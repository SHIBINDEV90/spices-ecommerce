import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    await connectToDatabase();

    // Hash the token from URL to match the stored SHA-256 hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find the user by token and ensure token is not expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    // Invalidate the reset token and expiry
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return NextResponse.json({
      message: 'Password reset successfully.',
      role: user.role // Helps frontend redirect to /login, /vendor/login, or /admin/login
    });
  } catch (error: any) {
    console.error('[Reset Password] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
