import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import roadImg from '@/assets/road.png';
import chickenImg from '@/assets/chicken.png';
import eggImg from '@/assets/egg.png';

const useTypewriter = (text: string, speed = 50, start = false) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!start) { setDisplayed(''); setDone(false); return; }
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(interval); setDone(true); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, start]);

  return { displayed, done };
};

const Splash = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [phase, setPhase] = useState<'loading' | 'question' | 'answer'>('loading');
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const allLoaded = imagesLoaded >= 2;

  useEffect(() => {
    if (allLoaded) {
      const timer = setTimeout(() => setPhase('question'), 400);
      return () => clearTimeout(timer);
    }
  }, [allLoaded]);

  const question = useTypewriter('why did the chicken cross the road?', 45, phase === 'question');
  const answer = useTypewriter("to get to rebecca and isha's margin notes", 45, phase === 'answer');

  const handleTap = (e: React.MouseEvent) => {
    if (showLogin) return;
    if (phase === 'question' && question.done) setPhase('answer');
    else if (phase === 'answer' && answer.done) navigate('/home');
  };

  const handleEggClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowLogin(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      toast.success('welcome in ✿');
      navigate('/home');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const onImageLoad = () => setImagesLoaded((n) => n + 1);

  return (
    <div
      onClick={handleTap}
      className="min-h-screen bg-background flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden relative px-6"
    >
      {/* Text above the drawing */}
      <div className="mb-2 text-center min-h-[3rem]">
        {phase === 'question' && (
          <>
            <p
              className="text-base md:text-xl font-light tracking-wide leading-relaxed"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {question.displayed}
              {!question.done && <span className="animate-pulse">|</span>}
            </p>
            {question.done && (
              <p className="text-muted-foreground text-xs mt-3 italic animate-pulse animate-fade-in" style={{ fontFamily: 'var(--font-body)' }}>
                tap to find out
              </p>
            )}
          </>
        )}

        {phase === 'answer' && (
          <>
            <p
              className="text-base md:text-xl font-light tracking-wide leading-relaxed"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {answer.displayed}
              {!answer.done && <span className="animate-pulse">|</span>}
            </p>
            {answer.done && (
              <p className="text-muted-foreground text-xs mt-3 italic animate-pulse animate-fade-in" style={{ fontFamily: 'var(--font-body)' }}>
                tap to enter ✿
              </p>
            )}
          </>
        )}
      </div>

      {/* Road + Chicken + Egg illustration */}
      <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center">
        <img
          src={roadImg}
          alt="A whimsical hand-drawn road"
          className="w-full max-w-lg opacity-80"
          width={1200}
          height={800}
          onLoad={onImageLoad}
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          {/* Egg behind the chicken */}
          <img
            src={eggImg}
            alt=""
            className="w-10 md:w-14 absolute -bottom-1 left-1/2 -translate-x-1/2 translate-x-6 opacity-60 hover:opacity-100 hover:scale-110 transition-all cursor-pointer z-0"
            width={512}
            height={512}
            onClick={handleEggClick}
            loading="lazy"
          />
          {/* Chicken in front */}
          <img
            src={chickenImg}
            alt="A cute hand-drawn chicken"
            className="w-24 md:w-32 hover:animate-wiggle relative z-10"
            width={512}
            height={512}
            onLoad={onImageLoad}
          />
        </div>
      </div>

      {/* Login popup */}
      {showLogin && (
        <div
          className="fixed inset-0 bg-foreground/20 flex items-center justify-center z-50 px-6"
          onClick={(e) => { e.stopPropagation(); setShowLogin(false); }}
        >
          <div
            className="bg-card border border-border rounded-lg p-8 w-full max-w-sm animate-fade-in shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-light text-center mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
              log in
            </h2>
            <p className="text-xs text-muted-foreground text-center italic mb-6" style={{ fontFamily: 'var(--font-body)' }}>
              if you can guess our password feel free to publish your work :)
            </p>
            <form onSubmit={handleLogin} className="space-y-3">
              <Input
                type="email"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background border-border text-sm"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              <Input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background border-border text-sm"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              <Button type="submit" className="w-full text-sm" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
                enter
              </Button>
            </form>
            <button
              onClick={() => setShowLogin(false)}
              className="w-full text-center mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              never mind
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Splash;
