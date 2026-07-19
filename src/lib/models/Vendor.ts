import mongoose, { Schema, Document } from 'mongoose';

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
  gstNumber?: string;
  iecNumber?: string;
  vendorType: 'Farmer' | 'Exporter';
  documents: {
    documentType: string;
    url: string;
  }[];
  status: 'Pending' | 'Approved' | 'Rejected';
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName: { type: String, required: true },
  ownerName: { type: String, required: true },
  businessAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
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

delete mongoose.models.Vendor;
export default mongoose.model<IVendor>('Vendor', VendorSchema);
