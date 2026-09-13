import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Vendor from '@/lib/models/Vendor';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'Vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Find vendor profile
    const vendor = await Vendor.findOne({ userId: (session.user as any).id });
    if (!vendor) {
        return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    // Find all orders that have products from this vendor that were sent by admin or in progress
    const orders = await Order.find({
      products: {
        $elemMatch: {
          vendorId: vendor._id,
          $or: [
            { sentToVendor: true },
            { status: { $in: ['Accepted', 'Shipped', 'Delivered'] } }
          ]
        }
      }
    }).sort({ createdAt: -1 }).lean();

    // Filter products array to only show this vendor's dispatched items
    const vendorOrders = orders.map(order => {
        const vendorProducts = order.products.filter((p: any) => 
          p.vendorId?.toString() === vendor._id.toString() &&
          (p.sentToVendor || ['Accepted', 'Shipped', 'Delivered'].includes(p.status))
        );
        
        // Calculate the subtotal for this vendor's part of the order
        const vendorTotal = vendorProducts.reduce((sum: number, p: any) => sum + (p.price * p.quantity), 0);
        const firstSentAt = vendorProducts.find((p: any) => p.sentToVendorAt)?.sentToVendorAt;

        return {
            _id: order._id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            shippingAddress: order.shippingAddress,
            orderNote: order.orderNote,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
            sentToVendorAt: firstSentAt || order.createdAt,
            products: vendorProducts,
            vendorTotal
        };
    }).filter(order => order.products.length > 0);

    return NextResponse.json({ orders: vendorOrders });
  } catch (error: any) {
    console.error('Fetch Vendor Orders Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
