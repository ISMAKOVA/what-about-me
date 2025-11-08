'use client';
import { Globe, Grid2x2 } from 'lucide-react';
import { useState } from 'react';

import { Grid, InfiniteGrid } from '@/components/grid';
import { Container } from '@/components/layout/container';
import { Navbar } from '@/components/layout/navbar';
import { PAGES_WORK } from '@/lib/constants';

export default function Home() {
  const [infiniteGrid, setInfiniteGrid] = useState(true);

  return (
    <>
      <Navbar items={PAGES_WORK}>
        <div className="flex-right">TODO: oscilloscope</div>
        <button
          onClick={() => setInfiniteGrid(!infiniteGrid)}
          className="cursor-pointer relative flex-right"
        >
          {infiniteGrid ? <Grid2x2 /> : <Globe />}
        </button>
      </Navbar>
      <Container>{infiniteGrid ? <InfiniteGrid /> : <Grid />}</Container>
    </>
  );
}
