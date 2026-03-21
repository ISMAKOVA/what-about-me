export interface CarouselItemConfig {
  id: string;
  label: string;
  modelPath: string; // path to .glb file served from /public, e.g. '/models/floppy.glb'
  /** Optional scale multiplier applied on top of the global ITEM_HEIGHT_FRACTION. Default: 1. */
  scale?: number;
}

export const CAROUSEL_ITEMS: CarouselItemConfig[] = [
  { id: 'floppy', label: 'Floppy Disk', modelPath: '/models/floppy_disk.glb' },
  { id: 'sony_psp', label: 'Sony PSP', modelPath: '/models/floppy_disk.glb' },
  { id: 'sphere', label: 'Sphere', modelPath: '/models/floppy_disk.glb' },
  { id: 'floppy', label: 'Floppy Disk', modelPath: '/models/floppy_disk.glb' },
  { id: 'vinyl', label: 'Vinyl', modelPath: '/models/floppy_disk.glb' },
  { id: 'sphere', label: 'Sphere', modelPath: '/models/floppy_disk.glb' },
  { id: 'sphere', label: 'Sphere', modelPath: '/models/floppy_disk.glb' },
  // { id: 'floppy', label: 'Floppy Disk', modelPath: '/models/floppy_disk.glb' },
  // { id: 'vinyl', label: 'Vinyl', modelPath: '/models/floppy_disk.glb' },
  // { id: 'sphere', label: 'Sphere', modelPath: '/models/floppy_disk.glb' },
];
