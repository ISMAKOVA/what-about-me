import { Container } from '@/components/layout/container';
import { Navbar } from '@/components/layout/navbar';
import { PAGES_CONTACT } from '@/lib/constants';

export default function Home() {
  return (
    <>
      <Navbar items={PAGES_CONTACT} />
      <Container>
        <div className="h-full flex justify-center items-center gap-2">
          <h1>Contact Page</h1>
        </div>
      </Container>
    </>
  );
}
