import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Vendor from '@/lib/models/Vendor';
import User from '@/lib/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendVendorOrderNotificationEmail } from '@/lib/email';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is allowed (implies send to all vendors in this order)
      body = {};
    }

    const { vendorId } = body;

    await dbConnect();

    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Filter vendor items
    const vendorItems = order.products.filter((p: any) => p.vendorId);
    if (vendorItems.length === 0) {
      return NextResponse.json(
        { message: 'This order does not contain any vendor-added products.' },
        { status: 400 }
      );
    }

    // Determine target vendor IDs
    const targetVendorIds: string[] = [];
    if (vendorId) {
      const match = vendorItems.some((p: any) => p.vendorId.toString() === vendorId.toString());
      if (!match) {
        return NextResponse.json(
          { message: 'Specified vendor not found in this order.' },
          { status: 400 }
        );
      }
      targetVendorIds.push(vendorId.toString());
    } else {
      // All unique vendors in this order
      vendorItems.forEach((p: any) => {
        const vId = p.vendorId.toString();
        if (!targetVendorIds.includes(vId)) {
          targetVendorIds.push(vId);
        }
      });
    }

    const notifiedVendors: any[] = [];
    const now = new Date();

    for (const vId of targetVendorIds) {
      // Fetch vendor details
      const vendor = await Vendor.findById(vId).populate('userId', 'email name phone');
      if (!vendor) continue;

      const vendorEmail = vendor.email || (vendor.userId as any)?.email;

      // Mark vendor's items as sent
      let itemsForThisVendor: any[] = [];
      order.products.forEach((p: any) => {
        if (p.vendorId && p.vendorId.toString() === vId) {
          p.sentToVendor = true;
          p.sentToVendorAt = now;
          itemsForThisVendor.push({
            name: p.name,
            quantity: p.quantity,
            price: p.price,
          });
        }
      });

      let emailResult = null;
      if (vendorEmail) {
        emailResult = await sendVendorOrderNotificationEmail({
          vendorEmail,
          vendorName: vendor.ownerName || 'Vendor Partner',
          businessName: vendor.businessName || 'SpiceWizz Partner',
          orderId: order._id.toString(),
          orderDate: order.createdAt,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          shippingAddress: order.shippingAddress,
          orderNote: order.orderNote,
          items: itemsForThisVendor,
        });
      } else {
        console.warn(`[Send to Vendor] Vendor ${vId} does not have an email address.`);
      }

      const emailDelivered = !!emailResult?.delivered;
      const emailError = emailResult?.error || (!vendorEmail ? 'No vendor email address on record' : null);

      notifiedVendors.push({
        vendorId: vId,
        businessName: vendor.businessName,
        email: vendorEmail,
        itemsCount: itemsForThisVendor.length,
        emailDispatched: emailDelivered,
        emailError,
        emailProvider: emailResult?.provider,
      });
    }

    await order.save();

    // Re-fetch populated order for return
    const populatedOrder = await Order.findById(order._id)
      .populate('products.vendorId', 'businessName ownerName email phone vendorType');

    const totalVendors = notifiedVendors.length;
    const deliveredCount = notifiedVendors.filter(v => v.emailDispatched).length;
    const failedVendors = notifiedVendors.filter(v => !v.emailDispatched);

    let feedbackMessage = '';
    if (deliveredCount === totalVendors && totalVendors > 0) {
      feedbackMessage = `Order assigned and notification email successfully delivered to ${totalVendors} vendor(s).`;
    } else if (deliveredCount > 0) {
      feedbackMessage = `Order assigned to ${totalVendors} vendor(s). Email delivered to ${deliveredCount}, but failed for ${failedVendors.length} vendor(s).`;
    } else {
      const reason = failedVendors[0]?.emailError ? `: ${failedVendors[0].emailError}` : '';
      feedbackMessage = `Order assigned to vendor dashboard, but notification email could not be sent${reason}`;
    }

    return NextResponse.json({
      success: true,
      allEmailsDelivered: deliveredCount === totalVendors,
      emailDeliveredCount: deliveredCount,
      message: feedbackMessage,
      order: populatedOrder,
      notifiedVendors,
    });
  } catch (error: any) {
    console.error('Send to Vendor Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}
