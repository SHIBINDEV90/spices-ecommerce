import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Coupon from '@/lib/models/Coupon';

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, coupons }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const coupon = new Coupon(body);
    await coupon.save();
    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    // Handle duplicate key error for code
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: 'Coupon code already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
