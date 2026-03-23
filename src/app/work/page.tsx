'use client';
import { Globe, Grid2x2 } from 'lucide-react';
import { useState } from 'react';

import { Grid, InfiniteGrid } from '@/components/grid';
import { Navbar } from '@/components/layout/navbar';
import { PAGES_WORK } from '@/lib/constants';

export default function Home() {
  const [infiniteGrid, setInfiniteGrid] = useState(false);

  return (
    <>
      <Navbar items={PAGES_WORK}>
        {/* <li className="col-start-3 col-end-5 h-12">
          <AudioPlayer />
        </li> */}
        <button
          onClick={() => setInfiniteGrid(!infiniteGrid)}
          className="col-start-5 cursor-pointer relative flex-right"
        >
          {infiniteGrid ? <Grid2x2 /> : <Globe />}
        </button>
      </Navbar>

      {infiniteGrid ? <InfiniteGrid /> : <Grid />}

      {/* <Footer /> */}
    </>
  );
}
