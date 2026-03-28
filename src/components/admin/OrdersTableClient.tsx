'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Loader2, CheckCircle, Clock, Truck, Package } from 'lucide-react';

interface OrdersTableClientProps {
  initialOrders: any[];
}

export default function OrdersTableClient({ initialOrders }: OrdersTableClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status.');
      
      setOrders(prev => prev.map(order => 
        order._id === id ? { ...order, orderStatus: newStatus } : order
      ));
    } catch (error) {
      console.error(error);
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-3 h-3" />;
      case 'Paid': return <CheckCircle className="w-3 h-3" />;
      case 'Shipped': return <Truck className="w-3 h-3" />;
      case 'Delivered': return <Package className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const statusColors: Record<string, string> = {
    Pending: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    Paid: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Shipped: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-600">
            Orders Management
          </h2>
          <p className="text-gray-400 mt-2 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            {orders.length} Total Orders
          </p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-lg">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-black/40 text-gray-400 text-sm">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Country</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 font-medium">Status & Action</th>
                <th className="p-4 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No orders yet. They will appear here when customers purchase.</p>
                    </td>
                  </tr>
                ) : (
                  orders.map((order, index) => (
                    <motion.tr 
                      key={order._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-4 font-mono text-xs text-gray-400">
                        {order._id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-white">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.customerEmail}</p>
                      </td>
                      <td className="p-4 text-gray-300">
                        {order.shippingAddress?.country || 'N/A'}
                      </td>
                      <td className="p-4 font-medium text-emerald-400">
                        ${order.totalAmount?.toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${
                          order.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          order.paymentStatus === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {order.paymentStatus?.toUpperCase() || 'PENDING'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 relative">
                          {updatingId === order._id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                          ) : (
                            <select
                              value={order.orderStatus || 'Pending'}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              className={`appearance-none outline-none cursor-pointer pl-8 pr-4 py-1.5 text-xs font-semibold rounded-md border transition-all ${statusColors[order.orderStatus || 'Pending']}`}
                            >
                              <option value="Pending" className="bg-gray-800 text-white">Pending</option>
                              <option value="Paid" className="bg-gray-800 text-white">Paid</option>
                              <option value="Shipped" className="bg-gray-800 text-white">Shipped</option>
                              <option value="Delivered" className="bg-gray-800 text-white">Delivered</option>
                            </select>
                          )}
                          <div className="absolute left-2.5 pointer-events-none opacity-70">
                            {getStatusIcon(order.orderStatus || 'Pending')}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right text-sm text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
