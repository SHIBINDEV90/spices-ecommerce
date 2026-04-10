import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/lib/models/Blog';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { title, slug, content, isPublished } = await req.json();

    if (!title || !slug || !content) {
      return NextResponse.json({ message: 'Title, slug, and content are required' }, { status: 400 });
    }

    await dbConnect();

    // Prevent duplicate slugs
    const existing = await Blog.findOne({ slug });
    if (existing) {
      return NextResponse.json({ message: `The slug '${slug}' is already in use.` }, { status: 400 });
    }

    const newBlog = await Blog.create({
      title,
      slug,
      content,
      isPublished,
      author: session.user?.name || 'Admin',
    });

    return NextResponse.json({ message: 'Blog created safely', blog: newBlog }, { status: 201 });

  } catch (error: any) {
    console.error('Blog Error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const activePosts = await Blog.find({ isPublished: true }).sort({ createdAt: -1 });
    return NextResponse.json(activePosts);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
