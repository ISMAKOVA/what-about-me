'use client';

import { ensureGsapPlugins } from '@/lib/gsap';
import { PropsWithChildren, useEffect } from 'react';

export default function GsapProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    ensureGsapPlugins();
  }, []);
  return <>{children}</>;
}
