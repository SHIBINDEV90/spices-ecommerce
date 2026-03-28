import dbConnect from '@/lib/db';
import Blog from '@/lib/models/Blog';
import Link from 'next/link';
import { ArrowRight, Calendar, User, BookOpen } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection'; // Assuming it's in components

export const metadata = {
  title: 'Spice Industry Insights | Malabar Coast Spices',
  description: 'Expert articles, market trends, and sourcing guides for global wholesale spice buyers.',
};

export default async function PublicBlogPage() {
  await dbConnect();

  // Fetch only published blogs, newest first
  const posts = await Blog.find({ isPublished: true }).sort({ createdAt: -1 });

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Hero Header */}
      <section className="relative pt-32 pb-20 flex items-center justify-center overflow-hidden border-b border-white/10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-4 z-10 text-center max-w-4xl">
          <BookOpen className="w-12 h-12 text-purple-500 mx-auto mb-6 opacity-80" />
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-lg leading-tight">
            The Spice <span className="text-purple-400">Journal</span>
          </h1>
          <p className="text-xl text-gray-400 font-medium">
            Industry intelligence, market forecasts, and origin stories from the heart of Kerala.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-24 relative bg-black">
        <div className="container mx-auto px-4 max-w-7xl">
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
              <p className="text-gray-400 text-lg">Our experts are currently drafting new insights. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <div key={post._id.toString()} className="group border border-white/10 bg-white/5 hover:bg-white/10 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 flex flex-col h-full">
                  {post.coverImage ? (
                    <div className="h-56 w-full overflow-hidden">
                      <img 
                        src={post.coverImage} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                  ) : (
                    <div className="h-56 w-full bg-gradient-to-br from-purple-900/40 to-black flex items-center justify-center border-b border-white/10">
                      <BookOpen className="w-12 h-12 text-white/20" />
                    </div>
                  )}

                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags?.slice(0, 2).map((tag: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-xs font-semibold tracking-wider uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4 line-clamp-2 leading-tight group-hover:text-purple-400 transition-colors">
                      {post.title}
                    </h3>
                    
                    <div className="text-gray-400 text-sm line-clamp-3 mb-8 flex-1 leading-relaxed">
                      {/* Very crude strip HTML/Markdown tags for snippet */}
                      {post.content.replace(/<[^>]*>?/gm, '').replace(/[#*`_]/g, '')}
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10">
                      <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                      </div>
                      
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="flex items-center gap-2 text-purple-400 font-bold hover:text-purple-300 transition-colors"
                      >
                        Read <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
