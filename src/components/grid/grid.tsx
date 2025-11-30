import beats from '@/lib/beats';

import { BeatCard } from '../ui/beat-card';

export const Grid = () => {
  return (
    <div className="w-full h-full py-40 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-y-40 place-content-center place-items-center gap-20">
        {/* TODO: Create iphone like player with glassmorphism */}
        <h2 className="text-7xl col-span-2 font-satoshi">...yo it&apos;s me</h2>
        {beats.map((b, i) => (
          <BeatCard key={b.title + i} beat={b} number={i + 1} />
        ))}
      </div>
    </div>
  );
};
