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

    // Send SMS via MSG91
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey || !templateId || templateId === 'your_template_id_here') {
      console.warn('MSG91 credentials not fully configured. Falling back to console log.');
      console.log(`\n========================================`);
      console.log(`MOCK SMS DELIVERED TO: ${phone}`);
      console.log(`YOUR OTP IS: ${otp}`);
      console.log(`========================================\n`);
    } else {
      // Ensure phone has country code (default to 91 for India if length is 10)
      let formattedPhone = phone;
      if (formattedPhone.length === 10) {
        formattedPhone = `91${formattedPhone}`;
      }

      const msg91Url = 'https://control.msg91.com/api/v5/otp';
      const msg91Response = await fetch(msg91Url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authkey': authKey
        },
        body: JSON.stringify({
          template_id: templateId,
          mobile: formattedPhone,
          otp: otp
        })
      });

      const responseData = await msg91Response.json();
      
      if (!msg91Response.ok || responseData.type === 'error') {
        console.error('MSG91 API Error:', responseData);
        return NextResponse.json({ error: 'Failed to send OTP SMS' }, { status: 500 });
      }
      
      console.log(`Successfully sent OTP via MSG91 to ${formattedPhone}`);
    }

    return NextResponse.json({ message: 'OTP sent successfully', success: true });
  } catch (error) {
    console.error('OTP request error:', error);
    return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
  }
}
