import { PropsWithChildren } from 'react';

import { cn } from '@/utils/cn';

type Props = {
  className?: string;
};

export const Container = ({ className, children }: PropsWithChildren<Props>) => {
  return (
    <main className={cn('w-screen h-screen overflow-hidden mx-4', className)}>{children}</main>
  );
};
