import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { Users, Mail, Phone, MapPin } from 'lucide-react';

export default async function AdminCustomersPage() {
  await dbConnect();

  // Aggregate orders by customerEmail to build a lightweight CRM system
  const customerPipeline = await Order.aggregate([
    { $sort: { createdAt: -1 } }, // Latest order first for accurate most recent address
    {
      $group: {
        _id: "$customerEmail",
        name: { $first: "$customerName" },
        phone: { $first: "$customerPhone" },
        shippingAddress: { $first: "$shippingAddress" },
        totalOrders: { $sum: 1 },
        lifetimeValue: { $sum: "$totalAmount" },
        lastOrderDate: { $max: "$createdAt" },
      }
    },
    { $sort: { lifetimeValue: -1 } } // Sort by High Rollers first
  ]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-center pr-0 lg:pr-[300px]">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
            Customer Directory &amp; Analytics
          </h2>
          <p className="text-gray-400 mt-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            {customerPipeline.length} Unique Buyers &bull; Profiles and shipping destinations
          </p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-lg mt-8 shadow-xl">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-black/40 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                <th className="p-4">Customer Profile</th>
                <th className="p-4">Latest Shipping Destination</th>
                <th className="p-4">Gross Orders</th>
                <th className="p-4">Lifetime Value</th>
                <th className="p-4 text-right">Last Interaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {customerPipeline.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No customers registered yet.</p>
                  </td>
                </tr>
              ) : (
                customerPipeline.map((cust) => {
                  const addr = cust.shippingAddress;
                  const formattedAddress = addr 
                    ? [addr.street, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean).join(', ')
                    : 'No address on file';

                  return (
                    <tr key={cust._id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <p className="font-semibold text-white">{cust.name}</p>
                        <a href={`mailto:${cust._id}`} className="text-xs text-blue-400 font-mono mt-0.5 flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                          <Mail className="w-3 h-3 flex-shrink-0" /> {cust._id}
                        </a>
                        {cust.phone && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 font-mono">
                            <Phone className="w-3 h-3 text-gray-500 flex-shrink-0" /> {cust.phone}
                          </p>
                        )}
                      </td>
                      <td className="p-4 max-w-sm">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-xs text-white font-medium truncate">
                              {addr?.street || 'N/A'}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate mt-0.5" title={formattedAddress}>
                              {[addr?.city, addr?.state, addr?.postalCode, addr?.country].filter(Boolean).join(', ') || 'No destination'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-amber-400">
                        {cust.totalOrders} {cust.totalOrders === 1 ? 'order' : 'orders'}
                      </td>
                      <td className="p-4 font-bold text-emerald-400 text-base tracking-tight">
                        ₹{cust.lifetimeValue?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="p-4 text-right text-xs text-gray-400 font-mono">
                        {new Date(cust.lastOrderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
