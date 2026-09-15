import mongoose, { Schema, Document } from 'mongoose';

export interface ILocationPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IVendor extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  ownerName: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  location?: ILocationPoint;
  quickCommerce?: {
    enabled: boolean;
    deliveryRadiusKm: number;       // default: 35
    preparationTimeMinutes: number; // default: 15
    isAcceptingOrders: boolean;     // live toggle
  };
  gstNumber?: string;
  iecNumber?: string;
  vendorType: 'Farmer' | 'Exporter';
  documents: {
    documentType: string;
    url: string;
  }[];
  email?: string;
  phone?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  email: { type: String, lowercase: true, trim: true, index: true },
  phone: { type: String, trim: true },
  businessName: { type: String, required: true },
  ownerName: { type: String, required: true },
  businessAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [76.0389, 11.5561], // Default coordinates: Vythiri, Wayanad (673576)
    },

  },
  quickCommerce: {
    enabled: { type: Boolean, default: false },
    deliveryRadiusKm: { type: Number, default: 35 },
    preparationTimeMinutes: { type: Number, default: 15 },
    isAcceptingOrders: { type: Boolean, default: true },
  },
  gstNumber: { type: String },
  iecNumber: { type: String },
  vendorType: { type: String, enum: ['Farmer', 'Exporter'], required: true },
  documents: [
    {
      documentType: { type: String, required: true }, // e.g., GST, IEC, PAN, Aadhaar
      url: { type: String, required: true },
    }
  ],
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  profileImage: { type: String },
}, { timestamps: true });

// 2dsphere index for geospatial queries within 35 km
VendorSchema.index({ location: '2dsphere' });

delete mongoose.models.Vendor;
export default mongoose.model<IVendor>('Vendor', VendorSchema);

