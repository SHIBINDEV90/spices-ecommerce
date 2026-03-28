import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { PackageOpen } from 'lucide-react';
import BulkEnquiryForm from '@/components/BulkEnquiryForm';
import { Suspense } from 'react';

export const metadata = {
  title: 'Request a Bulk Quote | Malabar Coast Spices',
  description: 'Initiate a specialized cargo order for wholesale spices direct from the Malabar Coast.',
};

export default async function BulkEnquiryPage() {
  await dbConnect();

  // Only permit bulk enquiry requests for valid export-grade spices
  const docs = await Product.find({ isBulkAvailable: true }).select('_id name');
  const availableProducts = JSON.parse(JSON.stringify(docs));

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 relative overflow-hidden flex flex-col items-center">
      {/* Cinematic Ambient Backdrops */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center mb-12 text-center max-w-3xl">
        <PackageOpen className="w-16 h-16 text-orange-500 opacity-80 mb-6" />
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-xl leading-tight">
          Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">Export</span> Quotes
        </h1>
        <p className="text-gray-400 text-lg md:text-xl font-medium">
          Source direct from our origin. Please outline your commodity requirements and our industrial trade desk will configure a custom freight proposal.
        </p>
      </div>

      <div className="w-full px-4">
        <Suspense fallback={<div className="text-center p-12 text-gray-500">Loading procurement terminal...</div>}>
          <BulkEnquiryForm products={availableProducts} />
        </Suspense>
      </div>
    </div>
  );
}
