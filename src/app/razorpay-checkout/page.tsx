'use client';

import { useState } from 'react';
import Script from 'next/script';
import { 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Lock,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function RazorpayCheckoutDemoPage() {
  const [amountRupees, setAmountRupees] = useState<number>(100);
  const [customerName, setCustomerName] = useState('John Doe');
  const [customerEmail, setCustomerEmail] = useState('customer@example.com');
  const [customerPhone, setCustomerPhone] = useState('9876543210');
  
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [stepStatus, setStepStatus] = useState<string>('Ready to test checkout');
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handlePayNow = async () => {
    setLoading(true);
    setErrorMessage('');
    setPaymentResult(null);
    setStepStatus('Step 1: Contacting backend to create Razorpay order (/api/create-order)...');

    try {
      const amountInPaise = Math.round(amountRupees * 100);
      if (amountInPaise < 100) {
        throw new Error('Minimum payment amount is 100 paise (₹1.00)');
      }

      if (typeof window === 'undefined' || !(window as any).Razorpay) {
        throw new Error('Razorpay Checkout SDK is still loading. Please try again in a moment.');
      }

      // STEP 1: Backend Create Order
      const createRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          notes: {
            purpose: 'Razorpay Standard Web Checkout Integration Test',
            customer: customerName,
          },
        }),
      });

      const orderData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(orderData.error || 'Failed to create order on backend');
      }

      setStepStatus(`Step 2: Order created (${orderData.order_id}). Launching Razorpay Standard Checkout modal...`);

      const keyId =
        orderData.key_id ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        'rzp_test_Tu2DtJjUlMVZGE';

      // STEP 2: Configure & Open Razorpay Modal
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'SpiceWizz | Malabar Coast Spices',
        description: 'Razorpay Standard Web Checkout Test',
        image: '/images/Cardamom.jpg',
        order_id: orderData.order_id,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        notes: {
          store: 'SpiceWizz Kerala',
        },
        theme: {
          color: '#4A6121', // brand moss-deep
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          setStepStatus('Step 3: Payment captured by gateway. Verifying HMAC signature on backend (/api/verify-payment)...');

          try {
            // STEP 3: Verify Payment Signature on Backend
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Signature verification failed on backend');
            }

            setStepStatus('Completed: Payment verified & signature validated!');
            setPaymentResult({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              amount: orderData.amount / 100,
              currency: orderData.currency,
            });
            setLoading(false);
          } catch (verifyErr: any) {
            setErrorMessage(verifyErr.message || 'Verification failed');
            setStepStatus('Error: Payment verification failed');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setStepStatus('Payment cancelled: User closed the Razorpay modal');
            setErrorMessage('User dismissed payment modal without completing the payment.');
          },
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);

      rzpInstance.on('payment.failed', function (failResp: any) {
        setLoading(false);
        const desc = failResp?.error?.description || 'Transaction declined or failed';
        setStepStatus(`Payment Failed: ${desc}`);
        setErrorMessage(desc);
      });

      rzpInstance.open();
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'Failed to initiate checkout');
      setStepStatus('Error encountered during checkout');
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="min-h-screen bg-cream-paper py-16 px-4 md:px-8 text-slate-ink">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Razorpay Standard Web Checkout</span>
            </div>
            <h1 className="font-display-lg text-3xl md:text-4xl font-bold text-slate-ink mb-3">
              Standard Checkout Integration
            </h1>
            <p className="text-neutral-600 text-sm md:text-base max-w-xl mx-auto">
              Test end-to-end order creation (<code className="bg-neutral-200 px-1 py-0.5 rounded text-xs">/api/create-order</code>),
              checkout modal opening, and HMAC-SHA256 signature verification (<code className="bg-neutral-200 px-1 py-0.5 rounded text-xs">/api/verify-payment</code>).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Card: Checkout Test Form */}
            <div className="lg:col-span-7 bg-white border border-outline-variant/60 rounded-2xl p-6 sm:p-8 shadow-md">
              <h2 className="font-title-lg text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-secondary" />
                <span>Test Payment Parameters</span>
              </h2>

              <div className="space-y-4 text-sm">
                {/* Preset Amount Selector */}
                <div>
                  <label className="font-medium text-neutral-700 block mb-1.5">
                    Select Test Amount (INR)
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[1, 10, 100, 500].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmountRupees(amt)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          amountRupees === amt
                            ? 'bg-[#4A6121] text-white border-[#4A6121] shadow-sm'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 font-bold">₹</span>
                    <input
                      type="number"
                      min={1}
                      value={amountRupees}
                      onChange={(e) => setAmountRupees(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A6121]"
                      placeholder="Custom amount in ₹"
                    />
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Equivalent to {Math.round(amountRupees * 100)} paise (Minimum 100 paise)
                  </span>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="font-medium text-neutral-700 text-xs block mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#4A6121]"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-neutral-700 text-xs block mb-1">
                      Customer Email
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#4A6121]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-medium text-neutral-700 text-xs block mb-1">
                      Customer Phone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#4A6121]"
                    />
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handlePayNow}
                    disabled={loading}
                    className="w-full bg-[#4A6121] hover:bg-[#384b18] text-white py-3.5 px-6 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-[#4A6121]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay ₹{amountRupees} with Razorpay</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Card: Live Integration Status & Verification Results */}
            <div className="lg:col-span-5 space-y-4">
              {/* Status Box */}
              <div className="bg-white border border-outline-variant/60 rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-neutral-500 mb-2">
                  Integration Pipeline Status
                </h3>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 font-mono text-xs text-neutral-800 leading-relaxed break-words">
                  {stepStatus}
                </div>

                {errorMessage && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="leading-snug">{errorMessage}</div>
                  </div>
                )}
              </div>

              {/* Success Result Card */}
              {paymentResult && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-md">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Payment &amp; Signature Verified!</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-emerald-950 font-mono bg-white/80 p-3 rounded-lg border border-emerald-200">
                    <div>
                      <span className="font-bold">Status:</span> Verified (HMAC-SHA256 Match)
                    </div>
                    <div>
                      <span className="font-bold">Amount:</span> ₹{paymentResult.amount} {paymentResult.currency}
                    </div>
                    <div className="truncate" title={paymentResult.order_id}>
                      <span className="font-bold">Order ID:</span> {paymentResult.order_id}
                    </div>
                    <div className="truncate" title={paymentResult.payment_id}>
                      <span className="font-bold">Payment ID:</span> {paymentResult.payment_id}
                    </div>
                  </div>
                </div>
              )}

              {/* Architecture Info */}
              <div className="bg-white/80 border border-neutral-200 rounded-2xl p-5 text-xs text-neutral-600 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                  <Sparkles className="w-3.5 h-3.5 text-secondary" />
                  <span>Configured Flow</span>
                </div>
                <ul className="space-y-1 list-disc list-inside text-[11px] text-neutral-500">
                  <li><strong>POST /api/create-order:</strong> Razorpay Orders API (100 paise min)</li>
                  <li><strong>Standard Modal:</strong> checkout.js loaded dynamically</li>
                  <li><strong>POST /api/verify-payment:</strong> HMAC-SHA256 timing-safe verification</li>
                  <li><strong>Environment:</strong> Key ID exposed to client, Key Secret safe on server</li>
                </ul>
                <div className="pt-2 border-t border-neutral-100 flex justify-between items-center text-[11px]">
                  <Link href="/checkout" className="text-secondary hover:underline flex items-center gap-1">
                    <span>Go to Cart Checkout</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
