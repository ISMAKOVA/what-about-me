export interface CarouselItemConfig {
  id: string;
  label: string;
  description: string;
  modelPath: string; // path to .glb file served from /public, e.g. '/models/floppy.glb'
  /** Optional scale multiplier applied on top of the global ITEM_HEIGHT_FRACTION. Default: 1. */
  scale?: number;
}

export const CAROUSEL_ITEMS: CarouselItemConfig[] = [
  {
    id: 'floppy',
    label: 'Floppy Disk',
    description: 'A 3.5" magnetic storage medium from the early computing era.',
    modelPath: '/models/floppy_disk.glb',
  },
  {
    id: 'sony_psp',
    label: 'Sony PSP',
    description: 'PlayStation Portable — Sony\'s iconic handheld gaming console from 2004.',
    modelPath: '/models/floppy_disk.glb',
  },
  {
    id: 'sphere',
    label: 'Sphere',
    description: 'A perfect geometric form — infinite symmetry in every direction.',
    modelPath: '/models/floppy_disk.glb',
  },
  {
    id: 'floppy',
    label: 'Floppy Disk',
    description: 'A 3.5" magnetic storage medium from the early computing era.',
    modelPath: '/models/floppy_disk.glb',
  },
  {
    id: 'vinyl',
    label: 'Vinyl',
    description: 'Analog audio stored in grooves — warmth no digital format can replicate.',
    modelPath: '/models/floppy_disk.glb',
  },
  {
    id: 'sphere',
    label: 'Sphere',
    description: 'A perfect geometric form — infinite symmetry in every direction.',
    modelPath: '/models/floppy_disk.glb',
  },
  {
    id: 'sphere',
    label: 'Sphere',
    description: 'A perfect geometric form — infinite symmetry in every direction.',
    modelPath: '/models/floppy_disk.glb',
  },
];
