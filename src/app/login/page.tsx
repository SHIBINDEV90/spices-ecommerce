"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Phone, Lock, Loader2, LogIn, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRequestOtp = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to request OTP');
        setLoading(false);
      } else {
        setSuccessMessage('OTP sent successfully!');
        setTimeLeft(300);
        setStep(2);
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred while requesting OTP');
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('customer-credentials', {
        redirect: false,
        phone,
        otp,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push('/products'); // Redirect to products or dashboard after login
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred during sign in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden pt-20">
      {/* Cinematic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 md:gap-16 items-center relative z-10">
        
        {/* Left Side: Cinematic Copy */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden md:flex flex-col justify-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm w-max mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Welcome Back
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Unlock the World of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Premium Spices</span>
          </h1>
          <p className="text-lg text-foreground/70 mb-8 max-w-lg">
            Sign in to access your curated collection, track your orders, and discover new, exotic flavors tailored to your taste.
          </p>
        </motion.div>

        {/* Right Side: Login Form */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bg-surface glass p-8 md:p-10 rounded-3xl shadow-2xl border border-foreground/5 relative overflow-hidden">
            {/* Inner glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="text-center mb-8 relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 text-primary">
                <LogIn className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Sign In</h2>
              <p className="text-foreground/60 text-sm">Enter your details to access your account</p>
            </div>

            <form onSubmit={step === 1 ? handleRequestOtp : handleVerifyOtp} className="space-y-6 relative z-10">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl mb-4 text-center">
                  {error}
                </div>
              )}
              {successMessage && step === 2 && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 text-sm p-3 rounded-xl mb-4 text-center">
                  {successMessage}
                </div>
              )}

              {step === 1 ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80 ml-1">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-background/50 border border-foreground/10 rounded-xl pl-12 pr-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-foreground/30"
                      placeholder="Enter registered mobile number"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-semibold text-foreground/80">Enter OTP</label>
                    <button 
                      type="button" 
                      onClick={() => { setStep(1); setOtp(''); setSuccessMessage(''); }}
                      className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      Change Number
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-background/50 border border-foreground/10 rounded-xl pl-12 pr-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all tracking-[0.5em] text-center font-bold placeholder:tracking-normal placeholder:font-normal placeholder:text-foreground/30 disabled:opacity-50"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      disabled={timeLeft === 0}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2 px-1">
                    <span className={`text-xs font-medium ${timeLeft > 0 ? 'text-foreground/60' : 'text-red-500'}`}>
                      {timeLeft > 0 ? `OTP expires in ${formatTime(timeLeft)}` : 'OTP has expired'}
                    </span>
                    {timeLeft === 0 && (
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || (step === 2 && timeLeft === 0)}
                className="w-full py-4 bg-primary text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    {step === 1 ? 'Request OTP' : 'Verify & Sign In'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            <p className="text-center text-sm text-foreground/60 mt-8 relative z-10">
              Don't have an account?{' '}
              <Link href="/signup" className="font-bold text-primary hover:text-primary/80 transition-colors">
                Create one now
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
