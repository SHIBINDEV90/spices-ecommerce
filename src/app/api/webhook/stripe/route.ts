import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { headers } from 'next/headers';

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Please define STRIPE_SECRET_KEY in your environment');
  }

  return new Stripe(secretKey, {
    apiVersion: '2026-03-25.dahlia',
  });
}

// Disable body parsing so we can read the raw body for Stripe signature verification
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
    // When a user hits checkout/session, we didn't map it into `Order` table instantly (cart abandonment). 
    // Now that they Paid, we spin up the immutable Order.
    
    // NOTE: In production, you would fetch `line_items` from Stripe to capture exactly what they bought
    // For this blueprint, we log the high-level transaction payload
    const totalAmount = (session.amount_total || 0) / 100;

    await Order.create({
      customerName: session.metadata?.customerName || 'Stripe Customer',
      customerEmail: session.customer_details?.email || session.customer_email || 'unknown@example.com',
      products: [], // Expanded inside line-item extraction in full deployment!
      totalAmount: totalAmount,
      shippingAddress: {
        addressLine1: session.customer_details?.address?.line1 || 'N/A',
        city: session.customer_details?.address?.city || 'N/A',
        state: session.customer_details?.address?.state || 'N/A',
        zipCode: session.customer_details?.address?.postal_code || 'N/A',
        country: session.customer_details?.address?.country || 'N/A',
      },
      paymentStatus: session.payment_status === 'paid' ? 'paid' : 'failed',
      orderStatus: 'Pending',
      paymentGatewayId: session.id, // Stores the pi_ or cs_ identifier for the Ledger!
    });
    
    console.log(`[Webhook] Mapped new Paid Order for ${totalAmount} from ${session.customer_email}`);
  } catch (error) {
    console.error('[Webhook DB Error]', error);
  }
}
