import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Enquiry from '@/lib/models/Enquiry';
import Notification from '@/lib/models/Notification';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const deletedEnquiry = await Enquiry.findByIdAndDelete(params.id);

    if (!deletedEnquiry) {
      return NextResponse.json({ message: 'Enquiry not found' }, { status: 404 });
    }

    // Clean up corresponding in-app notification if any
    try {
      await Notification.deleteMany({ 'metadata.enquiryId': params.id });
    } catch (notifErr) {
      console.warn('[Delete Enquiry] Failed to delete related notification:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Enquiry deleted successfully',
      enquiryId: params.id,
    });
  } catch (error: any) {
    console.error('Delete Enquiry Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}
