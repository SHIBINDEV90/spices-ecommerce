import dbConnect from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
import User from '@/lib/models/User';
import VendorEditForm from '@/components/admin/VendorEditForm';
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export default async function EditVendorPage({ params }: { params: { id: string } }) {
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    notFound();
  }

  // Ensure User model is loaded for populate
  const _user = User;
  
  const vendor = await Vendor.findById(params.id).populate({
    path: 'userId',
    select: 'name email phone role createdAt',
  });

  if (!vendor) {
    notFound();
  }

  return (
    <div className="py-2">
      <VendorEditForm
        initialVendor={JSON.parse(JSON.stringify(vendor))}
        vendorId={params.id}
      />
    </div>
  );
}
