import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { format } from 'date-fns';

type Category = 'essay' | 'poetry';
type Tab = Category | 'appreciation';

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

interface Quote {
  id: string;
  text: string;
  author: string | null;
  source: string | null;
  description: string | null;
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
  appreciation: 'Appreciation',
};

const tabDescriptions: Partial<Record<Tab, string>> = {
  essay: 'long-form thoughts, reflections, and musings',
  appreciation: 'quotes, books, articles, and other people\'s work that we love',
};

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = (location.state as any)?.tab || 'essay';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [posts, setPosts] = useState<Post[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    if (activeTab === 'appreciation') {
      const [quotesRes, booksRes] = await Promise.all([
        supabase.from('quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('books').select('*').order('created_at', { ascending: false }),
      ]);
      if (quotesRes.data) setQuotes(quotesRes.data);
      if (booksRes.data) setBooks(booksRes.data);
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
          <h1 className="text-4xl font-light tracking-wider md:text-3xl" style={{ fontFamily: 'var(--font-mono)' }}>
            rebecca and isha's margin notes
          </h1>
          <p className="text-muted-foreground italic mt-1 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
            essays · poetry · appreciation
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            ← back to chicken
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-border">
        <div className="max-w-5xl mx-auto flex gap-0">
          {(Object.keys(tabLabels) as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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
        {tabDescriptions[activeTab] && (
          <div className="max-w-5xl mx-auto px-5 pt-2 pb-1">
            <p className="text-xs text-muted-foreground italic" style={{ fontFamily: 'var(--font-body)' }}>
              {tabDescriptions[activeTab]}
            </p>
          </div>
        )}
      </nav>

      {/* Search */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (showSearch && !searchQuery) {
                setShowSearch(false);
              } else {
                setShowSearch(true);
              }
            }}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <Search size={16} />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showSearch ? 'max-w-xs w-64 opacity-100' : 'max-w-0 w-0 opacity-0'
            }`}
          >
            <Input
              placeholder="search by title or author…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => {
                if (!searchQuery) setShowSearch(false);
              }}
              className="text-sm border-border bg-transparent"
              style={{ fontFamily: 'var(--font-mono)' }}
              autoFocus={showSearch}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-6">
        {/* Grid Content */}
        {activeTab === 'appreciation' ? (
          <div className="space-y-8">
            {quotes.filter((q) => {
              if (!searchQuery) return true;
              const s = searchQuery.toLowerCase();
              return q.text.toLowerCase().includes(s) || (q.author?.toLowerCase().includes(s));
            }).length > 0 && (
              <div>
                <h2 className="text-sm tracking-wider text-muted-foreground mb-3" style={{ fontFamily: 'var(--font-mono)' }}>quotes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quotes.filter((q) => {
                    if (!searchQuery) return true;
                    const s = searchQuery.toLowerCase();
                    return q.text.toLowerCase().includes(s) || (q.author?.toLowerCase().includes(s));
                  }).map((q) => (
                    <Card key={q.id} className="bg-card border-border rounded-2xl">
                      <CardContent className="pt-5 pb-4 px-5">
                        <blockquote className="text-sm italic leading-relaxed mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                          "{q.text}"
                        </blockquote>
                        {q.author && (
                          <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                            — {q.author}{q.source ? `, ${q.source}` : ''}
                          </p>
                        )}
                        {q.description && (
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                            {q.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {books.filter((b) => {
              if (!searchQuery) return true;
              const s = searchQuery.toLowerCase();
              return b.title.toLowerCase().includes(s) || b.author.toLowerCase().includes(s);
            }).length > 0 && (
              <div>
                <h2 className="text-sm tracking-wider text-muted-foreground mb-3" style={{ fontFamily: 'var(--font-mono)' }}>books</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {books.filter((b) => {
                    if (!searchQuery) return true;
                    const s = searchQuery.toLowerCase();
                    return b.title.toLowerCase().includes(s) || b.author.toLowerCase().includes(s);
                  }).map((b) => (
                    <Card key={b.id} className="bg-card border-border rounded-2xl">
                      <CardHeader className="pb-1 pt-4 px-4">
                        <CardTitle className="text-base font-normal leading-snug" style={{ fontFamily: 'var(--font-serif)' }}>
                          {b.title}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground italic" style={{ fontFamily: 'var(--font-body)' }}>
                          by {b.author}
                        </p>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        {b.rating && (
                          <p className="text-muted-foreground mb-1 text-xs">
                            {Array.from({ length: b.rating }).map((_, i) => (
                              <span key={i}>✿</span>
                            ))}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {quotes.length === 0 && books.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground italic text-lg" style={{ fontFamily: 'var(--font-serif)' }}>nothing here yet…</p>
                <div className="ornament" />
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {posts
              .filter((p) => {
                if (!searchQuery) return true;
                const s = searchQuery.toLowerCase();
                return p.title.toLowerCase().includes(s) || p.author.toLowerCase().includes(s);
              })
              .map((p) => (
              <Card
                key={p.id}
                className="bg-card border-border cursor-pointer hover:shadow-md transition-all rounded-2xl aspect-square flex flex-col"
                onClick={() => navigate(`/post/${p.id}`)}
              >
                <CardHeader className="pb-1 flex-1 flex flex-col justify-center items-center text-center px-4">
                  <CardTitle className="text-base font-normal leading-snug" style={{ fontFamily: 'var(--font-serif)' }}>
                    {p.title}
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground mt-1.5" style={{ fontFamily: 'var(--font-body)' }}>
                    {format(new Date(p.created_at), 'MMMM d, yyyy')}
                  </p>
                  <p className="text-[10px] text-muted-foreground italic mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                    {p.author}
                  </p>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {activeTab !== 'appreciation' && posts.length === 0 && (
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
