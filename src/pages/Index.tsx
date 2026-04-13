import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import UserIndicator from '@/components/UserIndicator';
import ComposeDialog from '@/components/ComposeDialog';

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
  link: string | null;
  created_at: string;
  user_id: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  notes: string | null;
  rating: number | null;
  link: string | null;
  created_at: string;
  user_id: string;
}

interface Article {
  id: string;
  title: string;
  author: string | null;
  link: string | null;
  description: string | null;
  created_at: string;
  user_id: string;
}

const tabLabels: Record<Tab, string> = {
  essay: 'Essays',
  poetry: 'Poetry',
  appreciation: 'Appreciation',
};

const tabDescriptions: Partial<Record<Tab, string>> = {
  appreciation: 'quotes, books, articles, and other people\'s work that we love',
};

const getAuthorColor = (author: string | null) => {
  if (!author) return undefined;
  const lower = author.toLowerCase();
  const hasIsha = lower.includes('isha');
  const hasRebecca = lower.includes('rebecca');
  if (hasIsha && hasRebecca) return 'hsl(var(--author-both))';
  if (hasIsha) return 'hsl(var(--author-isha))';
  if (hasRebecca) return 'hsl(var(--author-rebecca))';
  return undefined;
};

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const initialTab = (location.state as any)?.tab || 'essay';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [posts, setPosts] = useState<Post[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    if (activeTab === 'appreciation') {
      const [quotesRes, booksRes, articlesRes] = await Promise.all([
        supabase.from('quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('books').select('*').order('created_at', { ascending: false }),
        supabase.from('articles').select('*').order('created_at', { ascending: false }),
      ]);
      if (quotesRes.data) setQuotes(quotesRes.data);
      if (booksRes.data) setBooks(booksRes.data);
      if (articlesRes.data) setArticles(articlesRes.data as Article[]);
    } else {
      const { data } = await supabase.from('posts').select('*').eq('category', activeTab).order('created_at', { ascending: false });
      if (data) setPosts(data);
    }
  };

  const isOwner = (itemUserId: string) => user?.id === itemUserId;

  const handleDelete = async (table: string, id: string) => {
    if (!confirm('are you sure?')) return;
    const { error } = await (supabase.from(table as any).delete() as any).eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('deleted');
      fetchData();
    }
  };

  const OwnerActions = ({ table, id, userId }: { table: string; id: string; userId: string }) => {
    if (!isOwner(userId)) return null;
    return (
      <div className="flex gap-1.5 mt-2">
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(table, id); }}
          className="text-muted-foreground/50 hover:text-destructive transition-colors p-0.5"
          title="delete"
        >
          <Trash2 size={12} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-start">
          <div>
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
          <UserIndicator />
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
                          {q.link ? (
                            <a href={q.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1">
                              "{q.text}" <ArrowUpRight size={12} />
                            </a>
                          ) : (
                            <>"{q.text}"</>
                          )}
                        </blockquote>
                        {q.author && (
                          <p className="text-xs" style={{ fontFamily: 'var(--font-body)', color: getAuthorColor(q.author) || 'hsl(var(--muted-foreground))' }}>
                            — {q.author}{q.source ? `, ${q.source}` : ''}
                          </p>
                        )}
                        {q.description && (
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                            {q.description}
                          </p>
                        )}
                        <OwnerActions table="quotes" id={q.id} userId={q.user_id} />
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
                          {b.link ? (
                            <a href={b.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1">
                              {b.title} <ArrowUpRight size={14} />
                            </a>
                          ) : (
                            b.title
                          )}
                        </CardTitle>
                        <p className="text-xs italic" style={{ fontFamily: 'var(--font-body)', color: getAuthorColor(b.author) || 'hsl(var(--muted-foreground))' }}>
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
                        <OwnerActions table="books" id={b.id} userId={b.user_id} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {articles.filter((a) => {
              if (!searchQuery) return true;
              const s = searchQuery.toLowerCase();
              return a.title.toLowerCase().includes(s) || (a.author?.toLowerCase().includes(s));
            }).length > 0 && (
              <div>
                <h2 className="text-sm tracking-wider text-muted-foreground mb-3" style={{ fontFamily: 'var(--font-mono)' }}>essays</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {articles.filter((a) => {
                    if (!searchQuery) return true;
                    const s = searchQuery.toLowerCase();
                    return a.title.toLowerCase().includes(s) || (a.author?.toLowerCase().includes(s));
                  }).map((a) => (
                    <Card key={a.id} className="bg-card border-border rounded-2xl">
                      <CardHeader className="pb-1 pt-4 px-4">
                        <CardTitle className="text-base font-normal leading-snug" style={{ fontFamily: 'var(--font-serif)' }}>
                          {a.link ? (
                            <a href={a.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1">
                              {a.title} <ArrowUpRight size={14} />
                            </a>
                          ) : (
                            a.title
                          )}
                        </CardTitle>
                        {a.author && (
                          <p className="text-xs italic" style={{ fontFamily: 'var(--font-body)', color: getAuthorColor(a.author) || 'hsl(var(--muted-foreground))' }}>
                            by {a.author}
                          </p>
                        )}
                      </CardHeader>
                      {a.description && (
                        <CardContent className="px-4 pb-4">
                          <p className="text-xs leading-relaxed text-muted-foreground">{a.description}</p>
                        </CardContent>
                      )}
                      <div className="px-4 pb-3">
                        <OwnerActions table="articles" id={a.id} userId={a.user_id} />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {quotes.length === 0 && books.length === 0 && articles.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground italic text-lg" style={{ fontFamily: 'var(--font-serif)' }}>nothing here yet…</p>
                <div className="ornament" />
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {posts
              .filter((p) => {
                if (!searchQuery) return true;
                const s = searchQuery.toLowerCase();
                return p.title.toLowerCase().includes(s) || p.author.toLowerCase().includes(s);
              })
              .map((p) => (
              <Card
                key={p.id}
                className="bg-card border-border cursor-pointer hover:shadow-md transition-all rounded-2xl flex flex-col relative py-4 px-4"
                onClick={() => navigate(`/post/${p.id}`)}
              >
                <div className="flex flex-col items-start text-left gap-1">
                  <CardTitle className="text-sm font-normal leading-snug" style={{ fontFamily: 'var(--font-serif)' }}>
                    {p.title}
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                    {format(new Date(p.created_at), 'MMMM d, yyyy')}
                  </p>
                  <span className="inline-flex items-center gap-1.5 mt-0.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: getAuthorColor(p.author) || 'hsl(var(--muted-foreground))' }}
                    />
                    <span className="text-[10px] text-foreground italic" style={{ fontFamily: 'var(--font-body)' }}>
                      {p.author}
                    </span>
                  </span>
                </div>
                {isOwner(p.user_id) && (
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete('posts', p.id); }}
                      className="text-muted-foreground/40 hover:text-destructive transition-colors p-1"
                      title="delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
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

      {/* Compose button (logged in only) */}
      <ComposeDialog onCreated={fetchData} />

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
