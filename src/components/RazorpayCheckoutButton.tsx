'use client';

import { useState } from 'react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutButtonProps {
  /** Amount in INR (e.g. 500 for ₹500) or in Paise if isPaise=true */
  amount: number;
  /** Set to true if amount is already in paise (min 100 paise) */
  isPaise?: boolean;
  currency?: string;
  buttonText?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  receipt?: string;
  notes?: Record<string, string>;
  className?: string;
  disabled?: boolean;
  onSuccess?: (verifyData: { order_id: string; payment_id: string }) => void;
  onError?: (errorMessage: string) => void;
}

export default function RazorpayCheckoutButton({
  amount,
  isPaise = false,
  currency = 'INR',
  buttonText = 'Pay with Razorpay',
  customerName = '',
  customerEmail = '',
  customerPhone = '',
  receipt,
  notes,
  className = '',
  disabled = false,
  onSuccess,
  onError,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamically ensure the Razorpay checkout.js script is loaded
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(true));
        existingScript.addEventListener('error', () => resolve(false));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setErrorMsg('');
    setLoading(true);

    try {
      // 1. Calculate amount in Paise (Min 100 paise = ₹1.00)
      const amountInPaise = isPaise ? Math.round(amount) : Math.round(amount * 100);
      if (amountInPaise < 100) {
        throw new Error('Minimum order amount is 100 paise (₹1.00)');
      }

      // 2. Load Razorpay Checkout Script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // 3. STEP 1: Call Backend to Create Order
      const createOrderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
          notes: notes || {},
        }),
      });

      const orderData = await createOrderRes.json();
      if (!createOrderRes.ok) {
        throw new Error(orderData.error || 'Failed to initialize payment order');
      }

      const { order_id, key_id } = orderData;
      const razorpayKey =
        key_id ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        'rzp_test_Tu2DtJjUlMVZGE';

      // 4. STEP 2: Configure Razorpay Checkout Modal
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'SpiceWizz | Malabar Coast Spices',
        description: 'Authentic Kerala Spices Direct Checkout',
        image: '/images/Cardamom.jpg',
        order_id: order_id,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        notes: notes || {
          origin: 'Standard Web Checkout',
        },
        theme: {
          color: '#4A6121', // Brand moss-deep
        },
        // On Payment Success Handler
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            setLoading(true);

            // 5. STEP 3: Verify Payment Signature on Backend
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
              const err = verifyData.error || 'Payment signature verification failed';
              setErrorMsg(err);
              onError?.(err);
              setLoading(false);
              return;
            }

            // Payment verified successfully
            setLoading(false);
            if (onSuccess) {
              onSuccess({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
              });
            } else {
              alert(`Payment Verified Successfully! Payment ID: ${response.razorpay_payment_id}`);
            }
          } catch (verifyErr: any) {
            const msg = verifyErr.message || 'Error occurred while verifying payment';
            setErrorMsg(msg);
            onError?.(msg);
            setLoading(false);
          }
        },
        // Handle Modal Dismiss (User Cancellation)
        modal: {
          ondismiss: function () {
            setLoading(false);
            const cancelNotice = 'Payment checkout cancelled by user.';
            setErrorMsg(cancelNotice);
            onError?.(cancelNotice);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      // Handle Payment Failure event
      razorpayInstance.on('payment.failed', function (failResp: any) {
        const errorDesc =
          failResp?.error?.description ||
          failResp?.error?.reason ||
          'Payment transaction failed or was declined';
        setErrorMsg(errorDesc);
        onError?.(errorDesc);
        setLoading(false);
      });

      // Open the Razorpay checkout modal
      razorpayInstance.open();
    } catch (err: any) {
      const msg = err.message || 'Payment initiation failed';
      setErrorMsg(msg);
      onError?.(msg);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handlePayment}
        disabled={disabled || loading}
        className={
          className ||
          'bg-[#4A6121] hover:bg-[#384b18] text-white font-medium py-3 px-6 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm'
        }
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            Processing Payment...
          </span>
        ) : (
          <span>{buttonText}</span>
        )}
      </button>

      {errorMsg && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2.5 py-1.5 mt-1">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
