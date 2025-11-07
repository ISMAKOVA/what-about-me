import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';

import disk from '@/assets/disc_transparent.png';

export const BeatDisc = ({ image }: { image: string }) => {
  const discRef = useRef<HTMLDivElement>(null);
  const spinTween = useRef<gsap.core.Tween | null>(null);

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

  // safety cleanup
  useEffect(() => {
    return () => {
      spinTween.current?.kill();
      spinTween.current = null;
    };
  }, []);

  return (
    <div
      ref={discRef}
      onMouseEnter={() => spinTween.current?.play()}
      onMouseLeave={() => spinTween.current?.pause()}
      className="w-68 h-68 relative rounded-full overflow-hidden flex justify-center items-center bg-cover bg-center"
      style={{ backgroundImage: `url(${image})` }}
    >
      {/* disk on top (has transparent parts) */}
      <div
        className="absolute inset-0 z-20 rounded-full bg-cover bg-center"
        style={{ backgroundImage: `url(${disk.src || disk})` }}
      />

      {/* subtle grain overlay */}
      <div
        aria-hidden
        className="absolute inset-0 z-30 pointer-events-none"
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
