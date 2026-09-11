"use client";

import { useState } from "react";
import { 
  MapPin, 
  Mail, 
  Phone, 
  Send, 
  ShieldCheck, 
  Leaf, 
  Award, 
  ClipboardCheck, 
  ExternalLink, 
  Building2, 
  Compass, 
  Globe2 
} from "lucide-react";

const OFFICE_LOCATIONS = [
  {
    id: "wayanad",
    title: "Spicewizz - Vythiri, Wayanad",
    role: "Plantation & Origin Hub",
    shortTitle: "Wayanad Office",
    address: "Spicewizz, Vythiri, Wayanad, Kerala - 673576, India",
    pinCode: "673576",
    shortAddress: "Vythiri, Wayanad (PIN: 673576)",
    embedUrl: "https://maps.google.com/maps?q=Vythiri%2C%20Wayanad%2C%20Kerala%20673576&t=&z=14&ie=UTF8&iwloc=&output=embed",
    directionsUrl: "https://www.google.com/maps/search/?api=1&query=Vythiri+Wayanad+Kerala+673576",
    badge: "Origin & Sourcing Hub",
    tagColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    phone: "+91 98765 43210",
    email: "wayanad@spicewizz.com",
    features: ["Spice Processing & Quality Grading", "Farmer Procurement Center", "Direct Origin Sourcing"]
  },
  {
    id: "calicut",
    title: "Spicewizz - Calicut",
    role: "Corporate & Tech Hub",
    shortTitle: "Calicut Office",
    address: "Spicewizz, Near Cyber Park, Thondayad, Calicut (Kozhikode), Kerala, India",
    pinCode: "673016",
    shortAddress: "Near Cyber Park, Thondayad, Calicut",
    embedUrl: "https://maps.google.com/maps?q=Cyberpark%2C%20Thondayad%2C%20Calicut%2C%20Kerala&t=&z=15&ie=UTF8&iwloc=&output=embed",
    directionsUrl: "https://www.google.com/maps/search/?api=1&query=Cyber+Park+Thondayad+Calicut",
    badge: "Corporate & Export Office",
    tagColor: "bg-amber-100 text-amber-800 border-amber-200",
    phone: "+91 (484) 2345 6789",
    email: "calicut@spicewizz.com",
    features: ["Global Export Logistics Desk", "B2B International Trade Desk", "Tech & Supply Chain Management"]
  }
];

