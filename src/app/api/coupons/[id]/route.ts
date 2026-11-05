import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Coupon from '@/lib/models/Coupon';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'Admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  await dbConnect();
  try {
    const body = await req.json();
    const coupon = await Coupon.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    
    if (!coupon) {
      return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, coupon }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: 'Coupon code already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'Admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  await dbConnect();
  try {
    const coupon = await Coupon.findByIdAndDelete(params.id);
    
    if (!coupon) {
      return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Coupon deleted' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
