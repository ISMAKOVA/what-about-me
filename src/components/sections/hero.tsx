'use client';

import { Carousel3D, StudioEnvironment } from '../ui';

export const Hero = () => {
  return (
    <section id="hero">
      {/* Logo — fixed at top-centre, always above the carousel */}
      <div
        className="font-cabinet fixed top-6 left-1/2 -translate-x-1/2 z-50
                   text-sm font-black tracking-[0.1em] select-none pointer-events-none"
      >
        YODANIK
      </div>

      <div className="font-cabinet relative h-screen">
        <StudioEnvironment lightOrigin="top-left" className="absolute inset-0" />
        <Carousel3D className="absolute inset-0" />
      </div>
    </section>
  );
};
