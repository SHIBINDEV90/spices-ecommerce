'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit, Plus, Ticket, Loader2, Power, PowerOff } from 'lucide-react';
import Link from 'next/link';

interface CouponsTableClientProps {
  initialCoupons: any[];
}

export default function CouponsTableClient({ initialCoupons }: CouponsTableClientProps) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete coupon');
      setCoupons(prev => prev.filter(c => c._id !== id));
    } catch (error) {
      console.error(error);
      alert('Failed to delete coupon.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/coupons/${id}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentState })
      });
      if (!res.ok) throw new Error('Failed to update coupon');
      const data = await res.json();
      setCoupons(prev => prev.map(c => c._id === id ? data.coupon : c));
    } catch (error) {
      console.error(error);
      alert('Failed to update coupon status.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-600">
            Coupon Management
          </h2>
          <p className="text-gray-400 mt-2 flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            {coupons.length} Coupons Total
          </p>
        </div>
        <Link 
          href="/admin/coupons/new" 
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-orange-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Coupon</span>
        </Link>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 text-gray-400 text-sm">
                <th className="p-4 font-medium">Code</th>
                <th className="p-4 font-medium">Discount</th>
                <th className="p-4 font-medium">Usage</th>
                <th className="p-4 font-medium">Expires</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      <Ticket className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No coupons found. Start by adding one.</p>
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon, index) => (
                    <motion.tr 
                      key={coupon._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-b border-white/5 transition-colors group ${!coupon.isActive ? 'opacity-50' : 'hover:bg-white/5'}`}
                    >
                      <td className="p-4">
                        <div className="font-bold text-white uppercase tracking-wider">{coupon.code}</div>
                        <div className="text-xs text-gray-500 mt-1 max-w-[200px] truncate">{coupon.description}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-orange-400">
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                        </span>
                        {coupon.minimumOrderAmount > 0 && (
                          <div className="text-xs text-gray-500 mt-1">Min: ₹{coupon.minimumOrderAmount}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-white/10 rounded-full h-1.5 max-w-[80px]">
                            <div 
                              className="bg-orange-500 h-1.5 rounded-full" 
                              style={{ width: `${Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400">{coupon.usedCount} / {coupon.usageLimit}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-300 text-sm">
                        {new Date(coupon.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => handleToggleActive(coupon._id, coupon.isActive)}
                          disabled={loadingId === coupon._id}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${coupon.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20'}`}
                        >
                          {loadingId === coupon._id ? <Loader2 className="w-3 h-3 animate-spin" /> : coupon.isActive ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDelete(coupon._id)}
                            disabled={loadingId === coupon._id}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
