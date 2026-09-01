import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
import Product from '@/lib/models/Product';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const vendor = await Vendor.findById(params.id).lean();
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const products = await Product.find({
      vendorId: vendor._id,
      approvalStatus: 'Approved'
    }).lean();

    return NextResponse.json({
      vendor: JSON.parse(JSON.stringify(vendor)),
      products: JSON.parse(JSON.stringify(products))
    });
  } catch (error: any) {
    console.error('Fetch Vendor Store Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
