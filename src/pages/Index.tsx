import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';

type Category = 'essay' | 'poetry' | 'misc';
type Tab = Category | 'quotes' | 'books';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  published: boolean;
  created_at: string;
  user_id: string;
}

interface Quote {
  id: string;
  text: string;
  author: string | null;
  source: string | null;
  created_at: string;
  user_id: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  notes: string | null;
  rating: number | null;
  created_at: string;
  user_id: string;
}

const tabLabels: Record<Tab, string> = {
  essay: 'Essays',
  poetry: 'Poetry',
  books: 'Books',
  quotes: 'Quotes',
  misc: 'Miscellany',
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('essay');
  const [posts, setPosts] = useState<Post[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    if (activeTab === 'quotes') {
      const { data } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
      if (data) setQuotes(data);
    } else if (activeTab === 'books') {
      const { data } = await supabase.from('books').select('*').order('created_at', { ascending: false });
      if (data) setBooks(data);
    } else {
      const { data } = await supabase.from('posts').select('*').eq('category', activeTab).order('created_at', { ascending: false });
      if (data) setPosts(data);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-light tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
            rebecca and isha's margin notes
          </h1>
          <p className="text-muted-foreground italic mt-1 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
            essays · poetry · books · quotes · miscellany
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-border">
        <div className="max-w-5xl mx-auto flex gap-0">
          {(Object.keys(tabLabels) as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setExpandedPost(null); }}
              className={`px-5 py-3 text-sm tracking-wider border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Grid Content */}
        {activeTab === 'quotes' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quotes.map((q) => (
              <Card key={q.id} className="bg-card border-border">
                <CardContent className="pt-6">
                  <blockquote className="text-lg italic leading-relaxed mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                    "{q.text}"
                  </blockquote>
                  {q.author && (
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                      — {q.author}{q.source ? `, ${q.source}` : ''}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : activeTab === 'books' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((b) => (
              <Card key={b.id} className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-normal" style={{ fontFamily: 'var(--font-serif)' }}>
                    {b.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground italic" style={{ fontFamily: 'var(--font-body)' }}>
                    by {b.author}
                  </p>
                </CardHeader>
                <CardContent>
                  {b.rating && (
                    <p className="text-muted-foreground mb-2">
                      {Array.from({ length: b.rating }).map((_, i) => (
                        <span key={i}>✿</span>
                      ))}
                    </p>
                  )}
                  {b.notes && (
                    <p className="text-sm leading-relaxed prose-vintage">{b.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((p) => (
              <Card
                key={p.id}
                className="bg-card border-border cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setExpandedPost(expandedPost === p.id ? null : p.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-normal" style={{ fontFamily: 'var(--font-serif)' }}>
                    {p.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                    {format(new Date(p.created_at), 'MMMM d, yyyy')}
                  </p>
                </CardHeader>
                <CardContent>
                  <div
                    className={`prose-vintage text-sm leading-relaxed whitespace-pre-wrap ${
                      expandedPost === p.id ? '' : 'line-clamp-4'
                    }`}
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {p.content}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {((activeTab === 'quotes' && quotes.length === 0) ||
          (activeTab === 'books' && books.length === 0) ||
          (!['quotes', 'books'].includes(activeTab) && posts.length === 0)) && (
          <div className="text-center py-20">
            <p className="text-muted-foreground italic text-lg" style={{ fontFamily: 'var(--font-serif)' }}>
              nothing here yet…
            </p>
            <div className="ornament" />
          </div>
        )}
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

export default Index;
