import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
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
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('essay');
  const [posts, setPosts] = useState<Post[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formSource, setFormSource] = useState('');
  const [formRating, setFormRating] = useState<number>(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, activeTab]);

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

  const handleSubmit = async () => {
    if (!user) return;

    try {
      if (activeTab === 'quotes') {
        const { error } = await supabase.from('quotes').insert({
          text: formContent,
          author: formAuthor || null,
          source: formSource || null,
          user_id: user.id,
        });
        if (error) throw error;
      } else if (activeTab === 'books') {
        const { error } = await supabase.from('books').insert({
          title: formTitle,
          author: formAuthor,
          notes: formContent || null,
          rating: formRating || null,
          user_id: user.id,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('posts').insert({
          title: formTitle,
          content: formContent,
          category: activeTab,
          published: true,
          user_id: user.id,
        });
        if (error) throw error;
      }

      toast.success('Added successfully');
      resetForm();
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string, table: 'posts' | 'quotes' | 'books') => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Removed');
      fetchData();
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormContent('');
    setFormAuthor('');
    setFormSource('');
    setFormRating(0);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground italic" style={{ fontFamily: 'var(--font-serif)' }}>loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-wider" style={{ fontFamily: 'var(--font-serif)' }}>
              ✿ A Garden of Words
            </h1>
            <p className="text-muted-foreground italic mt-1 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              essays · poetry · books · quotes · miscellany
            </p>
          </div>
          <Button variant="ghost" onClick={signOut} className="text-muted-foreground text-xs" style={{ fontFamily: 'var(--font-body)' }}>
            leave
          </Button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-border">
        <div className="max-w-5xl mx-auto flex gap-0">
          {(Object.keys(tabLabels) as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setShowForm(false); setExpandedPost(null); }}
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
        {/* Add button */}
        {user && (
          <div className="mb-8 text-center">
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-muted-foreground hover:text-foreground text-sm italic transition-colors"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {showForm ? '— close —' : '+ add new +'}
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <Card className="mb-10 bg-card border-border">
            <CardContent className="pt-6 space-y-4">
              {activeTab !== 'quotes' && (
                <Input
                  placeholder={activeTab === 'books' ? 'Book title' : 'Title'}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="bg-background border-border text-lg"
                  style={{ fontFamily: 'var(--font-serif)' }}
                />
              )}
              {(activeTab === 'books' || activeTab === 'quotes') && (
                <Input
                  placeholder="Author"
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  className="bg-background border-border"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
              )}
              {activeTab === 'quotes' && (
                <Input
                  placeholder="Source (optional)"
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  className="bg-background border-border"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
              )}
              <Textarea
                placeholder={
                  activeTab === 'quotes' ? 'The quote…' :
                  activeTab === 'books' ? 'Your thoughts on this book (optional)' :
                  'Begin writing…'
                }
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                className="bg-background border-border min-h-[150px] prose-vintage"
                style={{ fontFamily: 'var(--font-body)' }}
              />
              {activeTab === 'books' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-serif)' }}>Rating:</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setFormRating(n)}
                      className={`text-lg ${n <= formRating ? 'text-foreground' : 'text-muted-foreground/30'}`}
                    >
                      ✿
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={resetForm} style={{ fontFamily: 'var(--font-serif)' }}>cancel</Button>
                <Button onClick={handleSubmit} style={{ fontFamily: 'var(--font-serif)', letterSpacing: '0.05em' }}>save</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grid Content */}
        {activeTab === 'quotes' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quotes.map((q) => (
              <Card key={q.id} className="bg-card border-border group">
                <CardContent className="pt-6">
                  <blockquote className="text-lg italic leading-relaxed mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                    "{q.text}"
                  </blockquote>
                  {q.author && (
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                      — {q.author}{q.source ? `, ${q.source}` : ''}
                    </p>
                  )}
                  {user?.id === q.user_id && (
                    <button
                      onClick={() => handleDelete(q.id, 'quotes')}
                      className="text-xs text-muted-foreground/40 hover:text-destructive mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      remove
                    </button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : activeTab === 'books' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((b) => (
              <Card key={b.id} className="bg-card border-border group">
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
                  {user?.id === b.user_id && (
                    <button
                      onClick={() => handleDelete(b.id, 'books')}
                      className="text-xs text-muted-foreground/40 hover:text-destructive mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      remove
                    </button>
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
                className="bg-card border-border group cursor-pointer hover:shadow-md transition-shadow"
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
                  {user?.id === p.user_id && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(p.id, 'posts'); }}
                      className="text-xs text-muted-foreground/40 hover:text-destructive mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      remove
                    </button>
                  )}
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
