'use client';
import {
  animate,
  motion,
  transform,
  useAnimationFrame,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useCursor } from './provider';

function clampToRect(rect: DOMRect, x: number, y: number) {
  return {
    x: Math.min(Math.max(x, rect.left), rect.right),
    y: Math.min(Math.max(y, rect.top), rect.bottom),
  };
}

export function StickyCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);

  const { mouseX, mouseY, mode, stickyRef, stickyConfig } = useCursor();
  const size = mode === 'sticky' ? 40 : 16;

  const smoothedX = useSpring(mouseX, { mass: 0.5, damping: 30, stiffness: 300 });
  const smoothedY = useSpring(mouseY, { mass: 0.5, damping: 30, stiffness: 300 });

  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);

  const textRef = useRef<HTMLSpanElement | null>(null);
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    if (mode === 'sticky' && stickyConfig?.text && textRef.current) {
      setTextWidth(textRef.current.offsetWidth);
    }
  }, [stickyConfig?.text, mode]);

  useAnimationFrame(() => {
    if (mode !== 'sticky' || !stickyRef) {
      animate(scaleX, 1, { duration: 0.2 });
      animate(scaleY, 1, { duration: 0.2 });
      return;
    }

    const update = () => {
      const rect = stickyRef.getBoundingClientRect();

      const nearest = clampToRect(rect, mouseX.get(), mouseY.get());

      const dx = mouseX.get() - nearest.x;
      const dy = mouseY.get() - nearest.y;

      const magnet = stickyConfig?.magnet || 0.15;

      smoothedX.set(nearest.x + dx * magnet - size / 2);
      smoothedY.set(nearest.y + dy * magnet - size / 2);

      const absDist = Math.max(Math.abs(dx), Math.abs(dy));
      scaleX.set(transform(absDist, [0, rect.width], [1, 1.1]));
      scaleY.set(transform(absDist, [0, rect.height], [1, 0.9]));

      if (stickyConfig?.rotate && cursorRef.current) {
        const angle = Math.atan2(dy, dx);
        cursorRef.current.style.rotate = `${angle}rad`;
      }
    };

    update();
  });

  const horizontalPadding = 16;
  const pillHeight = 28;
  const pillWidth = textWidth + horizontalPadding * 2;

  return (
    <motion.div
      ref={cursorRef}
      className="fixed top-0 left-0 rounded-full pointer-events-none bg-black/70 text-white flex justify-center items-center"
      style={{
        left: smoothedX,
        top: smoothedY,
        scaleX,
        scaleY,

        width: mode === 'sticky' && stickyConfig?.text ? pillWidth : size,
        height: mode === 'sticky' && stickyConfig?.text ? pillHeight : size,
      }}
    >
      <span ref={textRef} className="absolute opacity-0 pointer-events-none whitespace-nowrap">
        {stickyConfig?.text}
      </span>

      {mode === 'sticky' && stickyConfig?.text ? stickyConfig.text : ''}
    </motion.div>
  );
}
