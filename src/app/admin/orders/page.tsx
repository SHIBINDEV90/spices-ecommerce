import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Vendor from '@/lib/models/Vendor';
import OrdersTableClient from '@/components/admin/OrdersTableClient';

export default async function AdminOrdersPage() {
  await dbConnect();
  
  // Ensure Vendor model is registered for populate
  if (!Vendor) {
    console.log('Vendor model initialized');
  }

  // Sort by newest first and populate vendor details
  const orders = await Order.find({})
    .populate({
      path: 'products.vendorId',
      select: 'businessName ownerName email phone vendorType'
    })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="w-full">
      <OrdersTableClient initialOrders={JSON.parse(JSON.stringify(orders))} />
    </div>
  );
}
