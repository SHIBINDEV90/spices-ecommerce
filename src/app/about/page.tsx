"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Leaf,
  ShieldCheck,
  MapPin,
  HeartHandshake,
  Sparkles,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  PackageCheck,
  Award,
  Sprout,
  Truck,
  Scale
} from "lucide-react";

const PILLARS = [
  {
    icon: Clock,
    title: "Current Harvest Only",
    badge: "Never Stale",
    desc: "Spices are living agricultural produce, not inert powders. While commercial brands sell spices aged 12 to 24 months in warehouses, we dispatch strictly from the latest seasonal harvest when natural volatile oils are at their absolute peak.",
  },
  {
    icon: HeartHandshake,
    title: "Direct & Fair to Farmers",
    badge: "No Middlemen",
    desc: "We work directly with smallholder family planters in Vythiri and the Western Ghats. By cutting out multi-tier broker chains, our growers receive fair farmgate prices, sustaining their families and traditional agroforestry practices.",
  },
  {
    icon: ShieldCheck,
    title: "Zero Fillers or Artificial Polish",
    badge: "100% Pure",
    desc: "No mineral oil polishing for fake shine, no synthetic food dyes, and zero spent starch fillers. What you see and smell in every SpiceWizz pack is pure, unadulterated nature just as the soil produced it.",
  },
  {
    icon: PackageCheck,
    title: "Aroma-Lock Micro Packaging",
    badge: "Fresh Sealed",
    desc: "Natural spice oils (like piperine in black pepper and cineole in cardamom) evaporate quickly in heat and light. We pack in small, carefully monitored batches using airtight, multi-layer moisture-barrier pouches.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Handpicked at Peak Maturity",
    desc: "Harvested by experienced local plantation hands who know exactly when the berry, pod, or clove has reached maximum oil concentration.",
  },
  {
    step: "02",
    title: "Traditional Curing & Sun Drying",
    desc: "Cleaned and sun-cured naturally on hygienic raised drying beds or low-temperature curing chambers that protect the essential aroma.",
  },
  {
    step: "03",
    title: "Density & Size Grading",
    desc: "Screened and graded by hand and precision sieves — separating export-grade 8mm+ bold green cardamoms and heavy-density Malabar pepper.",
  },
  {
    step: "04",
    title: "Direct Dispatch to Your Door",
    desc: "Sealed fresh at our Vythiri origin hub and dispatched straight to your kitchen across India and international destinations.",
  },
];

