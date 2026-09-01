import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
import Product from '@/lib/models/Product';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    
    // Find all approved vendors
    const vendors = await Vendor.find({ status: 'Approved' }).lean();
    
    // Get product count for each vendor
    const vendorsWithProductCount = await Promise.all(
      vendors.map(async (vendor: any) => {
        const productCount = await Product.countDocuments({
          vendorId: vendor._id,
          approvalStatus: 'Approved'
        });
        return {
          ...vendor,
          productCount
        };
      })
    );

    return NextResponse.json({ vendors: JSON.parse(JSON.stringify(vendorsWithProductCount)) });
  } catch (error: any) {
    console.error('Fetch Vendors Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
