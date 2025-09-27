'use client';

import { useGSAP } from '@gsap/react';
import gsap, { SplitText } from 'gsap/all';
import { MoveLeft, MoveRight } from 'lucide-react';

import { Navbar } from './navbar/navbar';

export const Hero = () => {
  useGSAP(() => {
    const titleSplit = new SplitText('.title', { type: 'lines' });

    gsap.from(titleSplit.lines, {
      opacity: 0,
      yPercent: 100,
      duration: 1.8,
      ease: 'expo.out',
      stagger: 0.06,
    });
  }, []);

  return (
    <section id="hero">
      <Navbar />
      <div className="font-cabinet flex h-screen items-center justify-end">
        <h1 className="title w-2/3 overflow-hidden">WHAT ABOUT ME?</h1>
      </div>
    </section>
  );
};
