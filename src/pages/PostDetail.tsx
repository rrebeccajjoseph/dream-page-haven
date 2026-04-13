import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

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

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      const { data } = await supabase.from('posts').select('*').eq('id', id).single();
      if (data) setPost(data as Post);
      setLoading(false);
    };
    fetchPost();
  }, [id]);

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
        <div className="prose-vintage text-base leading-[2] whitespace-pre-wrap" style={{ fontFamily: 'var(--font-body)' }}>
          {post.content}
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
