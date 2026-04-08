import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  await dbConnect();

  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@spicewizz.com' });
    if (existingAdmin) {
      return NextResponse.json({ success: true, message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash('spicewizz123', 10);

    const newAdmin = await User.create({
      name: 'System Admin',
      email: 'admin@spicewizz.com',
      password: hashedPassword,
      role: 'Admin',
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Admin account created successfully',
      credentials: { email: 'admin@spicewizz.com', password: 'spicewizz123' }
    });

  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
