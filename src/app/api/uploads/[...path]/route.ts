import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { path: string[] } }) {
  try {
    const rawSegments = Array.isArray(params?.path) ? params.path : [params?.path].filter(Boolean);
    const decodedSegments = rawSegments.map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    });

    // Check if file exists to prevent errors
    // Primary upload directory
    const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'public', 'uploads');
    let filePath = path.join(uploadsDir, ...decodedSegments);
    // Fallback if custom UPLOADS_DIR is set but file is in public/uploads
    if (!existsSync(filePath)) {
      const fallbackPath = path.join(process.cwd(), 'public', 'uploads', ...decodedSegments);
      if (existsSync(fallbackPath)) {
        filePath = fallbackPath;
      } else {
        return new NextResponse('File not found', { status: 404 });
      }
    }

    // Read the file buffer
    const fileBuffer = readFileSync(filePath);

    // Determine the content type based on the file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.gif') contentType = 'image/gif';

    // Return the file with proper headers for caching and content type
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('Error serving uploaded file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
