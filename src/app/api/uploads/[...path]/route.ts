import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_EXTENSIONS: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

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

    // Reject any segment containing path traversal patterns
    if (decodedSegments.some((seg) => seg.includes('..') || seg.includes('\0'))) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Primary upload directory
    const uploadsDir = path.resolve(process.env.UPLOADS_DIR || path.join(process.cwd(), 'public', 'uploads'));
    const fallbackBaseDir = path.resolve(path.join(process.cwd(), 'public', 'uploads'));

    let filePath = path.resolve(uploadsDir, ...decodedSegments);
    if (!filePath.startsWith(uploadsDir + path.sep)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Fallback if custom UPLOADS_DIR is set but file is in public/uploads
    if (!existsSync(filePath)) {
      const fallbackPath = path.resolve(fallbackBaseDir, ...decodedSegments);
      if (!fallbackPath.startsWith(fallbackBaseDir + path.sep)) {
        return new NextResponse('Forbidden', { status: 403 });
      }
      if (existsSync(fallbackPath)) {
        filePath = fallbackPath;
      } else {
        return new NextResponse('File not found', { status: 404 });
      }
    }

    // Only serve safe image extensions
    const ext = path.extname(filePath).toLowerCase();
    const contentType = ALLOWED_EXTENSIONS[ext];
    if (!contentType) {
      return new NextResponse('Unsupported file type', { status: 403 });
    }

    // Read the file buffer
    const fileBuffer = readFileSync(filePath);

    // Return the file with proper headers for caching, content type, and nosniff
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('Error serving uploaded file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
