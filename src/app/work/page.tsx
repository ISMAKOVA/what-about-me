'use client';
import { Globe, Grid2x2 } from 'lucide-react';
import { useRef, useState } from 'react';

import { Grid, InfiniteGrid } from '@/components/grid';
import { Navbar } from '@/components/layout/navbar';
import { PAGES_WORK } from '@/lib/constants';

export default function Home() {
  const [infiniteGrid, setInfiniteGrid] = useState(false);
  const stickyElement = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <Navbar items={PAGES_WORK}>
        <div className="col-start-4 relative">
          TODO: oscilloscope
          <span
            ref={stickyElement}
            className="absolute top-0 left-0 w-full h-full hover:scale-250"
          ></span>
        </div>
        <button
          onClick={() => setInfiniteGrid(!infiniteGrid)}
          className="cursor-pointer relative flex-right"
        >
          {infiniteGrid ? <Grid2x2 /> : <Globe />}
        </button>
      </Navbar>

      {infiniteGrid ? <InfiniteGrid /> : <Grid />}

      {/* <Footer /> */}
    </>
  );
}
