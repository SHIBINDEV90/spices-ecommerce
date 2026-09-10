import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import Coupon from '@/lib/models/Coupon';
import Stripe from 'stripe';
import { getRazorpayClient } from '@/lib/razorpay';

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
        customerPhone,
        orderNote,
        paymentMethod = 'razorpay',
        couponCode
    } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!customerName || !customerEmail || !shippingAddress?.street || !shippingAddress?.city) {
      return NextResponse.json({ error: 'Missing required shipping or customer details' }, { status: 400 });
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

    const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee + codFee);

    // Create Order in DB
    const order = await Order.create({
        customerName,
        customerEmail,
        customerPhone,
        orderNote,
        shippingAddress,
        products: orderProducts,
        totalAmount,
        couponCode,
        discountAmount,
        paymentStatus: 'pending',
        orderStatus: 'Pending',
        paymentMethod: paymentMethod === 'cod' ? 'cod' : (paymentMethod === 'stripe' ? 'stripe' : 'razorpay'),
    });

    // 1. CASH ON DELIVERY
    if (paymentMethod === 'cod') {
        return NextResponse.json({ 
          success: true, 
          orderId: order._id.toString(), 
          paymentMethod: 'cod',
          totalAmount 
        });
    }

    // 2. RAZORPAY (UPI / QR / Indian Cards / Net Banking)
    if (paymentMethod === 'razorpay' || paymentMethod === 'upi') {
        try {
          const razorpay = getRazorpayClient();
          const amountInPaisa = Math.round(totalAmount * 100);

          const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaisa,
            currency: 'INR',
            receipt: order._id.toString(),
            notes: {
              orderId: order._id.toString(),
              customerEmail,
              customerName,
            }
          });

          order.paymentGatewayId = razorpayOrder.id;
          order.paymentMethod = 'razorpay';
          await order.save();

          const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;

          return NextResponse.json({
            success: true,
            orderId: order._id.toString(),
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key,
            paymentMethod: 'razorpay',
          });
        } catch (rzpErr: any) {
          console.error('Razorpay Order Creation Error:', rzpErr);
          return NextResponse.json(
            { error: `Razorpay Error: ${rzpErr.message || 'Failed to create payment order'}` },
            { status: 500 }
          );
        }
    }

    // 3. STRIPE (International Online Card Payment)
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

    const finalLineItems = discountAmount > 0 
        ? [{
            price_data: {
                currency: 'inr',
                product_data: { name: `Order from Malabar Coast Spices (Discount Applied)` },
                unit_amount: Math.round(totalAmount * 100),
            },
            quantity: 1,
        }]
        : lineItems;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail,
      metadata: {
        orderId: order._id.toString(),
      },
      line_items: finalLineItems,
      mode: 'payment',
      success_url: `${(process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${(process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')}/checkout`,
    });

    // Save Stripe session ID to order
    order.paymentGatewayId = session.id;
    order.paymentMethod = 'stripe';
    await order.save();

    return NextResponse.json({ 
      success: true, 
      url: session.url, 
      paymentMethod: 'stripe',
      orderId: order._id.toString() 
    });

  } catch (error: any) {
    console.error('Checkout Order Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const sessionId = searchParams.get('sessionId');

    await dbConnect();

    let order = null;
    if (orderId) {
      order = await Order.findById(orderId).populate('products.productId');
    } else if (sessionId) {
      order = await Order.findOne({ paymentGatewayId: sessionId }).populate('products.productId');
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order._id.toString(),
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        orderNote: order.orderNote,
        shippingAddress: order.shippingAddress,
        products: order.products,
        totalAmount: order.totalAmount,
        discountAmount: order.discountAmount,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        paymentMethod: order.paymentMethod,
        paymentGatewayId: order.paymentGatewayId,
        paymentId: order.paymentId,
        createdAt: order.createdAt,
      }
    });
  } catch (error: any) {
    console.error('Get Order Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to get order' }, { status: 500 });
  }
}
