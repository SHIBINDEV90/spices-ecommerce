import { NextResponse } from 'next/server';
import { fulfillOrder } from '@/lib/order-fulfillment';
import { verifyRazorpaySignature } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      orderId, 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment verification parameters' },
        { status: 400 }
      );
    }

    const isSignatureValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isSignatureValid) {
      console.warn(`[Razorpay Verify] Invalid signature attempt for order ${orderId}.`);
      return NextResponse.json(
        { error: 'Payment signature verification failed. Potential tampering detected.' },
        { status: 400 }
      );
    }

    // Fulfill the order idempotently (mark paid, update coupons, update vendor wallets)
    const result = await fulfillOrder({
      orderId,
      paymentGatewayId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      paymentMethod: 'razorpay',
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update order status' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      orderId,
      paymentId: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error('[Razorpay Verify Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error during verification' },
      { status: 500 }
    );
  }
}

