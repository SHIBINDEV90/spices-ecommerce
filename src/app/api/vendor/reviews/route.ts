import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Review from '@/lib/models/Review';
import Vendor from '@/lib/models/Vendor';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'Vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const vendor = await Vendor.findOne({ userId: (session.user as any).id });
    if (!vendor) return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });

    const reviews = await Review.find({ vendorId: vendor._id })
                                .populate('productId', 'name imageUrl')
                                .sort({ createdAt: -1 });

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error('Fetch Vendor Reviews Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== 'Vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const vendor = await Vendor.findOne({ userId: (session.user as any).id });
    if (!vendor) return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });

    const { reviewId, vendorReply } = await req.json();

    const review = await Review.findOneAndUpdate(
        { _id: reviewId, vendorId: vendor._id },
        { vendorReply },
        { new: true }
    );

    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    return NextResponse.json({ message: 'Reply added successfully', review });
  } catch (error: any) {
    console.error('Vendor Reply Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
