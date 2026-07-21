import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Review from '@/lib/models/Review';
import Product from '@/lib/models/Product';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const reviews = await Review.find({ productId: params.id }).sort({ createdAt: -1 });
    return NextResponse.json({ reviews });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const product = await Product.findById(params.id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5 || !comment) {
        return NextResponse.json({ error: 'Invalid rating or comment' }, { status: 400 });
    }

    const user = session.user as any;
    const review = await Review.create({
        productId: product._id,
        vendorId: product.vendorId, // Important: linking review to vendor!
<<<<<<< HEAD
        customerId: (session.user as any).id,
        customerName: session.user.name || 'Anonymous',
=======
        customerId: user.id,
        customerName: user.name || 'Anonymous',
>>>>>>> 89326febbbaf9f85f1d183d943e6396e99ab8103
        rating,
        comment
    });

    return NextResponse.json({ message: 'Review submitted successfully', review }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
        return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 });
    }
    console.error('Submit Review Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
