import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { fulfillOrder } from '@/lib/order-fulfillment';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET is not set. Webhook received but cannot verify signature.');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    if (!signature) {
      console.warn('[Razorpay Webhook] Missing x-razorpay-signature header.');
      return NextResponse.json({ error: 'Missing signature header' }, { status: 400 });
    }

    // Verify HMAC SHA256 signature against raw body
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const isSignatureValid = 
      expectedSignature.length === signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(signature, 'utf-8')
      );

    if (!isSignatureValid) {
      console.error('[Razorpay Webhook] Invalid webhook signature detected.');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    // Parse verified payload
    const event = JSON.parse(rawBody);
    console.log(`[Razorpay Webhook] Received verified event: ${event.event}`);

    if (event.event === 'order.paid') {
      const rzpOrder = event.payload?.order?.entity;
      const rzpPayment = event.payload?.payment?.entity;
      const orderId = rzpOrder?.receipt || rzpOrder?.notes?.orderId;
      const paymentGatewayId = rzpOrder?.id;
      const paymentId = rzpPayment?.id;

      await fulfillOrder({
        orderId,
        paymentGatewayId,
        paymentId,
        paymentMethod: 'razorpay',
      });
    } else if (event.event === 'payment.captured') {
      const rzpPayment = event.payload?.payment?.entity;
      const paymentGatewayId = rzpPayment?.order_id;
      const paymentId = rzpPayment?.id;
      const orderId = rzpPayment?.notes?.orderId;

      await fulfillOrder({
        orderId,
        paymentGatewayId,
        paymentId,
        paymentMethod: 'razorpay',
      });
    }

    return NextResponse.json({ status: 'ok', received: true });
  } catch (error: any) {
    console.error('[Razorpay Webhook Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Webhook Error' }, { status: 500 });
  }
}

