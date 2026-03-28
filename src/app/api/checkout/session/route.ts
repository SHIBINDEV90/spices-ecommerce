import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10', // Latest stable API
});

export async function POST(req: Request) {
  try {
    const { items, customerEmail, customerName } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    await dbConnect();

    // Map checkout items with trusted DB prices to prevent tampering
    const lineItems = await Promise.all(
      items.map(async (item: any) => {
        const dbProduct = await Product.findById(item._id);
        if (!dbProduct) throw new Error(`Product not found: ${item.name}`);

        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: dbProduct.name,
              images: [dbProduct.imageUrl],
            },
            unit_amount: Math.round(dbProduct.price * 100), // Stripe expects cents
          },
          quantity: item.quantity,
        };
      })
    );

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail,
      metadata: {
        customerName: customerName || 'Guest',
      },
      line_items: lineItems,
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['US', 'GB', 'CA', 'AE', 'AU', 'IN', 'FR', 'DE', 'JP', 'SG'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 4500, currency: 'usd' }, // $45.00
            display_name: 'Standard Global Ocean Freight',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 7 },
              maximum: { unit: 'business_day', value: 14 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 12500, currency: 'usd' }, // $125.00
            display_name: 'Priority Air Cargo',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 5 },
            },
          },
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('Stripe Session Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
