import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

type ContentType = 'essay' | 'poetry' | 'quote' | 'book' | 'article';

interface ComposeDialogProps {
  onCreated: () => void;
  defaultType?: ContentType;
}

const getAuthorName = (email: string | null) => {
  if (!email) return 'anonymous';
  const lower = email.toLowerCase();
  if (lower.includes('isha')) return 'isha';
  if (lower.includes('rebecca') || lower.includes('rjoseph')) return 'rebecca';
  return email.split('@')[0];
};

const ComposeDialog = ({ onCreated, defaultType }: ComposeDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [contentType, setContentType] = useState<ContentType>(defaultType || 'essay');
  const [loading, setLoading] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [rating, setRating] = useState<number>(0);

  if (!user) return null;

  const resetForm = () => {
    setTitle('');
    setContent('');
    setText('');
    setAuthor('');
    setSource('');
    setDescription('');
    setLink('');
    setRating(0);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const authorName = getAuthorName(user.email ?? null);

      if (contentType === 'essay' || contentType === 'poetry') {
        const { error } = await supabase.from('posts').insert({
          title,
          content,
          category: contentType,
          author: authorName,
          user_id: user.id,
          published: true,
        });
        if (error) throw error;
      } else if (contentType === 'quote') {
        const { error } = await supabase.from('quotes').insert({
          text,
          author: author || null,
          source: source || null,
          description: description || null,
          link: link || null,
          user_id: user.id,
        });
        if (error) throw error;
      } else if (contentType === 'book') {
        const { error } = await supabase.from('books').insert({
          title,
          author: author || authorName,
          rating: rating || null,
          link: link || null,
          user_id: user.id,
        });
        if (error) throw error;
      } else if (contentType === 'article') {
        const { error } = await supabase.from('articles').insert({
          title,
          author: author || null,
          link: link || null,
          description: description || null,
          user_id: user.id,
        });
        if (error) throw error;
      }

      toast.success('created ✿');
      resetForm();
      setOpen(false);
      onCreated();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <button
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-50"
          title="compose"
        >
          <Plus size={20} />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-normal tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
            new entry
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
            <SelectTrigger className="border-border" style={{ fontFamily: 'var(--font-body)' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="essay">Essay</SelectItem>
              <SelectItem value="poetry">Poetry</SelectItem>
              <SelectItem value="quote">Quote</SelectItem>
              <SelectItem value="book">Book</SelectItem>
              <SelectItem value="article">Article</SelectItem>
            </SelectContent>
          </Select>

          {/* Essay / Poetry fields */}
          {(contentType === 'essay' || contentType === 'poetry') && (
            <>
              <Input
                placeholder="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-border bg-transparent"
                style={{ fontFamily: 'var(--font-serif)' }}
              />
              <Textarea
                placeholder={contentType === 'poetry' ? 'write your poem…' : 'write your essay…'}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border-border bg-transparent min-h-[200px]"
                style={{ fontFamily: 'var(--font-body)' }}
              />
            </>
          )}

          {/* Quote fields */}
          {contentType === 'quote' && (
            <>
              <Textarea
                placeholder="the quote…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="border-border bg-transparent min-h-[100px]"
                style={{ fontFamily: 'var(--font-serif)' }}
              />
              <Input
                placeholder="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="border-border bg-transparent"
                style={{ fontFamily: 'var(--font-body)' }}
              />
              <Input
                placeholder="source (optional)"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="border-border bg-transparent"
                style={{ fontFamily: 'var(--font-body)' }}
              />
              <Input
                placeholder="description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-border bg-transparent"
                style={{ fontFamily: 'var(--font-body)' }}
              />
              <Input
                placeholder="link (optional)"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="border-border bg-transparent"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </>
          )}

          {/* Book fields */}
          {contentType === 'book' && (
            <>
              <Input
                placeholder="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-border bg-transparent"
                style={{ fontFamily: 'var(--font-serif)' }}
              />
              <Input
                placeholder="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="border-border bg-transparent"
                style={{ fontFamily: 'var(--font-body)' }}
              />
              <div>
                <p className="text-xs text-muted-foreground mb-2" style={{ fontFamily: 'var(--font-body)' }}>rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRating(r === rating ? 0 : r)}
                      className={`text-lg transition-colors ${r <= rating ? 'text-foreground' : 'text-muted-foreground/30'}`}
                    >
                      ✿
                    </button>
                  ))}
                </div>
              </div>
              <Input
                placeholder="link (optional)"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="border-border bg-transparent"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </>
          )}

          {/* Article fields */}
          {contentType === 'article' && (
            <>
              <Input
                placeholder="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-border bg-transparent"
                style={{ fontFamily: 'var(--font-serif)' }}
              />
              <Input
                placeholder="author (optional)"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="border-border bg-transparent"
                style={{ fontFamily: 'var(--font-body)' }}
              />
              <Input
                placeholder="description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-border bg-transparent"
                style={{ fontFamily: 'var(--font-body)' }}
              />
              <Input
                placeholder="link (optional)"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="border-border bg-transparent"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
            style={{ fontFamily: 'var(--font-serif)', letterSpacing: '0.1em' }}
          >
            {loading ? 'saving…' : 'publish ✿'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComposeDialog;
