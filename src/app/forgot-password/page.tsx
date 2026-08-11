'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'customer'; // customer, vendor, admin
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Determine back link and color schemes based on role
  let backLink = '/login';
  let accentColorClass = 'text-primary';
  let buttonBgClass = 'bg-primary text-black hover:bg-primary/90 shadow-primary/25';
  let focusRingClass = 'focus:ring-primary/50';
  let pageTitle = 'Forgot Password';
  let pageSub = 'Enter your email address to receive a secure password reset link.';
  let bgAmbianceClass = 'bg-primary/10';

  if (role === 'vendor') {
    backLink = '/vendor/login';
    accentColorClass = 'text-amber-600';
    buttonBgClass = 'bg-primary text-white hover:opacity-90 shadow-primary/25';
    focusRingClass = 'focus:ring-primary/50';
    pageTitle = 'Vendor Password Recovery';
    pageSub = 'Recover your vendor account credentials via email.';
  } else if (role === 'admin') {
    backLink = '/admin/login';
    accentColorClass = 'text-orange-500';
    buttonBgClass = 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white';
    focusRingClass = 'focus:ring-orange-500/50';
    pageTitle = 'Admin Password Recovery';
    pageSub = 'Access terminal credentials recovery.';
    bgAmbianceClass = 'bg-orange-600/20';
  }

  const isDarkBg = role === 'admin';

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden pt-20 transition-colors duration-300 ${isDarkBg ? 'bg-black text-white' : 'bg-background text-foreground'}`}>
      {/* Cinematic Background Ambiance */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${bgAmbianceClass} rounded-full blur-[120px] pointer-events-none`} />

      <div className="w-full max-w-md p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`glass p-8 md:p-10 rounded-3xl shadow-2xl border ${isDarkBg ? 'border-white/10 bg-white/5' : 'border-foreground/5 bg-surface/80'} relative overflow-hidden`}
        >
          {/* Inner Glow decorative */}
          <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-20 ${role === 'admin' ? 'bg-orange-500' : 'bg-primary'}`} />

          <div className="text-center mb-8 relative z-10">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${isDarkBg ? 'bg-white/5 border border-white/10' : 'bg-primary/10'} ${accentColorClass}`}>
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">{pageTitle}</h2>
            <p className={`text-sm ${isDarkBg ? 'text-gray-400' : 'text-foreground/60'}`}>{pageSub}</p>
          </div>

          {error && (
            <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-sm ${isDarkBg ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-6 space-y-4"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 text-green-500 mb-2">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Request Submitted</h3>
              <p className={`text-sm ${isDarkBg ? 'text-gray-400' : 'text-foreground/60'} leading-relaxed`}>
                If an account exists with this email, a secure reset link has been dispatched to it.
              </p>
              <p className={`text-xs ${isDarkBg ? 'text-gray-500' : 'text-foreground/40'}`}>
                Please check your inbox (and spam folder) within the next few minutes.
              </p>
              <div className="pt-6">
                <Link
                  href={backLink}
                  className={`inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-colors cursor-pointer ${accentColorClass}`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Login
                </Link>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className={`text-sm font-semibold ml-1 ${isDarkBg ? 'text-gray-300' : 'text-foreground/80'}`}>Email Address</label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${isDarkBg ? 'text-gray-500' : 'text-foreground/40'}`}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 transition-all ${isDarkBg ? 'bg-black/40 border border-white/10 text-white placeholder:text-gray-600 focus:ring-orange-500/50' : 'bg-background/50 border border-foreground/10 text-foreground placeholder:text-foreground/30 focus:ring-primary/50'}`}
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-4 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-70 cursor-pointer ${buttonBgClass}`}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Send Reset Link
                  </>
                )}
              </motion.button>

              <div className="text-center pt-2">
                <Link
                  href={backLink}
                  className={`inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-all cursor-pointer ${isDarkBg ? 'text-gray-400 hover:text-white' : 'text-foreground/60 hover:text-foreground'}`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
