'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Copy, 
  ExternalLink, 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  ShieldAlert, 
  Boxes,
  Compass,
  ArrowRight
} from 'lucide-react';

export interface TrackingEvent {
  status: string;
  description?: string;
  location?: string;
  source?: string;
  timestamp: string | Date;
}

export interface ShippingDetails {
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  awbCode?: string;
  shippedAt?: string | Date;
  deliveredAt?: string | Date;
  estimatedDeliveryDate?: string | Date;
}

interface OrderTrackingTimelineProps {
  status: string;
  history?: TrackingEvent[];
  shipping?: ShippingDetails;
  orderId?: string;
}

const steps = [
  { key: 'processing', label: 'Order Processing', subtitle: 'Spices being prepared & weighed', icon: Clock },
  { key: 'packed', label: 'Packed & Inspected', subtitle: 'Aroma-sealed & quality verified', icon: Boxes },
  { key: 'shipped', label: 'Shipped', subtitle: 'Handed over to courier service', icon: Package },
  { key: 'in_transit', label: 'In Transit', subtitle: 'Moving through logistics hubs', icon: Compass },
  { key: 'out_for_delivery', label: 'Out for Delivery', subtitle: 'Courier is delivering today', icon: Truck },
  { key: 'delivered', label: 'Delivered', subtitle: 'Package received by customer', icon: CheckCircle2 },
];

const statusLabels: Record<string, string> = {
  processing: 'Processing',
  packed: 'Packed & Ready',
  shipped: 'Shipped',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned (RTO)',
  exception: 'Delivery Exception',
};

