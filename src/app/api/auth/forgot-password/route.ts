import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { Resend } from 'resend';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return a success message to prevent account enumeration
    const successResponse = {
      message: 'If an account exists with this email, a reset link has been sent.'
    };

    if (!user) {
      // Log to console for debugging even if user doesn't exist (helpful during development)
      console.log(`[Forgot Password] Requested email: ${email} (User not found)`);
      return NextResponse.json(successResponse);
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save token and expiry
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // Construct reset URL
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const resetUrl = `${origin}/reset-password/${resetToken}`;

    // Development Console Logging fallback
    console.log(`\n========================================`);
    console.log(`PASSWORD RESET URL FOR: ${user.email}`);
    console.log(`URL: ${resetUrl}`);
    console.log(`========================================\n`);

    // Send transactional email
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && apiKey !== 're_PLACEHOLDER') {
      try {
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: 'SpiceWizz <onboarding@resend.dev>',
          to: user.email,
          subject: 'Reset Your Password - SpiceWizz',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eee; border-radius: 16px; background-color: #fcf9f2; color: #1c1c18;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #486413; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">SpiceWizz</h1>
                <p style="color: #855300; font-size: 14px; margin: 4px 0 0 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Premium Spices Marketplace</p>
              </div>
              
              <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <h3 style="margin-top: 0; color: #1c1c18; font-size: 20px; font-weight: 700;">Reset Your Password</h3>
                <p style="font-size: 16px; line-height: 1.6; color: #44483b;">Hello <strong>${user.name}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6; color: #44483b;">We received a request to reset your SpiceWizz account password. Click the button below to choose a new password:</p>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${resetUrl}" style="background: linear-gradient(135deg, #486413 0%, #607d2b 100%); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(72,100,19,0.25);">Reset Password</a>
                </div>
                
                <p style="font-size: 14px; color: #855300; background-color: #ffddb8; padding: 10px 16px; border-radius: 6px; font-weight: 500; margin: 24px 0;">
                  ⚠️ This password reset link will expire in 15 minutes.
                </p>
                
                <p style="font-size: 14px; color: #757969; margin-bottom: 0;">If you did not request this, you can safely ignore this email; your password will remain unchanged.</p>
              </div>

              <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #757969;">
                <p>&copy; ${new Date().getFullYear()} SpiceWizz Team. All rights reserved.</p>
              </div>
            </div>
          `,
        });
        console.log(`[Forgot Password] Reset email successfully dispatched to ${user.email}`);
      } catch (emailError) {
        console.error('[Forgot Password] Failed to send email via Resend:', emailError);
      }
    } else {
      console.warn('[Forgot Password] RESEND_API_KEY is not configured or placeholder. Email was not sent.');
    }

    return NextResponse.json(successResponse);
  } catch (error: any) {
    console.error('[Forgot Password] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
