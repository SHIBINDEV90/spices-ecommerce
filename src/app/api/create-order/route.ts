import { NextResponse } from 'next/server';
import { getRazorpayClient, getRazorpayCredentials } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const { amount, currency = 'INR', receipt, notes } = body || {};

    // Validate amount presence and type
    const parsedAmount = Number(amount);
    if (amount === undefined || amount === null || isNaN(parsedAmount)) {
      return NextResponse.json(
        { error: 'Amount in paise is required and must be a valid number' },
        { status: 400 }
      );
    }

    // Validate minimum amount (Minimum 100 paise = 1 INR)
    if (parsedAmount < 100) {
      return NextResponse.json(
        { error: 'Amount must be at least 100 paise (₹1.00)' },
        { status: 400 }
      );
    }

    // Check credentials availability
    let razorpay;
    let key_id;
    try {
      const creds = getRazorpayCredentials();
      key_id = creds.key_id;
      razorpay = getRazorpayClient();
    } catch (credErr: any) {
      console.error('[Razorpay Auth Error]:', credErr);
      return NextResponse.json(
        { error: credErr.message || 'Razorpay authentication failed. Check credentials.' },
        { status: 401 }
      );
    }

    // Call Razorpay API to create order
    try {
      const order = await razorpay.orders.create({
        amount: Math.round(parsedAmount),
        currency: (currency || 'INR').toUpperCase(),
        receipt: receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        notes: notes || {},
      });

      return NextResponse.json(
        {
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          key_id,
        },
        { status: 200 }
      );
    } catch (rzpErr: any) {
      console.error('[Razorpay API Error]:', rzpErr);

      const status = rzpErr?.statusCode || rzpErr?.status;
      const errorDesc = rzpErr?.error?.description || rzpErr?.message || '';
      const isAuthError =
        status === 401 ||
        errorDesc.toLowerCase().includes('auth') ||
        errorDesc.toLowerCase().includes('unauthorized') ||
        errorDesc.toLowerCase().includes('key');

      if (isAuthError) {
        return NextResponse.json(
          { error: 'Razorpay authentication failure. Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: errorDesc || 'Failed to create order with Razorpay' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[Create Order Unexpected Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while creating order' },
      { status: 500 }
    );
  }
}
