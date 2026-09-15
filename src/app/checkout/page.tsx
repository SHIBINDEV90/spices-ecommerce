'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { 
  ShoppingBag, 
  Tag, 
  ShieldCheck, 
  Truck, 
  Smartphone, 
  Globe,
  Zap,
  MapPin,
  Clock
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';

const isUploadedImage = (src: string) => src.startsWith('/uploads/');

export default function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { location, isQuickMode, setQuickMode, setIsModalOpen } = useLocation();

  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  
  // Coupon States
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Billing Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('India');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [email, setEmail] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [shipDifferent, setShipDifferent] = useState(false);
  
  // Shipping Form States
  const [shipFirstName, setShipFirstName] = useState('');
  const [shipLastName, setShipLastName] = useState('');
  const [shipCountry, setShipCountry] = useState('India');
  const [shipAddress1, setShipAddress1] = useState('');
  const [shipAddress2, setShipAddress2] = useState('');
  const [shipCity, setShipCity] = useState('');
  const [shipState, setShipState] = useState('');
  const [shipZip, setShipZip] = useState('');
  
  // Payment State: 'razorpay' (UPI / Cards / Net Banking), 'stripe' (International), 'cod' (Cash on Delivery)
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'stripe' | 'cod'>('razorpay');

  const subtotal = getCartTotal();
  const delivery = subtotal > 500 ? 0 : 50; 
  const codFee = paymentMethod === 'cod' ? 75 : 0;
  
  // Calculate discount based on applied coupon
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maximumDiscount && discountAmount > appliedCoupon.maximumDiscount) {
        discountAmount = appliedCoupon.maximumDiscount;
      }
    } else {
      discountAmount = appliedCoupon.discountValue;
      if (discountAmount > subtotal) discountAmount = subtotal;
    }
  }

  const total = Math.max(0, subtotal - discountAmount + delivery + codFee);

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    setValidatingCoupon(true);
    setCouponError('');
    
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: coupon, cartTotal: subtotal })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Invalid coupon');
      }
      
      setAppliedCoupon(data);
      setCouponError('');
    } catch (err: any) {
      setCouponError(err.message || 'Failed to apply coupon');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCoupon('');
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const shippingAddress = shipDifferent ? {
        street: shipAddress1 + (shipAddress2 ? `, ${shipAddress2}` : ''),
        city: shipCity,
        state: shipState,
        postalCode: shipZip,
        country: shipCountry
    } : {
        street: address1 + (address2 ? `, ${address2}` : ''),
        city: city,
        state: state,
        postalCode: zip,
        country: country
    };

    try {
        const res = await fetch('/api/checkout/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cartItems,
                shippingAddress,
                customerName: `${firstName} ${lastName}`.trim(),
                customerEmail: email,
                customerPhone: contactNo,
                orderNote: orderNote,
                paymentMethod,
                couponCode: appliedCoupon?.coupon || null,
                deliveryType: isQuickMode ? 'quick' : 'standard',
                deliveryLocation: location.lat && location.lng ? {
                    type: 'Point',
                    coordinates: [location.lng, location.lat],
                    addressText: `${shippingAddress.street}, ${shippingAddress.city}`,
                } : undefined,
                estimatedDeliveryMinutes: isQuickMode ? 45 : undefined,
            })
        });


        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Checkout initialization failed');

        // 1. CASH ON DELIVERY
        if (data.paymentMethod === 'cod') {
            clearCart();
            window.location.href = `/checkout/success?order_id=${data.orderId}`;
            return;
        }

        // 2. STRIPE INTERNATIONAL
        if (data.paymentMethod === 'stripe') {
            if (data.url) {
                clearCart();
                window.location.href = data.url;
            } else {
                throw new Error('Stripe redirect URL not received');
            }
            return;
        }

        // 3. RAZORPAY UPI / INDIAN CARDS / NET BANKING
        if (data.paymentMethod === 'razorpay') {
            if (typeof window === 'undefined' || !(window as any).Razorpay) {
                throw new Error('Payment gateway SDK is loading. Please try again in a few seconds.');
            }

            if (!data.key || data.key === 'rzp_test_placeholder') {
                alert('Notice: Razorpay keys are not configured in environment. Order #' + data.orderId + ' was recorded as pending.');
                setLoading(false);
                return;
            }

            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency || 'INR',
                name: 'SpiceWizz | Malabar Coast Spices',
                description: `Order #${data.orderId.slice(-6).toUpperCase()}`,
                image: '/images/Cardamom.jpg',
                order_id: data.razorpayOrderId,
                prefill: {
                    name: `${firstName} ${lastName}`.trim(),
                    email: email,
                    contact: contactNo,
                },
                notes: {
                    orderId: data.orderId,
                    customerEmail: email,
                },
                theme: {
                    color: '#317a26',
                },
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch('/api/checkout/razorpay/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                orderId: data.orderId,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyData = await verifyRes.json();
                        if (!verifyRes.ok) {
                            throw new Error(verifyData.error || 'Server payment verification failed');
                        }

                        clearCart();
                        window.location.href = `/checkout/success?order_id=${data.orderId}&payment_id=${response.razorpay_payment_id}`;
                    } catch (verifyErr: any) {
                        alert(`Verification Failed: ${verifyErr.message}`);
                        setLoading(false);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    },
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (failResp: any) {
                alert(`Payment was not completed: ${failResp.error?.description || 'Transaction cancelled or failed'}`);
                setLoading(false);
            });
            rzp.open();
        }

    } catch (error: any) {
        alert(error.message || 'Checkout failed');
        setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex flex-col items-center justify-center p-4">
        <ShoppingBag className="w-16 h-16 text-neutral-300 mb-6" />
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Checkout is Empty</h1>
        <p className="text-neutral-500 mb-8 text-center max-w-sm">You need items in your cart to checkout.</p>
        <Link href="/products" className="bg-[#317a26] hover:bg-[#235e1c] text-white px-8 py-3 rounded font-semibold transition-all">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        strategy="lazyOnload"
        onLoad={() => setRazorpayLoaded(true)}
      />

      <div className="min-h-screen bg-[#faf9f5] pt-24 pb-24 text-neutral-800 font-sans">
        <div className="container mx-auto px-4 max-w-6xl">
          <form onSubmit={handleCheckout} className="flex flex-col xl:flex-row gap-8">
            
            {/* Left Column - Forms */}
            <div className="w-full xl:w-[65%] space-y-6">

              {/* Coupon Section */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-2 mb-1.5">
                  <Tag className="w-5 h-5 text-[#317a26]" strokeWidth={2.5} />
                  <h3 className="font-semibold text-[17px] text-neutral-800">Have a coupon?</h3>
                </div>
                <p className="text-[13px] text-neutral-500 mb-4">Enter your coupon code to get a discount</p>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Coupon code" 
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    disabled={!!appliedCoupon || validatingCoupon}
                    className="flex-1 border border-neutral-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px] placeholder:text-neutral-400 disabled:opacity-60 disabled:bg-neutral-100 uppercase"
                  />
                  {!appliedCoupon ? (
                    <button 
                      type="button" 
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !coupon.trim()}
                      className="px-7 py-2.5 bg-[#f4f4f4] text-neutral-600 font-medium rounded-lg hover:bg-neutral-200 transition-colors text-[15px] disabled:opacity-50 flex items-center justify-center min-w-[90px]"
                    >
                      {validatingCoupon ? '...' : 'Apply'}
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={removeCoupon}
                      className="px-7 py-2.5 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors text-[15px] min-w-[90px]"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
                {appliedCoupon && <p className="text-[#317a26] text-sm mt-2 font-medium">Coupon applied successfully!</p>}
              </div>

              {/* Delivery Speed Selection Card */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[20px] font-bold text-neutral-800 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" />
                    <span>Choose Delivery Speed</span>
                  </h2>
                  <div className="text-xs text-neutral-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold text-neutral-700">{location.city || 'Vythiri, Wayanad'}</span>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="text-primary hover:underline font-bold ml-1"
                    >
                      (Change)
                    </button>
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Standard Shipping */}
                  <div
                    onClick={() => setQuickMode(false)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                      !isQuickMode
                        ? 'border-primary bg-primary/5 text-neutral-900'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-neutral-900">Standard Shipping</span>
                      <Truck className={`w-4 h-4 ${!isQuickMode ? 'text-primary' : 'text-neutral-400'}`} />
                    </div>
                    <p className="text-xs text-neutral-500 mb-3">
                      Delivered via trusted courier partner across India within 3–5 business days.
                    </p>
                    <div className="text-xs font-semibold text-neutral-700">
                      Standard Rates Apply
                    </div>
                  </div>

                  {/* 35 km Quick Commerce */}
                  <div
                    onClick={() => setQuickMode(true)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                      isQuickMode
                        ? 'border-amber-500 bg-amber-500/10 text-neutral-900 ring-2 ring-amber-400/50'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500 fill-current" />
                        <span>⚡ 35 km Quick Commerce</span>
                      </span>
                      <Clock className={`w-4 h-4 ${isQuickMode ? 'text-amber-600' : 'text-neutral-400'}`} />
                    </div>
                    <p className="text-xs text-neutral-500 mb-3">
                      Hyperlocal delivery from nearby stores within a 35 km radius in <strong className="text-amber-700 dark:text-amber-300">30–60 minutes</strong>.
                    </p>
                    <div className="text-xs font-bold text-amber-700 flex items-center gap-1">
                      <span>⚡ Express Local Dispatch</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Details */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <h2 className="text-[22px] font-semibold text-neutral-800 mb-6">Billing Details</h2>

                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-5">
                  <div>
                    <label className="block text-[14px] font-medium text-neutral-700 mb-1.5">First name <span className="text-red-500">*</span></label>
                    <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px]" />
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-neutral-700 mb-1.5">Last name (optional)</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px]" />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-[14px] font-medium text-neutral-700 mb-1.5">Country / Region <span className="text-red-500">*</span></label>
                  <input type="text" required value={country} onChange={e => setCountry(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px]" />
                </div>

                <div className="mb-5">
                  <label className="block text-[14px] font-medium text-neutral-700 mb-1.5">Address Line 1 <span className="text-red-500">*</span></label>
                  <input type="text" required placeholder="House number and street name" value={address1} onChange={e => setAddress1(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px] placeholder:text-neutral-400" />
                </div>

                <div className="mb-5">
                  <label className="block text-[14px] font-medium text-neutral-700 mb-1.5">Address Line 2 (optional)</label>
                  <input type="text" placeholder="Apartment, suite, unit, etc." value={address2} onChange={e => setAddress2(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px] placeholder:text-neutral-400" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-5">
                  <div>
                    <label className="block text-[14px] font-medium text-neutral-700 mb-1.5">Town / City <span className="text-red-500">*</span></label>
                    <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px]" />
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-neutral-700 mb-1.5">State / County <span className="text-red-500">*</span></label>
                    <input type="text" required value={state} onChange={e => setState(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-5">
                  <div>
                    <label className="block text-[14px] font-medium text-neutral-700 mb-1.5">Postcode / ZIP <span className="text-red-500">*</span></label>
                    <input type="text" required value={zip} onChange={e => setZip(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px]" />
                  </div>
                  <div>
                    <label className="block text-[14px] font-medium text-neutral-700 mb-1.5">Contact / Mobile No <span className="text-red-500">*</span></label>
                    <input type="tel" required placeholder="e.g. +91 9876543210" value={contactNo} onChange={e => setContactNo(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-neutral-700 mb-1.5">Email address <span className="text-red-500">*</span></label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px]" />
                </div>
              </div>

              {/* Ship to Different Address */}
              <div className={`rounded-xl px-2 py-4 sm:p-6 transition-all ${shipDifferent ? 'bg-[#faf9f5]' : 'bg-transparent'}`}>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShipDifferent(!shipDifferent)}>
                  <div className={`w-[20px] h-[20px] rounded-[4px] border flex items-center justify-center transition-colors ${shipDifferent ? 'bg-[#317a26] border-[#317a26]' : 'border-neutral-400 bg-white'}`}>
                    {shipDifferent && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="font-medium text-[15.5px] text-neutral-800 tracking-wide">Ship to a different address?</span>
                </div>

                <div className={`grid transition-all duration-300 ease-in-out ${shipDifferent ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        <div>
                          <label className="block text-[14.5px] text-neutral-800 mb-1.5">First name <span className="text-[#a52a2a]">*</span></label>
                          <input type="text" required={shipDifferent} value={shipFirstName} onChange={e => setShipFirstName(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px] bg-white transition-shadow" />
                        </div>
                        <div>
                          <label className="block text-[14.5px] text-neutral-800 mb-1.5">Last name (optional)</label>
                          <input type="text" value={shipLastName} onChange={e => setShipLastName(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px] bg-white transition-shadow" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[14.5px] text-neutral-800 mb-1.5">Country / Region <span className="text-[#a52a2a]">*</span></label>
                        <input type="text" required={shipDifferent} value={shipCountry} onChange={e => setShipCountry(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px] bg-white transition-shadow" />
                      </div>

                      <div>
                        <label className="block text-[14.5px] text-neutral-800 mb-1.5">Address Line 1 <span className="text-[#a52a2a]">*</span></label>
                        <input type="text" required={shipDifferent} placeholder="House number and street name" value={shipAddress1} onChange={e => setShipAddress1(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px] placeholder:text-neutral-500 bg-white transition-shadow" />
                      </div>

                      <div>
                        <label className="block text-[14.5px] text-neutral-800 mb-1.5">Address Line 2 (optional)</label>
                        <input type="text" placeholder="Apartment, suite, unit, etc." value={shipAddress2} onChange={e => setShipAddress2(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px] placeholder:text-neutral-500 bg-white transition-shadow" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        <div>
                          <label className="block text-[14.5px] text-neutral-800 mb-1.5">Town / City <span className="text-[#a52a2a]">*</span></label>
                          <input type="text" required={shipDifferent} value={shipCity} onChange={e => setShipCity(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px] bg-white transition-shadow" />
                        </div>
                        <div>
                          <label className="block text-[14.5px] text-neutral-800 mb-1.5">State / County <span className="text-[#a52a2a]">*</span></label>
                          <input type="text" required={shipDifferent} value={shipState} onChange={e => setShipState(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px] bg-white text-neutral-800 transition-shadow" />
                        </div>
                      </div>

                      <div className="w-full md:w-[calc(50%-12px)]">
                        <label className="block text-[14.5px] text-neutral-800 mb-1.5">Postcode / ZIP <span className="text-[#a52a2a]">*</span></label>
                        <input type="text" required={shipDifferent} value={shipZip} onChange={e => setShipZip(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px] bg-white transition-shadow" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Note */}
              <div className="bg-[#faf9f5] border border-neutral-200 rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
                <h3 className="font-semibold text-[17px] text-neutral-800 mb-1.5">Order Note</h3>
                <p className="text-[13px] text-neutral-500 mb-4">Any special instructions or requests for your order (optional)</p>
                <textarea 
                  rows={4}
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="e.g. Please pack securely, gift wrapping needed..."
                  className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none resize-none text-[15px] placeholder:text-neutral-400"
                ></textarea>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[18px] text-neutral-800">Select Payment Method</h3>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>256-Bit SSL Encrypted</span>
                  </div>
                </div>

                <div className="space-y-4">
                  
                  {/* Option 1: Razorpay (UPI, QR, Cards, Net Banking) */}
                  <div 
                    className={`border-2 rounded-xl p-4 md:p-5 flex flex-col gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'razorpay' 
                        ? 'bg-emerald-50/40 border-[#317a26] shadow-sm' 
                        : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }`}
                    onClick={() => setPaymentMethod('razorpay')}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        paymentMethod === 'razorpay' ? 'border-[#317a26]' : 'border-neutral-400'
                      }`}>
                        {paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 rounded-full bg-[#317a26]" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-[15px] text-neutral-900">
                            UPI / QR / Cards / Net Banking
                          </span>
                          <span className="text-[11px] font-semibold uppercase tracking-wider bg-[#317a26] text-white px-2 py-0.5 rounded">
                            Recommended (India)
                          </span>
                        </div>
                        <p className="text-[13px] text-neutral-500 mt-0.5">
                          Instant checkout via Google Pay, PhonePe, Paytm, BHIM, UPI QR, Debit/Credit Cards & Net Banking
                        </p>
                      </div>

                      <Smartphone className="w-5 h-5 text-[#317a26] flex-shrink-0 hidden sm:block" />
                    </div>

                    {/* UPI & Payment Badges */}
                    <div className="pl-8 flex items-center gap-2 flex-wrap text-xs text-neutral-600">
                      <span className="px-2 py-0.5 bg-neutral-100 rounded border border-neutral-200 font-medium">⚡ GPay</span>
                      <span className="px-2 py-0.5 bg-neutral-100 rounded border border-neutral-200 font-medium">🟣 PhonePe</span>
                      <span className="px-2 py-0.5 bg-neutral-100 rounded border border-neutral-200 font-medium">🔷 Paytm</span>
                      <span className="px-2 py-0.5 bg-neutral-100 rounded border border-neutral-200 font-medium">🇮🇳 BHIM UPI</span>
                      <span className="px-2 py-0.5 bg-neutral-100 rounded border border-neutral-200 font-medium">RuPay / Visa</span>
                    </div>
                  </div>

                  {/* Option 2: Stripe (International Cards) */}
                  <div 
                    className={`border-2 rounded-xl p-4 md:p-5 flex flex-col gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'stripe' 
                        ? 'bg-blue-50/40 border-blue-600 shadow-sm' 
                        : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }`}
                    onClick={() => setPaymentMethod('stripe')}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        paymentMethod === 'stripe' ? 'border-blue-600' : 'border-neutral-400'
                      }`}>
                        {paymentMethod === 'stripe' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-[15px] text-neutral-900">
                            International Cards (Stripe)
                          </span>
                          <span className="text-[11px] font-semibold uppercase tracking-wider bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded">
                            Global
                          </span>
                        </div>
                        <p className="text-[13px] text-neutral-500 mt-0.5">
                          Pay securely using international Credit/Debit cards (USD, EUR, GBP, AUD, etc.)
                        </p>
                      </div>

                      <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 hidden sm:block" />
                    </div>

                    <div className="pl-8 flex items-center gap-2 flex-wrap text-xs text-neutral-600">
                      <span className="px-2 py-0.5 bg-neutral-100 rounded border border-neutral-200 font-medium">Visa</span>
                      <span className="px-2 py-0.5 bg-neutral-100 rounded border border-neutral-200 font-medium">Mastercard</span>
                      <span className="px-2 py-0.5 bg-neutral-100 rounded border border-neutral-200 font-medium">Amex</span>
                      <span className="px-2 py-0.5 bg-neutral-100 rounded border border-neutral-200 font-medium">Apple Pay</span>
                    </div>
                  </div>

                  {/* Option 3: Cash On Delivery */}
                  <div 
                    className={`border-2 rounded-xl p-4 md:p-5 flex items-center gap-3.5 cursor-pointer transition-all ${
                      paymentMethod === 'cod' 
                        ? 'bg-amber-50/40 border-amber-600 shadow-sm' 
                        : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      paymentMethod === 'cod' ? 'border-amber-600' : 'border-neutral-400'
                    }`}>
                      {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />}
                    </div>

                    <div className="flex-1">
                      <span className="block font-semibold text-[15px] text-neutral-900 leading-snug">
                        Cash On Delivery (COD)
                      </span>
                      <span className="block text-[13px] text-neutral-500 mt-0.5">
                        Pay cash when the package arrives at your delivery address
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-semibold text-[13.5px] text-[#d97706] bg-amber-100 px-2 py-0.5 rounded">+₹75</span>
                      <Truck className="w-5 h-5 text-neutral-600" strokeWidth={2} />
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="w-full xl:w-[35%]">
              <div className="bg-[#f6f5ef] border border-neutral-200 rounded-xl p-6 md:p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)] xl:sticky xl:top-24">
                <h2 className="text-[20px] font-semibold text-neutral-800 mb-6">Your Order</h2>
                
                <div className="space-y-4 mb-6 max-h-[340px] overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex gap-4">
                      <div className="relative w-[60px] h-[60px] rounded-md overflow-hidden bg-white flex-shrink-0 border border-neutral-200">
                        <Image src={item.imageUrl || '/images/Cardamom.jpg'} alt={item.name} fill className="object-cover" unoptimized={isUploadedImage(item.imageUrl || '/images/Cardamom.jpg')} />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-0.5">
                          <h4 className="font-medium text-[14px] text-neutral-800 line-clamp-1 pr-2">{item.name}</h4>
                          <span className="font-semibold text-[14px] text-neutral-800">₹{((item.price || 500) * item.quantity).toFixed(0)}</span>
                        </div>
                        <p className="text-[13px] text-neutral-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-5 border-t border-neutral-200/80 space-y-3.5 mb-6 relative">
                  <div className="flex justify-between text-[14px] text-neutral-500">
                    <span>Subtotal</span>
                    <span className="text-neutral-800">₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-[14px] text-neutral-500">
                    <span>Delivery Fee</span>
                    <span className={delivery === 0 ? "text-[#317a26] font-medium" : "text-neutral-800"}>
                      {delivery === 0 ? 'FREE' : `₹${delivery}`}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-[14px] text-[#317a26] font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                      <span>Discount ({appliedCoupon.coupon})</span>
                      <span>-₹{discountAmount.toFixed(0)}</span>
                    </div>
                  )}
                  {paymentMethod === 'cod' && (
                    <div className="flex justify-between text-[14px] text-amber-700 font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                      <span>COD Handling Fee</span>
                      <span>+₹75</span>
                    </div>
                  )}
                </div>

                <div className="pt-5 border-t border-neutral-200/80 flex justify-between items-end mb-8 relative">
                  <div>
                    <span className="text-[18px] font-bold text-neutral-800 block">Total</span>
                    <span className="text-[12px] text-neutral-500">Includes all taxes</span>
                  </div>
                  <span className="text-[24px] font-extrabold text-[#317a26]">
                    ₹{total.toFixed(0)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-lg bg-[#317a26] text-white font-semibold text-[16px] hover:bg-[#265e1d] transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <span className="animate-pulse">Processing Order...</span>
                  ) : paymentMethod === 'cod' ? (
                    'Place Order (Cash on Delivery)'
                  ) : paymentMethod === 'stripe' ? (
                    `Proceed to Stripe (₹${total.toFixed(0)})`
                  ) : (
                    `Pay ₹${total.toFixed(0)} with UPI / Cards`
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[12px] text-neutral-500 mt-4">
                  <ShieldCheck className="w-4 h-4 text-[#317a26]" />
                  <span>100% Secure &amp; Verified Payments</span>
                </div>

                <p className="text-[12px] text-center text-neutral-500 mt-4 leading-relaxed">
                  By placing this order, you agree to our Terms &amp; Conditions<br/>and Privacy Policy.
                </p>
              </div>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
