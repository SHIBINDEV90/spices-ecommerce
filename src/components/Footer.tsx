'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Mail, Phone, MapPin, ShieldCheck, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Hide the footer on admin and vendor dashboards
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/vendor')) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-slate-ink text-surface-variant/80 border-t border-white/10 w-full transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          
          {/* Col 1: Brand & Origin Story */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-display-lg text-headline-md text-saffron-glow font-bold tracking-tight">
                SpiceWizz
              </span>
            </Link>
            <p className="text-surface-variant/70 text-sm leading-relaxed">
              Premium spice exporters connecting the lush rainforest hills of Vythiri, Wayanad to global kitchens through ethical sourcing, purity grading, and direct farm transparency.
            </p>
            <div className="pt-2 text-xs text-surface-variant/60 space-y-1.5">
              <p className="flex items-center gap-2">
                <MapPin size={14} className="text-saffron-glow shrink-0" />
                <span>Vythiri, Wayanad, Kerala - 673576</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14} className="text-saffron-glow shrink-0" />
                <span>+91 80864 51830 (Mon–Sat, 9AM–6PM)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-saffron-glow shrink-0" />
                <a href="mailto:contact@spicewizz.com" className="hover:text-saffron-glow transition-colors">
                  contact@spicewizz.com
                </a>
              </p>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-primary-fixed dark:text-primary-fixed-dim font-bold mb-4 uppercase tracking-wider text-xs md:text-sm text-saffron-glow/90">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link className="text-surface-variant/70 hover:text-saffron-glow transition-all duration-200 inline-block" href="/products">
                  Shop All Spices
                </Link>
              </li>
              <li>
                <Link className="text-surface-variant/70 hover:text-saffron-glow transition-all duration-200 inline-block" href="/track-order">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link className="text-surface-variant/70 hover:text-saffron-glow transition-all duration-200 inline-block" href="/bulk-enquiry">
                  Bulk B2B Wholesale
                </Link>
              </li>
              <li>
                <Link className="text-surface-variant/70 hover:text-saffron-glow transition-all duration-200 inline-block" href="/about">
                  Our Story &amp; Origin
                </Link>
              </li>
              <li>
                <Link className="text-surface-variant/70 hover:text-saffron-glow transition-all duration-200 inline-block" href="/contact">
                  Contact Customer Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Policies & Trust */}
          <div>
            <h4 className="text-primary-fixed dark:text-primary-fixed-dim font-bold mb-4 uppercase tracking-wider text-xs md:text-sm text-saffron-glow/90">
              Policies &amp; Trust
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link 
                  className="text-surface-variant/70 hover:text-saffron-glow transition-all duration-200 flex items-center gap-1.5 group" 
                  href="/cancellation-refund-policy"
                >
                  <RotateCcw size={14} className="text-saffron-glow group-hover:rotate-45 transition-transform duration-300" />
                  <span>Refund &amp; Cancellation Policy</span>
                </Link>
              </li>
              <li>
                <Link 
                  className="text-surface-variant/70 hover:text-saffron-glow transition-all duration-200 flex items-center gap-1.5" 
                  href="/privacy-policy"
                >
                  <ShieldCheck size={14} className="text-surface-variant/50" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link 
                  className="text-surface-variant/70 hover:text-saffron-glow transition-all duration-200 flex items-center gap-1.5" 
                  href="/terms-conditions"
                >
                  <span>Terms &amp; Conditions</span>
                </Link>
              </li>
              <li>
                <Link 
                  className="text-surface-variant/70 hover:text-saffron-glow transition-all duration-200 flex items-center gap-1.5" 
                  href="/certifications"
                >
                  <span>Quality &amp; Certifications</span>
                </Link>
              </li>
            </ul>

            <div className="mt-5 p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-surface-variant/70 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Buyer Protection Guarantee</span>
              </div>
              <p className="text-[11px] text-surface-variant/60 leading-normal">
                100% free cancellation before dispatch. 48-hr transit damage replacement warranty.
              </p>
            </div>
          </div>

          {/* Col 4: Newsletter & Verification */}
          <div>
            <h4 className="text-primary-fixed dark:text-primary-fixed-dim font-bold mb-4 uppercase tracking-wider text-xs md:text-sm text-saffron-glow/90">
              Newsletter &amp; Updates
            </h4>
            <p className="text-surface-variant/70 text-xs mb-3 leading-relaxed">
              Subscribe to receive seasonal harvest updates, single-origin arrivals, and exclusive grower stories.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-3 py-2 text-sm w-full focus:ring-1 focus:ring-saffron-glow focus:border-saffron-glow outline-none rounded-md transition-all" 
                  placeholder="Enter your email" 
                />
                <button 
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="bg-saffron-glow text-slate-ink px-3.5 py-2 rounded-md flex items-center justify-center hover:bg-secondary-fixed-dim transition-colors shrink-0 font-medium"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
              {subscribed && (
                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 animate-fadeIn">
                  <CheckCircle2 size={13} />
                  <span>Thank you for subscribing to SpiceWizz!</span>
                </p>
              )}
            </form>

            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-2 text-[11px] text-surface-variant/50">
              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">FSSAI Certified</span>
              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">ISO 22000</span>
              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">Spice Board India</span>
              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">FairTrade</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Payment Security */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-surface-variant/50">
          <p className="text-center md:text-left">
            &copy; {new Date().getFullYear()} SpiceWizz (Malabar Coast Spices). All Rights Reserved. Sourced ethically from Wayanad, Kerala.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/cancellation-refund-policy" className="hover:text-saffron-glow transition-colors underline-offset-4 hover:underline">
              Cancellation &amp; Refund Policy
            </Link>
            <Link href="/privacy-policy" className="hover:text-saffron-glow transition-colors underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms-conditions" className="hover:text-saffron-glow transition-colors underline-offset-4 hover:underline">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
