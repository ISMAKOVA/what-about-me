import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import React, { useEffect, useRef, useState } from 'react';

import disk from '@/assets/disc_transparent.png';
import { cn } from '@/utils/cn';
import { useCursorStick } from './cursor';

export const BeatDisc = ({ image, className }: { image: string; className?: string }) => {
  const discRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const spinTween = useRef<gsap.core.Tween | null>(null);
  const [cursorText, setCursorText] = useState('play');

  useCursorStick(cursorRef, { magnet: 0.1, text: cursorText });

  useGSAP(() => {
    const disc = discRef.current;

    spinTween.current = gsap.to(disc, {
      rotation: '+=360',
      duration: 1.2,
      repeat: -1,
      ease: 'none',
      paused: true,
    });
  });

  useEffect(() => {
    return () => {
      spinTween.current?.kill();
      spinTween.current = null;
    };
  }, []);

  const toggleSpin = () => {
    const t = spinTween.current;
    if (!t) return;
    if (t.paused()) {
      t.play();
      setCursorText('pause'); // TODO: Use Zustand to manage cursor state globally
    } else {
      t.pause();
      setCursorText('play');
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSpin();
    }
  };

  return (
    <div
      ref={discRef}
      role="button"
      tabIndex={0}
      onClick={toggleSpin}
      onKeyDown={onKey}
      className={cn(
        'w-64 h-64 md:w-80 md:h-80 relative rounded-full  flex justify-center items-center bg-cover bg-center',
        className,
      )}
      style={{ backgroundImage: `url(${image})` }}
    >
      {/* borders for stick cursor */}
      <div
        ref={cursorRef}
        className="absolute top-0 left-0 z-2 w-full h-full rounded-full hover:scale-200"
      ></div>

      {/* disk on top (has transparent parts) */}
      <div
        className="absolute inset-0 z-0 rounded-full bg-cover bg-center"
        style={{ backgroundImage: `url(${disk.src || disk})` }}
      />

      {/* subtle grain overlay */}
      <div
        aria-hidden
        className="absolute inset-0 z-1 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(0,0,0,0.025) 1px, rgba(0,0,0,0) 1px)',
          backgroundSize: '3px 3px',
          mixBlendMode: 'overlay',
          opacity: 0.7,
        }}
      />
    </div>
  );
};
