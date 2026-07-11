import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function TermsConditionsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-cream-paper font-body-md overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-slate-ink overflow-hidden">
          {/* Subtle background pattern */}
          <div 
            className="absolute inset-0 opacity-10" 
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-ink" />
        </div>
        <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-white text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-saffron-glow/20 flex items-center justify-center">
              <ShieldCheck className="text-saffron-glow w-8 h-8" />
            </div>
          </div>
          <h1 className="font-display-lg text-headline-lg md:text-display-lg mb-4 leading-tight">Terms & Conditions</h1>
          <p className="font-body-lg text-body-lg text-surface-container-low opacity-90 max-w-2xl mx-auto">
            These Terms & Conditions govern your access to and use of our website, products, and services.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24 relative z-10 -mt-10 md:-mt-16">
        <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="bg-white rounded-xl shadow-xl border border-outline-variant/30 p-8 md:p-16">
            
            <div className="prose prose-slate max-w-none prose-headings:font-headline-md prose-headings:text-slate-ink prose-p:text-on-surface-variant prose-p:leading-relaxed prose-li:text-on-surface-variant prose-a:text-saffron-glow">
              <p className="font-bold text-slate-ink">Effective Date: July 10, 2026</p>
              
              <p>
                Welcome to <strong>SpiceWizz</strong>. These Terms & Conditions govern your access to and use of our website, products, and services. By accessing or using our website, creating an account, placing an order, or using any of our services, you agree to be bound by these Terms.
              </p>
              <p>
                If you do not agree with these Terms, please do not use our website.
              </p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">1. Definitions</h2>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li><strong>Company</strong> refers to spicewizz.com.</li>
                <li><strong>Website</strong> refers to spicewizz.com and all associated web pages.</li>
                <li><strong>Customer</strong> refers to any individual or business accessing or using our website.</li>
                <li><strong>Products</strong> refer to spices and related products offered for sale.</li>
              </ul>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">2. Eligibility</h2>
              <p>You must be at least 18 years of age and legally capable of entering into a binding contract to use this website.</p>
              <p>By using this website, you represent that the information you provide is accurate and complete.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">3. User Account</h2>
              <p>To access certain features, you may need to create an account.</p>
              <p>You agree to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Provide accurate and current information.</li>
                <li>Keep your login credentials secure.</li>
                <li>Maintain the confidentiality of your password and OTP.</li>
                <li>Notify us immediately of any unauthorized use of your account.</li>
              </ul>
              <p>You are responsible for all activities that occur under your account.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">4. Products</h2>
              <p>We make every effort to display product descriptions, images, specifications, and pricing accurately.</p>
              <p>However:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Product images are for illustration purposes and may vary slightly from the actual product.</li>
                <li>Natural agricultural products such as spices may differ in color, size, aroma, and appearance due to seasonal variations.</li>
                <li>Product availability is subject to stock.</li>
              </ul>
              <p>We reserve the right to modify or discontinue products without prior notice.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">5. Pricing</h2>
              <p>All prices displayed on the website are subject to change without prior notice.</p>
              <p>Unless otherwise stated:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Prices for Indian customers are shown in Indian Rupees (INR).</li>
                <li>International pricing may be displayed in other currencies where available.</li>
              </ul>
              <p>Applicable taxes, shipping charges, customs duties, and import charges may be added during checkout or collected by customs authorities, depending on the destination country.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">6. Orders</h2>
              <p>After placing an order:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>You will receive an order confirmation.</li>
                <li>Acceptance of your order occurs only after payment verification and order confirmation.</li>
                <li>We reserve the right to refuse or cancel any order due to pricing errors, suspected fraud, product unavailability, legal restrictions, or other legitimate business reasons.</li>
              </ul>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">7. Payment</h2>
              <p>We accept payments through secure third-party payment providers.</p>
              <p>By making a payment, you authorize the selected payment provider to process your transaction.</p>
              <p>We do not store your credit card, debit card, CVV, UPI PIN, or internet banking credentials.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">8. International Orders</h2>
              <p>For international shipments:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Buyers are responsible for complying with their country's import regulations.</li>
                <li>Customs duties, taxes, import fees, inspections, or clearance charges are the responsibility of the buyer unless otherwise agreed in writing.</li>
                <li>Delivery timelines may vary due to customs procedures, logistics, or regulatory requirements.</li>
              </ul>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">9. Shipping</h2>
              <p>Shipping timelines provided on the website are estimates only.</p>
              <p>Delivery delays may occur due to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Weather conditions</li>
                <li>Customs inspections</li>
                <li>Transportation delays</li>
                <li>Government restrictions</li>
                <li>Force majeure events</li>
              </ul>
              <p>We are not responsible for delays beyond our reasonable control.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">10. Returns, Refunds, and Cancellations</h2>
              <p>Returns, refunds, and cancellations are governed by our separate Return & Refund Policy.</p>
              <p>Certain products, including food products and export shipments, may not be eligible for return once dispatched, unless required by applicable law or otherwise stated.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">11. Intellectual Property</h2>
              <p>All content on this website, including:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Logos</li>
                <li>Product images</li>
                <li>Product descriptions</li>
                <li>Graphics</li>
                <li>Videos</li>
                <li>Documents</li>
                <li>Website design</li>
                <li>Software</li>
                <li>Text</li>
              </ul>
              <p>is the property of SpiceWizz or its licensors and is protected by applicable intellectual property laws.</p>
              <p>You may not copy, reproduce, distribute, modify, or use any content without prior written permission.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">12. Prohibited Activities</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Use the website for unlawful purposes.</li>
                <li>Attempt unauthorized access to our systems.</li>
                <li>Upload malicious software or harmful code.</li>
                <li>Interfere with the operation or security of the website.</li>
                <li>Use automated tools to scrape or copy website content without permission.</li>
                <li>Impersonate another person or business.</li>
              </ul>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">13. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, SpiceWizz shall not be liable for any indirect, incidental, consequential, special, or punitive damages arising from the use of our website or products.</p>
              <p>Our total liability shall not exceed the amount paid by you for the relevant order giving rise to the claim, except where prohibited by applicable law.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">14. Indemnification</h2>
              <p>You agree to indemnify and hold harmless SpiceWizz, its directors, employees, partners, and affiliates from any claims, losses, damages, liabilities, costs, or expenses arising from:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Your misuse of the website.</li>
                <li>Your violation of these Terms.</li>
                <li>Your violation of any applicable law or third-party rights.</li>
              </ul>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">15. Privacy</h2>
              <p>Your use of the website is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal information.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">16. Third-Party Services</h2>
              <p>Our website may integrate with third-party providers such as payment gateways, shipping companies, SMS/OTP providers, analytics providers, and email service providers.</p>
              <p>We are not responsible for the services, policies, or content of these third parties.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">17. Website Availability</h2>
              <p>While we strive to keep the website available at all times, we do not guarantee uninterrupted access.</p>
              <p>We may suspend or restrict access for maintenance, upgrades, security, or technical reasons.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">18. Changes to These Terms</h2>
              <p>We may revise these Terms & Conditions from time to time.</p>
              <p>Updated versions will be posted on this page with a revised effective date.</p>
              <p>Continued use of the website after changes become effective constitutes acceptance of the updated Terms.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">19. Governing Law</h2>
              <p>These Terms shall be governed by and interpreted in accordance with the laws of India.</p>
              <p>Any disputes arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the competent courts in the location where SpiceWizz is registered, unless otherwise required by applicable law.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">20. Contact Us</h2>
              <p>If you have any questions regarding these Terms & Conditions, please contact us:</p>
              
              <div className="bg-surface border border-outline-variant/50 rounded-lg p-6 mt-4 inline-block">
                <p className="font-bold text-lg text-slate-ink mb-2">SpiceWizz</p>
                <p className="mb-1"><strong>Email:</strong> <Link href="mailto:support@spicewizz.com" className="text-secondary hover:underline">support@spicewizz.com</Link></p>
                <p className="mb-1"><strong>Website:</strong> <Link href="https://spicewizz.com" className="text-secondary hover:underline">https://spicewizz.com</Link></p>
                <p><strong>Business Hours:</strong> Monday – Saturday, 9:00 AM – 6:00 PM (IST)</p>
              </div>

              <p className="mt-8 italic text-on-surface-variant/80">
                By using this website, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.
              </p>
            </div>
            
            <div className="mt-12 text-center pt-8 border-t border-outline-variant/30">
              <Link 
                href="/" 
                className="inline-block bg-slate-ink text-white font-label-md text-label-md uppercase px-8 py-3 rounded hover:bg-slate-ink/90 transition-colors"
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
