'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import Image from 'next/image';

export default function VendorReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/vendor/reviews');
        if (!res.ok) throw new Error('Failed to load reviews');
        const data = await res.json();
        setReviews(data.reviews);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const submitReply = async (reviewId: string) => {
    try {
      const res = await fetch('/api/vendor/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, vendorReply: replyText[reviewId] }),
      });
      if (!res.ok) throw new Error('Failed to submit reply');
      
      const data = await res.json();
      setReviews(reviews.map(r => r._id === reviewId ? data.review : r));
      setReplyingTo(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-neutral-500">Loading reviews...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Customer Reviews</h1>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-neutral-500 border border-neutral-100">
          <Star className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
          <p>No reviews yet. Keep delivering great products to get positive feedback!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                
                {/* Product Info */}
                <div className="w-full md:w-48 flex-shrink-0 flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                    <Image src={review.productId?.imageUrl || '/images/Cardamom.jpg'} alt="Product" fill className="object-cover" />
                  </div>
                  <div className="text-sm font-medium text-neutral-900 line-clamp-2">
                    {review.productId?.name || 'Unknown Product'}
                  </div>
                </div>

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-neutral-300'}`} />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-neutral-900">{review.customerName}</span>
                    <span className="text-xs text-neutral-500">• {new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <p className="text-neutral-700 mb-4 text-sm leading-relaxed">{review.comment}</p>

                  {/* Vendor Reply Section */}
                  {review.vendorReply ? (
                    <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100 mt-4">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-primary/90 uppercase tracking-wider">Your Reply</span>
                      </div>
                      <p className="text-sm text-neutral-600">{review.vendorReply}</p>
                    </div>
                  ) : replyingTo === review._id ? (
                    <div className="mt-4">
                      <textarea
                        value={replyText[review._id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [review._id]: e.target.value })}
                        placeholder="Write a public reply to the customer..."
                        className="w-full border border-neutral-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => setReplyingTo(null)} className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900">Cancel</button>
                        <button 
                          onClick={() => submitReply(review._id)} 
                          disabled={!replyText[review._id]?.trim()}
                          className="px-4 py-2 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground text-sm font-medium rounded-lg"
                        >
                          Submit Reply
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setReplyingTo(review._id)}
                      className="text-sm text-primary hover:text-primary/90 font-medium"
                    >
                      Reply to review
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
