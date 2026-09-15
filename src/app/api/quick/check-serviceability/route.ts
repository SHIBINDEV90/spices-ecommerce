import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
import { calculateHaversineDistanceKm, calculateDeliveryETA, WAYANAD_OFFICE } from '@/lib/geo';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { lat, lng } = body;

    if (!lat || !lng) {
      return NextResponse.json(
        { serviceable: false, message: 'Latitude and longitude are required.' },
        { status: 400 }
      );
    }

    const radiusKm = 35;
    const maxDistanceMeters = radiusKm * 1000;

    // Check distance to Spicewizz Central Hub in Vythiri, Wayanad
    const distToWayanadHub = calculateHaversineDistanceKm(
      { lat: parseFloat(lat), lng: parseFloat(lng) },
      { lat: WAYANAD_OFFICE.lat, lng: WAYANAD_OFFICE.lng }
    );
    const isWithinWayanadHub = distToWayanadHub <= radiusKm;

    // Search for active vendors within 35 km
    let vendors: any[] = [];
    try {
      vendors = await Vendor.find({
        status: 'Approved',
        'quickCommerce.enabled': { $ne: false },
        'quickCommerce.isAcceptingOrders': { $ne: false },
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            $maxDistance: maxDistanceMeters,
          },
        },
      }).lean();
    } catch (err) {
      const allVendors = await Vendor.find({
        status: 'Approved',
        'quickCommerce.enabled': { $ne: false },
        'quickCommerce.isAcceptingOrders': { $ne: false },
      }).lean();

      vendors = allVendors.filter((v: any) => {
        if (v.location?.coordinates) {
          const [vLng, vLat] = v.location.coordinates;
          const dist = calculateHaversineDistanceKm(
            { lat: parseFloat(lat), lng: parseFloat(lng) },
            { lat: vLat, lng: vLng }
          );
          return dist <= (v.quickCommerce?.deliveryRadiusKm || radiusKm);
        }
        return false;
      });
    }

    if (!isWithinWayanadHub && (!vendors || vendors.length === 0)) {
      return NextResponse.json({
        serviceable: false,
        message: `Quick Commerce is only active within 35 km of our Wayanad hub (Vythiri, Wayanad - 673576). Standard pan-India shipping is available!`,
      });
    }

    // Find closest dispatch point (Wayanad office or nearby vendor)
    let minDistance = isWithinWayanadHub ? distToWayanadHub : 999;
    let minPrep = 15;

    for (const v of vendors) {
      const [vLng, vLat] = v.location?.coordinates || [WAYANAD_OFFICE.lng, WAYANAD_OFFICE.lat];
      const dist = calculateHaversineDistanceKm(
        { lat: parseFloat(lat), lng: parseFloat(lng) },
        { lat: vLat, lng: vLng }
      );
      if (dist < minDistance) {
        minDistance = dist;
        minPrep = v.quickCommerce?.preparationTimeMinutes || 15;
      }
    }

    const eta = calculateDeliveryETA(minDistance, minPrep);

    return NextResponse.json({
      serviceable: true,
      vendorsCount: vendors.length + (isWithinWayanadHub ? 1 : 0),
      nearestVendorDistanceKm: minDistance,
      hub: 'Vythiri, Wayanad (PIN: 673576)',
      estimatedDeliveryMinutes: eta.minMinutes,
      etaFormatted: eta.formattedETA,
      message: `Great news! Quick delivery is available at your location from our Wayanad hub (${minDistance} km) in ${eta.formattedETA}.`,
    });

  } catch (error: any) {
    console.error('Serviceability check error:', error);
    return NextResponse.json(
      { serviceable: false, message: error.message || 'Error checking serviceability' },
      { status: 500 }
    );
  }
}
