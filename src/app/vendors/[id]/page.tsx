import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/db';
import VendorModel from '@/lib/models/Vendor';
import ProductModel from '@/lib/models/Product';
import ProductCard from '@/components/ProductCard';
import { Tractor, Store, MapPin, CheckCircle2, ArrowLeft, ShieldCheck, Award, PackageCheck, Mail, Phone } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getVendorStore(id: string) {
  await connectToDatabase();

  try {
    const vendor = await VendorModel.findById(id).lean();
    if (!vendor || vendor.status !== 'Approved') return null;

    const products = await ProductModel.find({
      vendorId: vendor._id,
      approvalStatus: 'Approved'
    }).populate('vendorId', 'businessName ownerName vendorType businessAddress status').lean();

    return {
      vendor: JSON.parse(JSON.stringify(vendor)),
      products: JSON.parse(JSON.stringify(products))
    };
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const data = await getVendorStore(params.id);
  if (!data) return { title: 'Vendor Not Found | Spicewizz' };
  return {
    title: `${data.vendor.businessName} Storefront | Spicewizz`,
    description: `Shop authentic spices directly from ${data.vendor.businessName} (${data.vendor.vendorType})`
  };
}

export default async function VendorStorefrontPage({ params }: { params: { id: string } }) {
  const data = await getVendorStore(params.id);

  if (!data) {
    notFound();
  }

  const { vendor, products } = data;

  return (
    <div className="min-h-screen bg-surface text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link 
          href="/vendors" 
          className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground font-bold text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Vendor Directory
        </Link>

        {/* Vendor Header Card */}
        <div className="bg-surface rounded-3xl border border-black/10 dark:border-white/10 p-8 shadow-lg mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-xl flex-shrink-0 ${
                vendor.vendorType === 'Farmer' ? 'bg-emerald-600' : 'bg-amber-600'
              }`}>
                {vendor.vendorType === 'Farmer' ? <Tractor size={36} /> : <Store size={36} />}
              </div>

              <div>
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                    {vendor.businessName}
                  </h1>
                  <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                    vendor.vendorType === 'Farmer' 
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' 
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                  }`}>
                    {vendor.vendorType} Partner
                  </span>
                </div>

                <p className="text-foreground/70 font-medium mb-3">Owner: {vendor.ownerName}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-foreground/60">
                  {vendor.businessAddress && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} className="text-foreground/40" />
                      {vendor.businessAddress.street}, {vendor.businessAddress.city}, {vendor.businessAddress.state}, {vendor.businessAddress.country}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <CheckCircle2 size={14} /> Verified Supplier
                  </span>
                </div>
              </div>
            </div>

            {/* Vendor Credentials / Stats */}
            <div className="flex flex-wrap items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-black/5 dark:border-white/5">
              <div className="bg-foreground/5 p-4 rounded-2xl text-center min-w-[110px]">
                <div className="text-2xl font-extrabold text-foreground">{products.length}</div>
                <div className="text-[11px] font-semibold text-foreground/60 uppercase tracking-wider">Products</div>
              </div>

              {vendor.gstNumber && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 p-4 rounded-2xl text-center min-w-[120px]">
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1">
                    <Award size={14} /> GST Verified
                  </div>
                  <div className="text-[10px] font-mono text-emerald-900/60 dark:text-emerald-400/70 mt-1">{vendor.gstNumber}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Catalog Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">
              Products by {vendor.businessName}
            </h2>
            <p className="text-foreground/60 text-sm">Directly supplied and verified</p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-3xl border border-black/5 dark:border-white/10">
            <PackageCheck size={48} className="mx-auto text-foreground/30 mb-4" />
            <h3 className="text-xl font-bold mb-2">No Approved Products Yet</h3>
            <p className="text-foreground/60 text-sm max-w-md mx-auto">
              This vendor is preparing their product offerings. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any, index: number) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                index={index} 
                featured={index < 2} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
