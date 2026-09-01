import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import connectToDatabase from '@/lib/db';
import VendorModel from '@/lib/models/Vendor';
import ProductModel from '@/lib/models/Product';
import { Tractor, Store, MapPin, CheckCircle2, PackageCheck, ArrowRight, ShieldCheck, Award } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getVendorsData() {
  await connectToDatabase();
  const vendors = await VendorModel.find({ status: 'Approved' }).lean();

  const vendorsWithProducts = await Promise.all(
    vendors.map(async (vendor: any) => {
      const products = await ProductModel.find({
        vendorId: vendor._id,
        approvalStatus: 'Approved'
      }).lean();

      return {
        ...vendor,
        products: JSON.parse(JSON.stringify(products)),
        productCount: products.length
      };
    })
  );

  return JSON.parse(JSON.stringify(vendorsWithProducts));
}

export default async function VendorsPage() {
  const vendors = await getVendorsData();
  const farmers = vendors.filter((v: any) => v.vendorType === 'Farmer');
  const exporters = vendors.filter((v: any) => v.vendorType === 'Exporter');

  return (
    <div className="min-h-screen bg-surface text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Banner Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-8 sm:p-12 mb-16 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-6">
              <ShieldCheck size={14} /> Direct From Source
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Farmer & Exporter Marketplace
            </h1>
            <p className="text-emerald-100/80 text-lg leading-relaxed mb-8">
              Connect directly with verified spice growers, organic farmers, and certified exporters from Kerala's spice belt. Support direct trade with maximum quality transparency.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-white/10">
              <div>
                <div className="text-3xl font-extrabold text-white">{vendors.length}</div>
                <div className="text-xs text-emerald-200/70 font-semibold uppercase tracking-wider">Verified Vendors</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-white">{farmers.length}</div>
                <div className="text-xs text-emerald-200/70 font-semibold uppercase tracking-wider">Local Farmers</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-white">{exporters.length}</div>
                <div className="text-xs text-emerald-200/70 font-semibold uppercase tracking-wider">Licensed Exporters</div>
              </div>
            </div>
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">Verified Vendor Directory</h2>
            <p className="text-foreground/60 text-sm">Explore partner stores and their direct spice catalog</p>
          </div>
          <Link
            href="/products?source=vendors"
            className="px-5 py-2.5 bg-foreground text-surface rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            All Vendor Products <ArrowRight size={16} />
          </Link>
        </div>

        {vendors.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-3xl border border-black/5 dark:border-white/10 shadow-sm">
            <Tractor size={48} className="mx-auto text-foreground/30 mb-4" />
            <h3 className="text-xl font-bold mb-2">No Active Vendors Found</h3>
            <p className="text-foreground/60 text-sm max-w-md mx-auto mb-6">
              Our vendor marketplace is onboarding new farmers and exporters. Check back soon!
            </p>
            <Link
              href="/vendor/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white rounded-full font-bold text-sm shadow-md hover:bg-emerald-800 transition-colors"
            >
              Become a Vendor / Farmer Partner
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vendors.map((vendor: any) => (
              <div
                key={vendor._id}
                className="group bg-surface rounded-3xl border border-black/10 dark:border-white/10 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
                        vendor.vendorType === 'Farmer' ? 'bg-emerald-600' : 'bg-amber-600'
                      }`}>
                        {vendor.vendorType === 'Farmer' ? <Tractor size={24} /> : <Store size={24} />}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg leading-snug group-hover:text-emerald-600 transition-colors">
                          {vendor.businessName}
                        </h3>
                        <p className="text-xs text-foreground/60">Owner: {vendor.ownerName}</p>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                      vendor.vendorType === 'Farmer' 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' 
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    }`}>
                      {vendor.vendorType}
                    </span>
                  </div>

                  {/* Address & Badges */}
                  <div className="space-y-2 mb-6">
                    {vendor.businessAddress && (
                      <div className="flex items-center gap-1.5 text-xs text-foreground/70">
                        <MapPin size={14} className="text-foreground/40 shrink-0" />
                        <span>{vendor.businessAddress.city}, {vendor.businessAddress.state}, {vendor.businessAddress.country}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-0.5 rounded-md">
                        <CheckCircle2 size={12} /> Verified Seller
                      </span>
                      {vendor.gstNumber && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground/60 bg-foreground/5 px-2.5 py-0.5 rounded-md">
                          <Award size={12} /> GST Registered
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vendor Sample Products Preview */}
                  <div className="border-t border-black/5 dark:border-white/5 pt-4 mb-6">
                    <div className="flex items-center justify-between text-xs font-bold text-foreground/70 mb-3">
                      <span>Products ({vendor.productCount})</span>
                      <Link href={`/vendors/${vendor._id}`} className="text-emerald-600 hover:underline">
                        View All
                      </Link>
                    </div>

                    {vendor.products.length === 0 ? (
                      <p className="text-xs text-foreground/40 italic">No products listed yet.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {vendor.products.slice(0, 3).map((prod: any) => (
                          <div key={prod._id} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 group/img">
                            <Image
                              src={prod.imageUrl || '/images/Cardamom.jpg'}
                              alt={prod.name}
                              fill
                              className="object-cover group-hover/img:scale-110 transition-transform"
                              unoptimized={typeof prod.imageUrl === 'string' && prod.imageUrl.startsWith('/uploads/')}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  href={`/vendors/${vendor._id}`}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm transition-colors text-center flex items-center justify-center gap-2 shadow-sm"
                >
                  Visit Storefront <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
