export interface CarouselItemConfig {
  id: string;
  label: string;
  description: string;
  /** Path to a .glb model served from /public. Provide either this or imagePath. */
  modelPath?: string;
  /** Path to an image (jpg/png/webp) served from /public. Renders as a flat plane. */
  imagePath?: string;
  /** Optional scale multiplier applied on top of the global ITEM_HEIGHT_FRACTION. Default: 1. */
  scale?: number;
  /** When true, all GLTF meshes receive a glass/crystal MeshPhysicalMaterial. */
  glass?: boolean;
}

export const CAROUSEL_ITEMS: CarouselItemConfig[] = [
  {
    id: 'floppy',
    label: 'Floppy Disk',
    description: 'A 3.5" magnetic storage medium from the early computing era.',
    imagePath: '/images/floppy_disk.png',
  },
  {
    id: 'image of disk',
    label: 'Sphere',
    description: 'A perfect geometric form — infinite symmetry in every direction.',
    imagePath: '/images/floppy_disk.png',
  },
  {
    id: 'sony_psp',
    label: 'Sony PSP',
    description: 'PlayStation Portable — Sonys iconic handheld gaming console from 2004.',
    imagePath: '/images/floppy_disk.png',
  },
  {
    id: 'mp3',
    label: 'MP3 Player',
    description: 'A portable digital audio player — revolutionized music consumption.',
    imagePath: '/images/mp3.png',
  },
  {
    id: 'kanye_psp',
    label: 'Kanye PSP',
    description: 'A custom edition of the PlayStation Portable inspired by Kanye West.',
    imagePath: '/images/kanye_psp.png',
  },
];
