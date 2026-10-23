/**
 * Shiprocket API Integration Helper for SpiceWizz E-commerce
 * Official Docs: https://apidocs.shiprocket.in/
 */

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cachedAuth: CachedToken | null = null;

/**
 * Normalizes raw courier/Shiprocket shipment statuses into standard SpiceWizz tracking statuses
 */
export function normalizeShiprocketStatus(value: string): 'processing' | 'packed' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned' | 'exception' {
  if (!value) return 'processing';
  const s = value.toLowerCase().replace(/[_-]+/g, ' ').trim();

  if (s.includes('delivered')) return 'delivered';
  if (s.includes('out for delivery') || s.includes('out for dispatch')) return 'out_for_delivery';
  if (s.includes('in transit') || s.includes('in-transit') || s.includes('transit') || s.includes('reached at') || s.includes('departed')) {
    return 'in_transit';
  }
  if (s.includes('picked up') || s.includes('shipped') || s.includes('dispatched') || s.includes('manifested')) {
    return 'shipped';
  }
  if (s.includes('cancel')) return 'cancelled';
  if (s.includes('return') || s.includes('rto') || s.includes('undelivered - returning')) return 'returned';
  if (s.includes('exception') || s.includes('undelivered') || s.includes('delayed') || s.includes('lost') || s.includes('damaged')) {
    return 'exception';
  }
  if (s.includes('packed') || s.includes('ready to ship') || s.includes('invoice generated') || s.includes('awb assigned')) {
    return 'packed';
  }

  return 'processing';
}

/**
 * Generate a direct courier tracking URL based on carrier & AWB
 */
export function getDirectTrackingUrl(carrier: string = '', awb: string = ''): string {
  if (!awb) return '';
  const c = carrier.toLowerCase();
  if (c.includes('delhivery')) return `https://www.delhivery.com/track/package/${encodeURIComponent(awb)}`;
  if (c.includes('blue dart') || c.includes('bluedart')) return `https://www.bluedart.com/tracking?trackNumber=${encodeURIComponent(awb)}`;
  if (c.includes('dtdc')) return `https://www.dtdc.in/tracking/tracking_results.asp?pin=${encodeURIComponent(awb)}`;
  if (c.includes('india post') || c.includes('speed post')) return `https://www.indiapost.gov.in/_layouts/15/dpt.cpt.application/tracking.aspx`;
  if (c.includes('ekart')) return `https://ekartlogistics.com/shipmenttrack/${encodeURIComponent(awb)}`;
  if (c.includes('shadowfax')) return `https://tracker.shadowfax.in/#/track?awb=${encodeURIComponent(awb)}`;

  // Default to Shiprocket universal tracking
  return `https://shiprocket.co/tracking/${encodeURIComponent(awb)}`;
}

/**
 * Obtain Shiprocket Bearer Authentication Token with in-memory caching
 */
export async function getShiprocketToken(): Promise<string> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD in environment variables');
  }

  const now = Date.now();
  if (cachedAuth && cachedAuth.expiresAt > now + 60 * 1000) {
    return cachedAuth.token;
  }

  const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok || !data.token) {
    throw new Error(data.message || `Shiprocket authentication failed with status ${res.status}`);
  }

  // Shiprocket tokens last ~10 days. We safely cache for 5 days.
  cachedAuth = {
    token: data.token,
    expiresAt: now + 5 * 24 * 60 * 60 * 1000,
  };

  return data.token;
}

/**
 * Check if Shiprocket credentials are fully configured
 */
export function isShiprocketConfigured(): boolean {
  return Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD);
}

/**
 * Create a new shipment order in Shiprocket
 */
export async function createShiprocketOrder(order: any) {
  const token = await getShiprocketToken();

  const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary';
  const nameParts = (order.customerName || 'Valued Customer').trim().split(' ');
  const firstName = nameParts[0] || 'Customer';
  const lastName = nameParts.slice(1).join(' ') || 'Customer';

  const orderItems = (order.products || []).map((item: any, idx: number) => ({
    name: item.name || `Spice Product #${idx + 1}`,
    sku: String(item.productId?._id || item.productId || `SPICE-${idx + 1}`),
    units: item.quantity || 1,
    selling_price: item.price || 100,
    discount: 0,
    tax: 0,
  }));

  const orderDate = new Date(order.createdAt || Date.now())
    .toISOString()
    .replace('T', ' ')
    .substring(0, 16);

  const payload = {
    order_id: String(order._id),
    order_date: orderDate,
    pickup_location: pickupLocation,
    channel_id: '',
    comment: order.orderNote || 'SpiceWizz Fresh Wayanad Spices Order',
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: order.shippingAddress?.street || 'Plantation Estate Delivery',
    billing_city: order.shippingAddress?.city || 'Kochi',
    billing_pincode: String(order.shippingAddress?.postalCode || '682001'),
    billing_state: order.shippingAddress?.state || 'Kerala',
    billing_country: order.shippingAddress?.country || 'India',
    billing_email: order.customerEmail || 'orders@spicewizz.com',
    billing_phone: String(order.customerPhone || '9876543210').replace(/[^0-9]/g, '').slice(-10),
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
    sub_total: order.totalAmount || 100,
    length: 15,
    breadth: 12,
    height: 8,
    weight: 0.5, // Standard initial kg weight
  };

  const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || (data.errors ? JSON.stringify(data.errors) : 'Shiprocket order creation failed'));
  }

  return data;
}

/**
 * Generate AWB and assign Courier for a created shipment
 */
export async function assignShiprocketAwb(shipmentId: string, courierId?: number) {
  const token = await getShiprocketToken();

  const body: Record<string, any> = { shipment_id: shipmentId };
  if (courierId) {
    body.courier_id = courierId;
  }

  const res = await fetch('https://apiv2.shiprocket.in/v1/external/courier/assign/awb', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok || data.status_code === 400) {
    throw new Error(data.message || 'Failed to assign AWB via Shiprocket');
  }

  return data;
}

/**
 * Fetch real-time tracking details from Shiprocket using AWB code
 */
export async function trackShiprocketByAwb(awbCode: string) {
  const token = await getShiprocketToken();

  const res = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${encodeURIComponent(awbCode)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Shiprocket tracking lookup failed with status ${res.status}`);
  }

  return data;
}
