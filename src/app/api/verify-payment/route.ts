import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getRazorpayCredentials } from '@/lib/razorpay';
import { fulfillOrder } from '@/lib/order-fulfillment';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      // Fallback aliases
      order_id = razorpay_order_id,
      payment_id = razorpay_payment_id,
      signature = razorpay_signature,
      // Optional internal order reference for e-commerce DB
      orderId,
    } = body || {};

    const effectiveOrderId = order_id || razorpay_order_id;
    const effectivePaymentId = payment_id || razorpay_payment_id;
    const effectiveSignature = signature || razorpay_signature;

    // Validate presence of all three essential verification parameters
    if (!effectiveOrderId || !effectivePaymentId || !effectiveSignature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required',
        },
        { status: 400 }
      );
    }

    // Retrieve secret securely
    let key_secret: string;
    try {
      const creds = getRazorpayCredentials();
      key_secret = creds.key_secret;
    } catch (credErr: any) {
      console.error('[Verify Payment] Configuration error:', credErr);
      return NextResponse.json(
        { success: false, error: 'Payment gateway configuration error on server' },
        { status: 500 }
      );
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${effectiveOrderId}|${effectivePaymentId}`)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    const isSignatureValid =
      expectedSignature.length === effectiveSignature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(effectiveSignature, 'utf-8')
      );

    if (!isSignatureValid) {
      console.warn(
        `[Razorpay Verify] Signature mismatch for order: ${effectiveOrderId}. Payment marked as unpaid.`
      );
      return NextResponse.json(
        {
          success: false,
          error: 'Signature mismatch: payment verification failed. Do not mark as paid.',
        },
        { status: 400 }
      );
    }

    // If an internal DB orderId was provided, update database fulfillment idempotently
    if (orderId) {
      try {
        await fulfillOrder({
          orderId,
          paymentGatewayId: effectiveOrderId,
          paymentId: effectivePaymentId,
          paymentMethod: 'razorpay',
        });
      } catch (fulfillErr) {
        console.warn('[Verify Payment] Internal DB fulfillment note:', fulfillErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Payment verified successfully',
        order_id: effectiveOrderId,
        payment_id: effectivePaymentId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Verify Payment Unexpected Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error during verification' },
      { status: 500 }
    );
  }
}
