import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Get query params for filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    const query: any = {};
    if (status) {
      query.status = status;
    }

    const vendors = await Vendor.find(query)
      .populate({
        path: 'userId',
        select: 'name email phone createdAt role',
      })
      .sort({ createdAt: -1 })
      .lean();

    // Get product counts for vendors
    const productCounts = await Product.aggregate([
      { $match: { vendorId: { $ne: null } } },
      { $group: { _id: '$vendorId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    productCounts.forEach((pc: any) => {
      if (pc._id) {
        countMap.set(pc._id.toString(), pc.count);
      }
    });

    const enrichedVendors = vendors.map((v: any) => ({
      ...v,
      productCount: countMap.get(v._id.toString()) || 0,
    }));

    return NextResponse.json({ vendors: enrichedVendors });
  } catch (error: any) {
    console.error('Fetch Vendors Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
