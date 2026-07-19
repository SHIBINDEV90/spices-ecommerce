import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Wallet from '@/lib/models/Wallet';
import Withdrawal from '@/lib/models/Withdrawal';
import Vendor from '@/lib/models/Vendor';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'Vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const vendor = await Vendor.findOne({ userId: session.user.id });
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

    let wallet = await Wallet.findOne({ vendorId: vendor._id });
    
    if (!wallet) {
        wallet = await Wallet.create({ vendorId: vendor._id });
    }

    const withdrawals = await Withdrawal.find({ vendorId: vendor._id }).sort({ createdAt: -1 });

    return NextResponse.json({ wallet, withdrawals });
  } catch (error: any) {
    console.error('Fetch Wallet Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'Vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const vendor = await Vendor.findOne({ userId: session.user.id });
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

    const { amount, bankDetails } = await req.json();

    if (!amount || amount <= 0 || !bankDetails) {
        return NextResponse.json({ error: 'Invalid amount or bank details' }, { status: 400 });
    }

    const wallet = await Wallet.findOne({ vendorId: vendor._id });
    if (!wallet || wallet.availableBalance < amount) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Deduct from available, add to pending
    wallet.availableBalance -= amount;
    wallet.pendingBalance += amount;
    await wallet.save();

    const withdrawal = await Withdrawal.create({
        vendorId: vendor._id,
        amount,
        bankDetails,
        status: 'Pending'
    });

    return NextResponse.json({ message: 'Withdrawal requested successfully', withdrawal }, { status: 201 });
  } catch (error: any) {
    console.error('Request Withdrawal Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
