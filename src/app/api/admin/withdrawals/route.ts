import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Withdrawal from '@/lib/models/Withdrawal';
import Wallet from '@/lib/models/Wallet';
import Vendor from '@/lib/models/Vendor';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const withdrawals = await Withdrawal.find()
      .populate({ path: 'vendorId', select: 'businessName ownerName', model: Vendor })
      .sort({ createdAt: -1 });

    return NextResponse.json({ withdrawals });
  } catch (error: any) {
    console.error('Fetch Withdrawals Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
