"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Product } from '@/types/product';
import ProductCard from '@/components/ProductCard';
import AnimatedSection from '@/components/AnimatedSection';
import HeroImageSequence from '@/components/HeroImageSequence';
import { motion } from 'framer-motion';
import { Leaf, ShieldCheck, Factory, Globe2, MoveRight } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showHeroText, setShowHeroText] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        // Just take first 3-6 products for the homepage
        setProducts(data.slice(0, 6));
      } catch (err) {
        console.error("Error fetching products", err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Cinematic Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Images */}
        <HeroImageSequence onComplete={() => setShowHeroText(true)} />
        
        {/* Glassmorphic Overlay Box - Delayed until after sequence */}
        <div className="relative z-10 container mx-auto px-4 flex justify-center">
          {showHeroText && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="p-10 md:p-16 text-center max-w-4xl"
            >
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-lg leading-tight"
              >
                Premium Indian Spice Exporter
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl md:text-2xl mb-10 text-neutral-100 font-medium drop-shadow"
              >
                Direct From Kerala Farms, The Spice Garden of India
              </motion.p>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row justify-center gap-4"
              >
                <Link href="/products" className="bg-primary text-white font-bold py-4 px-10 rounded-full hover:bg-opacity-90 transition-transform active:scale-95 shadow-xl flex items-center justify-center gap-2">
                  Explore Products <MoveRight size={20}/>
                </Link>
                <Link href="/bulk-enquiry" className="bg-white/20 backdrop-blur-md text-white border border-white/40 font-bold py-4 px-10 rounded-full hover:bg-white/30 transition-colors shadow-lg">
                  Request Bulk Quote
                </Link>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      {/* About Company Section */}
      <section className="bg-background py-24 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <AnimatedSection className="container mx-auto px-4 text-center">
          <span className="text-secondary font-bold tracking-widest uppercase text-sm mb-2 block">Our Heritage</span>
          <h2 className="text-4xl font-bold mb-8 text-foreground drop-shadow-sm">About Malabar Coast Spices</h2>
          <p className="max-w-3xl mx-auto text-lg text-foreground/80 leading-relaxed">
            We are a leading exporter of high-quality, authentic spices sourced directly from the lush farms of Kerala. With generations of expertise, our commitment is to bring you the freshest, most aromatic spices that meet international export standards and elevate global culinary experiences.
          </p>
        </AnimatedSection>
      </section>

      {/* Our Products Section */}
      <section className="bg-surface py-24">
        <AnimatedSection className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-secondary font-bold tracking-widest uppercase text-sm mb-2 block">From Our Farms</span>
            <h2 className="text-4xl font-bold text-foreground">Featured Products</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, idx) => (
              <ProductCard key={product._id} product={product} index={idx} />
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link href="/products" className="inline-flex items-center gap-2 bg-foreground text-background font-bold py-4 px-10 rounded-full hover:bg-neutral-800 transition-colors">
              View Entire Catalog <MoveRight size={20}/>
            </Link>
          </div>
        </AnimatedSection>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-background py-24 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2" />
        <AnimatedSection className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-secondary font-bold tracking-widest uppercase text-sm mb-2 block">The Malabar Difference</span>
            <h2 className="text-4xl font-bold text-foreground">Why Choose Us?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Leaf size={32} />, title: "Direct Farm Sourcing", desc: "Sourced directly to ensure maximum freshness and quality control." },
              { icon: <ShieldCheck size={32} />, title: "Export Grade Quality", desc: "Rigorous testing to meet strict international food safety standards." },
              { icon: <Factory size={32} />, title: "Hygienic Processing", desc: "Processed and packed using state-of-the-art sterile machinery." },
              { icon: <Globe2 size={32} />, title: "Global Shipping", desc: "Timely and reliable fulfillment to markets across the world." }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -8 }}
                className="bg-surface p-8 rounded-2xl shadow-sm border border-neutral-100 min-h-[250px] flex flex-col items-center text-center transition-shadow hover:shadow-lg"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-xl mb-3 text-foreground">{feature.title}</h3>
                <p className="text-foreground/70">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>
      
      {/* Infinite Marquee Certifications Section */}
      <section className="py-20 bg-surface overflow-hidden border-y border-neutral-100">
        <div className="container mx-auto px-4 text-center mb-10">
          <h2 className="text-2xl font-bold text-foreground">Accredited & Certified For Global Trade</h2>
        </div>
        <div className="flex whitespace-nowrap overflow-hidden relative group">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex items-center gap-16 min-w-full pl-16"
          >
            {['IEC Registration', 'FSSAI Certified', 'Spice Board of India', 'ISO 9001:2015', 'HACCP Compliant', 'APEDA', 'Halal Certified', 'USDA Organic'].map((cert, idx) => (
              <div key={idx} className="flex-shrink-0 px-8 py-4 bg-white border border-neutral-200 rounded-xl shadow-sm text-lg font-semibold text-primary/80">
                {cert}
              </div>
            ))}
          </motion.div>
          {/* Duplicate for seamless infinite scroll */}
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex items-center gap-16 min-w-full pl-16 absolute top-0 left-full"
          >
            {['IEC Registration', 'FSSAI Certified', 'Spice Board of India', 'ISO 9001:2015', 'HACCP Compliant', 'APEDA', 'Halal Certified', 'USDA Organic'].map((cert, idx) => (
              <div key={idx} className="flex-shrink-0 px-8 py-4 bg-white border border-neutral-200 rounded-xl shadow-sm text-lg font-semibold text-primary/80">
                {cert}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bulk Enquiry / Call to Action */}
      <section className="bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
        <AnimatedSection className="container mx-auto px-4 py-24 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Partner With Us for Bulk Orders</h2>
          <p className="text-primary-foreground/80 mb-10 max-w-2xl mx-auto text-lg">
            We offer competitive pricing, customized packaging, and private labeling for bulk and wholesale exports. Let us source the best for your business.
          </p>
          <Link href="/bulk-enquiry" className="inline-block bg-accent py-4 px-12 rounded-full font-bold text-white hover:bg-orange-600 transition-colors shadow-xl hover:shadow-2xl hover:-translate-y-1 transform duration-300">
            Request a Dedicated Quote
          </Link>
        </AnimatedSection>
      </section>

      {/* Footer Section */}
      <footer className="bg-neutral-900 justify-self-end text-neutral-400 py-12 border-t border-neutral-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Malabar Coast Spices</h2>
          <p className="mb-4 text-sm max-w-md mx-auto line-clamp-2">Delivering the ancient magic of Indian spices to modern kitchens worldwide. Authentic, pure, and sustainably sourced.</p>
          <p className="mb-6">Email: <a href="mailto:exports@malabarcoast.com" className="text-accent hover:underline">exports@malabarcoast.com</a></p>
          <div className="pt-8 border-t border-neutral-800 text-sm flex justify-center items-center gap-6">
            <p>&copy; {new Date().getFullYear()} Malabar Coast Spices. All Rights Reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
