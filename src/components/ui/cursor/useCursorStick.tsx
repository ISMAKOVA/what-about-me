'use client';
import { RefObject, useEffect } from 'react';
import { CursorState, useCursor } from './provider';

export function useCursorStick(
  ref: RefObject<HTMLElement | null>,
  config?: CursorState['stickyConfig'],
) {
  const { setSticky, updateStickyConfig, stickyRef } = useCursor();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleEnter = () => setSticky(el, config);
    const handleLeave = () => setSticky(null);

    el.addEventListener('mouseenter', handleEnter);
    el.addEventListener('mouseleave', handleLeave);

    return () => {
      el.removeEventListener('mouseenter', handleEnter);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [config, ref, setSticky]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (stickyRef === el) {
      updateStickyConfig({ ...config });
    }
  }, [config, ref, stickyRef, updateStickyConfig]);
}
