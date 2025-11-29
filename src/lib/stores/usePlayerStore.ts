import { create } from 'zustand';

type PlayerState = {
  currentBeatId?: string | null;
  isPlaying: boolean;
  playBeat: (id: string) => void;
  pauseBeat: () => void;
  toggleBeat: (id: string) => void;
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentBeatId: null,
  isPlaying: false,
  playBeat: (id: string) => set(() => ({ currentBeatId: id, isPlaying: true })),
  pauseBeat: () => set({ isPlaying: false }),
  toggleBeat: (id: string) => {
    const s = get();
    if (s.currentBeatId === id) {
      set({ isPlaying: !s.isPlaying });
    } else {
      set({ currentBeatId: id, isPlaying: true });
    }
  },
}));
