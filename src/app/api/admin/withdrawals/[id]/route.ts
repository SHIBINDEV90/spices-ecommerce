import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Withdrawal from '@/lib/models/Withdrawal';
import Wallet from '@/lib/models/Wallet';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const { status, notes } = await req.json();

    if (!['Approved', 'Rejected'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const withdrawal = await Withdrawal.findById(params.id);
    if (!withdrawal) return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });

    if (withdrawal.status !== 'Pending') {
        return NextResponse.json({ error: 'Withdrawal is already processed' }, { status: 400 });
    }

    const wallet = await Wallet.findOne({ vendorId: withdrawal.vendorId });
    if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });

    if (status === 'Approved') {
        wallet.pendingBalance -= withdrawal.amount;
        wallet.withdrawnBalance += withdrawal.amount;
    } else if (status === 'Rejected') {
        wallet.pendingBalance -= withdrawal.amount;
        wallet.availableBalance += withdrawal.amount;
    }

    withdrawal.status = status;
    withdrawal.notes = notes;

    await Promise.all([wallet.save(), withdrawal.save()]);

    return NextResponse.json({ message: 'Withdrawal processed successfully', withdrawal });
  } catch (error: any) {
    console.error('Process Withdrawal Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
