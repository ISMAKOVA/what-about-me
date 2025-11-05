'use client';
import { useState } from 'react';

import { Grid, InfiniteGrid } from '@/components/grid';
import { Container } from '@/components/layout/container';
import { Navbar } from '@/components/layout/navbar';

export default function Home() {
  const [infiniteGrid, setInfiniteGrid] = useState(true);
  return (
    <>
      <Navbar>
        <button onClick={() => setInfiniteGrid(!infiniteGrid)}>
          {!infiniteGrid ? 'Infinite Grid' : 'Grid'}
        </button>
      </Navbar>
      <Container>{infiniteGrid ? <InfiniteGrid /> : <Grid />}</Container>
    </>
  );
}
