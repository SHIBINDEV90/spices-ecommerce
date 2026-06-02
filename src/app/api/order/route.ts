import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product'; // To validate products
import Coupon from '@/lib/models/Coupon';
import { IOrderItem } from '@/lib/models/Order';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { customerName, customerEmail, shippingAddress, products, couponCode } = body;

    // --- 1. Basic Validation ---
    if (!customerName || !customerEmail || !shippingAddress || !products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ success: false, message: 'Missing or invalid required fields' }, { status: 400 });
    }

    // --- 2. More Detailed Validation & Total Calculation ---
    let totalAmount = 0;
    const validatedProducts: IOrderItem[] = [];

    for (const item of products) {
        const productDoc = await Product.findById(item.productId);
        if (!productDoc) {
            return NextResponse.json({ success: false, message: `Product with id ${item.productId} not found` }, { status: 404 });
        }
        if (!productDoc.isRetailAvailable || productDoc.stock < item.quantity) {
             return NextResponse.json({ success: false, message: `Product "${productDoc.name}" is not available for retail or is out of stock.` }, { status: 400 });
        }

        // Use the price from the database to prevent client-side price manipulation
        const price = productDoc.price || 0;
        totalAmount += price * item.quantity;
        
        validatedProducts.push({
            productId: productDoc._id,
            name: productDoc.name,
            quantity: item.quantity,
            price: price,
        });
    }

    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && new Date(coupon.endDate) >= new Date() && new Date(coupon.startDate) <= new Date() && totalAmount >= coupon.minimumOrderAmount && coupon.usedCount < coupon.usageLimit) {
        if (coupon.discountType === 'percentage') {
          discountAmount = (totalAmount * coupon.discountValue) / 100;
          if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
            discountAmount = coupon.maximumDiscount;
          }
        } else if (coupon.discountType === 'fixed') {
          discountAmount = coupon.discountValue;
          if (discountAmount > totalAmount) discountAmount = totalAmount;
        }
        appliedCoupon = coupon;
        totalAmount -= discountAmount;
      }
    }

    // --- 3. Create the Order in your Database ---
    const newOrder = new Order({
      customerName,
      customerEmail,
      shippingAddress,
      products: validatedProducts,
      totalAmount,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      discountAmount,
      paymentStatus: 'pending', // Status is pending until payment is confirmed
    });

    // --- 4. Payment Gateway Integration (e.g., Razorpay) ---
    // In a real application, you would do this:
    // a. Create an order with the payment gateway SDK using the `totalAmount`.
    //    const razorpayOrder = await razorpay.orders.create({ amount: totalAmount * 100, currency: 'INR' });
    // b. Save the `razorpayOrder.id` to your order document.
    //    newOrder.paymentGatewayId = razorpayOrder.id;
    // c. Return the `razorpayOrder.id` to the client to initialize the payment popup.

    await newOrder.save();

    return NextResponse.json(
      { 
        success: true, 
        message: 'Order created successfully. Ready for payment.',
        // In a real app, you would return the paymentGatewayId here.
        // e.g., paymentGatewayOrderId: newOrder.paymentGatewayId
        order: newOrder,
      }, 
      { status: 201 }
    );

  } catch (error) {
    const err = error as Error;
    console.error('Error creating order:', err);
    return NextResponse.json({ success: false, message: `An error occurred: ${err.message}` }, { status: 500 });
  }
}
