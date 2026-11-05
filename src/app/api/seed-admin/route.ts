import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, message: 'Forbidden in production' }, { status: 403 });
  }

  await dbConnect();

  try {
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin';
    const admins = [
      { email: 'admin@malabarcoast.com', password: defaultPassword, name: 'Malabar Admin' },
      { email: 'admin@spicewizz.com', password: defaultPassword, name: 'Spicewizz Admin' }
    ];

    for (const admin of admins) {
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      
      const existingUser = await User.findOne({ email: admin.email });
      if (existingUser) {
        existingUser.password = hashedPassword;
        existingUser.role = 'Admin';
        await existingUser.save();
      } else {
        await User.create({
          name: admin.name,
          email: admin.email,
          password: hashedPassword,
          role: 'Admin',
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Admin accounts updated/created successfully',
      admins: admins.map(a => ({ email: a.email }))
    });

  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
