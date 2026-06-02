import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Coupon from '@/lib/models/Coupon';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { couponCode, cartTotal } = body;

    if (!couponCode || cartTotal === undefined) {
      return NextResponse.json({ success: false, message: 'Coupon code and cart total are required' }, { status: 400 });
    }

    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });

    if (!coupon) {
      return NextResponse.json({ success: false, message: 'Invalid or inactive coupon code' }, { status: 400 });
    }

    // Check expiry
    if (new Date(coupon.endDate) < new Date()) {
      return NextResponse.json({ success: false, message: 'Coupon expired' }, { status: 400 });
    }
    if (new Date(coupon.startDate) > new Date()) {
      return NextResponse.json({ success: false, message: 'Coupon is not yet active' }, { status: 400 });
    }

    // Check Minimum Order
    if (cartTotal < coupon.minimumOrderAmount) {
      return NextResponse.json({ success: false, message: `Minimum order amount of ₹${coupon.minimumOrderAmount} not met` }, { status: 400 });
    }

    // Check Usage Limit
    if (coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ success: false, message: 'Coupon usage limit reached' }, { status: 400 });
    }

    // Calculate Discount
    let discount = 0;

    if (coupon.discountType === 'percentage') {
      discount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    } else if (coupon.discountType === 'fixed') {
      discount = coupon.discountValue;
      // Don't discount more than the cart total
      if (discount > cartTotal) {
         discount = cartTotal;
      }
    }

    const finalAmount = cartTotal - discount;

    return NextResponse.json({
      success: true,
      coupon: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount: discount,
      finalAmount: finalAmount
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
