import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
import User from '@/lib/models/User'; // need this for populate to work if we want to populate email, though we have userId

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Get query params for filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    const query: any = {};
    if (status) {
      query.status = status;
    }

    const vendors = await Vendor.find(query).populate({
        path: 'userId',
        select: 'email phone createdAt'
    }).sort({ createdAt: -1 });

    return NextResponse.json({ vendors });
  } catch (error: any) {
    console.error('Fetch Vendors Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
