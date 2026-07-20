import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Vendor from '@/lib/models/Vendor';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'Vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Find vendor profile
    const vendor = await Vendor.findOne({ userId: (session.user as any).id });
    if (!vendor) {
        return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    // Find all orders that have at least one product from this vendor
    const orders = await Order.find({ "products.vendorId": vendor._id }).sort({ createdAt: -1 }).lean();

    // Filter products array to only show this vendor's items to protect privacy of other vendors
    const vendorOrders = orders.map(order => {
        const vendorProducts = order.products.filter((p: any) => p.vendorId?.toString() === vendor._id.toString());
        
        // Calculate the subtotal for this vendor's part of the order
        const vendorTotal = vendorProducts.reduce((sum: number, p: any) => sum + (p.price * p.quantity), 0);

        return {
            _id: order._id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            shippingAddress: order.shippingAddress,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
            products: vendorProducts,
            vendorTotal
        };
    });

    return NextResponse.json({ orders: vendorOrders });
  } catch (error: any) {
    console.error('Fetch Vendor Orders Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
