import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="font-cabinet text-right text-[clamp(6rem,20vw,19rem)] leading-[1] font-black">
        404
      </h1>
      <p className="font-cabinet absolute bottom-10 text-center text-sm font-medium">
        Page Not Found.{' '}
        <Link href="/" className="font-bold hover:underline">
          Go back home
        </Link>
      </p>
    </main>
  );
}
