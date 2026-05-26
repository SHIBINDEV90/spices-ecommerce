import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  await dbConnect();

  try {
    const admins = [
      { email: 'admin@malabarcoast.com', password: 'malabar123', name: 'Malabar Admin' },
      { email: 'admin@spicewizz.com', password: 'spicewizz123', name: 'Spicewizz Admin' }
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
      admins: admins.map(a => ({ email: a.email, password: a.password }))
    });

  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
