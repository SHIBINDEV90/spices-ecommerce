import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = String(body.query || '').trim();
    const verification = String(body.verification || '').trim().toLowerCase();

    if (!query) {
      return NextResponse.json({ message: 'Please provide an Order ID or Courier AWB number' }, { status: 400 });
    }

    await dbConnect();

    // Try finding order by:
    // 1. Exact Mongo _id (if valid ObjectId)
    // 2. Short order id (last 8 characters)
    // 3. shipping.trackingNumber or shipping.awbCode
    // 4. shipping.shiprocketOrderId or shipmentId
    let order = null;

    if (mongoose.Types.ObjectId.isValid(query)) {
      order = await Order.findById(query).lean();
    }

    if (!order) {
      // Look up by AWB code, tracking number, or Shiprocket order ID
      order = await Order.findOne({
        $or: [
          { 'shipping.trackingNumber': query },
          { 'shipping.awbCode': query },
          { 'shipping.shiprocketOrderId': query },
          { 'shipping.shiprocketShipmentId': query },
        ],
      }).lean();
    }

    if (!order && query.length >= 6) {
      // Look up order where ID ends with query or starts with query
      const cleanQ = query.replace(/^#/, '');
      order = await Order.findOne({
        $expr: {
          $regexMatch: {
            input: { $toString: '$_id' },
            regex: cleanQ,
            options: 'i',
          },
        },
      }).lean();
    }

    if (!order) {
      return NextResponse.json({
        message: 'No order found matching the provided details. Please check your Order ID or AWB number.',
      }, { status: 404 });
    }

    // Optional verification check if provided
    if (verification) {
      const emailMatch = (order as any).customerEmail?.toLowerCase() === verification;
      const phoneDigits = String((order as any).customerPhone || '').replace(/\D/g, '');
      const verifyDigits = verification.replace(/\D/g, '');
      const phoneMatch = verifyDigits.length >= 4 && phoneDigits.includes(verifyDigits);

      if (!emailMatch && !phoneMatch) {
        return NextResponse.json({
          message: 'Verification failed. The email or mobile number does not match this order.',
        }, { status: 403 });
      }
    }

    return NextResponse.json({
      success: true,
      orderId: String(order._id),
      trackingStatus: (order as any).trackingStatus || 'processing',
      orderStatus: (order as any).orderStatus || 'Pending',
      paymentStatus: (order as any).paymentStatus || 'pending',
      shipping: (order as any).shipping || {},
      history: (order as any).trackingHistory || [],
      customerName: (order as any).customerName,
      shippingCity: (order as any).shippingAddress?.city,
      shippingState: (order as any).shippingAddress?.state,
      shippingPostalCode: (order as any).shippingAddress?.postalCode,
      products: (order as any).products?.map((p: any) => ({
        name: p.name,
        quantity: p.quantity,
        price: p.price,
      })),
      totalAmount: (order as any).totalAmount,
      deliveryType: (order as any).deliveryType,
      createdAt: (order as any).createdAt,
    });
  } catch (error: any) {
    console.error('Order tracking search failed:', error);
    return NextResponse.json({ message: error.message || 'Internal tracking error' }, { status: 500 });
  }
}
