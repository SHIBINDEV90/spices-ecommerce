'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ResetPasswordProps {
  params: {
    token: string;
  };
}

export default function ResetPasswordPage({ params }: ResetPasswordProps) {
  const router = useRouter();
  const token = params.token;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [redirectingRole, setRedirectingRole] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password. Link might be invalid or expired.');
      }

      setSuccess(true);
      setRedirectingRole(data.role);

      // Auto redirect to appropriate login page based on role after 3 seconds
      setTimeout(() => {
        let redirectUrl = '/login';
        if (data.role === 'Vendor') {
          redirectUrl = '/vendor/login';
        } else if (data.role === 'Admin') {
          redirectUrl = '/admin/login';
        }
        router.push(redirectUrl);
      }, 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check role redirection url
  let backLink = '/login';
  if (redirectingRole === 'Vendor') {
    backLink = '/vendor/login';
  } else if (redirectingRole === 'Admin') {
    backLink = '/admin/login';
  }

  // Determine dark/light aesthetic based on if it's admin role (optional, keep default premium style)
  const isDarkBg = false;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground relative overflow-hidden pt-20">
      {/* Cinematic Background Ambiance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass p-8 md:p-10 rounded-3xl shadow-2xl border border-foreground/5 bg-surface/80 relative overflow-hidden"
        >
          {/* Inner Glow decorative */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none opacity-20" />

          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 text-primary">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Reset Password</h2>
            <p className="text-sm text-foreground/60">Choose a new, secure password for your account.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 flex items-center gap-3 text-sm">
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
              <h3 className="text-xl font-bold text-foreground">Password Reset Successful!</h3>
              <p className="text-sm text-foreground/60 leading-relaxed">
                Your password has been successfully updated.
              </p>
              <p className="text-xs text-primary font-semibold animate-pulse">
                Redirecting to login portal shortly...
              </p>
              <div className="pt-4">
                <Link
                  href={backLink}
                  className="inline-flex py-3 px-6 rounded-xl bg-primary text-black font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 cursor-pointer"
                >
                  Proceed to Login
                </Link>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1 text-foreground/80">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background/50 border border-foreground/10 rounded-xl pl-12 pr-4 py-4 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1 text-foreground/80">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-background/50 border border-foreground/10 rounded-xl pl-12 pr-4 py-4 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Reset Password
                  </>
                )}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
