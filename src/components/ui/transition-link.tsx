'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';

import { animatePageOut } from '@/utils/animations';
import { cn } from '@/utils/cn';

interface Props {
  href: string;
  children: ReactNode;
  className?: string;
}
export const TransitionLink = ({ href, className, children }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    if (pathname !== href) {
      animatePageOut(href, router);
    }
  };

  return (
    <button onClick={handleClick} className={cn('flex gap-2 cursor-pointer', className)}>
      {children}
    </button>
  );
};
