"use client";

import { MapPin, Mail, Phone, Send, ShieldCheck, Leaf, Award, ClipboardCheck } from "lucide-react";

export default function ContactPage() {
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
            
            <div className="bg-surface border border-outline-variant p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <MapPin className="text-secondary w-8 h-8 flex-shrink-0" />
                <div>
                  <h3 className="font-title-lg text-title-lg mb-2 text-slate-ink">Office Headquarters</h3>
                  <p className="text-on-surface-variant font-body-md leading-relaxed">
                    Spicewizz Export India,<br />
                    Marine Drive Tower, Kochi,<br />
                    Kerala 682031, India
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-outline-variant p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <Mail className="text-secondary w-8 h-8 flex-shrink-0" />
                <div>
                  <h3 className="font-title-lg text-title-lg mb-2 text-slate-ink">Email Us</h3>
                  <p className="text-on-surface-variant font-body-md">exports@spicewizz.com</p>
                  <p className="text-on-surface-variant font-body-md">support@spicewizz.com</p>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-outline-variant p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <Phone className="text-secondary w-8 h-8 flex-shrink-0" />
                <div>
                  <h3 className="font-title-lg text-title-lg mb-2 text-slate-ink">Call Us</h3>
                  <p className="text-on-surface-variant font-body-md">+91 (484) 2345 6789</p>
                  <p className="text-on-surface-variant font-body-md">+91 98765 43210</p>
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

      {/* Global Presence Section */}
      <section className="py-24 bg-surface-container-highest">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-16">
            <h2 className="font-headline-md text-headline-md text-primary mb-4">Our Global Footprint</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">Exporting heritage across 5 continents, serving over 32 countries with ISO-certified logistics.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Google Map */}
            <div className="bg-surface h-96 rounded-xl border border-outline-variant overflow-hidden relative shadow-inner">
              <iframe
                src="https://maps.google.com/maps?q=Marine%20Drive%20Tower,%20Kochi,%20Kerala%20682031,%20India&t=&z=13&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded shadow-sm pointer-events-none">
                <p className="font-label-md text-label-md text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-saffron-glow animate-pulse" /> Headquarters Location
                </p>
              </div>
            </div>
            
            {/* Region Lists (Bento Style) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white border border-outline-variant rounded-lg hover:border-primary transition-colors cursor-default">
                <h4 className="font-title-lg text-secondary mb-2">Middle East</h4>
                <p className="text-on-surface-variant text-sm">UAE, Saudi Arabia, Qatar, Kuwait</p>
              </div>
              <div className="p-6 bg-white border border-outline-variant rounded-lg hover:border-primary transition-colors cursor-default">
                <h4 className="font-title-lg text-secondary mb-2">Europe</h4>
                <p className="text-on-surface-variant text-sm">Germany, Netherlands, France, UK</p>
              </div>
              <div className="p-6 bg-white border border-outline-variant rounded-lg hover:border-primary transition-colors cursor-default">
                <h4 className="font-title-lg text-secondary mb-2">Americas</h4>
                <p className="text-on-surface-variant text-sm">USA, Canada, Mexico, Brazil</p>
              </div>
              <div className="p-6 bg-white border border-outline-variant rounded-lg hover:border-primary transition-colors cursor-default">
                <h4 className="font-title-lg text-secondary mb-2">Asia-Pacific</h4>
                <p className="text-on-surface-variant text-sm">Japan, South Korea, Australia, Singapore</p>
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
