'use client';

import { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  Loader2,
  Eye,
  Copy,
  CheckCheck,
  X,
  Building2
} from 'lucide-react';
import Link from 'next/link';

export default function VendorWallet() {
  const [wallet, setWallet] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [amount, setAmount] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Details Modal State
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/vendor/wallet');
      if (!res.ok) throw new Error('Failed to load wallet');
      const data = await res.json();
      setWallet(data.wallet);
      setWithdrawals(data.withdrawals || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const availableBal = wallet?.availableBalance || 0;
    const numAmount = Number(amount);

    // Explicit validations with clear error messages
    if (availableBal <= 0) {
      setFormError('Your available balance is ₹0. Earnings in "Pending Clearance" will become available for payout once orders are marked as Delivered.');
      return;
    }

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid payout amount greater than ₹0.');
      return;
    }

    if (numAmount > availableBal) {
      setFormError(`Requested amount (₹${numAmount.toLocaleString('en-IN')}) exceeds your available balance of ₹${availableBal.toLocaleString('en-IN')}.`);
      return;
    }

    if (!bankDetails.trim()) {
      setFormError('Please enter your Bank Account details or UPI ID.');
      return;
    }

    setRequesting(true);
    try {
      const res = await fetch('/api/vendor/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numAmount, bankDetails: bankDetails.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit withdrawal request');
      }

      setFormSuccess(`Payout request for ₹${numAmount.toLocaleString('en-IN')} submitted successfully! Admin will review and process.`);
      setAmount('');
      setBankDetails('');
      await fetchWallet(); // refresh wallet & history
    } catch (err: any) {
      setFormError(err.message || 'Error submitting payout request.');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <div className="text-neutral-500 py-10 text-center">Loading wallet & payout details...</div>;
  if (error) return <div className="text-red-500 py-10 text-center">{error}</div>;

  const availableBalance = wallet?.availableBalance || 0;
  const pendingBalance = wallet?.pendingBalance || 0;
  const withdrawnBalance = wallet?.withdrawnBalance || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Wallet & Payouts</h1>
          <p className="text-sm text-neutral-500 mt-1">Track your spice sales earnings, cleared balances, and withdrawal requests.</p>
        </div>
        <Link
          href="/vendor/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline bg-green-50 px-3.5 py-2 rounded-lg border border-green-200"
        >
          <span>Manage Orders to Clear Earnings</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <IndianRupee className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Available to Withdraw</p>
            <p className="text-2xl font-bold text-neutral-900">₹{availableBalance.toLocaleString('en-IN')}</p>
            <p className="text-xs text-green-600 font-medium mt-0.5">Cleared and ready for payout</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Pending Clearance</p>
            <p className="text-2xl font-bold text-neutral-900">₹{pendingBalance.toLocaleString('en-IN')}</p>
            <p className="text-xs text-amber-600 font-medium mt-0.5">Clears when orders are marked Delivered</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Total Withdrawn</p>
            <p className="text-2xl font-bold text-neutral-900">₹{withdrawnBalance.toLocaleString('en-IN')}</p>
            <p className="text-xs text-blue-600 font-medium mt-0.5">Successfully transferred to your bank</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Withdrawal Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Request Payout</h2>
              {availableBalance > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(availableBalance.toString())}
                  className="text-xs text-primary font-medium hover:underline bg-green-50 px-2 py-1 rounded"
                >
                  Use Max (₹{availableBalance.toLocaleString('en-IN')})
                </button>
              )}
            </div>

            {/* Informative notice if available balance is 0 but pending balance exists */}
            {availableBalance <= 0 && (
              <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-0.5">Available Balance is ₹0</p>
                  <p>
                    You have <span className="font-bold">₹{pendingBalance.toLocaleString('en-IN')}</span> in Pending Clearance. 
                    Earnings become available for payout once your orders are marked as <span className="font-semibold">Delivered</span>.
                  </p>
                  <Link href="/vendor/orders" className="inline-block mt-1.5 font-semibold text-amber-900 underline">
                    Go to Orders to update status &rarr;
                  </Link>
                </div>
              </div>
            )}

            {/* Success message banner */}
            {formSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-xs text-green-800">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Error message banner */}
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">₹</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (formError) setFormError('');
                    }}
                    min="1"
                    className="w-full pl-8 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder={availableBalance > 0 ? `e.g. ${availableBalance}` : '0'}
                    required
                  />
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Available for withdrawal: <span className="font-semibold text-neutral-700">₹{availableBalance.toLocaleString('en-IN')}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Bank / UPI Details
                </label>
                <textarea 
                  value={bankDetails}
                  onChange={(e) => {
                    setBankDetails(e.target.value);
                    if (formError) setFormError('');
                  }}
                  className="w-full border border-neutral-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none transition-all"
                  placeholder="Enter Bank Name, Account Number, IFSC code, or your UPI ID (e.g. name@okhdfcbank)"
                  rows={3}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={requesting}
                className="w-full py-2.5 bg-primary hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                {requesting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <span>Submit Request</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Withdrawal History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Payout History</h2>
              <span className="text-xs font-medium text-neutral-500">{withdrawals.length} request{withdrawals.length === 1 ? '' : 's'}</span>
            </div>
            
            {withdrawals.length === 0 ? (
              <div className="p-12 text-center text-neutral-400">
                <Clock className="w-10 h-10 mx-auto text-neutral-300 mb-3" />
                <p className="font-medium text-neutral-600">No withdrawal requests yet</p>
                <p className="text-xs text-neutral-400 mt-1">Submitted payout requests will appear here with real-time status updates.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-100">
                    <tr>
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Amount</th>
                      <th className="p-4 font-medium">Payout Details</th>
                      <th className="p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {withdrawals.map((w) => (
                      <tr key={w._id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="p-4 text-neutral-600 whitespace-nowrap">
                          {new Date(w.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="p-4 font-bold text-neutral-900 whitespace-nowrap">
                          ₹{w.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-600 max-w-xs truncate text-sm" title={w.bankDetails}>
                              {w.bankDetails}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedWithdrawal(w);
                                setCopied(false);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-primary bg-green-50 hover:bg-green-100 border border-green-200 rounded-md transition-colors flex items-center gap-1.5 shrink-0"
                              title="View Full Payout Details"
                            >
                              <Eye className="w-3.5 h-3.5" /> Details
                            </button>
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-max gap-1.5 ${
                            w.status === 'Approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                            w.status === 'Rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {w.status === 'Approved' && <CheckCircle className="w-3.5 h-3.5" />}
                            {w.status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                            {w.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                            {w.status}
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
      </div>

      {/* FULL BANK DETAILS MODAL (VENDOR VIEW) */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-neutral-800">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Payout Request Details
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Request ID: <span className="font-mono text-neutral-600">{selectedWithdrawal._id}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWithdrawal(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-100">
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Amount</p>
                <p className="text-xl font-bold text-neutral-900 mt-0.5">
                  ₹{selectedWithdrawal.amount.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-100">
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 mt-1 text-xs font-semibold rounded-md ${
                  selectedWithdrawal.status === 'Approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                  selectedWithdrawal.status === 'Rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                  'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {selectedWithdrawal.status === 'Approved' && <CheckCircle className="w-3.5 h-3.5" />}
                  {selectedWithdrawal.status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                  {selectedWithdrawal.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                  {selectedWithdrawal.status}
                </span>
              </div>
            </div>

            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-100 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Submitted On:</span>
                <span className="text-neutral-800 font-medium">
                  {new Date(selectedWithdrawal.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </span>
              </div>
              {selectedWithdrawal.notes && (
                <div className="flex justify-between mt-2 pt-2 border-t border-neutral-200/60">
                  <span className="text-neutral-500">Admin Remarks:</span>
                  <span className="text-neutral-800 italic">{selectedWithdrawal.notes}</span>
                </div>
              )}
            </div>

            {/* Bank Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Bank / UPI Account Details
                </label>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedWithdrawal.bankDetails);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-primary hover:text-green-800 bg-green-50 hover:bg-green-100 border border-green-200 rounded-md transition-colors flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-primary" />
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

              <div className="p-4 bg-neutral-900 text-green-400 font-mono text-sm leading-relaxed whitespace-pre-wrap select-all break-words rounded-xl max-h-56 overflow-y-auto">
                {selectedWithdrawal.bankDetails}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-neutral-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedWithdrawal(null)}
                className="px-4 py-2 text-sm font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

