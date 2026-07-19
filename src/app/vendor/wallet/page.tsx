'use client';

import { useState, useEffect } from 'react';
import { IndianRupee, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function VendorWallet() {
  const [wallet, setWallet] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [amount, setAmount] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/vendor/wallet');
      if (!res.ok) throw new Error('Failed to load wallet');
      const data = await res.json();
      setWallet(data.wallet);
      setWithdrawals(data.withdrawals);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return alert('Invalid amount');
    if (!bankDetails.trim()) return alert('Please provide bank details');

    setRequesting(true);
    try {
      const res = await fetch('/api/vendor/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), bankDetails }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('Withdrawal requested successfully!');
      setAmount('');
      setBankDetails('');
      fetchWallet(); // refresh
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <div className="text-neutral-500">Loading wallet...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">My Wallet & Payouts</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <IndianRupee className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500 mb-1">Available to Withdraw</p>
            <p className="text-2xl font-bold text-neutral-900">₹{wallet?.availableBalance?.toLocaleString('en-IN') || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500 mb-1">Pending Clearance</p>
            <p className="text-2xl font-bold text-neutral-900">₹{wallet?.pendingBalance?.toLocaleString('en-IN') || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500 mb-1">Total Withdrawn</p>
            <p className="text-2xl font-bold text-neutral-900">₹{wallet?.withdrawnBalance?.toLocaleString('en-IN') || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Withdrawal Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Request Payout</h2>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Amount (₹)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  max={wallet?.availableBalance}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="e.g. 5000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Bank/UPI Details</label>
                <textarea 
                  value={bankDetails}
                  onChange={(e) => setBankDetails(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                  placeholder="Account Number, IFSC code, or UPI ID"
                  rows={3}
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={requesting || !wallet?.availableBalance || wallet.availableBalance <= 0}
                className="w-full py-2.5 bg-primary hover:opacity-90 disabled:bg-neutral-300 disabled:cursor-not-allowed text-primary-foreground font-medium rounded-lg transition-colors text-sm"
              >
                {requesting ? 'Processing...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>

        {/* Withdrawal History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className="p-5 border-b border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-900">Payout History</h2>
            </div>
            
            {withdrawals.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">
                No withdrawal requests yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-100">
                    <tr>
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Amount</th>
                      <th className="p-4 font-medium">Details</th>
                      <th className="p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {withdrawals.map((w) => (
                      <tr key={w._id} className="hover:bg-neutral-50/50">
                        <td className="p-4 text-neutral-600">{new Date(w.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 font-semibold text-neutral-900">₹{w.amount.toLocaleString('en-IN')}</td>
                        <td className="p-4 text-neutral-500 max-w-xs truncate" title={w.bankDetails}>{w.bankDetails}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center w-max gap-1.5 ${
                            w.status === 'Approved' ? 'bg-green-100 text-green-700' :
                            w.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {w.status === 'Approved' && <CheckCircle className="w-4 h-4" />}
                            {w.status === 'Rejected' && <XCircle className="w-4 h-4" />}
                            {w.status === 'Pending' && <Clock className="w-4 h-4" />}
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
    </div>
  );
}
