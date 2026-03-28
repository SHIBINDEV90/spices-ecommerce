import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-orange-500/30">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden p-6 md:p-12 relative bg-gradient-to-br from-black via-[#0a0a0a] to-[#111]">
        {children}
      </main>
    </div>
  );
}
