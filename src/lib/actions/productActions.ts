'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { z } from 'zod';

// Zod schema for validation
const ProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  productType: z.enum(['ecommerce', 'enquiry']),
  price: z.coerce.number().optional(),
  stock: z.coerce.number().optional(),
});

export async function createProduct(prevState: any, formData: FormData) {
  try {
    await dbConnect();

    const validatedFields = ProductSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
      return {
        message: 'Validation failed',
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }
    
    await Product.create(validatedFields.data);

    revalidatePath('/admin/products');
    
    return { success: true, message: 'Product created successfully' };

  } catch (error) {
    console.error(error);
    return { message: 'Failed to create product' };
  }
}
