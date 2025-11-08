import { Beat } from '@/lib/types';

import { BeatDisc } from './beat-disc';

export const BeatCard = ({ beat }: { beat: Beat }) => {
  return (
    <div>
      <h3 className="font-satoshi font-bold text-xs tracking-tight mb-4 text-left">{beat.name}</h3>

      <BeatDisc image={beat.image} />

      <p className="font-satoshi font-bold text-xs tracking-tight mt-8 text-right">
        <span className=" font-medium ">type </span> {beat.type}
      </p>
      <h3 className="font-satoshi font-medium text-xs tracking-tight text-right text-black">
        {beat.bpm} bpm
      </h3>
    </div>
  );
};
