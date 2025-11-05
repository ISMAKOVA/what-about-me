import { Container } from '@/components/layout/container';
import { Navbar } from '@/components/layout/navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <Container>
        <div className="h-full flex justify-center items-center gap-2">
          <h1>Contact Page</h1>
        </div>
      </Container>
    </>
  );
}
