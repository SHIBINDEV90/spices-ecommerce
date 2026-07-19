import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
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
    const vendor = await Vendor.findOne({ userId: session.user.id });
    if (!vendor) {
        return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    // 1. Total Products
    const totalProducts = await Product.countDocuments({ vendorId: vendor._id });

    // 2. Orders (we need to find orders that contain items from this vendor)
    // For now, let's just count the order items that belong to this vendor.
    // In MongoDB, we can aggregate to find this.
    const ordersWithVendorItems = await Order.aggregate([
        { $unwind: "$products" },
        { $match: { "products.vendorId": vendor._id } },
        {
            $group: {
                _id: "$_id",
                status: { $first: "$products.status" },
                revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } }
            }
        }
    ]);

    let pendingOrders = 0;
    let completedOrders = 0;
    let revenue = 0;

    ordersWithVendorItems.forEach(order => {
        if (order.status === 'Pending' || order.status === 'Accepted') {
            pendingOrders++;
        } else if (order.status === 'Delivered') {
            completedOrders++;
            revenue += order.revenue;
        } else if (order.status === 'Shipped') {
            pendingOrders++; // Treat shipped as pending completion
        }
    });

    return NextResponse.json({ 
        totalProducts,
        pendingOrders,
        completedOrders,
        revenue
    });
  } catch (error: any) {
    console.error('Fetch Vendor Dashboard Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
