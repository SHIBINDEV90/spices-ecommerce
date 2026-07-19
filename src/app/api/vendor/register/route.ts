import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Vendor from '@/lib/models/Vendor';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      businessName,
      ownerName,
      email,
      phone,
      password,
      gstNumber,
      iecNumber,
      vendorType,
      businessAddress,
      documents
    } = body;

    // Validate required fields
    if (!businessName || !ownerName || !email || !password || !vendorType || !businessAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      name: ownerName,
      email,
      phone,
      password: hashedPassword,
      role: 'Vendor'
    });

    // Create Vendor Profile
    const vendor = await Vendor.create({
      userId: user._id,
      businessName,
      ownerName,
      businessAddress,
      gstNumber,
      iecNumber,
      vendorType,
      documents: documents || [],
      status: 'Pending'
    });

    return NextResponse.json({
      message: 'Vendor registration successful. Pending admin approval.',
      vendorId: vendor._id
    }, { status: 201 });

  } catch (error: any) {
    console.error('Vendor Registration Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
