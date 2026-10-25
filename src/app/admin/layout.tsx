import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-orange-500/30">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-black via-[#0a0a0a] to-[#111]">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden p-6 md:p-8 lg:p-10 relative">
          {children}
        </main>
      </div>
    </div>
  );
}

