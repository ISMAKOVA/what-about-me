import { motion, useMotionValue, useSpring } from 'framer-motion';
import { MouseEvent, ReactNode, useCallback, useRef } from 'react';

export const Magnetic = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);

  const x = useSpring(mvX, { stiffness: 30, damping: 10, mass: 0.2 });
  const y = useSpring(mvY, { stiffness: 30, damping: 10, mass: 0.2 });

  const handleMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const { clientX, clientY } = e;
      const rect = ref.current!.getBoundingClientRect();

      const offsetX = clientX - (rect.left + rect.width / 2);
      const offsetY = clientY - (rect.top + rect.height / 2);
      const magnetStrength = 0.3;

      mvX.set(offsetX * magnetStrength);
      mvY.set(offsetY * magnetStrength);
    },
    [mvX, mvY],
  );

  const reset = () => {
    mvX.set(0);
    mvY.set(0);
  };

  return (
    <motion.div
      className="relative"
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x, y }} // smoother than animate={{ x, y }}
    >
      {children}
    </motion.div>
  );
};
