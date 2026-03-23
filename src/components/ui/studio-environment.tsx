'use client';

import React, { useId } from 'react';

interface StudioEnvironmentProps {
  lightOrigin?: 'top-left' | 'top-right';
  className?: string;
}

export function StudioEnvironment({
  lightOrigin = 'top-left',
  className,
}: StudioEnvironmentProps): React.JSX.Element {
  const uid = useId();
  const filterId = `studio-grain-${uid.replace(/:/g, '')}`;

  const isRight = lightOrigin === 'top-right';

  const plasterGradient = `radial-gradient(ellipse 120% 80% at ${isRight ? '75%' : '25%'} 15%, rgba(230,230,230,0.25) 0%, transparent 60%)`;

  const lightGradient = `radial-gradient(ellipse 85% 65% at ${isRight ? '90%' : '10%'} -5%, rgba(255,255,255,0.6) 0%, transparent 60%)`;

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{ position: 'absolute', inset: 0, isolation: 'isolate', overflow: 'hidden' }}
    >
      {/* Layer 1 — Wall base */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: '#ffffff' }} />

      {/* Layer 2 — Plaster gradient */}
      <div style={{ position: 'absolute', inset: 0, background: plasterGradient }} />

      {/* Layer 3 — Directional light (animated) */}
      <div
        className="studio-light-layer"
        style={{ position: 'absolute', inset: 0, background: lightGradient }}
      />

      {/* Layer 4 — SVG grain filter definition */}
      <svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter
            id={filterId}
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.45"
              numOctaves={4}
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
            <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" />
          </filter>
        </defs>
      </svg>

      {/* Layer 5 — Grain overlay */}
      <div
        style={{
          position: 'absolute',
          inset: '-10%',
          width: '120%',
          height: '120%',
          filter: `url(#${filterId})`,
          opacity: 0.1,
          backgroundColor: '#a0a0a0',
          mixBlendMode: 'multiply' as React.CSSProperties['mixBlendMode'],
        }}
      />

      {/* Layer 6 — Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 38%, rgba(40,40,40,0.13) 100%)',
        }}
      />
    </div>
  );
}
