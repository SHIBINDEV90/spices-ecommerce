import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Wallet from '@/lib/models/Wallet';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await req.json();

    if (!['Pending', 'Paid', 'Shipped', 'Delivered'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    await dbConnect();
    
    const currentOrder = await Order.findById(params.id);
    if (!currentOrder) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const previousStatus = currentOrder.orderStatus;
    currentOrder.orderStatus = status;

    if (status === 'Delivered' && previousStatus !== 'Delivered') {
      // Find all vendor products that were not already Delivered
      const vendorBuckets: Record<string, number> = {};
      currentOrder.products.forEach((p: any) => {
        if (p.vendorId && p.status !== 'Delivered') {
          p.status = 'Delivered';
          const vendorKey = p.vendorId.toString();
          const itemTotal = (p.price || 0) * (p.quantity || 1);
          vendorBuckets[vendorKey] = (vendorBuckets[vendorKey] || 0) + itemTotal;
        }
      });

      // Transfer from pending to available balance for each vendor
      for (const [vendorIdStr, totalVal] of Object.entries(vendorBuckets)) {
        const commission = totalVal * 0.10;
        const payout = Math.round(totalVal - commission);
        if (currentOrder.paymentStatus === 'paid') {
          await Wallet.findOneAndUpdate(
            { vendorId: vendorIdStr },
            { $inc: { availableBalance: payout, pendingBalance: -payout } },
            { upsert: true, new: true }
          );
        } else {
          await Wallet.findOneAndUpdate(
            { vendorId: vendorIdStr },
            { $inc: { availableBalance: payout } },
            { upsert: true, new: true }
          );
        }
      }
    }

    await currentOrder.save();
    return NextResponse.json({ success: true, order: currentOrder });
  } catch (error: any) {
    console.error('Update Order Status Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
