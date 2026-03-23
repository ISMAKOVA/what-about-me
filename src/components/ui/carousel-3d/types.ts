import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Item config — describes one entry in the carousel
// ---------------------------------------------------------------------------

export interface CarouselItemConfig {
  id: string;
  label: string;
  description: string;
  /** Path to a .glb model served from /public. Provide either this or imagePath. */
  modelPath?: string;
  /** Path to an image (jpg/png/webp) served from /public. Renders as a flat plane. */
  imagePath?: string;
  /**
   * Size multiplier applied on top of the global ITEM_HEIGHT_FRACTION baseline.
   * 1.0 = default size, 1.5 = 50% larger, 0.75 = 25% smaller.
   * Works for both GLB models and image items.
   */
  scale?: number;
  /** When true, all GLTF meshes receive a glass/crystal MeshPhysicalMaterial. */
  glass?: boolean;
}

// ---------------------------------------------------------------------------
// Runtime shape — what the interaction and render loop work with
// ---------------------------------------------------------------------------

export interface CarouselItemRuntime {
  config: CarouselItemConfig;
  group: THREE.Group;
  meshes: THREE.Mesh[];
  labelEl: HTMLDivElement;
  /** Uniform scale after scaleGroupToWorldHeight(); used as the tween base. */
  baseScale: number;
  /** Original material colours keyed by mesh uuid — used for desaturation lerp. */
  originalColors: Map<string, THREE.Color[]>;
  /**
   * Additional world-space XY displacement driven by the magnetic hover effect.
   * The interaction controller tweens these values; the render loop applies
   * them on top of the wrap/cylinder-arc position each frame.
   */
  magneticOffset: { x: number; y: number };
  /**
   * Per-item phase offset (radians) used for the pendulum swing on image items
   * so each one sways slightly out of sync with its neighbours.
   */
  swingPhase: number;
  /** Starting angle on the circle in radians: (index / total) * 2π. */
  baseAngle: number;
  /** Accumulated self-rotation for 3D model items (radians, grows each frame). */
  spinAngle: number;
}

// ---------------------------------------------------------------------------
// Interaction controller
// ---------------------------------------------------------------------------

export interface InteractionController {
  /**
   * Called once per animation frame by the render loop.
   * Applies wheel inertia to `pivotGroup.rotation.y` and runs hover raycasting.
   */
  applyInertia: () => void;
  /** Tears down all event listeners and kills in-flight tweens. */
  destroy: () => void;
}

// ---------------------------------------------------------------------------
// Info panel DOM elements
// ---------------------------------------------------------------------------

export interface InfoPanelElements {
  panel: HTMLDivElement;
  nameEl: HTMLParagraphElement;
  descriptionEl: HTMLParagraphElement;
}

// ---------------------------------------------------------------------------
// Light control values (dev-only leva controls)
// ---------------------------------------------------------------------------

export interface LightValues {
  ambientIntensity: number;
  dirIntensity: number;
  dirX: number;
  dirY: number;
  dirZ: number;
  fillIntensity: number;
}

// ---------------------------------------------------------------------------
// Glass material props (driven by leva in scene.tsx)
// ---------------------------------------------------------------------------

export interface GlassProps {
  thickness: number;
  roughness: number;
  transmission: number;
  ior: number;
  chromaticAbberation: number;
  backside: boolean;
}

// ---------------------------------------------------------------------------
// Carousel component props
// ---------------------------------------------------------------------------

export interface Carousel3DProps {
  className?: string;
}

// ---------------------------------------------------------------------------
// Carousel scene props
// ---------------------------------------------------------------------------

export interface CarouselSceneProps {
  glassProps: GlassProps;
}

// ---------------------------------------------------------------------------
// Carousel item component props (internal)
// ---------------------------------------------------------------------------

export interface ItemProps {
  config: CarouselItemConfig;
  index: number;
  totalCount: number;
  glassProps: GlassProps;
  onRegister: (meshes: THREE.Mesh[], group: THREE.Group) => void;
}
