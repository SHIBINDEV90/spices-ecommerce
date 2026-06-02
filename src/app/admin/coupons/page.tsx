import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import Coupon from '@/lib/models/Coupon';
import CouponsTableClient from '@/components/admin/CouponsTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CouponsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  await dbConnect();

  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  
  const serializedCoupons = coupons.map(c => ({
    ...c,
    _id: c._id.toString(),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    startDate: c.startDate.toISOString(),
    endDate: c.endDate.toISOString(),
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <CouponsTableClient initialCoupons={serializedCoupons} />
    </div>
  );
}
