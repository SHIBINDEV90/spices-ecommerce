'use client';

import { useState, useEffect } from 'react';
import { Check, X, Clock, DollarSign } from 'lucide-react';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch('/api/admin/withdrawals');
      if (!res.ok) throw new Error('Failed to load withdrawals');
      const data = await res.json();
      setWithdrawals(data.withdrawals);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processWithdrawal = async (id: string, status: 'Approved' | 'Rejected') => {
    if (!confirm(`Are you sure you want to mark this as ${status}?`)) return;

    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes: `Processed by admin on ${new Date().toLocaleDateString()}` }),
      });
      if (!res.ok) throw new Error('Failed to process');
      
      alert(`Withdrawal ${status} successfully`);
      fetchWithdrawals(); // refresh list
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-neutral-500">Loading payout requests...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Vendor Payouts</h1>
      </div>

      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#222] border-b border-[#333]">
              <tr className="text-gray-400 text-sm">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Vendor</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Bank Details</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No withdrawal requests found.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w._id} className="text-gray-300 hover:bg-[#222] transition-colors">
                    <td className="p-4">{new Date(w.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="font-medium text-white">{w.vendorId?.businessName || 'Unknown Vendor'}</div>
                    </td>
                    <td className="p-4 font-bold text-white">₹{w.amount.toLocaleString('en-IN')}</td>
                    <td className="p-4 max-w-[200px] truncate text-gray-400" title={w.bankDetails}>
                      {w.bankDetails}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-md flex items-center w-max gap-1.5 ${
                        w.status === 'Approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        w.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {w.status === 'Approved' && <Check className="w-3.5 h-3.5" />}
                        {w.status === 'Rejected' && <X className="w-3.5 h-3.5" />}
                        {w.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                        {w.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {w.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => processWithdrawal(w._id, 'Approved')}
                            className="p-2 text-green-400 hover:bg-green-500/20 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-sm"
                            title="Approve Payout"
                          >
                            <Check className="w-4 h-4" /> Approve
                          </button>
                          <button 
                            onClick={() => processWithdrawal(w._id, 'Rejected')}
                            className="p-2 text-red-400 hover:bg-red-500/20 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-sm"
                            title="Reject Payout"
                          >
                            <X className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm italic">Processed</span>
                      )}
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
