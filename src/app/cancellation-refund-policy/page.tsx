import { RotateCcw, ShieldCheck, Clock, CreditCard, CheckCircle2, AlertCircle, Truck, PackageCheck, HelpCircle, Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | SpiceWizz",
  description: "Learn about SpiceWizz's customer refund and cancellation policy, return eligibility for spices, refund timelines, and claim procedures.",
};

export default function CancellationRefundPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-cream-paper font-body-md overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[42vh] md:h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-slate-ink overflow-hidden">
          {/* Subtle background pattern */}
          <div 
            className="absolute inset-0 opacity-10" 
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-ink/80 to-slate-ink" />
        </div>
        <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-white text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-saffron-glow/20 flex items-center justify-center border border-saffron-glow/30 shadow-lg shadow-saffron-glow/10">
              <RotateCcw className="text-saffron-glow w-8 h-8" />
            </div>
          </div>
          <h1 className="font-display-lg text-headline-lg md:text-display-lg mb-4 leading-tight">
            Cancellation &amp; Refund Policy
          </h1>
          <p className="font-body-lg text-body-lg text-surface-container-low opacity-90 max-w-2xl mx-auto">
            Transparent, customer-first guidelines on order cancellations, damage replacements, and prompt refund processing.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24 relative z-10 -mt-10 md:-mt-16">
        <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop">
          
          {/* Quick Summary Highlights Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 border border-outline-variant/40 shadow-sm flex items-start gap-4">
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-ink text-sm uppercase tracking-wide">Free Cancellation</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Cancel for 100% refund anytime before your spice order is dispatched.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-outline-variant/40 shadow-sm flex items-start gap-4">
              <div className="p-3 rounded-lg bg-amber-50 text-amber-700 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-ink text-sm uppercase tracking-wide">48-Hr Damage Cover</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Report transit damage or wrong items within 48 hours for immediate replacement.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-outline-variant/40 shadow-sm flex items-start gap-4">
              <div className="p-3 rounded-lg bg-sky-50 text-sky-700 shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-ink text-sm uppercase tracking-wide">Quick Refunds</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Approved refunds credited back to original source within 3–7 banking days.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl border border-outline-variant/30 p-8 md:p-16">
            
            <div className="prose prose-slate max-w-none prose-headings:font-headline-md prose-headings:text-slate-ink prose-p:text-on-surface-variant prose-p:leading-relaxed prose-li:text-on-surface-variant prose-a:text-saffron-glow">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-outline-variant/40 mb-6">
                <p className="font-bold text-slate-ink text-sm mb-0">Effective Date: October 28, 2026</p>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-medium">
                  Verified Compliant (Consumer Protection &amp; Food Safety)
                </span>
              </div>
              
              <p>
                At <strong>SpiceWizz</strong> (operated via spicewizz.com), we take immense pride in procuring, grading, and delivering the highest quality Kerala single-origin spices and agricultural produce. Customer satisfaction and uncompromised food safety are at the core of everything we do.
              </p>
              <p>
                This <strong>Cancellation &amp; Refund Policy</strong> outlines the exact terms under which orders can be cancelled, returned, replaced, or refunded. By purchasing from SpiceWizz, you acknowledge and agree to the terms specified below.
              </p>

              <hr className="my-8 border-outline-variant/50" />

              {/* Section 1: Order Cancellation */}
              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep flex items-center gap-2">
                <span>1. Order Cancellation Policy</span>
              </h2>

              <h3 className="text-xl font-semibold mt-6 mb-2 text-slate-ink">A. Cancellations Before Dispatch</h3>
              <p>
                You may cancel your order at any time <strong>prior to order dispatch and shipment label generation</strong> free of charge.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>
                  <strong>Standard Delivery Orders:</strong> Typically, orders are packed and dispatched within 2 to 6 hours of placement. To cancel, please navigate to <Link href="/track-order" className="text-secondary font-medium hover:underline">Track Order</Link> or contact our customer support team immediately with your Order ID.
                </li>
                <li>
                  <strong>Refund on Pre-Dispatch Cancellation:</strong> A <strong>100% full refund</strong> (including any prepaid shipping charges and taxes) will be initiated back to your original payment method immediately upon cancellation approval.
                </li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-2 text-slate-ink">B. Cancellations After Dispatch</h3>
              <p>
                Once an order has been picked up by our logistics courier partner and an active Air Waybill (AWB) tracking number has been generated, it is classified as <strong>In Transit</strong> and cannot be intercepted or cancelled online.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>
                  If you refuse acceptance at your doorstep without prior authorization or verifiable damage, two-way courier shipping and Return-to-Origin (RTO) administrative charges will be deducted from any refundable balance.
                </li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-2 text-slate-ink">C. Quick Commerce (Hyperlocal Express Orders)</h3>
              <p>
                For orders placed under our <strong>Quick Commerce (35km delivery radius)</strong> service, items are picked, vacuum-verified, and handed to express delivery riders within minutes.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>
                  Quick commerce cancellations are only allowed before rider assignment / dispatch.
                </li>
                <li>
                  Once the delivery partner has been dispatched with your parcel, cancellation is no longer possible.
                </li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-2 text-slate-ink">D. Bulk B2B &amp; International Export Consignments</h3>
              <p>
                For custom wholesale or export orders exceeding 25 KG (involving custom grading, vacuum sealing, custom branding, or phytosanitary lab testing), cancellations cannot be accepted once processing, testing, or export documentation has commenced.
              </p>

              <hr className="my-8 border-outline-variant/50" />

              {/* Section 2: Returns & Food Safety */}
              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep flex items-center gap-2">
                <span>2. Returns &amp; Food Safety Policy</span>
              </h2>
              
              <div className="bg-amber-50/70 border-l-4 border-amber-500 p-4 rounded-r-lg my-4 text-sm text-slate-ink">
                <strong>Food Safety Notice (FSSAI &amp; International Standards):</strong>
                <p className="mt-1 mb-0">
                  Because whole spices, powdered blends, vanilla beans, and honey are perishable edible food products, food safety and hygiene regulations prohibit the return or resale of opened, unsealed, or tampered food packages. This protects all customers against cross-contamination and adulteration.
                </p>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-2 text-slate-ink">When Are You Eligible for a Return, Replacement, or Refund?</h3>
              <p>
                We stand firmly behind the freshness, purity, and grade of our harvest. We will happily arrange a <strong>free replacement or complete refund</strong> under the following circumstances:
              </p>

              <div className="space-y-3 my-4">
                <div className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-outline-variant/40">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-ink">1. Damaged in Transit:</strong>
                    <span className="text-on-surface-variant block text-sm">
                      The outer parcel arrived crushed, punctured, water-damaged, or the internal spice pouch/jar vacuum seal was compromised.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-outline-variant/40">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-ink">2. Tampered Package:</strong>
                    <span className="text-on-surface-variant block text-sm">
                      The security tape or tamper-evident seal was broken or altered prior to delivery.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-outline-variant/40">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-ink">3. Incorrect Product or Quantity:</strong>
                    <span className="text-on-surface-variant block text-sm">
                      You received a different spice variety, incorrect grade/mesh size, or missing items compared to your confirmed invoice.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-outline-variant/40">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-ink">4. Quality Defect:</strong>
                    <span className="text-on-surface-variant block text-sm">
                      Any verified foreign material or defect not meeting export-grade purity specifications.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-surface rounded-lg border border-outline-variant/40">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-ink">5. Lost Parcel in Transit:</strong>
                    <span className="text-on-surface-variant block text-sm">
                      If the courier tracking status is declared lost, or shows no movement for more than 10 business days beyond estimated transit times.
                    </span>
                  </div>
                </div>
              </div>

              <hr className="my-8 border-outline-variant/50" />

              {/* Section 3: Claim Procedure */}
              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">3. How to File a Return / Refund Claim</h2>
              <p>
                To ensure prompt investigation and quick resolution, please follow these simple steps:
              </p>

              <div className="border border-outline-variant/60 rounded-xl p-6 bg-surface/50 my-6">
                <ol className="list-decimal pl-6 space-y-3 mb-0">
                  <li>
                    <strong>Notice Window:</strong> File your claim within <strong>48 hours of parcel delivery</strong> (or within 7 days for international ocean/air consignments).
                  </li>
                  <li>
                    <strong>Take Clear Photographs / Unboxing Video:</strong>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                      <li>Photo of the outer shipping box with the courier label and tracking AWB clearly legible.</li>
                      <li>Photo/video showing the damaged parcel, broken seal, or incorrect item.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Submit Your Request:</strong>
                    <p className="mt-1 mb-0 text-sm">
                      Send your Order ID and photos via email to <Link href="mailto:contact@spicewizz.com" className="text-secondary font-bold hover:underline">contact@spicewizz.com</Link> or WhatsApp our helpdesk at <strong>+91 80864 51830</strong>.
                    </p>
                  </li>
                  <li>
                    <strong>Review &amp; Resolution:</strong>
                    <p className="mt-1 mb-0 text-sm">
                      Our quality assurance team in Wayanad will verify your submission within <strong>24 business hours</strong>. Upon verification, you can choose between a <strong>complimentary express replacement</strong> or a <strong>100% full refund</strong>.
                    </p>
                  </li>
                </ol>
              </div>

              <hr className="my-8 border-outline-variant/50" />

              {/* Section 4: Refund Timelines */}
              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">4. Refund Processing &amp; Timelines</h2>
              <p>
                Once your refund is approved, it is initiated immediately through our authorized banking and payment gateway partners (Razorpay / Stripe).
              </p>

              <div className="overflow-x-auto my-6">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-ink text-white">
                      <th className="p-3 font-semibold rounded-tl-lg">Payment Method</th>
                      <th className="p-3 font-semibold">Refund Method</th>
                      <th className="p-3 font-semibold rounded-tr-lg">Estimated Turnaround Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40">
                    <tr className="bg-white">
                      <td className="p-3 font-medium text-slate-ink">UPI (GPay, PhonePe, Paytm)</td>
                      <td className="p-3 text-on-surface-variant">Original UPI Linked Bank Account</td>
                      <td className="p-3 font-semibold text-emerald-700">24 – 48 Hours</td>
                    </tr>
                    <tr className="bg-surface/30">
                      <td className="p-3 font-medium text-slate-ink">Debit / Credit Cards</td>
                      <td className="p-3 text-on-surface-variant">Original Card Source Account</td>
                      <td className="p-3 font-semibold text-slate-ink">5 – 7 Business Days</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-3 font-medium text-slate-ink">Net Banking (IMPS / NEFT)</td>
                      <td className="p-3 text-on-surface-variant">Original Bank Account</td>
                      <td className="p-3 font-semibold text-slate-ink">3 – 5 Business Days</td>
                    </tr>
                    <tr className="bg-surface/30">
                      <td className="p-3 font-medium text-slate-ink">Cash on Delivery (COD)</td>
                      <td className="p-3 text-on-surface-variant">Direct Bank Transfer (NEFT) or UPI</td>
                      <td className="p-3 font-semibold text-slate-ink">3 – 5 Business Days after Bank Verification</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-3 font-medium text-slate-ink">International (Stripe / Forex)</td>
                      <td className="p-3 text-on-surface-variant">Original International Card / Currency</td>
                      <td className="p-3 font-semibold text-slate-ink">7 – 10 Business Days (Bank dependent)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-on-surface-variant italic">
                * Note: Timelines represent banking days and exclude national holidays or bank strikes. If a refund does not reflect after the indicated timeframe, please contact your issuing bank with the provided RRN / Transaction Reference ID.
              </p>

              <hr className="my-8 border-outline-variant/50" />

              {/* Section 5: Non-Refundable Scenarios */}
              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">5. Non-Refundable Situations</h2>
              <p>Refunds or replacements cannot be granted under the following scenarios:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Claims lodged after the <strong>48-hour post-delivery window</strong> has elapsed.</li>
                <li>Products with broken seals, unsealed spice packets, or partially consumed contents where no defect was demonstrated.</li>
                <li>
                  <strong>Natural Crop Variations:</strong> Spices are natural agricultural harvests. Minor variations in grain size, natural color shade, or seasonal aroma intensities are normal organic characteristics and are not considered manufacturing defects.
                </li>
                <li>
                  Delivery failures caused by customer-provided incorrect shipping addresses, incomplete contact phone numbers, or failure to collect after repeated courier delivery attempts.
                </li>
                <li>Products purchased during clear stock-clearance sales clearly marked as non-refundable.</li>
              </ul>

              <hr className="my-8 border-outline-variant/50" />

              {/* Section 6: Customer Support & Grievance */}
              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">6. Customer Grievance &amp; Support Desk</h2>
              <p>
                Have questions regarding your order status, cancellation, or refund? Our dedicated customer care desk in Vythiri, Wayanad is here to help you:
              </p>

              <div className="bg-surface border border-outline-variant/50 rounded-xl p-6 mt-4">
                <p className="font-bold text-lg text-slate-ink mb-3 flex items-center gap-2">
                  <ShieldCheck className="text-saffron-glow w-5 h-5" />
                  SpiceWizz Customer Redressal Team
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="mb-2 flex items-center gap-2 text-on-surface-variant">
                      <Mail className="w-4 h-4 text-secondary" />
                      <span><strong>Email:</strong> <Link href="mailto:contact@spicewizz.com" className="text-secondary hover:underline">contact@spicewizz.com</Link></span>
                    </p>
                    <p className="mb-2 flex items-center gap-2 text-on-surface-variant">
                      <Phone className="w-4 h-4 text-secondary" />
                      <span><strong>Helpline / WhatsApp:</strong> +91 80864 51830</span>
                    </p>
                    <p className="flex items-center gap-2 text-on-surface-variant">
                      <Clock className="w-4 h-4 text-secondary" />
                      <span><strong>Support Hours:</strong> Mon – Sat, 9:00 AM – 6:00 PM IST</span>
                    </p>
                  </div>
                  <div>
                    <p className="flex items-start gap-2 text-on-surface-variant mb-2">
                      <MapPin className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                      <span><strong>Origin Office:</strong> Spicewizz, Vythiri, Wayanad, Kerala - 673576, India</span>
                    </p>
                    <p className="flex items-start gap-2 text-on-surface-variant">
                      <HelpCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                      <span><strong>Resolution Guarantee:</strong> Ticket acknowledgement within 24 hours.</span>
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-8 italic text-on-surface-variant/80 text-sm">
                By ordering from SpiceWizz, you confirm that you have read, understood, and agreed to this Cancellation &amp; Refund Policy.
              </p>
            </div>
            
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4 pt-8 border-t border-outline-variant/30">
              <Link 
                href="/products" 
                className="inline-flex items-center gap-2 bg-saffron-glow text-slate-ink font-label-md text-label-md uppercase px-8 py-3 rounded-lg font-bold hover:bg-secondary-fixed-dim transition-colors shadow-sm"
              >
                Continue Shopping <ArrowRight size={16} />
              </Link>
              <Link 
                href="/" 
                className="inline-block bg-slate-ink text-white font-label-md text-label-md uppercase px-8 py-3 rounded-lg hover:bg-slate-ink/90 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
