'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VendorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('vendor-credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        window.location.href = '/vendor/dashboard';
      }
    } catch (err: any) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-900">Vendor Login</h1>
          <p className="text-neutral-500 mt-2">Manage your products and orders</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
            <input 
              required 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" 
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-neutral-700">Password</label>
              <Link href="/forgot-password?role=vendor" className="text-xs font-semibold text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>
            <input 
              required 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" 
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:opacity-90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Logging in...' : 'Login to Dashboard'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-neutral-500">Not a vendor yet? </span>
          <Link href="/vendor/register" className="text-primary hover:underline font-medium">
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
}
