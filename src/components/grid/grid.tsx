import beats from '@/lib/beats';

import { BeatCard } from '../ui/beat-card';

export const Grid = () => {
  return (
    <div className="overflow-y-scroll h-full py-40">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-40 place-content-center place-items-center">
        {beats.map((b) => (
          <BeatCard key={b.name} beat={b} />
        ))}
      </div>
    </div>
  );
};
