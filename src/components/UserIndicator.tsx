import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const getAuthorColor = (email: string | null) => {
  if (!email) return undefined;
  const lower = email.toLowerCase();
  if (lower.includes('isha')) return 'hsl(var(--author-isha))';
  if (lower.includes('rebecca') || lower.includes('rjoseph')) return 'hsl(var(--author-rebecca))';
  return undefined;
};

const getDisplayName = (email: string | null) => {
  if (!email) return null;
  const lower = email.toLowerCase();
  if (lower.includes('isha')) return 'isha';
  if (lower.includes('rebecca') || lower.includes('rjoseph')) return 'rebecca';
  return email.split('@')[0];
};

const UserIndicator = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <button
        onClick={() => navigate('/auth')}
        className="text-muted-foreground hover:text-foreground text-xs transition-colors"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        sign in →
      </button>
    );
  }

  const displayName = getDisplayName(user.email ?? null);
  const color = getAuthorColor(user.email ?? null);

  return (
    <div className="flex items-center gap-3">
      <span
        className="text-xs font-medium"
        style={{ fontFamily: 'var(--font-mono)', color: color || 'hsl(var(--foreground))' }}
      >
        ✿ {displayName}
      </span>
      <button
        onClick={async () => {
          await signOut();
          navigate('/');
        }}
        className="text-muted-foreground hover:text-foreground transition-colors"
        title="sign out"
      >
        <LogOut size={14} />
      </button>
    </div>
  );
};

export default UserIndicator;
