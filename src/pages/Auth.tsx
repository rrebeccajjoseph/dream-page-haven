import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUp(email, password, displayName);
        toast.success('Check your email to confirm your account');
      } else {
        await signIn(email, password);
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-light tracking-wide mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            ✿ Welcome
          </h1>
          <p className="text-muted-foreground italic" style={{ fontFamily: 'var(--font-body)' }}>
            a quiet place for words
          </p>
          <div className="ornament mt-4" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <Input
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-card border-border"
              style={{ fontFamily: 'var(--font-body)' }}
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-card border-border"
            style={{ fontFamily: 'var(--font-body)' }}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-card border-border"
            style={{ fontFamily: 'var(--font-body)' }}
          />
          <Button type="submit" className="w-full" style={{ fontFamily: 'var(--font-serif)', letterSpacing: '0.1em' }}>
            {isSignUp ? 'Create Account' : 'Enter'}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsSignUp(!isSignUp)} className="underline text-foreground hover:text-primary">
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
