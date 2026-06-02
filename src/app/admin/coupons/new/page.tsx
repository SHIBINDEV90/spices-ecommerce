import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CouponForm from '@/components/admin/CouponForm';

export default async function NewCouponPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <CouponForm />
    </div>
  );
}
