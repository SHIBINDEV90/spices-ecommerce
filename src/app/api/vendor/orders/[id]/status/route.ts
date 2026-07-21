import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Vendor from '@/lib/models/Vendor';
import Wallet from '@/lib/models/Wallet';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

    const body = await req.json();
    const { status } = body;

    if (!['Pending', 'Accepted', 'Shipped', 'Delivered'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const currentOrder = await Order.findOne({ 
        _id: params.id,
        "products.vendorId": vendor._id 
    });

    if (!currentOrder) {
        return NextResponse.json({ error: 'Order not found or you do not have permission' }, { status: 404 });
    }

    const vendorProducts = currentOrder.products.filter((p: any) => p.vendorId?.toString() === vendor._id.toString());
    const currentStatus = vendorProducts[0]?.status;

    if (currentStatus === 'Delivered' && status !== 'Delivered') {
        return NextResponse.json({ error: 'Cannot change status after order is Delivered' }, { status: 400 });
    }

    // Update all products in this order that belong to this vendor
    const order = await Order.findOneAndUpdate(
        { 
            _id: params.id,
            "products.vendorId": vendor._id 
        },
        { 
            $set: { "products.$[elem].status": status } 
        },
        {
            arrayFilters: [{ "elem.vendorId": vendor._id }],
            new: true
        }
    );

    // If transitioned to Delivered, add funds to Wallet
    if (status === 'Delivered' && currentStatus !== 'Delivered') {
        const vendorTotal = vendorProducts.reduce((sum: number, p: any) => sum + (p.price * p.quantity), 0);
        const commission = vendorTotal * 0.10; // 10% Admin Commission
        const payoutAmount = vendorTotal - commission;

        await Wallet.findOneAndUpdate(
            { vendorId: vendor._id },
            { $inc: { availableBalance: payoutAmount } },
            { upsert: true, new: true }
        );
    }

    return NextResponse.json({ message: 'Order status updated successfully', status });
  } catch (error: any) {
    console.error('Update Order Status Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
