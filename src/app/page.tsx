"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { Product } from '@/types/product';
import AnimatedSection from '@/components/AnimatedSection';
import { motion } from 'framer-motion';
import { ArrowRight, Tractor, ShieldCheck, Factory, Truck, Award } from 'lucide-react';
import HeroBackground from '@/components/HeroBackground';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        // Just take first 3 products for the homepage
        setProducts(data.slice(0, 3));
      } catch (err) {
        console.error("Error fetching products", err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative w-full h-[80vh] md:h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida/AP1WRLvMGC_0FHT_yKtT7epi9raHutAOqZy-5UnmqsbDVE10xpZMrE4GB34wESHlWKX7CRcWFQ3_YGTL5N9l7R_LMiwVDAF9KRjw8cOxPapit86Kih4D71gkGyPoHQsEKKiWH5KZj7RawJVWFL1kOUGWI_aimQG-Eq6-Bq1ezGMaHnEejqnBl_EpyLOntxcETJB0kCm2vkFO4BRLRT2QcaQSjnxllpmr_x-UkgOfCcklfZlJvc5n7TJIevq9RsQ')" }}
        />
        {/* Background Shader Animation */}
        <div className="absolute inset-0 opacity-40">
          <HeroBackground />
        </div>
        {/* Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-ink/80 via-slate-ink/40 to-transparent" />
        
        <div className="relative z-10 text-center px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex flex-col items-center">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-label-md text-label-md text-saffron-glow uppercase tracking-widest mb-4"
          >
            Export Grade
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-headline-lg font-medium text-4xl md:text-[80px] md:leading-[88px] text-surface-container-lowest max-w-4xl mb-8"
          >
            Premium Kerala Spices for Global Markets
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-body-lg text-body-lg text-surface-variant max-w-2xl mb-10"
          >
            Sourced directly from the lush farms of Kerala. We deliver the authentic, pure, and sustainably sourced magic of Indian spices to modern kitchens worldwide.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Link 
              href="/bulk-enquiry" 
              className="bg-saffron-glow text-slate-ink font-label-md text-label-md uppercase px-8 py-4 rounded hover:bg-secondary-fixed-dim transition-colors shadow-lg shadow-saffron-glow/20"
            >
              Request Export Quote
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. About/Heritage Section */}
      <section className="py-24 md:py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        <AnimatedSection className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h4 className="font-label-md text-label-md text-moss-deep uppercase tracking-widest">Our Heritage</h4>
            <h2 className="font-headline-lg text-headline-lg text-slate-ink">About Spicewizz</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              We are a leading exporter of high-quality, authentic spices sourced directly from the lush farms of Kerala. With generations of expertise, our commitment is to bring you the freshest, most aromatic spices that meet international export standards and elevate global culinary experiences.
            </p>
            <div className="pt-4">
              <Image 
                src="/images/logo.jpeg" 
                alt="Spicewizz Logo" 
                width={200}
                height={64}
                className="h-16 w-auto opacity-80 mix-blend-multiply filter grayscale hover:grayscale-0 transition-all duration-500" 
              />
            </div>
          </div>
          <div className="relative h-[500px] rounded overflow-hidden shadow-2xl shadow-moss-deep/5 group">
            <Image 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNKZ8zCoM5yB-Se-dBmNd_fgfsEMRb_ZVpZweE0-HsLpw2H791CaIJa1exk-jXgRRPnuOq0TWsTyFteM7A-kBiBBdiyuhQEm0G4rxj-bgOKSzqk5yLTbC6w4-34bO0WyBn7ORu7D0uKnOiuZhwIpnFg16EUl2trp1C7RgxPQy3pPVgSXq1J8Xsa6B3NHSMR_BldSSws3dHRIOebTi2W3KxWZauOOJlk4sOBjki5K_dfMkqEmYvcijYFXiMObSZgY_N_Wb4RLvwN2Y"
              alt="Raw green cardamom pods"
              fill
              className="object-cover transform group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 border border-cream-paper/20 rounded m-4 pointer-events-none" />
          </div>
        </AnimatedSection>
      </section>

      {/* 3. Featured Products Grid */}
      <section className="py-24 bg-surface-container-low border-y border-surface-variant w-full">
        <AnimatedSection className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-16">
            <h4 className="font-label-md text-label-md text-moss-deep uppercase tracking-widest mb-2">From Our Farms</h4>
            <h2 className="font-headline-lg text-headline-lg text-slate-ink">Featured Products</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product, idx) => (
              <motion.div 
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-cream-paper rounded overflow-hidden shadow-sm shadow-moss-deep/5 hover:shadow-xl transition-shadow duration-300 group cursor-pointer flex flex-col h-full border border-surface-variant relative"
              >
                <Link href="/bulk-enquiry" className="flex flex-col h-full relative">
                  <div className="h-64 relative overflow-hidden">
                    <Image
                      src={product.imageUrl || '/images/Cardamom.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-moss-deep text-surface-container-lowest font-label-md text-xs px-3 py-1 rounded uppercase tracking-wider z-10">
                      Export Grade
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-slate-ink/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <button className="border-2 border-saffron-glow text-saffron-glow font-label-md px-6 py-3 uppercase tracking-wider hover:bg-saffron-glow hover:text-slate-ink transition-colors">Request Bulk Quote</button>
                    </div>
                  </div>
                  <div className="p-8 flex-grow flex flex-col justify-between relative z-10 bg-cream-paper">
                    <div>
                      <h3 className="font-headline-md text-headline-md text-slate-ink mb-2">{product.name}</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant mb-6 line-clamp-3">
                        {product.description || "Premium quality spices sourced from the best farms, ensuring rich flavor and intense aroma for global markets."}
                      </p>
                    </div>

                  </div>
                </Link>
              </motion.div>
            ))}
            
            {products.length === 0 && (
              <>
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-cream-paper rounded border border-surface-variant p-8 text-center h-64 flex items-center justify-center">
                    <p className="text-on-surface-variant">Product Loading...</p>
                  </div>
                ))}
              </>
            )}
          </div>
          <div className="mt-12 text-center">
            <Link 
              href="/products" 
              className="inline-block border-2 border-moss-deep text-moss-deep font-label-md text-label-md uppercase px-8 py-4 rounded hover:bg-moss-deep hover:text-surface-container-lowest transition-colors"
            >
              View Entire Catalog
            </Link>
          </div>
        </AnimatedSection>
      </section>

      {/* 4. The Spicewizz Difference */}
      <section className="py-24 md:py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h4 className="font-label-md text-label-md text-moss-deep uppercase tracking-widest mb-2">The Spicewizz Difference</h4>
            <h2 className="font-headline-lg text-headline-lg text-slate-ink">Why Choose Us?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: <Tractor size={32} />, title: "Direct Farm Sourcing", desc: "Sourced directly to ensure maximum freshness and quality control." },
              { icon: <ShieldCheck size={32} />, title: "Export Grade Quality", desc: "Rigorous testing to meet strict international food safety standards." },
              { icon: <Factory size={32} />, title: "Hygienic Processing", desc: "Processed and packed using state-of-the-art sterile machinery." },
              { icon: <Truck size={32} />, title: "Global Shipping", desc: "Timely and reliable fulfillment to markets across the world." }
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-6 text-primary">
                  {feature.icon}
                </div>
                <h3 className="font-title-lg text-title-lg text-slate-ink mb-3">{feature.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{feature.desc}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* 5. Certifications */}
      <section className="py-16 bg-cream-paper border-t border-surface-variant w-full">
        <AnimatedSection className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <h3 className="font-title-lg text-title-lg text-slate-ink mb-10">Accredited & Certified For Global Trade</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
            {['IEC', 'FSSAI', 'Spice Board', 'ISO 9001'].map((cert, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Award size={36} className="text-saffron-glow" />
                <span className="font-label-md text-label-md text-moss-deep tracking-wider uppercase">{cert}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* 6. Bulk Inquiry CTA */}
      <section id="quote" className="bg-moss-deep text-surface-container-lowest py-24 px-margin-mobile md:px-margin-desktop relative overflow-hidden w-full">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <AnimatedSection className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-headline-lg text-headline-lg mb-6 text-white">Partner With Us for Bulk Orders</h2>
          <p className="font-body-lg text-body-lg text-surface-variant mb-10 max-w-2xl mx-auto">
            We offer competitive pricing, customized packaging, and private labeling for bulk and wholesale exports. Let us source the best for your business.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              className="bg-transparent border border-outline-variant text-surface-container-lowest font-body-md px-6 py-4 rounded focus:ring-2 focus:ring-saffron-glow focus:border-transparent outline-none w-full sm:w-auto flex-grow placeholder:text-outline" 
              placeholder="Business Email Address" 
              type="email" 
              required
            />
            <button 
              className="bg-saffron-glow text-slate-ink font-label-md text-label-md uppercase px-8 py-4 rounded hover:bg-secondary-fixed-dim transition-colors flex-shrink-0 whitespace-nowrap" 
              type="button"
              onClick={() => window.location.href = '/bulk-enquiry'}
            >
              Request Quote
            </button>
          </form>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="bg-slate-ink dark:bg-black w-full py-12 px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-gutter">
        <div className="md:col-span-1">
          <div className="font-display-lg text-headline-md text-saffron-glow mb-4">SpiceWizz</div>
          <p className="text-surface-variant/60 font-body-md text-body-md mb-6 leading-relaxed">
            Premium spice exporters connecting the lush hills of Kerala to global tables through transparency and tradition.
          </p>
        </div>
        <div>
          <h4 className="text-primary-fixed dark:text-primary-fixed-dim font-bold mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link className="text-surface-variant/60 hover:text-saffron-glow transition-all duration-200" href="#">Privacy Policy</Link></li>
            <li><Link className="text-surface-variant/60 hover:text-saffron-glow transition-all duration-200" href="#">Export Terms</Link></li>
            <li><Link className="text-surface-variant/60 hover:text-saffron-glow transition-all duration-200" href="#">Quality Assurance</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-primary-fixed dark:text-primary-fixed-dim font-bold mb-4 uppercase tracking-wider text-sm">Verification</h4>
          <ul className="space-y-2">
            <li><Link className="text-surface-variant/60 hover:text-saffron-glow transition-all duration-200" href="#">Certification Log</Link></li>
            <li><Link className="text-surface-variant/60 hover:text-saffron-glow transition-all duration-200" href="#">Global Logistics</Link></li>
          </ul>
        </div>
        <div className="md:col-span-1">
          <h4 className="text-primary-fixed dark:text-primary-fixed-dim font-bold mb-4 uppercase tracking-wider text-sm">Newsletter</h4>
          <div className="flex gap-2">
            <input className="bg-white/10 border border-white/20 text-white px-3 py-2 text-sm w-full focus:ring-1 focus:ring-saffron-glow focus:border-saffron-glow outline-none rounded-sm" placeholder="Your Email" type="text" />
            <button className="bg-saffron-glow text-slate-ink px-3 py-2 rounded-sm flex items-center justify-center hover:bg-secondary-fixed-dim transition-colors"><ArrowRight size={20} /></button>
          </div>
          <p className="text-[10px] text-surface-variant/40 mt-8">
            © {new Date().getFullYear()} SpiceWizz Export India. All Rights Reserved. ISO 22000 & FairTrade Certified.
          </p>
        </div>
      </footer>
    </div>
  );
}
