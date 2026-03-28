import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Enquiry from '@/lib/models/Enquiry';

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    // TODO: Add authentication and authorization to protect this route
    // This should only be accessible by admin users.

    const enquiries = await Enquiry.find({}).populate('product', 'name').sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: enquiries }, { status: 200 });

  } catch (error) {
    const err = error as Error;
    console.error('Error fetching enquiries:', err);
    return NextResponse.json({ success: false, message: `An error occurred: ${err.message}` }, { status: 500 });
  }
}
