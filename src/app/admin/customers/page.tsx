import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { Users, Mail } from 'lucide-react';

export default async function AdminCustomersPage() {
  await dbConnect();

  // Aggregate orders by customerEmail to build a lightweight CRM system
  const customerPipeline = await Order.aggregate([
    {
      $group: {
        _id: "$customerEmail",
        name: { $first: "$customerName" }, // Assumes name doesn't change wildly, takes first found
        totalOrders: { $sum: 1 },
        lifetimeValue: { $sum: "$totalAmount" },
        lastOrderDate: { $max: "$createdAt" },
        mostRecentCountry: { $first: "$shippingAddress.country" },
      }
    },
    { $sort: { lifetimeValue: -1 } } // Sort by High Rollers first
  ]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-center pr-0 lg:pr-[300px]">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
            Customer Analytics
          </h2>
          <p className="text-gray-400 mt-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {customerPipeline.length} Unique Buyers
          </p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-lg mt-8">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-black/40 text-gray-400 text-sm">
                <th className="p-4 font-medium">Customer Profile</th>
                <th className="p-4 font-medium">Country Focus</th>
                <th className="p-4 font-medium">Gross Orders</th>
                <th className="p-4 font-medium">Lifetime Value</th>
                <th className="p-4 font-medium text-right">Last Interaction</th>
              </tr>
            </thead>
            <tbody>
              {customerPipeline.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">No customers registered yet.</p>
                  </td>
                </tr>
              ) : (
                customerPipeline.map((cust) => (
                  <tr key={cust._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <p className="font-semibold text-white">{cust.name}</p>
                      <a href={`mailto:${cust._id}`} className="text-xs text-blue-400 font-mono mt-1 flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                        <Mail className="w-3 h-3" /> {cust._id}
                      </a>
                    </td>
                    <td className="p-4 text-gray-300">
                      {cust.mostRecentCountry || 'N/A'}
                    </td>
                    <td className="p-4 font-medium text-amber-400">
                      {cust.totalOrders}
                    </td>
                    <td className="p-4 font-bold text-emerald-400 text-lg tracking-tight">
                      ${cust.lifetimeValue?.toFixed(2)}
                    </td>
                    <td className="p-4 text-right text-sm text-gray-400">
                      {new Date(cust.lastOrderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
