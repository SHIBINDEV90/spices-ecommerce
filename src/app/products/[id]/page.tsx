import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import Link from 'next/link';
import Image from 'next/image';
import ProductInteraction from '@/components/ProductInteraction';
import { ArrowLeft, MapPin, Tag, Activity } from 'lucide-react';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const p = await Product.findById(params.id);
    if (!p) return { title: 'Product Not Found' };
    return { title: `${p.name} | Malabar Coast Spices`, description: p.description };
  } catch (err) {
    return { title: 'Spice Catalog' };
  }
}

export default async function ProductDetailsPage({ params }: { params: { id: string } }) {
  await dbConnect();

  let product;
  try {
    // We lean on Mongoose directly for SSR performance
    const doc = await Product.findById(params.id);
    if (!doc) notFound();
    product = JSON.parse(JSON.stringify(doc));
  } catch (error) {
    notFound();
  }

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
            />
            {product.isBulkAvailable && (
              <div className="absolute top-6 left-6 bg-amber-500 text-black px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                Wholesale Valid
              </div>
            )}
          </div>

          {/* Details Container */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-orange-400 text-sm font-bold tracking-widest uppercase mb-4">
               <Tag className="w-4 h-4" /> {product.productType || 'Premium Spice'}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">{product.name}</h1>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-10 border-l-2 border-orange-500 pl-6">
              {product.description}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                 <MapPin className="w-5 h-5 text-gray-500 mb-1" />
                 <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Origin Route</span>
                 <span className="text-sm font-medium">Kerala, Malabar Coast</span>
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
