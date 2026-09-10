'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Loader2, 
  CheckCircle, 
  Clock, 
  Truck, 
  Package, 
  MapPin, 
  Mail, 
  Phone, 
  Eye, 
  X, 
  Copy, 
  Check, 
  Search, 
  Receipt, 
  CreditCard,
  FileText
} from 'lucide-react';

interface OrdersTableClientProps {
  initialOrders: any[];
}

export default function OrdersTableClient({ initialOrders }: OrdersTableClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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

      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder((prev: any) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-3.5 h-3.5" />;
      case 'Paid': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'Shipped': return <Truck className="w-3.5 h-3.5" />;
      case 'Delivered': return <Package className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const statusColors: Record<string, string> = {
    Pending: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    Paid: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Shipped: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  const formatShippingAddress = (addr: any) => {
    if (!addr) return 'No shipping destination provided';
    const parts = [addr.street, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean);
    return parts.join(', ');
  };

  const handleCopyDestination = (order: any) => {
    const text = [
      order.customerName,
      order.customerEmail,
      order.customerPhone ? `Phone: ${order.customerPhone}` : null,
      formatShippingAddress(order.shippingAddress)
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(text);
    setCopiedId(order._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'ALL' || order.orderStatus === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesStatus;

    const fullAddr = formatShippingAddress(order.shippingAddress).toLowerCase();
    const name = (order.customerName || '').toLowerCase();
    const email = (order.customerEmail || '').toLowerCase();
    const phone = (order.customerPhone || '').toLowerCase();
    const id = (order._id || '').toLowerCase();

    const matchesQuery = 
      name.includes(query) ||
      email.includes(query) ||
      phone.includes(query) ||
      id.includes(query) ||
      fullAddr.includes(query);

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-600">
            Orders &amp; Shipping Management
          </h2>
          <p className="text-gray-400 mt-1.5 flex items-center gap-2 text-sm">
            <ShoppingCart className="w-4 h-4 text-orange-400" />
            <span>{orders.length} Total Orders &bull; Manage customer shipments &amp; tracking</span>
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search customer, city, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-orange-500/50 transition-colors w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50 transition-colors cursor-pointer"
          >
            <option value="ALL" className="bg-gray-900 text-white">All Statuses</option>
            <option value="Pending" className="bg-gray-900 text-white">Pending</option>
            <option value="Paid" className="bg-gray-900 text-white">Paid</option>
            <option value="Shipped" className="bg-gray-900 text-white">Shipped</option>
            <option value="Delivered" className="bg-gray-900 text-white">Delivered</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-lg shadow-xl">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-black/40 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Shipping Destination</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              <AnimatePresence>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-base font-medium">No orders found.</p>
                      <p className="text-xs text-gray-500 mt-1">Try clearing filters or search terms.</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => (
                    <motion.tr 
                      key={order._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* Order ID */}
                      <td className="p-4 font-mono text-xs text-orange-400/90 font-semibold">
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </td>

                      {/* Customer Details */}
                      <td className="p-4">
                        <p className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-gray-500 flex-shrink-0" />
                          <span>{order.customerEmail}</span>
                        </p>
                        {order.customerPhone && (
                          <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-gray-500 flex-shrink-0" />
                            <span>{order.customerPhone}</span>
                          </p>
                        )}
                      </td>

                      {/* Shipping Destination */}
                      <td className="p-4 max-w-xs">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-white font-medium text-xs truncate">
                              {order.shippingAddress?.street || 'Street not set'}
                            </p>
                            <p className="text-gray-400 text-xs truncate mt-0.5">
                              {[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode, order.shippingAddress?.country].filter(Boolean).join(', ') || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="p-4 font-bold text-emerald-400 text-base">
                        ₹{order.totalAmount?.toLocaleString('en-IN') || 0}
                      </td>

                      {/* Payment */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border w-fit ${
                            order.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            order.paymentStatus === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {order.paymentStatus?.toUpperCase() || 'PENDING'}
                          </span>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : (order.paymentMethod === 'stripe' ? 'Stripe (Card)' : 'Razorpay (UPI)')}
                          </span>
                        </div>
                      </td>

                      {/* Status & Action dropdown */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 relative">
                          {updatingId === order._id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                          ) : (
                            <select
                              value={order.orderStatus || 'Pending'}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              className={`appearance-none outline-none cursor-pointer pl-8 pr-4 py-1.5 text-xs font-semibold rounded-lg border transition-all ${statusColors[order.orderStatus || 'Pending']}`}
                            >
                              <option value="Pending" className="bg-gray-900 text-white">Pending</option>
                              <option value="Paid" className="bg-gray-900 text-white">Paid</option>
                              <option value="Shipped" className="bg-gray-900 text-white">Shipped</option>
                              <option value="Delivered" className="bg-gray-900 text-white">Delivered</option>
                            </select>
                          )}
                          <div className="absolute left-2.5 pointer-events-none opacity-80">
                            {getStatusIcon(order.orderStatus || 'Pending')}
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-xs text-gray-400 font-mono">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>

                      {/* Details Button */}
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 bg-white/10 hover:bg-orange-500/20 hover:text-orange-400 text-gray-300 rounded-lg text-xs font-medium transition-all inline-flex items-center gap-1.5 border border-white/10"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Order & Customer Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#121212] border border-white/15 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col text-white"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-start sticky top-0 bg-[#121212]/95 backdrop-blur z-10">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-md border border-orange-500/20">
                      #{selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
                      selectedOrder.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {selectedOrder.paymentStatus?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-2">
                    Order from {selectedOrder.customerName}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                
                {/* 1. SHIPPING DESTINATION CARD (Customer Focus) */}
                <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>Shipping Destination</span>
                    </div>

                    <button
                      onClick={() => handleCopyDestination(selectedOrder)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-xs text-gray-200 rounded-lg flex items-center gap-1.5 transition-colors border border-white/10"
                    >
                      {copiedId === selectedOrder._id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                          <span>Copy Address</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <p className="font-semibold text-white text-base">
                      {selectedOrder.customerName} &bull; <span className="font-mono text-gray-300 font-normal">{selectedOrder.customerEmail}</span>
                      {selectedOrder.customerPhone && (
                        <span className="text-amber-300 font-medium"> &bull; {selectedOrder.customerPhone}</span>
                      )}
                    </p>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {selectedOrder.shippingAddress?.street ? (
                        <>
                          {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}, {selectedOrder.shippingAddress.country}
                        </>
                      ) : (
                        <span className="text-gray-500 italic">No street address provided</span>
                      )}
                    </p>
                  </div>

                  {selectedOrder.orderNote && (
                    <div className="mt-4 pt-3 border-t border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2">
                      <FileText className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                      <div>
                        <span className="font-semibold">Customer Note:</span> {selectedOrder.orderNote}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. ORDER ITEMS BREAKDOWN */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center gap-2 font-semibold text-sm text-gray-300 mb-4">
                    <Receipt className="w-4 h-4 text-orange-400" />
                    <span>Purchased Spices &amp; Products</span>
                  </div>

                  <div className="divide-y divide-white/5">
                    {selectedOrder.products?.map((item: any, idx: number) => (
                      <div key={idx} className="py-3 flex justify-between items-center text-sm">
                        <div className="pr-4">
                          <p className="font-medium text-white">{item.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Quantity: <span className="text-gray-200 font-semibold">{item.quantity}</span> &bull; Rate: ₹{item.price?.toFixed(0)} each
                          </p>
                        </div>
                        <span className="font-bold text-white text-sm font-mono">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 mt-2 border-t border-white/10 space-y-2 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className="text-white">Included / Standard</span>
                    </div>
                    {selectedOrder.couponCode && (
                      <div className="flex justify-between text-emerald-400 font-medium">
                        <span>Coupon Applied ({selectedOrder.couponCode})</span>
                        <span>-₹{(selectedOrder.discountAmount || 0).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {selectedOrder.paymentMethod === 'cod' && (
                      <div className="flex justify-between text-amber-400">
                        <span>Cash On Delivery Surcharge</span>
                        <span>+₹75</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-white/10 text-base font-bold text-white">
                      <span>Total Invoice Amount</span>
                      <span className="text-emerald-400 text-lg">
                        ₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. PAYMENT & GATEWAY AUDITING */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-orange-400" />
                      <span>Payment Method</span>
                    </div>
                    <p className="font-semibold text-white">
                      {selectedOrder.paymentMethod === 'cod' 
                        ? 'Cash On Delivery (COD)' 
                        : selectedOrder.paymentMethod === 'stripe' 
                        ? 'Stripe International Gateway' 
                        : 'Razorpay UPI / Cards / Net Banking'
                      }
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                      <Receipt className="w-3.5 h-3.5 text-orange-400" />
                      <span>Gateway / Payment ID</span>
                    </div>
                    <p className="font-mono text-xs text-gray-300 break-all">
                      {selectedOrder.paymentId || selectedOrder.paymentGatewayId || 'N/A (Pending)'}
                    </p>
                  </div>
                </div>

                {/* 4. UPDATE STATUS QUICK ACTION */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-sm font-medium text-gray-300">
                    Update Shipment / Order Status:
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {updatingId === selectedOrder._id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                    ) : (
                      <select
                        value={selectedOrder.orderStatus || 'Pending'}
                        onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                        className={`appearance-none outline-none cursor-pointer pl-8 pr-6 py-2 text-xs font-semibold rounded-lg border transition-all ${statusColors[selectedOrder.orderStatus || 'Pending']}`}
                      >
                        <option value="Pending" className="bg-gray-900 text-white">Pending</option>
                        <option value="Paid" className="bg-gray-900 text-white">Paid</option>
                        <option value="Shipped" className="bg-gray-900 text-white">Shipped</option>
                        <option value="Delivered" className="bg-gray-900 text-white">Delivered</option>
                      </select>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
