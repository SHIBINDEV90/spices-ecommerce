'use client';

import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, IndianRupee } from 'lucide-react';
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
          <div className="grid grid-cols-2 gap-4">
            <Link href="/vendor/products/new" className="flex flex-col items-center justify-center p-6 bg-neutral-50 rounded-lg border border-neutral-100 hover:border-primary/30 hover:bg-primary/5 transition-colors text-center group">
              <Package className="w-8 h-8 text-neutral-400 group-hover:text-primary mb-2" />
              <span className="text-sm font-medium text-neutral-700 group-hover:text-primary">Add New Product</span>
            </Link>
            <Link href="/vendor/products" className="flex flex-col items-center justify-center p-6 bg-neutral-50 rounded-lg border border-neutral-100 hover:border-primary/30 hover:bg-primary/5 transition-colors text-center group">
              <Package className="w-8 h-8 text-neutral-400 group-hover:text-primary mb-2" />
              <span className="text-sm font-medium text-neutral-700 group-hover:text-primary">Manage Catalog</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
