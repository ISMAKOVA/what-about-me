'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';

import { animatePageOut } from '@/utils/animations';
import { cn } from '@/utils/cn';

interface Props {
  href: string;
  children: ReactNode;
  className?: string;
  underline?: boolean;
}
export const TransitionLink = ({ href, className, children, underline = false }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const [hover, setHover] = useState(false);

  const handleClick = () => {
    if (pathname !== href) {
      animatePageOut(href, router);
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn('relative flex gap-2 cursor-pointer', className)}
    >
      {children}

      {underline && (
        <span
          aria-hidden
          className={cn(
            'absolute left-0 bottom-0 w-full h-[1.5px] bg-[var(--foreground)] transform transition-transform duration-400 ease-in-out',
            hover ? 'origin-left scale-x-100' : 'origin-right scale-x-0 delay-75',
          )}
        />
      )}
    </button>
  );
};
