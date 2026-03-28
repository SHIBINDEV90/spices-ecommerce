import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { CreditCard, ShieldCheck } from 'lucide-react';

export default async function AdminPaymentsPage() {
  await dbConnect();
  
  // Sort payments/orders by descending date
  const orders = await Order.find({ paymentStatus: { $in: ['paid', 'failed'] } })
    .select('customerName paymentGatewayId totalAmount paymentStatus createdAt')
    .sort({ createdAt: -1 });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-center pr-0 lg:pr-[400px]">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-600">
            Payment Ledger
          </h2>
          <p className="text-gray-400 mt-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            {orders.length} Processed Transactions
          </p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-lg mt-8">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-black/40 text-gray-400 text-sm">
                <th className="p-4 font-medium">Payment ID</th>
                <th className="p-4 font-medium">Customer (Order)</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Gateway</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">No payments yet.</p>
                  </td>
                </tr>
              ) : (
                orders.map((record) => {
                  const gateway = record.paymentGatewayId 
                    ? record.paymentGatewayId.startsWith('pi_') ? 'Stripe' : 'Razorpay' 
                    : 'System Default';

                  return (
                    <tr key={record._id.toString()} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="p-4 font-mono text-xs text-gray-400">
                        {record.paymentGatewayId || `PAY-${record._id.toString().substring(0,8).toUpperCase()}`}
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-white">{record.customerName}</p>
                        <p className="text-xs text-gray-500 font-mono">Ord: {record._id.toString().substring(0,8).toUpperCase()}</p>
                      </td>
                      <td className="p-4 font-medium text-emerald-400 text-lg">
                        ${record.totalAmount?.toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs border border-white/5 font-medium">
                          {gateway}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${
                          record.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {record.paymentStatus?.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right text-sm text-gray-400">
                        {new Date(record.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
