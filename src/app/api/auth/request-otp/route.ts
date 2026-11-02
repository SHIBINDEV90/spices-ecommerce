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

    // Clean up input phone number
    const cleanPhone = phone.trim();
    const rawDigits = cleanPhone.replace(/[^0-9]/g, '');
    const tenDigits = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;

    // Check if user exists (flexible check for raw 10 digits, +91, or clean input)
    const user = await User.findOne({
      $or: [
        { phone: cleanPhone },
        { phone: tenDigits },
        { phone: `+91${tenDigits}` },
        { phone: `91${tenDigits}` }
      ]
    });

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
      console.log(`MOCK SMS DELIVERED TO: ${cleanPhone}`);
      console.log(`YOUR OTP IS: ${otp}`);
      console.log(`========================================\n`);
    } else {
      // Ensure phone has country code (default to 91 for India)
      const formattedPhone = tenDigits.length === 10 ? `91${tenDigits}` : rawDigits;

      // MSG91 v5 Send OTP API requires template_id, mobile, and otp as URL query parameters
      const msg91Url = new URL('https://control.msg91.com/api/v5/otp');
      msg91Url.searchParams.append('template_id', templateId);
      msg91Url.searchParams.append('mobile', formattedPhone);
      msg91Url.searchParams.append('otp', otp);
      msg91Url.searchParams.append('otp_expiry', '5'); // 5 minutes

      const msg91Response = await fetch(msg91Url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authkey': authKey
        }
      });

      const responseData = await msg91Response.json();
      
      if (!msg91Response.ok || responseData.type === 'error') {
        console.error('MSG91 API Error:', responseData);
        return NextResponse.json({ 
          error: responseData.message || 'Failed to send OTP SMS via MSG91' 
        }, { status: 500 });
      }
      
      console.log(`Successfully sent OTP via MSG91 to ${formattedPhone}`);
    }

    return NextResponse.json({ message: 'OTP sent successfully', success: true });
  } catch (error) {
    console.error('OTP request error:', error);
    return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
  }
}
