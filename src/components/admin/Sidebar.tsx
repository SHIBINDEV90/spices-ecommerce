'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  Users, 
  Store,
  Wallet,
  CreditCard, 
  FileText, 
  Settings, 
  Ticket,
  LogOut,
  Zap
} from 'lucide-react';

const MENU_ITEMS = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Quick Commerce (35km)', href: '/admin/quick-commerce', icon: Zap },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Vendors', href: '/admin/vendors', icon: Store },
  { name: 'Vendor Payouts', href: '/admin/withdrawals', icon: Wallet },
  { name: 'Enquiries', href: '/admin/enquiries', icon: MessageSquare },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Blog', href: '/admin/blog', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [pendingEnquiriesCount, setPendingEnquiriesCount] = useState<number>(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch('/api/admin/notifications', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && typeof json.pendingEnquiriesCount === 'number') {
            setPendingEnquiriesCount(json.pendingEnquiriesCount);
          }
        }
      } catch {
        // Silently ignore
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-64 bg-black border-r border-white/10 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-600">
          Admin Portal
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const isEnquiries = item.href === '/admin/enquiries';
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-400 font-medium border border-orange-500/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 truncate">{item.name}</span>
              {isEnquiries && pendingEnquiriesCount > 0 && (
                <span className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                  {pendingEnquiriesCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}

