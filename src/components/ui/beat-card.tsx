import { Beat } from '@/lib/types';

import { BeatDisc } from './beat-disc';
import { Magnetic } from './magnetic';

export const BeatCard = ({ number, beat }: { number: number; beat: Beat }) => {
  return (
    <div className="w-full h-full flex flex-col justify-between items-center">
      <div className="w-full self-start text-left text-xs">
        <h3 className="font-satoshi font-bold tracking-tight capitalize">{beat.name}</h3>
        <p className="w-2/3 mt-1 font-satoshi font-medium  lowercase">
          {beat.type} <span className="italic">type</span>
        </p>
      </div>
      <Magnetic>
        <BeatDisc image={beat.image} className="w-64 h-64 md:w-40 md:h-40 m-4" />
      </Magnetic>

      <p className="font-satoshi font-bold self-end text-xs">
        {number < 10 ? '0' : ''}
        {number}
      </p>

      {/* TODO: Show BPM on cursor cover */}
      {/*
      <h3 className="font-satoshi font-medium text-xs tracking-tight text-right text-black self-end">
        {beat.bpm} bpm
      </h3> */}
    </div>
  );
};
