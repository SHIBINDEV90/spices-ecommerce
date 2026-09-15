import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // 1. Fetch active quick commerce vendors
    const quickVendors = await Vendor.find({
      status: 'Approved',
      'quickCommerce.enabled': true,
    }).select('businessName ownerName businessAddress location quickCommerce status email phone').lean();

    // 2. Fetch all products enabled for quick commerce
    const quickProductsCount = await Product.countDocuments({
      'quickCommerce.isAvailable': true,
    });

    // 3. Fetch quick commerce orders
    const quickOrders = await Order.find({
      deliveryType: 'quick',
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const allOrdersCount = await Order.countDocuments({ deliveryType: 'quick' });

    return NextResponse.json({
      success: true,
      stats: {
        activeQuickVendors: quickVendors.length,
        quickProductsCount,
        totalQuickOrders: allOrdersCount,
      },
      vendors: quickVendors,
      orders: quickOrders,
    });
  } catch (error: any) {
    console.error('Admin Quick Commerce API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
