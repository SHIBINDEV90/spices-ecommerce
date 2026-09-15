import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
import Product from '@/lib/models/Product';
import { calculateHaversineDistanceKm, calculateDeliveryETA, WAYANAD_OFFICE } from '@/lib/geo';


export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const radiusKm = parseFloat(searchParams.get('radius') || '35'); // Default 35 km
    const maxDistanceMeters = radiusKm * 1000;

    const userLat = latParam ? parseFloat(latParam) : WAYANAD_OFFICE.lat;
    const userLng = lngParam ? parseFloat(lngParam) : WAYANAD_OFFICE.lng;

    if (isNaN(userLat) || isNaN(userLng)) {
      return NextResponse.json(
        { success: false, message: 'Invalid coordinates provided' },
        { status: 400 }
      );
    }

    // 1. Query MongoDB for active vendors within 35 km (35,000 meters) using 2dsphere index
    let nearbyVendors: any[] = [];
    try {
      nearbyVendors = await Vendor.find({
        status: 'Approved',
        'quickCommerce.enabled': { $ne: false },
        'quickCommerce.isAcceptingOrders': { $ne: false },
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [userLng, userLat], // [longitude, latitude]
            },
            $maxDistance: maxDistanceMeters,
          },
        },
      }).lean();
    } catch (geoErr) {
      console.warn('MongoDB $near query fallback (if index building):', geoErr);
      // Fallback in case 2dsphere index is still indexing: fetch all approved vendors and filter with haversine
      const allVendors = await Vendor.find({
        status: 'Approved',
        'quickCommerce.enabled': { $ne: false },
        'quickCommerce.isAcceptingOrders': { $ne: false },
      }).lean();

      nearbyVendors = allVendors.filter((v: any) => {
        if (v.location?.coordinates && Array.isArray(v.location.coordinates)) {
          const [vLng, vLat] = v.location.coordinates;
          const dist = calculateHaversineDistanceKm(
            { lat: userLat, lng: userLng },
            { lat: vLat, lng: vLng }
          );
          return dist <= (v.quickCommerce?.deliveryRadiusKm || radiusKm);
        }
        return false;
      });
    }

    // Build a map of vendor distance and prep time
    const vendorMap = new Map<string, { distanceKm: number; prepMinutes: number; businessName: string }>();

    for (const v of nearbyVendors) {
      const [vLng, vLat] = v.location?.coordinates || [WAYANAD_OFFICE.lng, WAYANAD_OFFICE.lat];
      const dist = calculateHaversineDistanceKm(
        { lat: userLat, lng: userLng },
        { lat: vLat, lng: vLng }
      );
      vendorMap.set(String(v._id), {
        distanceKm: dist,
        prepMinutes: v.quickCommerce?.preparationTimeMinutes || 15,
        businessName: v.businessName,
      });
    }

    const vendorIds = Array.from(vendorMap.keys());

    // 2. Fetch all products available for quick commerce from these nearby vendors
    // Also include Spicewizz Direct products from the Wayanad central hub if user is within 35km of Wayanad
    const distFromWayanadOffice = calculateHaversineDistanceKm(
      { lat: userLat, lng: userLng },
      { lat: WAYANAD_OFFICE.lat, lng: WAYANAD_OFFICE.lng }
    );
    const isWithinWayanadOfficeRadius = distFromWayanadOffice <= radiusKm;

    const filterQuery: any = {
      approvalStatus: 'Approved',
      stock: { $gt: 0 },
      'quickCommerce.isAvailable': { $ne: false },
    };

    const orClauses: any[] = [];
    if (vendorIds.length > 0) {
      orClauses.push({ vendorId: { $in: vendorIds } });
    }
    if (isWithinWayanadOfficeRadius) {
      orClauses.push({ vendorId: { $exists: false } });
      orClauses.push({ vendorId: null });
    }

    if (orClauses.length > 0) {
      filterQuery.$or = orClauses;
    } else {
      // If neither any vendor is within 35km nor is the customer within 35km of Wayanad Office
      return NextResponse.json({
        success: true,
        userLocation: { lat: userLat, lng: userLng },
        radiusKm,
        totalVendors: 0,
        count: 0,
        products: [],
        message: 'No quick commerce products available within 35 km of this location.',
      });
    }

    const products = await Product.find(filterQuery)
      .populate('vendorId', 'businessName location quickCommerce')
      .lean();

    // 3. Attach distance and delivery ETA to each product
    let enrichedProducts = products.map((prod: any) => {
      let distanceKm = distFromWayanadOffice;
      let prepMinutes = 15;
      let vendorName = 'Spicewizz Wayanad Hub';

      if (prod.vendorId) {
        const vendorInfo = vendorMap.get(String(prod.vendorId._id || prod.vendorId));
        if (vendorInfo) {
          distanceKm = vendorInfo.distanceKm;
          prepMinutes = vendorInfo.prepMinutes;
          vendorName = vendorInfo.businessName;
        } else if (prod.vendorId.location?.coordinates) {
          const [vLng, vLat] = prod.vendorId.location.coordinates;
          distanceKm = calculateHaversineDistanceKm(
            { lat: userLat, lng: userLng },
            { lat: vLat, lng: vLng }
          );
          vendorName = prod.vendorId.businessName || vendorName;
        }
      }

      const eta = calculateDeliveryETA(distanceKm, prepMinutes);

      return {
        ...prod,
        quickCommerce: {
          ...prod.quickCommerce,
          isAvailable: true,
          distanceKm,
          estimatedDeliveryMinutes: eta.minMinutes,
          etaFormatted: eta.formattedETA,
          vendorName,
        },
      };
    });

    // Strictly filter to ensure every product is <= radiusKm
    enrichedProducts = enrichedProducts.filter((p: any) => (p.quickCommerce.distanceKm || 0) <= radiusKm);

    // 4. Sort by nearest distance first
    enrichedProducts.sort(
      (a: any, b: any) => (a.quickCommerce.distanceKm || 0) - (b.quickCommerce.distanceKm || 0)
    );


    return NextResponse.json({
      success: true,
      userLocation: { lat: userLat, lng: userLng },
      radiusKm,
      totalVendors: nearbyVendors.length,
      count: enrichedProducts.length,
      products: enrichedProducts,
    });
  } catch (error: any) {
    console.error('Error fetching quick commerce products:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
