import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import Vendor from '@/lib/models/Vendor';
import Link from 'next/link';
import Image from 'next/image';
import ProductInteraction from '@/components/ProductInteraction';
import { ArrowLeft, MapPin, Tag, Activity, Tractor, Store, ShieldCheck, ChevronRight } from 'lucide-react';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const p = await Product.findById(params.id);
    if (!p) return { title: 'Product Not Found' };
    return { title: `${p.name} | Spicewizz`, description: p.description };
  } catch (err) {
    return { title: 'Spice Catalog' };
  }
}

export default async function ProductDetailsPage({ params }: { params: { id: string } }) {
  await dbConnect();

  let product;
  try {
    if (!Vendor) {} // ensure model is registered
    const doc = await Product.findById(params.id).populate('vendorId', 'businessName ownerName vendorType businessAddress status');
    if (!doc) notFound();
    product = JSON.parse(JSON.stringify(doc));
  } catch (error) {
    notFound();
  }

  const isUploadedImage = typeof product.imageUrl === 'string' && product.imageUrl.startsWith('/uploads/');
  const vendor = typeof product.vendorId === 'object' && product.vendorId !== null ? product.vendorId : null;

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 pt-32 max-w-6xl relative z-10">
        <Link href="/products" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-10 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Image Container */}
          <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group bg-white/5">
            <Image
              src={product.imageUrl}
              alt={`Image of ${product.name}`}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              unoptimized={isUploadedImage}
            />
            {product.isBulkAvailable && (
              <div className="absolute top-6 left-6 bg-amber-500 text-black px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                Wholesale Valid
              </div>
            )}
            
            {vendor && (
              <div className="absolute top-6 right-6 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl">
                {vendor.vendorType === 'Farmer' ? <Tractor size={14} /> : <Store size={14} />}
                {vendor.vendorType || 'Vendor'} Direct
              </div>
            )}
          </div>

          {/* Details Container */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-orange-400 text-sm font-bold tracking-widest uppercase mb-4">
               <Tag className="w-4 h-4" /> {product.productType || 'Premium Spice'}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">{product.name}</h1>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-8 border-l-2 border-orange-500 pl-6">
              {product.description}
            </p>
            
            {/* Seller / Vendor Box */}
            <div className="mb-8 p-5 bg-white/5 border border-white/10 rounded-2xl">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Fulfillment & Seller Information
              </span>

              {vendor ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                      vendor.vendorType === 'Farmer' ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}>
                      {vendor.vendorType === 'Farmer' ? <Tractor size={20} /> : <Store size={20} />}
                    </div>
                    <div>
                      <div className="font-bold text-base text-white">{vendor.businessName}</div>
                      <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        Verified {vendor.vendorType || 'Vendor'} Seller
                      </div>
                    </div>
                  </div>

                  <Link 
                    href={`/vendors/${vendor._id}`} 
                    className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    View Vendor Store <ChevronRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-base text-white">Spicewizz Official Direct</div>
                    <div className="text-xs text-gray-400">Export Grade Quality Guaranteed</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                 <MapPin className="w-5 h-5 text-gray-500 mb-1" />
                 <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Origin Route</span>
                 <span className="text-sm font-medium">
                   {vendor?.businessAddress?.city ? `${vendor.businessAddress.city}, ${vendor.businessAddress.state}` : 'Kerala, Malabar Coast'}
                 </span>
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                 <Activity className="w-5 h-5 text-gray-500 mb-1" />
                 <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Quality Tier</span>
                 <span className="text-sm font-medium">A+ Export Grade</span>
              </div>
            </div>
            
            <ProductInteraction product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}

