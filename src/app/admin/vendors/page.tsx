import VendorList from '@/components/admin/VendorList';

export default function AdminVendorsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Vendor Management</h1>
        <p className="text-neutral-600 mt-1">Review and manage vendor applications and accounts.</p>
      </div>

      <VendorList />
    </>
  );
}
