'use client';

import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';

import { PAGES } from '@/lib/constants';
import { cn } from '@/utils/cn';

import { TransitionLink } from '../ui/transition-link';

type Props = {
  className?: string;
};

export const Navbar = ({ className, children }: PropsWithChildren<Props>) => {
  const pathname = usePathname();

  const filteredPages = PAGES.filter((page) => page.link !== pathname);

  return (
    <nav className={cn('fixed  h-12 w-screen font-cabinet p-4 z-10', className)}>
      <ul className="grid grid-cols-4 font-bold items-center">
        {filteredPages.map((page, index) => (
          <li key={index} className={`col-start-${index === 0 ? 0 : 4}`}>
            <TransitionLink href={page.link} className="flex justify-start gap-2" underline>
              {page.name}
            </TransitionLink>
          </li>
        ))}

        {children}
      </ul>
    </nav>
  );
};
