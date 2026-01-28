'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Mail } from 'lucide-react';

interface Comment {
  _id: string;
  content: string;
  guest_name: string;
  guest_email?: string;
  createdAt: string;
}

interface CommentSectionProps {
  slug: string;
}

export default function CommentSection({ slug }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    content: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load comments
  useEffect(() => {
    fetchComments();
  }, [slug]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?slug=${slug}`);
      const data = await res.json();
      if (data.success) {
        setComments(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          ...formData,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: 'success',
          text: 'Comment submitted! It will appear after approval.',
        });
        setFormData({ guest_name: '', guest_email: '', content: '' });
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to submit comment',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16 border-t-2 border-slate-200 pt-12">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6" />
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      <div className="mb-12 bg-white border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Leave a Comment</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="guest_name" className="block text-sm font-semibold text-slate-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Name *
              </label>
              <input
                type="text"
                id="guest_name"
                required
                className="w-full border border-slate-300 px-4 py-2 focus:outline-none focus:border-slate-900 transition-colors"
                value={formData.guest_name}
                onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
              />
            </div>
            
            <div>
              <label htmlFor="guest_email" className="block text-sm font-semibold text-slate-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email (optional)
              </label>
              <input
                type="email"
                id="guest_email"
                className="w-full border border-slate-300 px-4 py-2 focus:outline-none focus:border-slate-900 transition-colors"
                value={formData.guest_email}
                onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-semibold text-slate-700 mb-2">
              Message *
            </label>
            <textarea
              id="content"
              required
              rows={4}
              className="w-full border border-slate-300 px-4 py-2 focus:outline-none focus:border-slate-900 transition-colors resize-none"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
          
          {message && (
            <div
              className={`p-4 border ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}
          
          <button
            type="submit"
            disabled={submitting}
            className="bg-slate-900 text-white px-6 py-3 font-semibold hover:bg-slate-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting...' : 'Submit Comment'}
          </button>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8 text-slate-600">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 border border-slate-200 bg-slate-50">
            <p className="text-slate-600">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="border-l-4 border-slate-200 pl-4 py-2"
            >
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-slate-600" />
                <span className="font-bold text-slate-900">{comment.guest_name}</span>
                <span className="text-sm text-slate-500">•</span>
                <time className="text-sm text-slate-500 font-mono">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </time>
              </div>
              <p className="text-slate-700 leading-relaxed">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
