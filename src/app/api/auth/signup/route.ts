import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import Coupon from '@/lib/models/Coupon';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, password } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 409 });
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return NextResponse.json({ error: 'User already exists with this phone number' }, { status: 409 });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'Customer', // Default role
    });

    // Generate a Welcome Coupon
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
    const couponCode = `WELCOME-${randomChars}`;
    
    const couponStartDate = new Date();
    const couponEndDate = new Date();
    couponEndDate.setDate(couponEndDate.getDate() + 30); // 30 days validity

    await Coupon.create({
      code: couponCode,
      description: 'Welcome Discount - 10% off your first order',
      discountType: 'percentage',
      discountValue: 10,
      usageLimit: 1,
      startDate: couponStartDate,
      endDate: couponEndDate,
      isActive: true
    });

    // Send Welcome SMS via MSG91
    if (phone) {
      const authKey = process.env.MSG91_AUTH_KEY;
      const welcomeTemplateId = process.env.MSG91_WELCOME_TEMPLATE_ID;

      if (!authKey || !welcomeTemplateId || welcomeTemplateId === 'your_welcome_template_id_here') {
        console.warn('MSG91 welcome template not fully configured. Falling back to console log.');
        console.log(`\n========================================`);
        console.log(`WELCOME SMS DELIVERED TO: ${phone}`);
        console.log(`Hello ${name}, welcome to Spicewizz! Use coupon code ${couponCode} for 10% off your first order.`);
        console.log(`========================================\n`);
      } else {
        let formattedPhone = phone;
        if (formattedPhone.length === 10) {
          formattedPhone = `91${formattedPhone}`;
        }

        const msg91Url = 'https://control.msg91.com/api/v5/otp'; // Or the generic SMS send endpoint if not using OTP templates
        // Note: The standard SMS endpoint for MSG91 is usually different from the OTP endpoint. 
        // If it's a transactional SMS, it typically uses the flow/campaign API.
        // For simplicity and since we only have the OTP API referenced in the project so far, 
        // we will use the flow API endpoint.
        const msg91FlowUrl = 'https://control.msg91.com/api/v5/flow/';
        
        try {
          const msg91Response = await fetch(msg91FlowUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'authkey': authKey
            },
            body: JSON.stringify({
              template_id: welcomeTemplateId,
              recipients: [
                {
                  mobiles: formattedPhone,
                  name: name,
                  coupon_code: couponCode
                }
              ]
            })
          });

          const responseData = await msg91Response.json();
          if (!msg91Response.ok || responseData.type === 'error') {
            console.error('MSG91 Flow API Error (Welcome SMS):', responseData);
          } else {
            console.log(`Successfully sent Welcome SMS via MSG91 to ${formattedPhone}`);
          }
        } catch (smsError) {
          console.error('Error sending Welcome SMS:', smsError);
        }
      }
    }

    return NextResponse.json({ 
      message: 'User created successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
