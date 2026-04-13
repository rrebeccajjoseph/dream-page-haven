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
        <div className="mt-16 pt-8 border-t border-border">
          <h2 className="text-sm tracking-wider text-muted-foreground mb-6" style={{ fontFamily: 'var(--font-mono)' }}>
            margin notes ✿
          </h2>

          {/* Comment list */}
          {comments.length > 0 && (
            <div className="space-y-4 mb-8">
              {comments.map((c) => (
                <div key={c.id} className="border-l-2 border-border pl-4 py-1">
                  <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                    {c.content}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs italic text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                      — {c.display_name}
                    </span>
                    <span className="text-xs text-muted-foreground/50" style={{ fontFamily: 'var(--font-mono)' }}>
                      {format(new Date(c.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment form */}
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <Input
              placeholder="your name (or leave blank for anonymous)"
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              className="bg-background border-border text-sm"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
            <Textarea
              placeholder="leave a note…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
              className="bg-background border-border text-sm min-h-[80px] resize-none"
              style={{ fontFamily: 'var(--font-body)' }}
            />
            <Button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="text-sm"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
            >
              {submitting ? 'sending…' : 'leave a note'}
            </Button>
          </form>
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