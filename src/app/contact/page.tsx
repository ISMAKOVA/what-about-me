import { TransitionLink } from '@/components/ui/transition-link';

export default function Home() {
  return (
    <main className="h-screen flex justify-center items-center gap-2">
      <h1>Contact Page</h1>
      <TransitionLink href="/"> Home </TransitionLink>
    </main>
  );
}
