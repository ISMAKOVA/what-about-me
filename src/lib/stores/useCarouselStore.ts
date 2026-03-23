import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

export type CarouselStatus = 'idle' | 'loading' | 'ready' | 'error';

type CarouselState = {
  selectedItemId: string | null;
  hoveredItemId: string | null;
  isScrolling: boolean;
  status: CarouselStatus;

  setSelectedItem: (id: string | null) => void;
  setHoveredItem: (id: string | null) => void;
  setScrolling: (scrolling: boolean) => void;
  setStatus: (status: CarouselStatus) => void;
};

/**
 * Vanilla store — use this directly in imperative / non-React code
 * (Three.js effects, GSAP callbacks, etc.) via carouselStore.getState().
 */
export const carouselStore = createStore<CarouselState>((set) => ({
  selectedItemId: null,
  hoveredItemId: null,
  isScrolling: false,
  status: 'idle',

  setSelectedItem: (id) => set({ selectedItemId: id }),
  setHoveredItem: (id) => set({ hoveredItemId: id }),
  setScrolling: (scrolling) => set({ isScrolling: scrolling }),
  setStatus: (status) => set({ status }),
}));

/**
 * React hook — use this in components.
 * @example const selectedId = useCarouselStore((s) => s.selectedItemId);
 */
export const useCarouselStore = <T>(selector: (state: CarouselState) => T): T =>
  useStore(carouselStore, selector);
