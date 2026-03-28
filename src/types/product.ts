export enum ProductType {
  ENQUIRY = 'enquiry',
  ECOMMERCE = 'ecommerce',
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string;
  description: string;
  productType: ProductType;
  isRetailAvailable?: boolean;
  price?: number;
  stock?: number;
  bulkPricing?: boolean;
  minOrderQty?: string;
  origin?: string;
  grades?: string[];
  moistureContent?: string;
}
