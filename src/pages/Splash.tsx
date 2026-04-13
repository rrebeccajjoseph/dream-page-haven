import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Splash = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'walking' | 'question' | 'answer'>('walking');
  const [chickenX, setChickenX] = useState(-10);

  // Animate chicken walking across
  useEffect(() => {
    if (phase !== 'walking') return;
    const interval = setInterval(() => {
      setChickenX((prev) => {
        if (prev >= 110) {
          clearInterval(interval);
          setTimeout(() => setPhase('question'), 400);
          return prev;
        }
        return prev + 0.8;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [phase]);

  const handleTap = () => {
    if (phase === 'question') {
      setPhase('answer');
    } else if (phase === 'answer') {
      navigate('/auth');
    }
  };

  return (
    <div
      onClick={handleTap}
      className="min-h-screen bg-background flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden relative"
    >
      {/* Road */}
      <div className="w-full absolute top-1/2 -translate-y-1/2">
        <div className="h-32 bg-muted/50 border-t border-b border-border relative">
          {/* Road dashes */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full flex gap-8 px-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-12 h-1 bg-border rounded flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>

      {/* Chicken */}
      {phase === 'walking' && (
        <div
          className="absolute text-6xl md:text-8xl transition-none z-10"
          style={{
            left: `${chickenX}%`,
            top: '50%',
            transform: 'translateY(-80%)',
          }}
        >
          🐔
        </div>
      )}

      {/* Question phase */}
      {phase === 'question' && (
        <div className="z-10 text-center px-6 animate-fade-in">
          <p
            className="text-2xl md:text-4xl font-light tracking-wide leading-relaxed"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            why did the chicken cross the road?
          </p>
          <p className="text-muted-foreground text-sm mt-8 italic animate-pulse" style={{ fontFamily: 'var(--font-body)' }}>
            tap to find out
          </p>
        </div>
      )}

      {/* Answer phase */}
      {phase === 'answer' && (
        <div className="z-10 text-center px-6 animate-fade-in">
          <p
            className="text-2xl md:text-4xl font-light tracking-wide leading-relaxed"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            to get to rebecca and isha's margin notes
          </p>
          <p className="text-muted-foreground text-sm mt-8 italic animate-pulse" style={{ fontFamily: 'var(--font-body)' }}>
            tap to enter ✿
          </p>
        </div>
      )}
    </div>
  );
};

export default Splash;
