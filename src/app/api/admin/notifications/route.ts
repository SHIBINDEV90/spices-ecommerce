import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/lib/models/Notification';
import Enquiry from '@/lib/models/Enquiry';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    // Retrieve latest 20 notifications for Admin
    const notifications = await Notification.find({ recipientRole: 'Admin' })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipientRole: 'Admin',
      read: false,
    });

    const pendingEnquiriesCount = await Enquiry.countDocuments({
      status: 'pending',
    });

    return NextResponse.json(
      {
        success: true,
        data: notifications,
        unreadCount,
        pendingEnquiriesCount,
      },
      { status: 200 }
    );
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching admin notifications:', err);
    return NextResponse.json(
      { success: false, message: `An error occurred: ${err.message}` },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { id, markAll } = body;

    if (markAll) {
      await Notification.updateMany(
        { recipientRole: 'Admin', read: false },
        { $set: { read: true } }
      );
      return NextResponse.json(
        { success: true, message: 'All notifications marked as read' },
        { status: 200 }
      );
    }

    if (id) {
      await Notification.findByIdAndUpdate(id, { $set: { read: true } });
      return NextResponse.json(
        { success: true, message: 'Notification marked as read' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Missing notification id or markAll flag' },
      { status: 400 }
    );
  } catch (error) {
    const err = error as Error;
    console.error('Error updating notifications:', err);
    return NextResponse.json(
      { success: false, message: `An error occurred: ${err.message}` },
      { status: 500 }
    );
  }
}
