'use client';

import { Navbar } from './navbar/navbar';

export const Hero = () => {
  return (
    <section id="hero">
      <Navbar />
      <div className="font-cabinet flex h-screen items-center justify-end">
        <h1 className="title">
          <>
            <span>WHAT</span> <span>ABOUT</span> <span>ME?</span>
          </>
        </h1>
      </div>
    </section>
  );
};
