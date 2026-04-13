import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import roadImg from '@/assets/road.png';
import chickenImg from '@/assets/chicken.png';

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
  const [phase, setPhase] = useState<'question' | 'answer'>('question');

  const question = useTypewriter('why did the chicken cross the road?', 45, phase === 'question');
  const answer = useTypewriter("to get to rebecca and isha's margin notes", 45, phase === 'answer');

  const handleTap = () => {
    if (phase === 'question' && question.done) setPhase('answer');
    else if (phase === 'answer' && answer.done) navigate('/home');
  };

  return (
    <div
      onClick={handleTap}
      className="min-h-screen bg-background flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden relative px-6"
    >
      {/* Text above the drawing */}
      <div className="mb-6 text-center min-h-[4rem]">

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
              <p className="text-muted-foreground text-xs mt-4 italic animate-pulse animate-fade-in" style={{ fontFamily: 'var(--font-body)' }}>
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
              <p className="text-muted-foreground text-xs mt-4 italic animate-pulse animate-fade-in" style={{ fontFamily: 'var(--font-body)' }}>
                tap to enter ✿
              </p>
            )}
          </>
        )}
      </div>

      {/* Road + Chicken illustration */}
      <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center">
        <img
          src={roadImg}
          alt="A whimsical hand-drawn road"
          className="w-full max-w-lg opacity-80"
          width={1200}
          height={800}
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <img
            src={chickenImg}
            alt="A cute hand-drawn chicken"
            className="w-24 md:w-32 hover:animate-wiggle"
            width={512}
            height={512}
          />
        </div>
      </div>
    </div>
  );
};

export default Splash;
