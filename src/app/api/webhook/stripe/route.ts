import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Coupon from '@/lib/models/Coupon';
import { headers } from 'next/headers';
import Stripe from 'stripe';

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Please define STRIPE_SECRET_KEY in your environment');
  }

  return new Stripe(secretKey, {
    apiVersion: '2026-03-25.dahlia',
  });
}

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;
  let event: Stripe.Event;

  try {
    // Only verify webhook signature if the secret is deliberately provided
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (webhookSecret) {
       const stripe = getStripeClient();
       event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
       // Gracefully fall back to insecure payload parsing if DEV hasn't hooked up CLI secret yet
       event = JSON.parse(body) as Stripe.Event;
    }
  } catch (error: any) {
    console.error(`Webhook Error Formatter: ${error.message}`);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  // Handle the specific payment intent / checkout session events
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    await fulfillOrder(session);
  }

  return NextResponse.json({ received: true });
}

async function fulfillOrder(session: Stripe.Checkout.Session) {
  await dbConnect();

  try {
    const orderId = session.metadata?.orderId;
    
    if (orderId) {
      if (session.payment_status === 'paid') {
        const order = await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'paid',
            paymentGatewayId: session.id,
        });

        if (order && order.couponCode) {
            await Coupon.findOneAndUpdate(
              { code: order.couponCode },
              { $inc: { usedCount: 1 } }
            );
        }

        console.log(`[Webhook] Marked Order ${orderId} as Paid`);
      }
      return;
    }

    // Fallback for old sessions without orderId
    const totalAmount = (session.amount_total || 0) / 100;
    const couponCode = session.metadata?.couponCode;
    const discountAmount = session.metadata?.discountAmount ? parseFloat(session.metadata.discountAmount) : 0;

    if (session.payment_status === 'paid' && couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode },
        { $inc: { usedCount: 1 } }
      );
    }

    await Order.create({
      customerName: session.metadata?.customerName || 'Stripe Customer',
      customerEmail: session.customer_details?.email || session.customer_email || 'unknown@example.com',
      products: [], 
      totalAmount: totalAmount,
      shippingAddress: {
        street: session.customer_details?.address?.line1 || 'N/A',
        city: session.customer_details?.address?.city || 'N/A',
        state: session.customer_details?.address?.state || 'N/A',
        postalCode: session.customer_details?.address?.postal_code || 'N/A',
        country: session.customer_details?.address?.country || 'N/A',
      },
      couponCode: couponCode || undefined,
      discountAmount: discountAmount || 0,
      paymentStatus: session.payment_status === 'paid' ? 'paid' : 'failed',
      orderStatus: 'Pending',
      paymentGatewayId: session.id,
    });
    
    console.log(`[Webhook] Mapped new Paid Order for ${totalAmount} from ${session.customer_email}`);
  } catch (error) {
    console.error('[Webhook DB Error]', error);
  }
}
