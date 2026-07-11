import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import CouponForm from '@/components/admin/CouponForm';
import dbConnect from '@/lib/db';
import Coupon from '@/lib/models/Coupon';

export default async function EditCouponPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  await dbConnect();
  const coupon = await Coupon.findById(params.id).lean();

  if (!coupon) {
    notFound();
  }

  // Convert MongoDB ObjectIds and Dates to strings/primitives to avoid serialization issues
  const serializedCoupon = {
    ...coupon,
    _id: coupon._id.toString(),
    startDate: coupon.startDate instanceof Date ? coupon.startDate.toISOString() : coupon.startDate,
    endDate: coupon.endDate instanceof Date ? coupon.endDate.toISOString() : coupon.endDate,
    createdAt: coupon.createdAt instanceof Date ? coupon.createdAt.toISOString() : coupon.createdAt,
    updatedAt: coupon.updatedAt instanceof Date ? coupon.updatedAt.toISOString() : coupon.updatedAt,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <CouponForm initialData={serializedCoupon} />
    </div>
  );
}
