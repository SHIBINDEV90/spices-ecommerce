import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Forbidden in production' }, { status: 403 });
  }

  try {
    await dbConnect();
    
    const email = 'admin@malabarcoast.com';
    const password = process.env.ADMIN_PASSWORD || 'admin';
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.role !== 'Admin') {
        existingUser.role = 'Admin';
        await existingUser.save();
        return NextResponse.json({ message: 'Existing user promoted to Admin' });
      }
      return NextResponse.json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await User.create({
      name: 'Admin',
      email,
      password: hashedPassword,
      role: 'Admin'
    });
    
    return NextResponse.json({ message: 'Admin user created successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
