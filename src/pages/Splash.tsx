import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import roadImg from '@/assets/road.png';
import chickenImg from '@/assets/chicken.png';

const Splash = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'idle' | 'question' | 'answer'>('idle');

  const handleTap = () => {
    if (phase === 'idle') {
      setPhase('question');
    } else if (phase === 'question') {
      setPhase('answer');
    } else if (phase === 'answer') {
      navigate('/home');
    }
  };

  return (
    <div
      onClick={handleTap}
      className="min-h-screen bg-background flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden relative px-6"
    >
      {/* Road illustration */}
      <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center">
        <img
          src={roadImg}
          alt="A whimsical hand-drawn road"
          className="w-full max-w-lg opacity-80"
          width={1200}
          height={800}
        />

        {/* Chicken sitting on the road */}
        <img
          src={chickenImg}
          alt="A cute hand-drawn chicken"
          className="w-24 md:w-32 absolute bottom-4 left-1/2 -translate-x-1/2"
          width={512}
          height={512}
        />
      </div>

      {/* Text */}
      <div className="mt-8 text-center animate-fade-in">
        {phase === 'idle' && (
          <p className="text-muted-foreground text-sm italic animate-pulse" style={{ fontFamily: 'var(--font-body)' }}>
            tap
          </p>
        )}

        {phase === 'question' && (
          <>
            <p
              className="text-xl md:text-3xl font-light tracking-wide leading-relaxed animate-fade-in"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              why did the chicken cross the road?
            </p>
            <p className="text-muted-foreground text-sm mt-6 italic animate-pulse" style={{ fontFamily: 'var(--font-body)' }}>
              tap to find out
            </p>
          </>
        )}

        {phase === 'answer' && (
          <>
            <p
              className="text-xl md:text-3xl font-light tracking-wide leading-relaxed animate-fade-in"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              to get to rebecca and isha's margin notes
            </p>
            <p className="text-muted-foreground text-sm mt-6 italic animate-pulse" style={{ fontFamily: 'var(--font-body)' }}>
              tap to enter ✿
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Splash;
