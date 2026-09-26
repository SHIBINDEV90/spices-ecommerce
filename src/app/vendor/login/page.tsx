'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Loader2, Store, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

function VendorLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/vendor/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('vendor-credentials', {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        let targetUrl = '/vendor/dashboard';
        if (callbackUrl && (callbackUrl.startsWith('/vendor') || callbackUrl.startsWith('/'))) {
          targetUrl = callbackUrl;
        }
        window.location.href = targetUrl;
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during login.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Cinematic Ambient Glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[650px] h-[650px] bg-primary/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[550px] h-[550px] bg-secondary/15 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Navigation back */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Spicewizz Marketplace</span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-surface/90 dark:bg-zinc-900/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-foreground/10 relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold mb-4">
              <Store className="w-3.5 h-3.5" />
              <span>Vendor Partner Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Vendor Login
            </h1>
            <p className="text-sm text-foreground/60 mt-2">
              Sign in to manage your inventory, orders, and earnings.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1 font-medium">{error}</div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="vendor-email"
                className="block text-sm font-semibold text-foreground/80 ml-1"
              >
                Registered Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/40">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="vendor-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  className="w-full bg-surface dark:bg-zinc-800/80 border border-foreground/15 dark:border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-foreground text-sm placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary caret-primary transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label
                  htmlFor="vendor-password"
                  className="block text-sm font-semibold text-foreground/80"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password?role=vendor"
                  className="text-xs font-semibold text-primary hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/40">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="vendor-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-surface dark:bg-zinc-800/80 border border-foreground/15 dark:border-white/10 rounded-xl pl-11 pr-11 py-3.5 text-foreground text-sm placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary caret-primary transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-foreground/40 hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:opacity-90 text-primary-foreground font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Vendor Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Card Footer */}
          <div className="mt-8 pt-6 border-t border-foreground/10 text-center space-y-3">
            <p className="text-sm text-foreground/70">
              Not registered as a vendor yet?{' '}
              <Link
                href="/vendor/register"
                className="text-primary hover:underline font-semibold"
              >
                Apply to Sell
              </Link>
            </p>
            <div>
              <Link
                href="/login"
                className="text-xs text-foreground/50 hover:text-foreground/80 transition-colors"
              >
                Customer login instead? Click here
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function VendorLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-foreground/70">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span>Loading Vendor Login...</span>
          </div>
        </div>
      }
    >
      <VendorLoginForm />
    </Suspense>
  );
}
