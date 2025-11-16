'use client';
import beats from '@/lib/beats';
import { gsap } from '@/lib/gsap';
import { Beat } from '@/lib/types';
import { Draggable } from 'gsap/Draggable';
import { useEffect, useRef } from 'react';
import { Container } from '../layout';
import { BeatDisc } from '../ui';

type Cell = { x: number; y: number; image: string };

const makeCells = ({
  beats,
  size,
  gap = 20,
}: {
  beats: Beat[];
  size: number;
  gap?: number;
}): { cells: Cell[]; w: number; h: number } => {
  const beatsLength = beats?.length ?? 0;
  const half = Math.ceil(beatsLength / 2);

  const rowOffset = gap * 2;

  const row1: Cell[] = [];
  const row2: Cell[] = [];

  for (let i = 0; i < half; i++) {
    row1.push({ x: i * (size + gap), y: 0, image: beats[i].image });
  }
  for (let j = 0; j < beatsLength - half; j++) {
    row2.push({ x: j * (size + gap) + rowOffset, y: size + gap, image: beats[half + j].image });
  }

  const cells: Cell[] = [...row1, ...row2];

  const cols = Math.max(row1.length, row2.length);
  const cellW = cols * (size + gap);
  const cellH = (size + gap) * 2;
  return { cells, w: cellW, h: cellH };
};

export function InfiniteGrid() {
  const { cells, w, h } = makeCells({ beats, size: 320, gap: 10 });
  const worldRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(Draggable);
    const world = worldRef.current!;
    const wrapX = gsap.utils.wrap(-w, 0);
    const wrapY = gsap.utils.wrap(-h, 0);

    const instance = Draggable.create(world, {
      type: 'x,y',
      inertia: true,
      onDrag() {
        const nx = wrapX(this.x);
        const ny = wrapY(this.y);
        gsap.set(world, { x: nx, y: ny });
      },
      onThrowUpdate() {
        const nx = wrapX(this.x);
        const ny = wrapY(this.y);
        gsap.set(world, { x: nx, y: ny });
      },
    });

    gsap.set(world, { x: -w / 2, y: -h / 3 });

    return () => {
      const d = instance[0];
      if (d && typeof d.kill === 'function') d.kill();
    };
  }, [w, h]);

  return (
    <Container>
      <div className="w-full h-full flex justify-center items-center relative z-0">
        <div
          ref={worldRef}
          className="relative"
          style={{ left: 0, top: 0, touchAction: 'none', cursor: 'grab' }}
        >
          {[-1, 0, 1].map((oy) => (
            <div key={oy} style={{ position: 'absolute', left: 0, top: oy * h }}>
              {[-1, 0, 1].map((ox) => (
                <div
                  key={ox}
                  style={{
                    position: 'absolute',
                    left: ox * w,
                    top: 0,
                    width: w,
                    height: h,
                    boxSizing: 'border-box',
                    // border: '1px dashed rgba(0,0,0,0.12)',
                    // background: 'rgba(255,255,255,0.6)',
                  }}
                >
                  {cells.map((c, i) => (
                    <div key={i} className="absolute" style={{ left: c.x, top: c.y }}>
                      <BeatDisc image={c.image} className="w-64 h-64 md:w-40 md:h-40 m-4" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
