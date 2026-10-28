'use client';

import { useState, useEffect } from 'react';
import { Check, X, Clock, Eye, Copy, CheckCheck, Building2, IndianRupee } from 'lucide-react';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch('/api/admin/withdrawals');
      if (!res.ok) throw new Error('Failed to load withdrawals');
      const data = await res.json();
      setWithdrawals(data.withdrawals || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processWithdrawal = async (id: string, status: 'Approved' | 'Rejected') => {
    if (!confirm(`Are you sure you want to mark this payout request as ${status}?`)) return;

    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes: `Processed by admin on ${new Date().toLocaleDateString()}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process');
      
      alert(`Withdrawal ${status} successfully`);
      setSelectedWithdrawal(null);
      fetchWithdrawals(); // refresh list
    } catch (err: any) {
      alert(err.message);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="text-neutral-500 py-10 text-center">Loading payout requests...</div>;
  if (error) return <div className="text-red-500 py-10 text-center">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Vendor Payouts</h1>
          <p className="text-sm text-gray-400 mt-1">Review vendor withdrawal requests and verify bank/UPI payout details.</p>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#222] border-b border-[#333]">
              <tr className="text-gray-400 text-sm">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Vendor</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Bank / UPI Details</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    No withdrawal requests found.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w._id} className="text-gray-300 hover:bg-[#222] transition-colors">
                    <td className="p-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(w.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-white">{w.vendorId?.businessName || 'Unknown Vendor'}</div>
                      {w.vendorId?.ownerName && (
                        <div className="text-xs text-gray-400">{w.vendorId.ownerName}</div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-white whitespace-nowrap">
                      ₹{w.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 max-w-[200px] truncate text-sm" title={w.bankDetails}>
                          {w.bankDetails}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedWithdrawal(w);
                            setCopied(false);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-md transition-colors flex items-center gap-1.5 shrink-0"
                          title="View Full Bank Details"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center w-max gap-1.5 ${
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
                    <td className="p-4 text-right whitespace-nowrap">
                      {w.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => processWithdrawal(w._id, 'Approved')}
                            className="px-3 py-1.5 text-green-400 hover:bg-green-500/20 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold border border-green-500/20"
                            title="Approve Payout"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button 
                            onClick={() => processWithdrawal(w._id, 'Rejected')}
                            className="px-3 py-1.5 text-red-400 hover:bg-red-500/20 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold border border-red-500/20"
                            title="Reject Payout"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs italic">
                          {w.status === 'Approved' ? 'Transferred' : 'Rejected'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL BANK DETAILS MODAL */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1f1f1f] border border-[#383838] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-gray-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#333] pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  Vendor Bank & Payout Details
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Request ID: <span className="font-mono text-gray-300">{selectedWithdrawal._id}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedWithdrawal(null)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-[#333] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Key Information Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#161616] p-3.5 rounded-xl border border-[#2a2a2a]">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Payout Amount</p>
                <p className="text-xl font-bold text-white mt-0.5">
                  ₹{selectedWithdrawal.amount.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-[#161616] p-3.5 rounded-xl border border-[#2a2a2a]">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 mt-1 text-xs font-semibold rounded-md ${
                  selectedWithdrawal.status === 'Approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                  selectedWithdrawal.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}>
                  {selectedWithdrawal.status === 'Approved' && <Check className="w-3.5 h-3.5" />}
                  {selectedWithdrawal.status === 'Rejected' && <X className="w-3.5 h-3.5" />}
                  {selectedWithdrawal.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                  {selectedWithdrawal.status}
                </span>
              </div>
            </div>

            {/* Vendor Details */}
            <div className="bg-[#161616] p-3.5 rounded-xl border border-[#2a2a2a] space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Vendor Business:</span>
                <span className="text-white font-medium">{selectedWithdrawal.vendorId?.businessName || 'Unknown Vendor'}</span>
              </div>
              {selectedWithdrawal.vendorId?.ownerName && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Owner Name:</span>
                  <span className="text-gray-300">{selectedWithdrawal.vendorId.ownerName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Requested On:</span>
                <span className="text-gray-300">
                  {new Date(selectedWithdrawal.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </span>
              </div>
            </div>

            {/* Complete Bank / UPI Details Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Complete Bank / UPI Payout Details
                </label>
                <button
                  type="button"
                  onClick={() => copyToClipboard(selectedWithdrawal.bankDetails)}
                  className="px-2.5 py-1 text-xs font-medium text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-md transition-colors flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Details</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-[#111] border border-[#333] rounded-xl text-emerald-300 font-mono text-sm leading-relaxed whitespace-pre-wrap select-all break-words max-h-60 overflow-y-auto">
                {selectedWithdrawal.bankDetails}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-[#333] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedWithdrawal(null)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#2e2e2e] rounded-lg transition-colors"
              >
                Close
              </button>

              {selectedWithdrawal.status === 'Pending' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => processWithdrawal(selectedWithdrawal._id, 'Rejected')}
                    className="px-4 py-2 text-sm font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => processWithdrawal(selectedWithdrawal._id, 'Approved')}
                    className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-green-900/30"
                  >
                    <Check className="w-4 h-4" /> Approve & Pay
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