export default function ContactPage() {
  const [activeLocationId, setActiveLocationId] = useState<"wayanad" | "calicut">("wayanad");
  const activeOffice = OFFICE_LOCATIONS.find((loc) => loc.id === activeLocationId) || OFFICE_LOCATIONS[0];

  return (
    <div className="flex flex-col min-h-screen font-body-md overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div 
            className="w-full h-full transform scale-105 bg-cover bg-center" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB1tTE3-aCKuEbhRO_fFCsKHhwNaFvXOy_VX7Z5ngJvwCGenq97Jd8ijzS7knqG402bMUVQeEcTUCvrf7zeqfo36txkjaxhqHZqBjHOhAfiV-Y4kUP3Mt0WcfKZJX9qAsaISVnngpBObDRaJajY6GNPAsl3SKxCzEbG85DyAkKijyT3L8bVBmq_XjlC3vNx29cGvFO-zDBlKlOgx-HXmAc9oNkKIk5zNITxQAvncDBOtZEuiruxSAPn7zsTWRapFwviTQGi82c-GUQ')" }}
          />
          <div className="absolute inset-0 bg-slate-ink/40" />
        </div>
        <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-white">
          <span className="font-label-md text-label-md text-saffron-glow uppercase tracking-widest block mb-4">Connect With Excellence</span>
          <h1 className="font-display-lg text-headline-lg md:text-display-lg mb-6 leading-tight">Get in Touch</h1>
          <p className="max-w-2xl font-body-lg text-body-lg text-surface-container-low opacity-90">
            Whether you're a retail enthusiast or an international procurement officer, we're here to bring the world's finest spices to your doorstep.
          </p>
        </div>
      </section>

      {/* General Inquiries & Contact Cards */}
      <section className="py-24 bg-cream-paper relative overflow-hidden">
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03]" 
          style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/felt.png')" }} 
        />
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-3 gap-gutter relative z-10">
          
          {/* Contact Cards Container */}
          <div className="lg:col-span-1 space-y-gutter">
            <h2 className="font-headline-md text-headline-md text-primary mb-8 border-l-4 border-saffron-glow pl-6">General Inquiries</h2>
            
            {/* Wayanad Office Card */}
            <div className="bg-surface border border-outline-variant p-6 rounded-lg shadow-sm hover:shadow-md transition-all hover:border-secondary/40">
              <div className="flex items-start gap-4">
                <MapPin className="text-secondary w-7 h-7 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-title-lg text-title-lg text-slate-ink font-semibold">Wayanad Office</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">PIN: 673576</span>
                  </div>
                  <p className="text-slate-800 font-semibold text-sm">Spicewizz</p>
                  <p className="text-on-surface-variant font-body-md text-sm leading-relaxed mt-0.5">
                    Vythiri, Wayanad,<br />
                    Kerala - 673576, India
                  </p>
                  <div className="flex items-center gap-3 mt-3 pt-2 border-t border-outline-variant/40">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveLocationId("wayanad");
                        document.getElementById("office-locations-map")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-xs font-semibold text-secondary hover:text-primary flex items-center gap-1 transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5" /> View on Map
                    </button>
                    <span className="text-neutral-300">•</span>
                    <a
                      href={OFFICE_LOCATIONS[0].directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-neutral-600 hover:text-secondary flex items-center gap-1 transition-colors"
                    >
                      Directions <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Calicut Office Card */}
            <div className="bg-surface border border-outline-variant p-6 rounded-lg shadow-sm hover:shadow-md transition-all hover:border-secondary/40">
              <div className="flex items-start gap-4">
                <MapPin className="text-secondary w-7 h-7 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-title-lg text-title-lg text-slate-ink font-semibold">Calicut Office</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Cyber Park</span>
                  </div>
                  <p className="text-slate-800 font-semibold text-sm">Spicewizz</p>
                  <p className="text-on-surface-variant font-body-md text-sm leading-relaxed mt-0.5">
                    Near Cyber Park, Thondayad,<br />
                    Calicut (Kozhikode), Kerala, India
                  </p>
                  <div className="flex items-center gap-3 mt-3 pt-2 border-t border-outline-variant/40">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveLocationId("calicut");
                        document.getElementById("office-locations-map")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-xs font-semibold text-secondary hover:text-primary flex items-center gap-1 transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5" /> View on Map
                    </button>
                    <span className="text-neutral-300">•</span>
                    <a
                      href={OFFICE_LOCATIONS[1].directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-neutral-600 hover:text-secondary flex items-center gap-1 transition-colors"
                    >
                      Directions <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-outline-variant p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <Mail className="text-secondary w-7 h-7 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-title-lg text-title-lg mb-2 text-slate-ink font-semibold">Email Us</h3>
                  <p className="text-on-surface-variant font-body-md text-sm">exports@spicewizz.com</p>
                  <p className="text-on-surface-variant font-body-md text-sm">support@spicewizz.com</p>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-outline-variant p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <Phone className="text-secondary w-7 h-7 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-title-lg text-title-lg mb-2 text-slate-ink font-semibold">Call Us</h3>
                  <p className="text-on-surface-variant font-body-md text-sm">+91 98765 43210 (Wayanad)</p>
                  <p className="text-on-surface-variant font-body-md text-sm">+91 (484) 2345 6789 (Calicut)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk & Export Inquiry Form */}
          <div className="lg:col-span-2 mt-12 lg:mt-0">
            <div className="bg-white border border-outline-variant p-10 md:p-12 rounded-lg shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transform translate-x-8 -translate-y-8" />
              <h2 className="font-headline-md text-headline-md text-primary mb-2">Bulk & Export Inquiry</h2>
              <p className="text-on-surface-variant font-body-md mb-10 relative z-10">Exclusive procurement portal for international B2B buyers and wholesalers.</p>
              
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10" onSubmit={(e) => {
                e.preventDefault();
                const btn = document.getElementById('submitBtn');
                if (btn) {
                  const originalText = btn.innerHTML;
                  btn.innerHTML = '<span class="animate-spin inline-block">⏳</span> Sending...';
                  (btn as HTMLButtonElement).disabled = true;
                  setTimeout(() => {
                    btn.innerHTML = '<span>✓</span> Inquiry Sent Successfully';
                    btn.classList.add('bg-primary');
                    btn.classList.remove('bg-secondary');
                    setTimeout(() => {
                      btn.innerHTML = originalText;
                      btn.classList.remove('bg-primary');
                      btn.classList.add('bg-secondary');
                      (btn as HTMLButtonElement).disabled = false;
                      (e.target as HTMLFormElement).reset();
                    }, 3000);
                  }, 1500);
                }
              }}>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Full Name</label>
                  <input required className="w-full bg-cream-paper border border-outline-variant rounded-sm focus:ring-secondary focus:border-secondary transition-all px-4 py-3" placeholder="e.g. Julian Schmidt" type="text" />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Company Name</label>
                  <input required className="w-full bg-cream-paper border border-outline-variant rounded-sm focus:ring-secondary focus:border-secondary transition-all px-4 py-3" placeholder="Registered Company Name" type="text" />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Country</label>
                  <input required className="w-full bg-cream-paper border border-outline-variant rounded-sm focus:ring-secondary focus:border-secondary transition-all px-4 py-3" placeholder="Shipping Destination" type="text" />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Work Email</label>
                  <input required className="w-full bg-cream-paper border border-outline-variant rounded-sm focus:ring-secondary focus:border-secondary transition-all px-4 py-3" placeholder="corporate@domain.com" type="email" />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Phone Number</label>
                  <input required className="w-full bg-cream-paper border border-outline-variant rounded-sm focus:ring-secondary focus:border-secondary transition-all px-4 py-3" placeholder="+ (CC) Number" type="tel" />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Product Interest</label>
                  <select className="w-full bg-cream-paper border border-outline-variant rounded-sm focus:ring-secondary focus:border-secondary transition-all px-4 py-3">
                    {['Cardamom', 'Pepper', 'Cinnamon', 'Nutmeg', 'Mace flower', 'Star anise', 'Bay leafe', 'Honey', 'Coffee seeds'].map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Quantity Requirements & Specifications</label>
                  <textarea required className="w-full bg-cream-paper border border-outline-variant rounded-sm focus:ring-secondary focus:border-secondary transition-all px-4 py-3 resize-y" placeholder="Mention volume (MT/kg), packaging requirements, and any lab certification needs..." rows={4}></textarea>
                </div>
                <div className="md:col-span-2 mt-4">
                  <button id="submitBtn" className="w-full bg-secondary text-white py-4 font-label-md text-label-md uppercase tracking-[0.2em] hover:bg-on-secondary-container transition-colors rounded-sm flex items-center justify-center gap-2" type="submit">
                    Send Export Inquiry <Send className="w-4 h-4 ml-2" />
                  </button>
                  <p className="text-center text-[11px] text-on-surface-variant mt-4 opacity-70">
                    By submitting, you agree to our Export Terms and Privacy Policy. Our trade desk responds within 24 business hours.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Office Locations & Interactive Map Section */}
      <section id="office-locations-map" className="py-24 bg-surface-container-highest scroll-mt-16">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-10">
            <span className="font-label-md text-label-md text-secondary uppercase tracking-widest block mb-2 font-semibold">
              Our Locations
            </span>
            <h2 className="font-headline-md text-headline-md text-primary mb-3">
              Visit Our Offices
            </h2>
            <p className="text-on-surface-variant max-w-xl mx-auto text-sm md:text-base">
              Experience authentic Malabar spices at our source origin in Wayanad or coordinate commercial exports at our Calicut corporate hub.
            </p>
          </div>

          {/* Interactive Office Switcher Buttons */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8">
            {OFFICE_LOCATIONS.map((loc) => {
              const isActive = activeLocationId === loc.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setActiveLocationId(loc.id as "wayanad" | "calicut")}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-medium transition-all text-sm md:text-base border shadow-sm ${
                    isActive
                      ? "bg-secondary text-white border-secondary ring-4 ring-secondary/20 shadow-md transform -translate-y-0.5"
                      : "bg-white text-slate-700 border-outline-variant hover:border-secondary/60 hover:bg-slate-50"
                  }`}
                >
                  <MapPin className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-saffron-glow" : "text-secondary"}`} />
                  <div className="text-left">
                    <div className="font-semibold text-sm md:text-base leading-tight">
                      {loc.title}
                    </div>
                    <div className={`text-xs ${isActive ? "text-white/80" : "text-neutral-500"}`}>
                      {loc.shortAddress}
                    </div>
                  </div>
                  {isActive ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-saffron-glow animate-pulse ml-1" />
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Map Display & Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Google Map Display (7 cols) */}
            <div className="lg:col-span-7 bg-surface rounded-2xl border border-outline-variant overflow-hidden relative shadow-lg min-h-[440px] flex flex-col">
              <div className="relative flex-1 w-full min-h-[440px]">
                <iframe
                  key={activeOffice.id}
                  src={activeOffice.embedUrl}
                  width="100%"
                  height="100%"
                  className="w-full h-full min-h-[440px] absolute inset-0"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Google Map - ${activeOffice.title}`}
                ></iframe>

                {/* Map Floating Badge */}
                <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-md bg-white/95 backdrop-blur-md p-4 rounded-xl border border-neutral-200/80 shadow-xl pointer-events-auto">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                          {activeOffice.badge}
                        </span>
                      </div>
                      <h4 className="font-title-lg font-bold text-slate-ink text-base">
                        {activeOffice.title}
                      </h4>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                        {activeOffice.address}
                      </p>
                    </div>
                    <a
                      href={activeOffice.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-white text-xs font-semibold hover:bg-secondary/90 shadow transition-colors flex-shrink-0 mt-1"
                      title="Open in Google Maps"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Cards & Global Reach (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4">
              {OFFICE_LOCATIONS.map((loc) => {
                const isActive = activeLocationId === loc.id;
                return (
                  <div
                    key={loc.id}
                    onClick={() => setActiveLocationId(loc.id as "wayanad" | "calicut")}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? "bg-white border-secondary shadow-md ring-2 ring-secondary/20"
                        : "bg-white/80 border-outline-variant hover:border-secondary/50 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isActive ? "bg-secondary text-white" : "bg-slate-100 text-secondary"}`}>
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-ink text-base">{loc.title}</h4>
                          <span className="text-xs text-secondary font-medium">{loc.role}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${loc.tagColor}`}>
                        {loc.badge}
                      </span>
                    </div>

                    <p className="text-xs md:text-sm text-neutral-600 mb-3 pl-11 leading-relaxed">
                      {loc.address}
                    </p>

                    <div className="pl-11 mb-3">
                      <ul className="grid grid-cols-1 gap-1 text-[11px] text-neutral-500">
                        {loc.features.map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary/60" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100 pl-11">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveLocationId(loc.id as "wayanad" | "calicut");
                        }}
                        className={`text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          isActive ? "text-secondary font-bold" : "text-neutral-600 hover:text-secondary"
                        }`}
                      >
                        <Compass className="w-4 h-4" />
                        {isActive ? "Currently on Map" : "Show on Map"}
                      </button>

                      <a
                        href={loc.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-semibold text-secondary hover:text-primary flex items-center gap-1 hover:underline"
                      >
                        Directions <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}

              {/* Global Reach Card */}
              <div className="p-5 bg-white/70 border border-outline-variant/70 rounded-2xl">
                <div className="flex items-center gap-2 mb-2 text-secondary font-semibold text-xs uppercase tracking-wider">
                  <Globe2 className="w-4 h-4" />
                  <span>Global Export Reach</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Exporting Malabar heritage to 32+ nations across the Middle East, Europe, Americas, and Asia-Pacific with ISO 22000 & Fairtrade logistics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certification & Trust Row */}
      <section className="py-12 bg-white border-y border-outline-variant/30">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-primary w-6 h-6" />
              <span className="font-label-md text-label-md text-slate-ink uppercase">ISO 22000 Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="text-primary w-6 h-6" />
              <span className="font-label-md text-label-md text-slate-ink uppercase">Fairtrade International</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="text-primary w-6 h-6" />
              <span className="font-label-md text-label-md text-slate-ink uppercase">Organic India Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="text-primary w-6 h-6" />
              <span className="font-label-md text-label-md text-slate-ink uppercase">HACCP Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Floating Action Button */}
      <a 
        className="fixed bottom-8 right-8 z-[60] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group" 
        href="https://wa.me/919876543210" 
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
        </svg>
        <div className="absolute right-full mr-4 bg-slate-ink text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Chat with Export Team
        </div>
      </a>
    </div>
  );
}
