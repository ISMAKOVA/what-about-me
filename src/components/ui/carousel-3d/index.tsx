'use client';

import dynamic from 'next/dynamic';
import { FC } from 'react';

// Scene contains Canvas + Three.js — must not run on the server
const Scene = dynamic(() => import('./scene').then((m) => m.default), { ssr: false });

interface Carousel3DProps {
  className?: string;
}

export const Carousel3D: FC<Carousel3DProps> = ({ className }) => (
  <div className={`relative w-full h-full overflow-hidden ${className ?? ''}`}>
    <Scene />
  </div>
);
