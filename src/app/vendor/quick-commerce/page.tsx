'use client';

import { useState, useEffect } from 'react';
import { 
  Zap, 
  MapPin, 
  Clock, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Navigation, 
  Store,
  PackageCheck,
  Power
} from 'lucide-react';
import Image from 'next/image';
import { POPULAR_HUBS } from '@/lib/geo';

export default function VendorQuickCommercePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Settings State
  const [enabled, setEnabled] = useState(false);
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState(35);
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState(15);
  const [lng, setLng] = useState<number>(76.0389);
  const [lat, setLat] = useState<number>(11.5561);

  const [detectingGps, setDetectingGps] = useState(false);

  // Products State
  const [products, setProducts] = useState<any[]>([]);
  const [productSettings, setProductSettings] = useState<{ [id: string]: { isAvailable: boolean; quickStock: number } }>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vendor/quick-commerce');
      const data = await res.json();

      if (res.ok && data.success) {
        const qc = data.vendor.quickCommerce || {};
        setEnabled(Boolean(qc.enabled));
        setIsAcceptingOrders(qc.isAcceptingOrders !== false);
        setDeliveryRadiusKm(qc.deliveryRadiusKm || 35);
        setPreparationTimeMinutes(qc.preparationTimeMinutes || 15);

        if (data.vendor.location?.coordinates && data.vendor.location.coordinates.length === 2) {
          setLng(data.vendor.location.coordinates[0]);
          setLat(data.vendor.location.coordinates[1]);
        }

        setProducts(data.products || []);

        const initialProductMap: { [id: string]: { isAvailable: boolean; quickStock: number } } = {};
        (data.products || []).forEach((p: any) => {
          initialProductMap[p._id] = {
            isAvailable: Boolean(p.quickCommerce?.isAvailable),
            quickStock: p.quickCommerce?.quickStock || p.stock || 10,
          };
        });
        setProductSettings(initialProductMap);
      } else {
        setError(data.error || 'Failed to fetch vendor settings');
      }
    } catch (err: any) {
      console.error(err);
      setError('Network error fetching quick commerce settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported on your browser');
      return;
    }
    setDetectingGps(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setDetectingGps(false);
        setMessage('GPS location updated to your current store location.');
        setTimeout(() => setMessage(null), 3000);
      },
      (err) => {
        setDetectingGps(false);
        setError('Failed to detect GPS location: ' + err.message);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSelectPresetHub = (hub: typeof POPULAR_HUBS[0]) => {
    setLat(hub.lat);
    setLng(hub.lng);
    setMessage(`Store coordinates set to ${hub.name}`);
    setTimeout(() => setMessage(null), 3000);
  };

  const toggleProductAvailability = (productId: string) => {
    setProductSettings((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        isAvailable: !prev[productId]?.isAvailable,
      },
    }));
  };

  const updateProductStock = (productId: string, stock: number) => {
    setProductSettings((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quickStock: Math.max(0, stock),
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);

    const payload = {
      coordinates: [lng, lat],
      quickCommerce: {
        enabled,
        isAcceptingOrders,
        deliveryRadiusKm,
        preparationTimeMinutes,
      },
      productSettings: Object.keys(productSettings).map((id) => ({
        productId: id,
        isAvailable: productSettings[id].isAvailable,
        quickStock: productSettings[id].quickStock,
      })),
    };

    try {
      const res = await fetch('/api/vendor/quick-commerce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Quick Commerce configuration saved successfully!');
        setTimeout(() => setMessage(null), 4000);
      } else {
        setError(data.error || 'Failed to save settings');
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to communicate with server');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        <span className="ml-3 text-neutral-600 font-medium">Loading Quick Commerce settings...</span>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>35 km Hyperlocal Network</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
            Quick Commerce Management
          </h1>
          <p className="text-sm text-neutral-500">
            Configure your store coordinates, 35 km delivery radius, prep times, and fast-fulfillment items.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-700 transition flex items-center gap-2 self-start sm:self-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 flex items-center gap-2 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Status Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Master Quick Commerce Switch */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-neutral-900 text-base">Enable Quick Commerce</h3>
            </div>
            <p className="text-xs text-neutral-500">
              When enabled, your store becomes discoverable to customers within 35 km for 30–60 min delivery.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              enabled ? 'bg-emerald-600' : 'bg-neutral-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Live Acceptance Switch */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2">
              <Power className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-neutral-900 text-base">Accepting Orders Right Now</h3>
            </div>
            <p className="text-xs text-neutral-500">
              Temporarily toggle this OFF if your packing team is swamped or during store closing hours.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAcceptingOrders(!isAcceptingOrders)}
            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isAcceptingOrders ? 'bg-emerald-600' : 'bg-neutral-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isAcceptingOrders ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Operational Limits & Coordinates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Radius & Prep Time */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Clock className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-neutral-900 text-base">Delivery Limits & Speed</h3>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-neutral-700">Service Delivery Radius</label>
              <span className="text-sm font-bold text-amber-600 px-2 py-0.5 rounded-md bg-amber-50">
                {deliveryRadiusKm} km (Max 35 km)
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="35"
              step="1"
              value={deliveryRadiusKm}
              onChange={(e) => setDeliveryRadiusKm(Number(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Customers within this radius will be able to order from your local inventory.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Average Packing / Prep Time (Minutes)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="5"
                max="60"
                value={preparationTimeMinutes}
                onChange={(e) => setPreparationTimeMinutes(Number(e.target.value))}
                className="w-24 px-3 py-2 border border-neutral-300 rounded-xl text-sm font-bold text-neutral-800 focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <span className="text-xs text-neutral-500">
                Minutes to inspect, package, and hand over to local delivery partner.
              </span>
            </div>
          </div>
        </div>

        {/* Store Location Coordinates */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-neutral-900 text-base">Store GPS Coordinates</h3>
            </div>
            <button
              onClick={handleDetectGps}
              disabled={detectingGps}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              {detectingGps ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              <span>Auto-Detect Store GPS</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs font-mono text-neutral-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs font-mono text-neutral-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wider">
              Or Quick Select Hub Preset
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_HUBS.map((hub) => (
                <button
                  key={hub.name}
                  type="button"
                  onClick={() => handleSelectPresetHub(hub)}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition"
                >
                  {hub.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Quick Catalog Manager */}
      <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-neutral-900 text-base">Quick Delivery Products Catalog</h3>
          </div>
          <span className="text-xs text-neutral-500 font-medium">
            Select items ready for local 30–60 min dispatch
          </span>
        </div>

        {products.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-sm">
            No products uploaded yet. Go to Products tab to create your first spice listing.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Standard Stock</th>
                  <th className="py-3 px-4">35km Quick Delivery</th>
                  <th className="py-3 px-4">Quick Stock Quota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((p) => {
                  const setting = productSettings[p._id] || { isAvailable: false, quickStock: 0 };
                  const img = p.imageUrl || (p.images && p.images[0]) || '/images/hero-spice.jpg';

                  return (
                    <tr key={p._id} className="hover:bg-neutral-50/60 transition">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                          <Image src={img} alt={p.name} fill className="object-cover" />
                        </div>
                        <div>
                          <span className="font-semibold text-neutral-900 block">{p.name}</span>
                          <span className="text-xs text-neutral-400">{p.category || 'Spice'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold text-neutral-900">
                        ₹{p.price}
                      </td>

                      <td className="py-3 px-4 text-neutral-600">
                        {p.stock} units
                      </td>

                      <td className="py-3 px-4">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={setting.isAvailable}
                            onChange={() => toggleProductAvailability(p._id)}
                            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                          />
                          <span className={`text-xs font-semibold ${setting.isAvailable ? 'text-emerald-700 font-bold' : 'text-neutral-400'}`}>
                            {setting.isAvailable ? '⚡ Active' : 'Off'}
                          </span>
                        </label>
                      </td>

                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          max={p.stock || 100}
                          value={setting.quickStock}
                          disabled={!setting.isAvailable}
                          onChange={(e) => updateProductStock(p._id, parseInt(e.target.value) || 0)}
                          className={`w-20 px-2 py-1 border rounded-lg text-xs font-semibold ${
                            setting.isAvailable 
                              ? 'border-neutral-300 bg-white text-neutral-900' 
                              : 'border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed'
                          }`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating Save Bar */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg hover:bg-primary-700 transition flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Quick Commerce Configuration'}</span>
        </button>
      </div>
    </div>
  );
}
