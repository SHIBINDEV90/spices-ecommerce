import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product'; // To validate products
import { IOrderItem } from '@/lib/models/Order';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { customerName, customerEmail, shippingAddress, products } = body;

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

    // --- 3. Create the Order in your Database ---
    const newOrder = new Order({
      customerName,
      customerEmail,
      shippingAddress,
      products: validatedProducts,
      totalAmount,
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
