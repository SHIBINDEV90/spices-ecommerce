import dbConnect from '@/lib/db';
import Blog from '@/lib/models/Blog';
import { FileText, Plus, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default async function AdminBlogPage() {
  await dbConnect();
  
  // Sort posts by descending creation date
  const posts = await Blog.find({}).sort({ createdAt: -1 });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-center pr-0 lg:pr-[300px]">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Content Hub
          </h2>
          <p className="text-gray-400 mt-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {posts.length} Documented Stories
          </p>
        </div>
        
        <Link 
          href="/admin/blog/new" 
          className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Write Post
        </Link>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-lg mt-8">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-black/40 text-gray-400 text-sm">
                <th className="p-4 font-medium min-w-[300px]">Headline</th>
                <th className="p-4 font-medium">Author</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Published Date</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">No content written yet.</p>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post._id.toString()} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <p className="font-semibold text-white truncate max-w-sm">{post.title}</p>
                      <p className="text-xs text-purple-400 font-mono mt-1">/{post.slug}</p>
                    </td>
                    <td className="p-4 text-gray-300">
                      {post.author}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border flex w-min items-center gap-1 ${
                        post.isPublished ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}>
                        {post.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {post.isPublished ? 'PUBLIC' : 'DRAFT'}
                      </span>
                    </td>
                    <td className="p-4 text-right text-sm text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
