import { cn } from '@/utils/cn';
import { TransitionLink } from '../ui';

export const Footer = ({ className }: { className?: string }) => {
  return (
    <footer className={cn('w-full py-6 text-sm text-muted-foreground', className)}>
      <div className="mx-auto px-4 flex items-center justify-between">
        <span>&copy; {new Date().getFullYear()} What about me?</span>
        <nav aria-label="Footer">
          <ul className="flex gap-4">
            <li>
              <TransitionLink href="/privacy">Privacy Policy</TransitionLink>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
