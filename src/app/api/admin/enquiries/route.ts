import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Enquiry from '@/lib/models/Enquiry';
import Notification from '@/lib/models/Notification';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: 'Invalid or empty enquiry IDs' }, { status: 400 });
    }

    await dbConnect();

    const result = await Enquiry.deleteMany({ _id: { $in: ids } });

    // Clean up related notifications
    try {
      await Notification.deleteMany({ 'metadata.enquiryId': { $in: ids } });
    } catch (notifErr) {
      console.warn('[Bulk Delete Enquiries] Failed to clean up notifications:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} enquiries deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error('Bulk Delete Enquiries Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

