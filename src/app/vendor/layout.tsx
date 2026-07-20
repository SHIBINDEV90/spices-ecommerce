'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { Home, Package, ShoppingCart, Settings, LogOut } from 'lucide-react';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isPublicRoute = pathname === '/vendor/login' || pathname === '/vendor/register';

  useEffect(() => {
    if (!isPublicRoute) {
      if (status === 'unauthenticated') {
        router.push('/vendor/login');
      } else if (status === 'authenticated' && (session?.user as any)?.role !== 'Vendor') {
        router.push('/');
      }
    }
  }, [status, session, router, isPublicRoute]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!session || (session?.user as any)?.role !== 'Vendor') {
    return null;
  }

  const navItems = [
    { name: 'Dashboard', href: '/vendor/dashboard', icon: Home },
    { name: 'Products', href: '/vendor/products', icon: Package },
    { name: 'Orders', href: '/vendor/orders', icon: ShoppingCart },
    { name: 'Settings', href: '/vendor/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-6 border-b border-neutral-200">
          <h1 className="text-xl font-bold text-primary-900">Vendor Panel</h1>
          <p className="text-sm text-neutral-500 mt-1">{(session.user as any)?.name}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700 font-medium' 
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-neutral-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-neutral-200">
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center space-x-3 px-4 py-3 w-full text-left text-neutral-600 hover:bg-neutral-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 text-neutral-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
