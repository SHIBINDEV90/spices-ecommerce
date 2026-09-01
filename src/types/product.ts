export enum ProductType {
  ENQUIRY = 'enquiry',
  ECOMMERCE = 'ecommerce',
}

export interface VendorInfo {
  _id: string;
  businessName: string;
  ownerName?: string;
  vendorType?: 'Farmer' | 'Exporter';
  businessAddress?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string;
  description: string;
  productType: ProductType | string;
  isRetailAvailable?: boolean;
  isBulkAvailable?: boolean;
  price?: number;
  stock?: number;
  bulkPricing?: boolean;
  minOrderQty?: string;
  origin?: string;
  grades?: string[];
  moistureContent?: string;
  selectedWeight?: string;
  vendorId?: VendorInfo | string | null;
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected';
  category?: string;
}
