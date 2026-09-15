/**
 * Geospatial Utilities for Quick Commerce (35 km Hyperlocal Delivery)
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface HubPreset {
  name: string;
  district: string;
  pincode?: string;
  lat: number;
  lng: number;
  distanceFromBaseKm?: number;
}

// Spicewizz Central Office & Processing Hub in Wayanad
export const WAYANAD_OFFICE = {
  name: 'Spicewizz Central Hub',
  address: 'Vythiri, Wayanad, Kerala - 673576, India',
  area: 'Vythiri',
  district: 'Wayanad',
  pincode: '673576',
  lat: 11.5561,
  lng: 76.0389,
  radiusKm: 35,
};

// Towns & Local Delivery Hubs strictly within 35 km of Vythiri, Wayanad
export const POPULAR_HUBS: HubPreset[] = [
  { name: 'Vythiri (Office Base)', district: 'Wayanad', pincode: '673576', lat: 11.5561, lng: 76.0389, distanceFromBaseKm: 0 },
  { name: 'Kalpetta Town', district: 'Wayanad', pincode: '673121', lat: 11.6080, lng: 76.0827, distanceFromBaseKm: 9 },
  { name: 'Lakkidi / Churam', district: 'Wayanad', pincode: '673576', lat: 11.5173, lng: 76.0270, distanceFromBaseKm: 5 },
  { name: 'Meppadi / Chembra', district: 'Wayanad', pincode: '673577', lat: 11.5539, lng: 76.1264, distanceFromBaseKm: 12 },
  { name: 'Pozhuthana', district: 'Wayanad', pincode: '673575', lat: 11.5833, lng: 76.0167, distanceFromBaseKm: 8 },
  { name: 'Sultan Bathery', district: 'Wayanad', pincode: '673592', lat: 11.6627, lng: 76.2570, distanceFromBaseKm: 29 },
  { name: 'Mananthavady', district: 'Wayanad', pincode: '670645', lat: 11.8033, lng: 76.0044, distanceFromBaseKm: 32 },
  { name: 'Thamarassery / Adivaram', district: 'Kozhikode Border', pincode: '673573', lat: 11.4172, lng: 75.9333, distanceFromBaseKm: 20 },
];


/**
 * Calculates straight-line distance in kilometers between two points using the Haversine formula.
 */
export function calculateHaversineDistanceKm(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place (e.g. 4.2 km)
}

/**
 * Estimates delivery time in minutes given distance and vendor preparation time.
 * Models realistic local two-wheeler transit (~2.5 minutes per km + prep time + 5 min dispatch buffer).
 */
export function calculateDeliveryETA(
  distanceKm: number,
  prepMinutes: number = 15
): {
  minMinutes: number;
  maxMinutes: number;
  formattedETA: string;
} {
  const travelMinutes = Math.ceil(distanceKm * 2.5); // ~24 km/h average speed in city traffic
  const baseMinutes = prepMinutes + travelMinutes + 5;

  const minMinutes = Math.max(25, Math.floor(baseMinutes / 5) * 5);
  const maxMinutes = minMinutes + 15;

  return {
    minMinutes,
    maxMinutes,
    formattedETA: `${minMinutes}–${maxMinutes} mins`,
  };
}

/**
 * Formats distance nicely (e.g., "750 m" or "4.2 km").
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Reverse geocodes coordinates to a human-readable city/area name using OpenStreetMap Nominatim.
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number
): Promise<{ address: string; city: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'User-Agent': 'SpiceWizz-Ecommerce/1.0',
        },
      }
    );

    if (!res.ok) {
      return {
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        city: 'Current Location',
      };
    }

    const data = await res.json();
    const addressObj = data.address || {};
    const city =
      addressObj.suburb ||
      addressObj.city ||
      addressObj.town ||
      addressObj.village ||
      addressObj.county ||
      'Current Location';

    const address = data.display_name || `${city}, Kerala`;

    return { address, city };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      city: 'Current Location',
    };
  }
}
