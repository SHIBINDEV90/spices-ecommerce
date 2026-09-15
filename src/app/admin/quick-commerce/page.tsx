'use client';

import { useState, useEffect } from 'react';
import { 
  Zap, 
  Store, 
  Package, 
  Clock, 
  MapPin, 
  Loader2, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function AdminQuickCommercePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/quick-commerce');
      const result = await res.json();
      if (res.ok && result.success) {
        setData(result);
      } else {
        setError(result.error || 'Failed to load quick commerce data');
      }
    } catch (err: any) {
      console.error(err);
      setError('Network error loading admin quick commerce');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <span className="ml-3 text-gray-400">Loading Quick Commerce Network...</span>
      </div>
    );
  }

  const stats = data?.stats || {};
  const vendors = data?.vendors || [];
  const orders = data?.orders || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>35 km Hyperlocal Operations</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Quick Commerce Hub
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Global monitoring of local 35 km delivery radius, active vendor stores, and rapid dispatches.
          </p>
        </div>

        <Link
          href="/quick"
          target="_blank"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:opacity-90 text-white font-bold text-xs shadow-lg transition flex items-center gap-2 self-start sm:self-auto"
        >
          <span>View Live Quick Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Active Quick Stores</span>
            <span className="text-3xl font-black text-white mt-1 block">{stats.activeQuickVendors || 0}</span>
            <span className="text-[11px] text-emerald-400 font-medium">Within 35 km radius</span>
          </div>
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Store className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Quick Spices In Catalog</span>
            <span className="text-3xl font-black text-white mt-1 block">{stats.quickProductsCount || 0}</span>
            <span className="text-[11px] text-gray-400 font-medium">Ready for immediate pack</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Quick Orders</span>
            <span className="text-3xl font-black text-white mt-1 block">{stats.totalQuickOrders || 0}</span>
            <span className="text-[11px] text-orange-400 font-medium">Hyperlocal dispatches</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Guaranteed Window</span>
            <span className="text-3xl font-black text-white mt-1 block">30–60m</span>
            <span className="text-[11px] text-gray-400 font-medium">Under 35 km transit</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Stores Network */}
      <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-bold text-white">Registered 35 km Quick Commerce Stores</h2>
          </div>
          <span className="text-xs text-gray-400">{vendors.length} stores active</span>
        </div>

        {vendors.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            No vendors have activated Quick Commerce yet. Vendors can enable it from their Vendor Dashboard under "Quick Commerce".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-white/5 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Store / Vendor</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Coordinates (Lng, Lat)</th>
                  <th className="py-3 px-4">Radius</th>
                  <th className="py-3 px-4">Prep Time</th>
                  <th className="py-3 px-4">Live Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {vendors.map((v: any) => {
                  const coords = v.location?.coordinates || [76.2999, 9.9312];
                  const qc = v.quickCommerce || {};

                  return (
                    <tr key={v._id} className="hover:bg-white/5 transition">
                      <td className="py-3 px-4 font-bold text-white">
                        {v.businessName}
                        <span className="block text-xs font-normal text-gray-400">{v.businessAddress?.city}, Kerala</span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{v.ownerName}</td>
                      <td className="py-3 px-4 font-mono text-xs text-orange-300">
                        {coords[0].toFixed(4)}, {coords[1].toFixed(4)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {qc.deliveryRadiusKm || 35} km
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {qc.preparationTimeMinutes || 15} mins
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          qc.isAcceptingOrders !== false
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${qc.isAcceptingOrders !== false ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          {qc.isAcceptingOrders !== false ? 'Accepting Orders' : 'Paused'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Quick Orders */}
      <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Recent Quick Commerce Orders (35 km)</h2>
          </div>
          <Link href="/admin/orders" className="text-xs text-orange-400 hover:underline">
            View All Orders &rarr;
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            No quick commerce orders placed yet. Place a test order through the ⚡ Quick Commerce page.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-white/5 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Delivery Point</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((o: any) => (
                  <tr key={o._id} className="hover:bg-white/5 transition">
                    <td className="py-3 px-4 font-mono text-xs text-orange-400 font-bold">
                      #{o._id.toString().slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {o.customerName}
                      <span className="block text-xs text-gray-400">{o.customerEmail}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-300 max-w-xs truncate">
                      {o.shippingAddress?.city}, {o.shippingAddress?.state}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {o.products?.length || 0} items
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      ₹{o.totalAmount}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {o.orderStatus || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