const FAQS = [
  {
    q: "Why do SpiceWizz spices smell noticeably stronger than supermarket brands?",
    a: "Because they are fresh! Commercial spices often sit in central warehouses and supermarket shelves for 1 to 2 years, during which over 60% of their volatile essential oils evaporate. SpiceWizz spices come directly from recent harvests, retaining their full natural potency.",
  },
  {
    q: "Are there any chemical dyes, preservatives, or anti-caking agents added?",
    a: "Absolutely none. Not even 0.01%. We don't polish our pepper berries with mineral oils or dye our cardamoms green. You receive 100% natural, unadulterated spices.",
  },
  {
    q: "Where is SpiceWizz based?",
    a: "Our origin and procurement hub is in Vythiri, Wayanad, Kerala (PIN: 673576) — situated in the heart of the Western Ghats spice country. Our trade logistics hub operates out of Calicut, Kerala.",
  },
  {
    q: "Do you supply both retail packs for home cooking and bulk wholesale?",
    a: "Yes! Home cooks can order fresh retail pouches directly through our online store, while chefs, specialty grocers, and overseas buyers can place bulk B2B enquiries with custom export specifications.",
  },
];

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream-paper text-slate-ink overflow-x-hidden">
      {/* 1. Hero Section */}
      <section className="relative h-[65vh] min-h-[480px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB1tTE3-aCKuEbhRO_fFCsKHhwNaFvXOy_VX7Z5ngJvwCGenq97Jd8ijzS7knqG402bMUVQeEcTUCvrf7zeqfo36txkjaxhqHZqBjHOhAfiV-Y4kUP3Mt0WcfKZJX9qAsaISVnngpBObDRaJajY6GNPAsl3SKxCzEbG85DyAkKijyT3L8bVBmq_XjlC3vNx29cGvFO-zDBlKlOgx-HXmAc9oNkKIk5zNITxQAvncDBOtZEuiruxSAPn7zsTWRapFwviTQGi82c-GUQ')",
          }}
        />
        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-ink/90 via-slate-ink/65 to-slate-ink/40" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-saffron-glow/20 border border-saffron-glow/40 text-saffron-glow px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
            <Sprout className="w-3.5 h-3.5" />
            <span>Rooted in Vythiri, Wayanad • 100% Genuine Startup</span>
          </div>

          <h1 className="font-display-lg text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight mb-6 leading-tight">
            Real Spices. Pure Origins. <br />
            <span className="text-saffron-glow">No Shortcuts.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-surface-variant/90 leading-relaxed font-light">
            We started SpiceWizz with a single conviction: the world deserves to experience
            spices as fresh and potent as the day they are hand-harvested in the mist-laden hills of Kerala.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/products"
              className="bg-saffron-glow text-slate-ink font-semibold px-7 py-3.5 rounded-lg hover:bg-secondary-fixed-dim transition-all text-sm uppercase tracking-wider shadow-lg shadow-saffron-glow/20 flex items-center gap-2"
            >
              <span>Explore Fresh Harvest</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-medium px-7 py-3.5 rounded-lg transition-all text-sm backdrop-blur-sm"
            >
              Visit Our Origin Hub
            </Link>
          </div>
        </div>
      </section>

      {/* 2. The Honest Startup Story */}
      <section className="py-20 md:py-28 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Story Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-moss-deep text-xs font-bold uppercase tracking-widest">
              <span className="w-8 h-[2px] bg-moss-deep"></span>
              Why We Started SpiceWizz
            </div>

            <h2 className="font-display-lg text-3xl sm:text-4xl text-slate-ink font-semibold leading-snug">
              The modern spice rack lost its soul. <br />
              <span className="text-secondary">We came together to bring it back.</span>
            </h2>

            <p className="text-neutral-700 text-base md:text-lg leading-relaxed">
              Growing up in Kerala, spices were never just inert powders sitting in jars. They were our mornings:
              the unmistakable, sweet-peppery breeze drifting from cardamom hills, the sound of freshly plucked pepper berries
              drying under the equatorial sun, and the vibrant aroma that fills a kitchen when a whole pod is cracked open.
            </p>

            <p className="text-neutral-700 text-base md:text-lg leading-relaxed">
              When we saw what most commercial brands and supermarkets were selling, we were shocked.
              Spices pass through four to six middlemen, get warehoused for 12 to 24 months, lose over half
              their volatile oils, and are often treated with artificial gloss or cut with fillers just to maximize shelf life.
            </p>

            <p className="text-neutral-700 text-base md:text-lg leading-relaxed font-medium text-slate-900">
              SpiceWizz is our response: a family-founded, transparent spice venture headquartered right at the source
              in Vythiri, Wayanad. No corporate layers. No stale stock. Just genuine, small-batch spices directly
              from the farmers who nurture them to your home.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-6 text-sm text-neutral-600 border-t border-neutral-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                <span>Vythiri, Wayanad (PIN: 673576)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Zero Synthetic Additives</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-amber-700" />
                <span>Direct Farmer Value</span>
              </div>
            </div>
          </div>

          {/* Honest Comparison Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none" />

              <h3 className="font-display-lg text-xl font-bold text-slate-ink mb-1">
                The Reality of Modern Spices
              </h3>
              <p className="text-xs text-neutral-500 mb-6">
                Why direct sourcing makes all the difference in your cooking
              </p>

              <div className="space-y-4 text-sm">
                <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-100">
                  <span className="text-xs font-bold text-red-700 uppercase tracking-wider block mb-1">
                    Mass Supermarket Brands
                  </span>
                  <ul className="text-neutral-700 space-y-1.5 text-xs">
                    <li className="flex items-start gap-1.5">
                      <span className="text-red-500 font-bold">✕</span>
                      <span>12–24 months old; sitting in transit & storage</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-red-500 font-bold">✕</span>
                      <span>4 to 6 brokers taking margin; farmers underpaid</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-red-500 font-bold">✕</span>
                      <span>Polished with oils or mixed with inferior grades</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-red-500 font-bold">✕</span>
                      <span>Volatile essential oils evaporated before purchase</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                    The SpiceWizz Direct Way
                  </span>
                  <ul className="text-neutral-800 space-y-1.5 text-xs">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Current seasonal harvest — peak aroma & piperine</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Direct farmgate partnership with Wayanad growers</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>100% natural; zero chemical polish, starches, or dyes</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Micro-batched & sealed in aroma-lock pouches</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>Origin: Vythiri &amp; Malabar, Kerala</span>
                <span className="font-semibold text-emerald-700">100% Traceable</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 4 Non-Negotiable Promises */}
      <section className="py-20 bg-surface-container-low border-y border-outline-variant/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-2">
              Our Core Commitments
            </span>
            <h2 className="font-display-lg text-3xl sm:text-4xl text-slate-ink font-semibold">
              The 4 Promises We Live By
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base mt-3">
              As a young startup, our reputation is built on trust, honesty, and what happens when you open our pouch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PILLARS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-outline-variant/60 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 text-secondary flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-full">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="font-title-lg text-lg font-bold text-slate-ink mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-neutral-100 flex items-center gap-1.5 text-xs text-secondary font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>SpiceWizz Standard</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. The Vythiri, Wayanad Origin Terroir */}
      <section className="py-20 md:py-28 px-6 max-w-6xl mx-auto">
        <div className="bg-slate-ink text-white rounded-3xl p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-moss-deep/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-saffron-glow/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-bold uppercase tracking-widest text-saffron-glow block">
                The Malabar Terroir
              </span>
              <h2 className="font-display-lg text-3xl sm:text-4xl font-semibold leading-tight text-white">
                Why Wayanad Spices Are Celebrated Globally
              </h2>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                Wayanad sits over 700 meters above sea level along the Western Ghats — a UNESCO
                World Heritage biodiversity sanctuary. The combination of nutrient-rich volcanic red loam,
                dense tropical canopy shade, and dual monsoon cycles gives our spices their legendary density,
                essential oil count, and unmistakable pungency.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                  <div className="text-saffron-glow font-bold text-lg">700m+</div>
                  <div className="text-xs text-neutral-400">High Altitude Mist</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                  <div className="text-saffron-glow font-bold text-lg">Rich Loam</div>
                  <div className="text-xs text-neutral-400">Nutrient Soil</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                  <div className="text-saffron-glow font-bold text-lg">Dual Monsoon</div>
                  <div className="text-xs text-neutral-400">Natural Hydration</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/10 border border-white/15 backdrop-blur-md rounded-2xl p-6 sm:p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-saffron-glow/20 border border-saffron-glow/40 flex items-center justify-center text-saffron-glow">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="font-title-lg text-xl font-bold text-white">
                Visit Our Sourcing Hub
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                SpiceWizz Plantation &amp; Origin Center<br />
                Vythiri, Wayanad, Kerala - 673576, India
              </p>
              <div className="pt-2">
                <Link
                  href="/contact#office-locations-map"
                  className="inline-flex items-center gap-2 bg-white text-slate-ink text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg hover:bg-saffron-glow transition-colors"
                >
                  <span>View Wayanad on Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Farm-To-Kitchen Roadmap */}
      <section className="py-20 bg-cream-paper border-t border-outline-variant/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-moss-deep block mb-2">
              Radical Transparency
            </span>
            <h2 className="font-display-lg text-3xl sm:text-4xl text-slate-ink font-semibold">
              The Journey to Your Kitchen
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base mt-2">
              Every package follows a clean, documented pathway from harvest to sealing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, idx) => (
              <div
                key={idx}
                className="bg-white border border-outline-variant/60 rounded-2xl p-6 relative shadow-sm"
              >
                <div className="text-4xl font-display-lg font-bold text-secondary/20 mb-3">
                  {step.step}
                </div>
                <h3 className="font-title-lg text-base font-bold text-slate-ink mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. A Personal Note From The Founders */}
      <section className="py-20 md:py-24 px-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-white to-amber-50/40 border border-outline-variant/70 rounded-3xl p-8 sm:p-12 shadow-md relative text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-6">
            <HeartHandshake className="w-7 h-7" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-3">
            A Note From The Founders
          </span>

          <h2 className="font-display-lg text-2xl sm:text-3xl text-slate-ink font-semibold mb-6">
            &ldquo;Every parcel we ship is packed with pride.&rdquo;
          </h2>

          <div className="space-y-4 text-neutral-700 text-sm sm:text-base leading-relaxed text-left sm:text-center max-w-2xl mx-auto">
            <p>
              We are not a faceless corporate conglomerate hiding behind marketing slogans. We are a family and a young,
              hardworking team that inspects every batch, talks to our partner farmers every week, and personally ensures
              what goes into our pouches is something we would proudly serve our own parents and children.
            </p>
            <p>
              When you choose SpiceWizz, you are directly backing local farming families in Kerala and proving that
              an honest food startup built on purity and fairness can thrive in a crowded market.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-200/80 inline-block text-center">
            <p className="font-display-lg text-lg font-bold text-slate-ink">
              The SpiceWizz Family &amp; Team
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Vythiri, Wayanad &amp; Calicut, Kerala, India
            </p>
          </div>
        </div>
      </section>

      {/* 7. Transparent FAQ Section */}
      <section className="py-20 bg-surface-container-low border-t border-outline-variant/40">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary block mb-2">
              Common Questions
            </span>
            <h2 className="font-display-lg text-3xl font-semibold text-slate-ink">
              Honest Answers to Honest Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-outline-variant/60 rounded-2xl overflow-hidden transition-all shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-neutral-50 transition-colors"
                  >
                    <span className="font-title-lg font-semibold text-slate-ink text-sm sm:text-base">
                      {faq.q}
                    </span>
                    <span className="text-neutral-400 flex-shrink-0">
                      {isOpen ? <ChevronUp className="w-5 h-5 text-secondary" /> : <ChevronDown className="w-5 h-5" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Bottom CTA Banner */}
      <section className="py-16 bg-moss-deep text-white px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-display-lg text-3xl sm:text-4xl font-semibold">
            Taste What Real, Freshly Harvested Spices Feel Like
          </h2>
          <p className="text-neutral-200 text-sm sm:text-base leading-relaxed">
            Order a pouch of our fresh Malabar pepper, bold Wayanad cardamom, or fragrant cloves.
            If your kitchen doesn&apos;t immediately smell like Kerala, we haven&apos;t done our job.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              href="/products"
              className="bg-saffron-glow text-slate-ink font-bold px-8 py-3.5 rounded-lg hover:bg-secondary-fixed-dim transition-all text-xs uppercase tracking-wider shadow-lg"
            >
              Shop All Fresh Spices
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-8 py-3.5 rounded-lg transition-all text-xs uppercase tracking-wider"
            >
              Get in Touch with Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
