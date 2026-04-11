"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, UserPlus, ArrowRight, User, Phone } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate signup for now
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden pt-20">
      {/* Cinematic Background */}
      <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 md:gap-16 items-center relative z-10">
        
        {/* Left Side: Cinematic Copy */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden md:flex flex-col justify-center md:order-2"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary font-semibold text-sm w-max mb-6">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            Join the Family
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Begin Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">Culinary Journey</span>
          </h1>
          <p className="text-lg text-foreground/70 mb-8 max-w-lg">
            Create an account to track your orders, save your favorite blends, and experience the finest spices imported directly from the Malabar Coast.
          </p>
        </motion.div>

        {/* Right Side: Signup Form */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md mx-auto md:order-1"
        >
          <div className="bg-surface glass p-8 md:p-10 rounded-3xl shadow-2xl border border-foreground/5 relative overflow-hidden">
            {/* Inner glow */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="text-center mb-8 relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 mb-6 text-secondary">
                <UserPlus className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Create Account</h2>
              <p className="text-foreground/60 text-sm">Fill in your details to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80 ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background/50 border border-foreground/10 rounded-xl pl-12 pr-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all placeholder:text-foreground/30"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80 ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background/50 border border-foreground/10 rounded-xl pl-12 pr-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all placeholder:text-foreground/30"
                    placeholder="hello@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80 ml-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-background/50 border border-foreground/10 rounded-xl pl-12 pr-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all placeholder:text-foreground/30"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background/50 border border-foreground/10 rounded-xl pl-12 pr-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all placeholder:text-foreground/30"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 bg-foreground text-background font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-foreground/90 transition-all shadow-lg disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    Sign Up Now
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            <p className="text-center text-sm text-foreground/60 mt-8 relative z-10">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-secondary hover:text-secondary/80 transition-colors">
                Sign in instead
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
