'use client';
import { MotionValue, useMotionValue } from 'framer-motion';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

export type CursorState = {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  mode: 'default' | 'sticky';
  stickyRef: HTMLElement | null;
  stickyConfig: {
    text?: string;
    magnet?: number;
    rotate?: boolean;
  } | null;
  setSticky: (el: HTMLElement | null, config?: CursorState['stickyConfig']) => void;
  updateStickyConfig: (config: CursorState['stickyConfig']) => void;
};

const CursorContext = createContext<CursorState | null>(null);

export function CursorProvider({ children }: { children: ReactNode }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const [mode, setMode] = useState<CursorState['mode']>('default');
  const [stickyRef, setStickyRef] = useState<HTMLElement | null>(null);
  const [stickyConfig, setStickyConfig] = useState<CursorState['stickyConfig']>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, [mouseX, mouseY]);

  const setSticky = (el: HTMLElement | null, config: CursorState['stickyConfig'] = {}) => {
    if (el) {
      setMode('sticky');
      setStickyRef(el);
      setStickyConfig(config);
    } else {
      setMode('default');
      setStickyRef(null);
      setStickyConfig(null);
    }
  };

  const updateStickyConfig = useCallback((cfg: CursorState['stickyConfig']) => {
    setStickyConfig((prev) => {
      if (
        prev?.text === cfg?.text &&
        prev?.magnet === cfg?.magnet &&
        prev?.rotate === cfg?.rotate
      ) {
        return prev;
      }
      return cfg;
    });
  }, []);

  return (
    <CursorContext.Provider
      value={{ mouseX, mouseY, mode, stickyRef, stickyConfig, updateStickyConfig, setSticky }}
    >
      {children}
    </CursorContext.Provider>
  );
}

export const useCursor = () => useContext(CursorContext)!;