export default function OrderTrackingTimeline({
  status,
  history = [],
  shipping,
  orderId,
}: OrderTrackingTimelineProps) {
  const [copiedAwb, setCopiedAwb] = useState(false);
  const isTerminal = ['cancelled', 'returned', 'exception'].includes(status);
  const currentStepIndex = steps.findIndex((s) => s.key === status);

  const awb = shipping?.trackingNumber || shipping?.awbCode;

  const handleCopyAwb = () => {
    if (awb) {
      navigator.clipboard.writeText(awb);
      setCopiedAwb(true);
      setTimeout(() => setCopiedAwb(false), 2000);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. CURRENT STATUS HERO CARD */}
      <div className="bg-gradient-to-br from-[#183a1d] via-[#224f27] to-[#122e17] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Shipment Status
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>{statusLabels[status] || status}</span>
            </h1>

            <p className="text-emerald-100/80 text-sm mt-1.5 max-w-lg leading-relaxed">
              {status === 'delivered'
                ? 'Your order of farm-fresh Malabar spices has been successfully delivered. Enjoy the authentic aroma!'
                : status === 'out_for_delivery'
                ? 'Our express delivery partner is on the way to your doorstep. Please ensure someone is available.'
                : status === 'in_transit'
                ? 'Your parcel is traveling securely across express courier hubs with climate-safe handling.'
                : status === 'shipped'
                ? 'Your parcel has been picked up from our Wayanad plantation facility and registered with the courier.'
                : status === 'packed'
                ? 'Your spices have been freshly weighed, inspected, and sealed in high-barrier aroma-protection pouches.'
                : status === 'cancelled'
                ? 'This order has been marked as cancelled. If this is unexpected, please contact our support team.'
                : 'Your order has been verified and our spice masters are currently preparing your artisanal batch.'}
            </p>
          </div>

          {/* Courier & AWB Capsule */}
          {awb && (
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col gap-2 min-w-[220px]">
              <div className="flex items-center justify-between text-xs text-emerald-200/80">
                <span>Courier Carrier</span>
                <span className="font-semibold text-white">{shipping?.carrier || 'Shiprocket Express'}</span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                <div className="font-mono text-sm font-bold text-amber-300 truncate">
                  {awb}
                </div>
                <button
                  type="button"
                  onClick={handleCopyAwb}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition text-xs flex items-center gap-1"
                  title="Copy Tracking Number"
                >
                  {copiedAwb ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[11px]">{copiedAwb ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {shipping?.trackingUrl && (
                <a
                  href={shipping.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Track on Courier Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. TERMINAL STATUS WARNING (Cancelled / Exception / Returned) */}
      {isTerminal && (
        <div className="rounded-2xl p-5 border bg-red-500/10 border-red-500/30 text-red-200 flex items-start gap-3.5">
          <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-white text-base">
              {statusLabels[status] || 'Notice Regarding Your Order'}
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              {status === 'cancelled'
                ? 'This order has been cancelled. Any pre-payments will be credited back via the original payment source within 3-5 business days.'
                : status === 'returned'
                ? 'The courier was unable to deliver the package after multiple attempts, and the shipment is being returned to our Wayanad origin facility.'
                : 'A delivery exception occurred (such as incorrect pincode, natural weather delay, or unreachable recipient). Our logistics desk is actively following up.'}
            </p>
            <p className="text-xs text-amber-300 pt-1">
              Need prompt assistance? WhatsApp our care desk at{' '}
              <a href="https://wa.me/919447000000" className="underline font-bold hover:text-white">
                +91 94470 00000
              </a>{' '}
              or email{' '}
              <a href="mailto:support@spicewizz.com" className="underline font-bold hover:text-white">
                support@spicewizz.com
              </a>
              .
            </p>
          </div>
        </div>
      )}

      {/* 3. VISUAL PROGRESS TRACKING STEPPER */}
      {!isTerminal && (
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Fulfillment &amp; Journey</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Real-time checkpoints from plantation harvest to your doorstep
              </p>
            </div>
            {orderId && (
              <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                #{orderId.substring(orderId.length - 8).toUpperCase()}
              </span>
            )}
          </div>

          {/* Stepper on Desktop */}
          <div className="hidden lg:grid grid-cols-6 gap-2 relative">
            {steps.map((step, idx) => {
              const isCompleted = status === 'delivered' || (currentStepIndex >= 0 && idx <= currentStepIndex);
              const isCurrent = currentStepIndex === idx;
              const StepIcon = step.icon;

              return (
                <div key={step.key} className="flex flex-col items-center text-center relative group">
                  {/* Connecting Line */}
                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute top-5 left-1/2 w-full h-[3px] -z-0 transition-colors duration-500 ${
                        currentStepIndex > idx || status === 'delivered'
                          ? 'bg-emerald-600'
                          : 'bg-neutral-200 dark:bg-neutral-800'
                      }`}
                    />
                  )}

                  {/* Icon Node */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`relative z-10 w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border border-neutral-200 dark:border-neutral-700'
                    } ${isCurrent ? 'ring-4 ring-emerald-500/25 ring-offset-2 dark:ring-offset-zinc-900 scale-105' : ''}`}
                  >
                    {isCompleted && !isCurrent ? (
                      <Check className="w-5 h-5 text-white stroke-[2.5]" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </motion.div>

                  {/* Labels */}
                  <div className="mt-3.5 space-y-0.5">
                    <p className={`text-xs font-bold leading-tight ${
                      isCompleted ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 line-clamp-2 px-1">
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stepper on Mobile & Tablet */}
          <div className="lg:hidden space-y-6 relative pl-3">
            <div className="absolute left-7 top-4 bottom-4 w-[2px] bg-neutral-200 dark:bg-neutral-800 -z-0" />

            {steps.map((step, idx) => {
              const isCompleted = status === 'delivered' || (currentStepIndex >= 0 && idx <= currentStepIndex);
              const isCurrent = currentStepIndex === idx;
              const StepIcon = step.icon;

              return (
                <div key={step.key} className="flex items-start gap-4 relative z-10">
                  <div
                    className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border border-neutral-200 dark:border-neutral-700'
                    } ${isCurrent ? 'ring-4 ring-emerald-500/25 ring-offset-2 dark:ring-offset-zinc-900' : ''}`}
                  >
                    {isCompleted && !isCurrent ? (
                      <Check className="w-4 h-4 text-white stroke-[2.5]" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>

                  <div className="pt-0.5">
                    <p className={`text-sm font-bold ${
                      isCompleted ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. ACTIVITY & SCAN TIMELINE LOG */}
      <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-neutral-900 dark:text-white">Activity Log &amp; Checkpoints</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Timestamped scans recorded by SpiceWizz and our courier partners</p>
            </div>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-sm">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Tracking updates will populate automatically as your parcel travels.
          </div>
        ) : (
          <div className="relative pl-4 sm:pl-6 space-y-6 before:absolute before:left-[19px] sm:before:left-[27px] before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-200 dark:before:bg-neutral-800">
            {[...history].reverse().map((event, idx) => {
              const dateObj = new Date(event.timestamp);
              const formattedDate = dateObj.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });
              const formattedTime = dateObj.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={`${event.timestamp}-${idx}`} className="relative flex items-start gap-4">
                  {/* Dot */}
                  <div className={`w-3.5 h-3.5 rounded-full border-2 bg-white dark:bg-zinc-900 shrink-0 mt-1 z-10 ${
                    idx === 0 
                      ? 'border-emerald-600 ring-4 ring-emerald-500/20' 
                      : 'border-neutral-300 dark:border-neutral-600'
                  }`} />

                  {/* Content */}
                  <div className="bg-neutral-50 dark:bg-zinc-800/60 border border-neutral-200/80 dark:border-neutral-700/60 rounded-2xl p-4 flex-1 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-neutral-900 dark:text-white">
                          {statusLabels[event.status] || event.status}
                        </span>
                        {event.source && (
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                            {event.source}
                          </span>
                        )}
                      </div>

                      <time className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                        {formattedDate} &bull; {formattedTime}
                      </time>
                    </div>

                    {event.description && (
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    {event.location && (
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium pt-0.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{event.location}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
