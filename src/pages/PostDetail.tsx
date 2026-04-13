import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  published: boolean;
  created_at: string;
  user_id: string;
}

interface Comment {
  id: string;
  post_id: string;
  display_name: string;
  content: string;
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  essay: 'Essays',
  poetry: 'Poetry',
  misc: 'Miscellany',
};

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      const { data } = await supabase.from('posts').select('*').eq('id', id).single();
      if (data) setPost(data as Post);
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return;
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: true });
      if (data) setComments(data as Comment[]);
    };
    fetchComments();
  }, [id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;
    setSubmitting(true);
    const { data, error } = await supabase.from('comments').insert({
      post_id: id,
      display_name: commentName.trim() || 'anonymous',
      content: commentText.trim(),
    }).select().single();
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      setComments((prev) => [...prev, data as Comment]);
      setCommentText('');
      toast.success('comment added ✿');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground italic" style={{ fontFamily: 'var(--font-serif)' }}>loading…</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground italic" style={{ fontFamily: 'var(--font-serif)' }}>post not found</p>
      </div>
    );
  }

  const categoryLabel = categoryLabels[post.category] || post.category;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with breadcrumb */}
      <header className="border-b border-border py-6 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <nav className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
            <button onClick={() => navigate('/home')} className="hover:text-foreground transition-colors">
              home
            </button>
            <span className="mx-2">/</span>
            <button onClick={() => navigate('/home', { state: { tab: post.category } })} className="hover:text-foreground transition-colors">
              {categoryLabel.toLowerCase()}
            </button>
            <span className="mx-2">/</span>
            <span className="text-foreground">{post.title.toLowerCase()}</span>
          </nav>
        </div>
      </header>

      {/* Post content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-light tracking-wide mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
          {post.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-10" style={{ fontFamily: 'var(--font-body)' }}>
          <span>{format(new Date(post.created_at), 'MMMM d, yyyy')}</span>
          <span>·</span>
          <span className="italic">{post.author}</span>
        </div>
        <div
          className="prose prose-sm max-w-none leading-[2]"
          style={{ fontFamily: 'var(--font-body)' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Comments section */}
        <div className="mt-16 pt-8 border-t border-border/50">
          <h2 className="text-xs tracking-widest uppercase text-muted-foreground/60 mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
            comments
          </h2>

          {/* Comment list */}
          {comments.length > 0 ? (
            <div className="space-y-3 mb-6">
              {comments.map((c) => (
                <div key={c.id} className="flex flex-col items-start">
                  <div className="relative bg-muted/40 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm leading-relaxed text-foreground/80" style={{ fontFamily: 'var(--font-body)' }}>
                      {c.content}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 mt-1 ml-2" style={{ fontFamily: 'var(--font-mono)' }}>
                    {c.display_name} · {format(new Date(c.created_at), 'MMM d')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/40 italic mb-6" style={{ fontFamily: 'var(--font-body)' }}>
              no comments yet
            </p>
          )}

          {/* Add comment toggle */}
          {!showCommentForm ? (
            <button
              onClick={() => setShowCommentForm(true)}
              className="text-xs tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              + add comment
            </button>
          ) : (
            <div className="bg-muted/20 rounded-2xl p-4 animate-fade-in">
              <form onSubmit={handleSubmitComment} className="space-y-2">
                <input
                  placeholder="your name (or leave blank for anonymous)"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="bg-transparent outline-none text-xs py-1 w-full text-foreground placeholder:text-muted-foreground/40"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
                <div className="flex gap-2 items-end">
                  <textarea
                    placeholder="leave a note…"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                    rows={1}
                    className="bg-transparent outline-none text-sm py-1 flex-1 text-foreground placeholder:text-muted-foreground/40 resize-none"
                    style={{ fontFamily: 'var(--font-body)' }}
                    onInput={(e) => {
                      const el = e.target as HTMLTextAreaElement;
                      el.style.height = 'auto';
                      el.style.height = el.scrollHeight + 'px';
                    }}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={submitting || !commentText.trim()}
                    className="text-xs tracking-wider text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors pb-1 shrink-0"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {submitting ? '…' : '→'}
                  </button>
                </div>
              </form>
              <button
                onClick={() => setShowCommentForm(false)}
                className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground mt-2 transition-colors"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                cancel
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground/50 italic" style={{ fontFamily: 'var(--font-serif)' }}>
          ❦ made with tenderness ❦
        </p>
      </footer>
    </div>
  );
};

export default PostDetail;