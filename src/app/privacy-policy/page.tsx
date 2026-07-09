import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
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
          <h1 className="font-display-lg text-headline-lg md:text-display-lg mb-4 leading-tight">Privacy Policy</h1>
          <p className="font-body-lg text-body-lg text-surface-container-low opacity-90 max-w-2xl mx-auto">
            We value your privacy and are committed to protecting your personal information.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24 relative z-10 -mt-10 md:-mt-16">
        <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="bg-white rounded-xl shadow-xl border border-outline-variant/30 p-8 md:p-16">
            
            <div className="prose prose-slate max-w-none prose-headings:font-headline-md prose-headings:text-slate-ink prose-p:text-on-surface-variant prose-p:leading-relaxed prose-li:text-on-surface-variant prose-a:text-saffron-glow">
              <p className="font-bold text-slate-ink">Effective Date: July 8, 2026</p>
              
              <p>
                Welcome to <strong>SpiceWizz</strong>. We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, store, and protect your information when you visit our website, create an account, purchase products, submit enquiries, or use any of our services.
              </p>
              <p>
                By using our website, you agree to the collection and use of information in accordance with this Privacy Policy.
              </p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">1. Information We Collect</h2>
              <p>We may collect the following types of information:</p>

              <h3 className="text-xl font-semibold mt-6 mb-2">Personal Information</h3>
              <p>When you create an account, place an order, or contact us, we may collect:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Full Name</li>
                <li>Company Name (if applicable)</li>
                <li>Email Address</li>
                <li>Mobile Number</li>
                <li>Billing Address</li>
                <li>Shipping Address</li>
                <li>Country and State</li>
                <li>GST Number (where applicable)</li>
                <li>Import/Export business information (for B2B customers)</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-2">Account Information</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Username</li>
                <li>Encrypted password</li>
                <li>Login history</li>
                <li>OTP verification status</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-2">Order Information</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Products ordered</li>
                <li>Order value</li>
                <li>Order history</li>
                <li>Invoice details</li>
                <li>Shipping details</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-2">Payment Information</h3>
              <p>Payments are processed securely through trusted third-party payment gateways.</p>
              <p>We do <strong>not</strong> store your credit card, debit card, CVV, UPI PIN, or online banking credentials on our servers.</p>

              <h3 className="text-xl font-semibold mt-6 mb-2">Technical Information</h3>
              <p>When you visit our website, we may automatically collect:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>IP Address</li>
                <li>Browser type</li>
                <li>Device information</li>
                <li>Operating system</li>
                <li>Date and time of access</li>
                <li>Pages visited</li>
                <li>Referral source</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-2">Cookies</h3>
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Keep you logged in</li>
                <li>Remember your preferences</li>
                <li>Improve website performance</li>
                <li>Analyze website traffic</li>
                <li>Enhance your shopping experience</li>
              </ul>
              <p>You can disable cookies through your browser settings; however, some features of the website may not function properly.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">2. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Create and manage your account</li>
                <li>Process and deliver orders</li>
                <li>Verify OTP-based login</li>
                <li>Respond to enquiries</li>
                <li>Process payments</li>
                <li>Provide customer support</li>
                <li>Send order confirmations and shipping updates</li>
                <li>Improve our products and services</li>
                <li>Prevent fraud and unauthorized access</li>
                <li>Comply with legal and regulatory obligations</li>
                <li>Send promotional communications where you have provided consent</li>
              </ul>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">3. OTP Verification</h2>
              <p>To improve account security, we may use your mobile number or email address to send One-Time Passwords (OTPs) for:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Login verification</li>
                <li>Registration verification</li>
                <li>Password recovery</li>
                <li>Security verification</li>
              </ul>
              <p>Your OTP is used solely for authentication purposes and expires automatically after a limited period.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">4. International Orders</h2>
              <p>As an exporter of Indian spices, we may share necessary customer information with logistics providers, customs authorities, freight forwarders, shipping companies, or government authorities where required to complete international shipments and comply with applicable import and export regulations.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">5. Payment Processing</h2>
              <p>Payments on our website are processed through secure third-party payment service providers.</p>
              <p>We do not store sensitive payment information such as:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Credit card numbers</li>
                <li>Debit card numbers</li>
                <li>CVV</li>
                <li>Internet banking passwords</li>
                <li>UPI PINs</li>
              </ul>
              <p>Please review the privacy policies of the payment providers you use for additional information about how they process your payment data.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">6. Information Sharing</h2>
              <p>We do not sell or rent your personal information.</p>
              <p>We may share your information with trusted service providers only when necessary to operate our business, including:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Payment gateway providers</li>
                <li>SMS and OTP providers</li>
                <li>Shipping and courier companies</li>
                <li>Cloud hosting providers</li>
                <li>Email service providers</li>
                <li>Analytics providers</li>
                <li>Customer support platforms</li>
              </ul>
              <p>These providers are authorized to use your information only for the services they provide to us.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">7. Data Security</h2>
              <p>We implement appropriate technical and organizational security measures to protect your information, including:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>HTTPS encryption</li>
                <li>Secure server infrastructure</li>
                <li>Password hashing</li>
                <li>Role-based access controls</li>
                <li>Firewall protection</li>
                <li>Regular software updates</li>
                <li>Database security controls</li>
              </ul>
              <p>While we strive to protect your personal information, no method of transmission over the internet or electronic storage is completely secure.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">8. Data Retention</h2>
              <p>We retain your information only for as long as necessary to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Fulfill orders</li>
                <li>Maintain business records</li>
                <li>Comply with tax and legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>
              <p>After the retention period, your information will be securely deleted or anonymized where appropriate.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">9. Your Rights</h2>
              <p>Subject to applicable law, you may have the right to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Update your profile</li>
                <li>Request deletion of your account</li>
                <li>Withdraw consent for marketing communications</li>
                <li>Request information about how your data is used</li>
              </ul>
              <p>Requests may be sent to the contact details provided below.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">10. Marketing Communications</h2>
              <p>If you choose to receive promotional communications, we may send:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Product updates</li>
                <li>Special offers</li>
                <li>New arrivals</li>
                <li>Newsletters</li>
              </ul>
              <p>You may unsubscribe at any time using the unsubscribe link included in our emails or by contacting us.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">11. Children's Privacy</h2>
              <p>Our products and services are not intended for individuals under 18 years of age.</p>
              <p>We do not knowingly collect personal information from children.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">12. Third-Party Links</h2>
              <p>Our website may contain links to third-party websites.</p>
              <p>We are not responsible for the privacy practices or content of those external websites. We encourage you to review their privacy policies before providing any personal information.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">13. Changes to This Privacy Policy</h2>
              <p>We may update this Privacy Policy from time to time.</p>
              <p>Any changes will become effective when the updated Privacy Policy is published on this page. We encourage you to review this page periodically.</p>

              <hr className="my-8 border-outline-variant/50" />

              <h2 className="text-2xl font-bold mt-10 mb-4 text-moss-deep">14. Contact Us</h2>
              <p>If you have any questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact us:</p>
              
              <div className="bg-surface border border-outline-variant/50 rounded-lg p-6 mt-4 inline-block">
                <p className="font-bold text-lg text-slate-ink mb-2">SpiceWizz</p>
                <p className="mb-1"><strong>Website:</strong> <Link href="https://spicewizz.com" className="text-secondary hover:underline">https://spicewizz.com</Link></p>
                <p><strong>Business Hours:</strong> Monday – Friday, 9:00 AM – 6:00 PM (IST)</p>
              </div>

              <p className="mt-8 italic text-on-surface-variant/80">
                By using our website, you acknowledge that you have read, understood, and agreed to this Privacy Policy.
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
