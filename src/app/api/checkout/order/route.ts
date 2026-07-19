import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import Coupon from '@/lib/models/Coupon';
import Stripe from 'stripe';

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Please define STRIPE_SECRET_KEY in your environment');
  }

  return new Stripe(secretKey, {
    apiVersion: '2026-03-25.dahlia' as any,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
        cartItems, 
        shippingAddress, 
        customerName, 
        customerEmail, 
        paymentMethod,
        couponCode
    } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    await dbConnect();

    let subtotal = 0;
    const orderProducts = [];

    // Map checkout items with trusted DB prices to prevent tampering
    for (const item of cartItems) {
      const dbProduct = await Product.findById(item._id);
      if (!dbProduct) throw new Error(`Product not found: ${item.name}`);

      const itemTotal = dbProduct.price * item.quantity;
      subtotal += itemTotal;

      orderProducts.push({
          productId: dbProduct._id,
          name: dbProduct.name,
          quantity: item.quantity,
          price: dbProduct.price,
          vendorId: dbProduct.vendorId, // Crucial for multi-vendor splitting
          status: 'Pending'
      });
    }

    const deliveryFee = subtotal > 500 ? 0 : 50; 
    const codFee = paymentMethod === 'cod' ? 75 : 0;

    let discountAmount = 0;
    if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
        if (coupon) {
            if (coupon.discountType === 'percentage') {
                discountAmount = (subtotal * coupon.discountValue) / 100;
                if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
                    discountAmount = coupon.maximumDiscount;
                }
            } else {
                discountAmount = coupon.discountValue;
            }
        }
    }

    const totalAmount = subtotal - discountAmount + deliveryFee + codFee;

    // Create Order in DB
    const order = await Order.create({
        customerName,
        customerEmail,
        shippingAddress,
        products: orderProducts,
        totalAmount,
        couponCode,
        discountAmount,
        paymentStatus: 'pending',
        orderStatus: 'Pending',
    });

    if (paymentMethod === 'cod') {
        return NextResponse.json({ success: true, orderId: order._id, paymentMethod: 'cod' });
    }

    // Process Stripe Online Payment
    const stripe = getStripeClient();

    const lineItems = orderProducts.map(item => ({
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // Stripe expects paisa
        },
        quantity: item.quantity,
    }));

    // Add Delivery Fee Line Item if applicable
    if (deliveryFee > 0) {
        lineItems.push({
            price_data: {
                currency: 'inr',
                product_data: { name: 'Delivery Fee' },
                unit_amount: deliveryFee * 100,
            },
            quantity: 1,
        });
    }

    // Calculate Stripe Discount (Stripe doesn't allow negative line items easily, 
    // we use coupons in Stripe, but since we already calculated total, we can just pass a single line item if it's complex.
    // For simplicity, since Stripe expects positive amounts, let's just pass the final total as one line item if there's a discount.
    // Actually, passing individual items is better for receipts. Stripe has a `discounts` array, but you need to create a Stripe Coupon first.
    // Alternatively, just adjust the unit amount of the items proportionally, or add a negative line item if supported (it's not).
    // The easiest robust way for custom discounts is to create the session with a single "Order Total" line item if there's a custom discount, OR create a temporary Stripe Coupon.
    // Let's use the individual items and let's assume we won't pass the discount to Stripe UI visually, or we just pass a single line item.
    // Let's just pass the line items and ignore the DB calculated discount for a moment, OR pass a single line item for the discounted total.
    const finalLineItems = discountAmount > 0 
        ? [{
            price_data: {
                currency: 'inr',
                product_data: { name: `Order from Malabar Coast (Includes Discount)` },
                unit_amount: Math.round(totalAmount * 100),
            },
            quantity: 1,
        }]
        : lineItems;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail,
      metadata: {
        orderId: order._id.toString(), // Store order ID to fulfill later
      },
      line_items: finalLineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout`,
    });

    // Save Stripe session ID to order
    order.paymentGatewayId = session.id;
    await order.save();

    return NextResponse.json({ url: session.url, paymentMethod: 'online' });

  } catch (error: any) {
    console.error('Checkout Order Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
