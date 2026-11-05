import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Saves uploaded image files to the local uploads directory and returns their public URLs.
 * 
 * @param files Array of File objects to save
 * @param prefix Optional prefix for the saved filename (e.g. vendor ID)
 * @returns Array of public URL strings (e.g. ['/uploads/products/123-image.jpg'])
 */
export async function saveUploadedFiles(
  files: (File | null | undefined)[],
  prefix: string = 'product'
): Promise<string[]> {
  const validFiles = files.filter(
    (f): f is File =>
      !!f &&
      typeof f === 'object' &&
      typeof (f as any).arrayBuffer === 'function' &&
      f.size > 0 &&
      f.size <= MAX_FILE_SIZE_BYTES
  );
  if (validFiles.length === 0) return [];

  const baseUploads = process.env.UPLOADS_DIR || path.join(process.cwd(), 'public', 'uploads');
  const uploadDir = path.join(baseUploads, 'products');

  try {
    await mkdir(uploadDir, { recursive: true });
  } catch {
    // Ignore if directory already exists
  }

  const uploadedUrls: string[] = [];

  for (let i = 0; i < validFiles.length; i++) {
    const file = validFiles[i];
    const rawExt = path.extname(file.name || '').toLowerCase() || '.jpg';
    if (!ALLOWED_IMAGE_EXTENSIONS.has(rawExt)) {
      throw new Error(`Unsupported image file extension: ${rawExt}`);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeBase = path
      .basename(file.name || `image_${i + 1}`, path.extname(file.name || ''))
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const filename = `${safePrefix}-${uniqueSuffix}-${safeBase}${rawExt}`;

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);
    uploadedUrls.push(`/uploads/products/${filename}`);
  }

  return uploadedUrls;
}
