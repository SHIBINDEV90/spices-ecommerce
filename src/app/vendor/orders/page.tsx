'use client';

import { useState, useEffect } from 'react';
import { Package, Truck, Check, Clock } from 'lucide-react';

type VendorOrder = {
  _id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: any;
  paymentStatus: string;
  createdAt: string;
  vendorTotal: number;
  products: any[];
};

export default function VendorOrders() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/vendor/orders');
        if (!res.ok) throw new Error('Failed to load orders');
        const data = await res.json();
        setOrders(data.orders);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/vendor/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      // Update local state
      setOrders(orders.map(o => {
        if (o._id === orderId) {
          return {
            ...o,
            products: o.products.map(p => ({ ...p, status: newStatus }))
          };
        }
        return o;
      }));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-neutral-500">Loading orders...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Manage Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-neutral-500 border border-neutral-100">
          <Package className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
          <p>No orders found yet. When customers buy your products, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            // Since we set status for all vendor products simultaneously, grab the first one
            const vendorStatus = order.products[0]?.status || 'Pending';
            
            return (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
                <div className="p-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-neutral-900">Order #{order._id.slice(-6).toUpperCase()}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid (COD)'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vendorStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 
                        vendorStatus === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                        vendorStatus === 'Accepted' ? 'bg-purple-100 text-purple-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {vendorStatus}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {vendorStatus === 'Pending' && (
                      <button onClick={() => handleStatusChange(order._id, 'Accepted')} className="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                        <Check className="w-4 h-4" /> Accept Order
                      </button>
                    )}
                    {vendorStatus === 'Accepted' && (
                      <button onClick={() => handleStatusChange(order._id, 'Shipped')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Mark Shipped
                      </button>
                    )}
                    {vendorStatus === 'Shipped' && (
                      <button onClick={() => handleStatusChange(order._id, 'Delivered')} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                        <Package className="w-4 h-4" /> Mark Delivered
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-5 flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wider">Items to Fulfill</h3>
                    <div className="space-y-3">
                      {order.products.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-neutral-700">{item.quantity}x {item.name}</span>
                          <span className="text-neutral-900 font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                      <div className="pt-3 mt-3 border-t border-neutral-100 flex justify-between font-bold text-neutral-900">
                        <span>Your Revenue (Pre-Commission)</span>
                        <span className="text-primary">₹{order.vendorTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-64 bg-neutral-50 rounded-lg p-4 text-sm">
                    <h3 className="font-semibold text-neutral-900 mb-2">Customer Details</h3>
                    <p className="text-neutral-800 font-medium">{order.customerName}</p>
                    <p className="text-neutral-500 mb-3">{order.customerEmail}</p>
                    
                    <h3 className="font-semibold text-neutral-900 mb-1">Shipping Address</h3>
                    <p className="text-neutral-600">
                      {order.shippingAddress.street}<br/>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br/>
                      {order.shippingAddress.country}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
