'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Tag, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cartItems, getCartTotal } = useCart();
  const [loading, setLoading] = useState(false);
  
  // Form States (matching screenshot)
  const [coupon, setCoupon] = useState('');
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
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('online');

  const subtotal = getCartTotal();
  const delivery = subtotal > 500 ? 0 : 50; 
  const codFee = paymentMethod === 'cod' ? 75 : 0;
  const total = subtotal + delivery + codFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate processing payment directly or integrating Stripe soon.
    setTimeout(() => {
        setLoading(false);
        // Add actual stripe/gateway integration here as needed
        alert('Proceeding to payment gateway...');
    }, 1500);
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
                  className="flex-1 border border-neutral-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px] placeholder:text-neutral-400"
                />
                <button type="button" className="px-7 py-2.5 bg-[#f4f4f4] text-neutral-500 font-medium rounded-lg hover:bg-neutral-200 transition-colors text-[15px]">
                  Apply
                </button>
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
                  <label className="block text-[14px] font-medium text-neutral-700 mb-1.5">Contact No <span className="text-red-500">*</span></label>
                  <input type="tel" required value={contactNo} onChange={e => setContactNo(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px]" />
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
                        <select required={shipDifferent} value={shipState} onChange={e => setShipState(e.target.value)} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#317a26]/20 focus:border-[#317a26] outline-none text-[15px] bg-white text-neutral-800 transition-shadow">
                          <option value="" disabled>Select a state</option>
                          <option value="kerala">Kerala</option>
                          <option value="karnataka">Karnataka</option>
                          <option value="tamil-nadu">Tamil Nadu</option>
                          <option value="maharashtra">Maharashtra</option>
                          <option value="delhi">Delhi</option>
                        </select>
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

            {/* Payment Method */}
            <div className="bg-[#faf9f5] border border-neutral-200 rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
              <h3 className="font-semibold text-[17px] text-neutral-800 mb-4">Payment Method</h3>
              <div className="space-y-4">
                
                {/* Pay Online */}
                <div 
                  className={`border rounded-lg p-4 flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === 'online' ? 'bg-white border-neutral-200 shadow-sm' : 'bg-transparent border-neutral-200 hover:bg-neutral-50/50'}`}
                  onClick={() => setPaymentMethod('online')}
                >
                  <div className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${paymentMethod === 'online' ? 'border-[#317a26]' : 'border-neutral-400'}`}>
                    {paymentMethod === 'online' && <div className="w-[8px] h-[8px] rounded-full bg-[#317a26]" />}
                  </div>
                  <div className="flex-1">
                    <span className="block font-medium text-[15px] text-neutral-900 leading-snug">Pay Online</span>
                    <span className="block text-[13.5px] text-neutral-500 mt-0.5">Pay securely with UPI, Cards, Net Banking</span>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-[#317a26] flex-shrink-0" strokeWidth={2} />
                </div>

                {/* Cash On Delivery */}
                <div 
                  className={`border rounded-lg p-4 flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'bg-white border-neutral-200 shadow-sm' : 'bg-transparent border-neutral-200 hover:bg-neutral-50/50'}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${paymentMethod === 'cod' ? 'border-[#317a26]' : 'border-neutral-400'}`}>
                    {paymentMethod === 'cod' && <div className="w-[8px] h-[8px] rounded-full bg-[#317a26]" />}
                  </div>
                  <div className="flex-1">
                    <span className="block font-medium text-[15px] text-neutral-900 leading-snug">Cash On Delivery (COD)</span>
                    <span className="block text-[13.5px] text-neutral-500 mt-0.5">Pay when your order is delivered</span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="font-medium text-[14px] text-[#d97706]">+₹75</span>
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
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-4">
                    <div className="relative w-[60px] h-[60px] rounded-md overflow-hidden bg-white flex-shrink-0 border border-neutral-200">
                      <Image src={item.imageUrl || '/images/Cardamom.jpg'} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-0.5">
                        <h4 className="font-medium text-[14px] text-neutral-800 line-clamp-1 pr-2">{item.name}</h4>
                        <span className="font-semibold text-[14px] text-neutral-800">₹{((item.price || 500) * item.quantity).toFixed(0)}</span>
                      </div>
                      <p className="text-[13px] text-neutral-500">100g</p>
                      <p className="text-[13px] text-neutral-500 mt-0.5">Qty: {item.quantity}</p>
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
                  <span>Delivery</span>
                  <span className={delivery === 0 ? "text-[#317a26]" : "text-neutral-800"}>
                    {delivery === 0 ? 'Free' : `₹${delivery}`}
                  </span>
                </div>
                {paymentMethod === 'cod' && (
                  <div className="flex justify-between text-[14px] text-neutral-500 animate-in fade-in slide-in-from-top-2 duration-300">
                    <span>COD Fee</span>
                    <span className="text-neutral-800">₹75</span>
                  </div>
                )}
              </div>

              <div className="pt-5 border-t border-neutral-200/80 flex justify-between items-end mb-8 relative">
                <span className="text-[18px] font-bold text-neutral-800">Total</span>
                <span className="text-[22px] font-bold text-neutral-900">
                  ₹{total.toFixed(0)}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-[6px] bg-[#317a26] text-white font-semibold text-[16px] hover:bg-[#265e1d] transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center"
              >
                {loading ? <span className="animate-pulse">Processing...</span> : 'Pay Now'}
              </button>

              <p className="text-[12px] text-center text-neutral-500 mt-4 leading-relaxed">
                By placing this order, you agree to our Terms & Conditions<br/>and Privacy Policy.
              </p>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
