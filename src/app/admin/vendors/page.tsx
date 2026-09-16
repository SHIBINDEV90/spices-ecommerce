import VendorList from '@/components/admin/VendorList';

export const dynamic = 'force-dynamic';

export default function AdminVendorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-600">
          Vendor Management
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Review, approve, edit, and manage registered merchant and farmer store profiles.
        </p>
      </div>

      <VendorList />
    </div>
  );
}
