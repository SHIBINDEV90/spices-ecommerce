import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    await dbConnect();

    // Check if user exists
    const user = await User.findOne({ phone });

    if (!user) {
      return NextResponse.json({ error: 'Mobile number is not registered. Please register or sign up first.' }, { status: 404 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 5 minutes from now
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP to user
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // MOCK SEND SMS: Print to server console
    console.log(`\n========================================`);
    console.log(`MOCK SMS DELIVERED TO: ${phone}`);
    console.log(`YOUR OTP IS: ${otp}`);
    console.log(`========================================\n`);

    return NextResponse.json({ message: 'OTP sent successfully', success: true });
  } catch (error) {
    console.error('OTP request error:', error);
    return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
  }
}
