'use client';

import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, IndianRupee, Zap, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function VendorDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/vendor/dashboard');
        if (!res.ok) throw new Error('Failed to load dashboard data');
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="text-neutral-500">Loading dashboard...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const cards = [
    { name: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { name: 'Completed Orders', value: stats.completedOrders, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Total Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.name} className="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4">
            <div className={`p-4 rounded-full ${card.bg}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">{card.name}</p>
              <h3 className="text-2xl font-bold text-neutral-900">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 35km Quick Commerce Banner Card */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-primary/10 border border-amber-300/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-400 text-neutral-950 rounded-xl shadow-sm shrink-0">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-amber-400/30 text-amber-900 rounded-full">
                Hyperlocal Delivery
              </span>
              <h3 className="font-bold text-neutral-900 text-base">Quick Delivery Products Catalog</h3>
            </div>
            <p className="text-xs text-neutral-600">
              Deliver your farm-fresh spices within 3 hours within a 35 km radius in Wayanad.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Link
            href="/vendor/quick-commerce"
            className="px-4 py-2 bg-white hover:bg-neutral-50 text-neutral-800 rounded-xl text-xs font-bold border border-neutral-200 shadow-sm transition"
          >
            Manage Catalog
          </Link>
          <Link
            href="/quick"
            target="_blank"
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl text-xs font-black shadow-sm transition flex items-center gap-1.5 group"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Explore Quick Spices</span>
            <ExternalLink className="w-3 h-3 opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-neutral-900">Recent Activity</h2>
            <Link href="/vendor/orders" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          <div className="text-center py-8 text-neutral-500 text-sm border-2 border-dashed border-neutral-100 rounded-lg">
            No recent activity to display.
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-neutral-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/vendor/products/new" className="flex flex-col items-center justify-center p-4 bg-neutral-50 rounded-lg border border-neutral-100 hover:border-primary/30 hover:bg-primary/5 transition-colors text-center group">
              <Package className="w-6 h-6 text-neutral-400 group-hover:text-primary mb-1.5" />
              <span className="text-xs font-semibold text-neutral-700 group-hover:text-primary">Add New Product</span>
            </Link>
            <Link href="/vendor/products" className="flex flex-col items-center justify-center p-4 bg-neutral-50 rounded-lg border border-neutral-100 hover:border-primary/30 hover:bg-primary/5 transition-colors text-center group">
              <Package className="w-6 h-6 text-neutral-400 group-hover:text-primary mb-1.5" />
              <span className="text-xs font-semibold text-neutral-700 group-hover:text-primary">Manage Catalog</span>
            </Link>
            <Link href="/vendor/quick-commerce" className="flex flex-col items-center justify-center p-4 bg-neutral-50 rounded-lg border border-neutral-100 hover:border-amber-400/50 hover:bg-amber-50/50 transition-colors text-center group">
              <Zap className="w-6 h-6 text-amber-500 mb-1.5" />
              <span className="text-xs font-semibold text-neutral-700 group-hover:text-amber-800">Quick Commerce</span>
            </Link>
            <Link href="/quick" target="_blank" className="flex flex-col items-center justify-center p-4 bg-amber-500/10 rounded-lg border border-amber-300/50 hover:bg-amber-500/20 transition-colors text-center group">
              <Zap className="w-6 h-6 text-amber-600 fill-current mb-1.5" />
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                Explore Quick Spices
                <ExternalLink className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
