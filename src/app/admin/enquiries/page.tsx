import dbConnect from '@/lib/db';
import Enquiry from '@/lib/models/Enquiry';
import Product from '@/lib/models/Product'; // Need to populate if necessary
import EnquiriesTableClient from '@/components/admin/EnquiriesTableClient';

export default async function AdminEnquiriesPage() {
  await dbConnect();
  
  // Sort by newest first and populate the product information if linked
  const enquiries = await Enquiry.find({})
    .populate('product', 'name')
    .sort({ createdAt: -1 });

  return (
    <div className="w-full">
      <EnquiriesTableClient initialEnquiries={JSON.parse(JSON.stringify(enquiries))} />
    </div>
  );
}
