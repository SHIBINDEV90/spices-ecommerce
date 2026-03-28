import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import OrdersTableClient from '@/components/admin/OrdersTableClient';

export default async function AdminOrdersPage() {
  await dbConnect();
  
  // Sort by newest first
  const orders = await Order.find({}).sort({ createdAt: -1 });

  return (
    <div className="w-full">
      <OrdersTableClient initialOrders={JSON.parse(JSON.stringify(orders))} />
    </div>
  );
}
