import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import Enquiry from '@/lib/models/Enquiry';
import DashboardCharts from '@/components/admin/DashboardCharts';
import { Package, ShoppingCart, MessageSquare, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';

// Mock data builder for charts for now
const getChartData = () => {
  return {
    revenue: [
      { name: 'Jan', total: 1200 },
      { name: 'Feb', total: 2100 },
      { name: 'Mar', total: 3400 },
      { name: 'Apr', total: 5200 },
      { name: 'May', total: 4800 },
      { name: 'Jun', total: 8500 },
    ],
    enquiries: [
      { name: 'Jan', count: 12 },
      { name: 'Feb', count: 19 },
      { name: 'Mar', count: 15 },
      { name: 'Apr', count: 32 },
      { name: 'May', count: 28 },
      { name: 'Jun', count: 48 },
    ]
  };
};

export default async function AdminDashboardPage() {
  await dbConnect();

  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();
  const totalEnquiries = await Enquiry.countDocuments();
  
  // Unique Customers calculation
  const uniqueCustomers = await Order.distinct('customerEmail');
  
  // Total Revenue calculation
  const paidOrders = await Order.find({ paymentStatus: 'paid' });
  const totalRevenue = paidOrders.reduce((acc, order) => acc + order.totalAmount, 0);

  // Recent Activity Lookups
  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
  const recentEnquiries = await Enquiry.find().sort({ createdAt: -1 }).limit(5);

  const charts = getChartData();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-600">
          Dashboard Overview
        </h1>
        <p className="text-gray-400 mt-2">Welcome back. Here is your business at a glance.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Products', value: totalProducts, icon: Package, color: 'text-blue-400' },
          { label: 'Total Orders', value: totalOrders, icon: ShoppingCart, color: 'text-orange-400' },
          { label: 'Total Enquiries', value: totalEnquiries, icon: MessageSquare, color: 'text-amber-400' },
          { label: 'Total Customers', value: uniqueCustomers.length, icon: Users, color: 'text-green-400' },
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400' },
        ].map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-lg flex items-center gap-4 hover:bg-white/10 transition-colors">
              <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${metric.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">{metric.label}</p>
                <p className="text-2xl font-bold text-white">{metric.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <DashboardCharts revenueData={charts.revenue} enquiryData={charts.enquiries} />

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="text-xl font-semibold">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm text-orange-400 hover:text-orange-300">View All</Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-black/40 text-gray-400 text-sm">
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-center text-gray-500">No recent orders.</td></tr>
                ) : (
                  recentOrders.map(order => (
                    <tr key={order._id.toString()} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4 font-mono text-xs">{order._id.toString().substring(0,8)}</td>
                      <td className="p-4">{order.customerName}</td>
                      <td className="p-4 font-medium text-emerald-400">${order.totalAmount}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          order.orderStatus === 'Pending' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                          order.orderStatus === 'Delivered' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {order.orderStatus || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Enquiries */}
        <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="text-xl font-semibold">Recent Enquiries</h3>
            <Link href="/admin/enquiries" className="text-sm text-amber-400 hover:text-amber-300">View All</Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-black/40 text-gray-400 text-sm">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Country</th>
                  <th className="p-4 font-medium">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {recentEnquiries.length === 0 ? (
                  <tr><td colSpan={3} className="p-4 text-center text-gray-500">No recent enquiries.</td></tr>
                ) : (
                  recentEnquiries.map(enq => (
                    <tr key={enq._id.toString()} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">{enq.name}</td>
                      <td className="p-4">{enq.country}</td>
                      <td className="p-4 text-amber-400">{enq.quantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
