import dbConnect from '@/lib/db';
import Blog from '@/lib/models/Blog';
import { notFound } from 'next/navigation';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  await dbConnect();
  const post = await Blog.findOne({ slug: params.slug, isPublished: true });
  
  if (!post) return { title: 'Post Not Found' };
  
  return {
    title: `${post.title} | Malabar Coast Spices`,
    description: post.content.substring(0, 150).replace(/[#*`_\]\[]/g, '') + '...',
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  await dbConnect();
  
  const post = await Blog.findOne({ slug: params.slug, isPublished: true });

  if (!post) {
    notFound();
  }

  // A very simple Markdown parser since we allowed Markdown in the editor.
  // In a full production app you'd use marked or react-markdown, 
  // but we can parse basic headers, bold, and paragraphs quickly for the showcase.
  const parseMarkdown = (text: string) => {
    let html = text
      .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold mt-8 mb-4 text-white">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-10 mb-6 text-purple-400">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mt-12 mb-8 text-white">$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-white font-bold">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="text-purple-300 italic">$1</em>')
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-purple-500 pl-4 py-2 my-6 bg-purple-900/10 italic text-gray-300">$1</blockquote>')
      .replace(/\n\n/gim, '</p><p class="mb-6 leading-loose text-lg text-gray-300">');
      
    return `<p class="mb-6 leading-loose text-lg text-gray-300">${html}</p>`;
  };

  return (
    <article className="min-h-screen bg-black pb-32">
      {/* Article Header */}
      <header className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-purple-900/20 to-black z-0 pointer-events-none" />
        
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <Link href="/blog" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium mb-12 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Journal
          </Link>
          
          <div className="flex flex-wrap gap-3 mb-8">
            {post.tags?.map((tag: string, idx: number) => (
              <span key={idx} className="flex items-center gap-1 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold tracking-wider uppercase text-gray-300">
                <Tag className="w-3 h-3 text-purple-400" /> {tag}
              </span>
            ))}
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-8">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-gray-400 font-medium border-t border-white/10 pt-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                <User className="w-5 h-5 text-purple-400" />
              </div>
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span>{new Date(post.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      {post.coverImage && (
        <div className="container mx-auto px-4 max-w-5xl mb-16">
          <div className="w-full h-[50vh] min-h-[400px] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <img src={post.coverImage} className="w-full h-full object-cover" alt={post.title} />
          </div>
        </div>
      )}

      {/* Article Body */}
      <div className="container mx-auto px-4 max-w-3xl">
        <div 
          className="prose prose-invert prose-purple max-w-none"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }}
        />
        
        <div className="mt-20 pt-10 border-t border-white/10 flex justify-between items-center">
          <p className="text-gray-500 font-medium">Was this export insight helpful?</p>
          <div className="flex gap-4">
            <Link href="/bulk-enquiry" className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors">
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
