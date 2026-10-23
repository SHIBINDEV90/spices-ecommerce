import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { id?: string; orderId?: string } }
) {
  try {
    const orderId = params.id || params.orderId || '';
    const { searchParams } = new URL(request.url);
    const verifyEmail = searchParams.get('email')?.trim().toLowerCase();
    const verifyPhone = searchParams.get('phone')?.trim();

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ message: 'Invalid order ID' }, { status: 400 });
    }

    await dbConnect();
    const order = await Order.findById(orderId).populate('products.productId').lean();

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Check authorization:
    // 1. Session is Admin
    // 2. Session matches customer user ID or customer email
    // 3. Request provided matching email or phone parameter (for guest tracking)
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const userEmail = session?.user?.email?.toLowerCase();
    const userId = (session?.user as any)?.id;

    let isAuthorized = false;

    if (userRole === 'Admin') {
      isAuthorized = true;
    } else if (userId && (order as any).userId && String((order as any).userId) === String(userId)) {
      isAuthorized = true;
    } else if (userEmail && (order as any).customerEmail?.toLowerCase() === userEmail) {
      isAuthorized = true;
    } else if (verifyEmail && (order as any).customerEmail?.toLowerCase() === verifyEmail) {
      isAuthorized = true;
    } else if (verifyPhone && (order as any).customerPhone) {
      const orderDigits = String((order as any).customerPhone).replace(/\D/g, '');
      const verifyDigits = verifyPhone.replace(/\D/g, '');
      if (verifyDigits.length >= 4 && orderDigits.includes(verifyDigits)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { 
          message: session 
            ? 'Access denied. You do not have permission to view tracking for this order.' 
            : 'Unauthorized. Please log in with the account used at checkout, or provide the verification email or phone parameter.' 
        },
        { status: 403 }
      );
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
      customerEmail: (order as any).customerEmail,
      shippingAddress: (order as any).shippingAddress,
      products: (order as any).products,
      totalAmount: (order as any).totalAmount,
      deliveryType: (order as any).deliveryType,
      createdAt: (order as any).createdAt,
    });
  } catch (error: any) {
    console.error('Customer tracking lookup failed:', error);
    return NextResponse.json({ message: 'Unable to load tracking details' }, { status: 500 });
  }
}
