// =============================================================================
// Carousel 3D — centralised configuration
// Edit values here; nothing else needs to change.
// =============================================================================

import * as THREE from 'three';

import type { CarouselItemConfig } from './types';

// -----------------------------------------------------------------------------
// Items
// -----------------------------------------------------------------------------

export const CAROUSEL_ITEMS: CarouselItemConfig[] = [
  {
    id: 'image of disk',
    label: 'Sphere',
    description: 'A perfect geometric form — infinite symmetry in every direction.',
    imagePath: '/images/sample_pack.png',
    scale: 0.8,
  },
  {
    id: 'image of disk',
    label: 'Sphere',
    description: 'A perfect geometric form — infinite symmetry in every direction.',
    imagePath: '/images/sample_pack.png',
    scale: 0.8,
  },
  {
    id: 'image of disk',
    label: 'Sphere',
    description: 'A perfect geometric form — infinite symmetry in every direction.',
    imagePath: '/images/sample_pack.png',
    scale: 0.8,
  },
  {
    id: 'image of disk',
    label: 'Sphere',
    description: 'A perfect geometric form — infinite symmetry in every direction.',
    imagePath: '/images/sample_pack.png',
    scale: 0.8,
  },
  {
    id: 'image of disk',
    label: 'Sphere',
    description: 'A perfect geometric form — infinite symmetry in every direction.',
    imagePath: '/images/sample_pack.png',
    scale: 0.8,
  },
];

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

/** Radius of the circle items sit on in the XZ plane (world units). */
export const CIRCLE_RADIUS = 5.5;

/** Fraction of screen height each item occupies (0–1). */
export const ITEM_HEIGHT_FRACTION = 0.25;

// -----------------------------------------------------------------------------
// Item scales
// -----------------------------------------------------------------------------

/** Uniform scale multiplier applied when hovering over an item. */
export const HOVER_SCALE = 1.3;

/** Uniform scale multiplier applied when an item is selected (clicked). */
export const SELECT_SCALE = 1.6;

// -----------------------------------------------------------------------------
// Animation — tweens
// -----------------------------------------------------------------------------

/** Duration (seconds) for hover-in / select-in scale tweens. */
export const SCALE_IN_DURATION = 0.6;

/** Ease for hover-in / select-in scale tweens. */
export const SCALE_IN_EASE = 'elastic.out(1, 0.5)';

/** Duration (seconds) for hover-out / deselect scale tweens. */
export const SCALE_OUT_DURATION = 0.4;

/** Ease for hover-out / deselect scale tweens. */
export const SCALE_OUT_EASE = 'power2.out';

// -----------------------------------------------------------------------------
// Animation — self-rotation
// -----------------------------------------------------------------------------

/** Radians added to each item's Y rotation per animation frame (~60 fps). */
export const SELF_ROTATION_SPEED = 0.004;

/** Peak swing angle (radians) for image-type items — left/right pendulum (rotation.y). */
export const IMAGE_SWING_AMPLITUDE = 0.18;
/** Angular frequency of the image swing (radians per frame). */
export const IMAGE_SWING_SPEED = 0.018;

// -----------------------------------------------------------------------------
// Scroll / inertia
// -----------------------------------------------------------------------------

/** Scales raw `WheelEvent.deltaY` into rotation velocity (radians). */
export const WHEEL_FACTOR = 0.002;

/** Velocity multiplier applied each frame (0–1); lower = snappier stop. */
export const SCROLL_DAMPING = 0.88;

// -----------------------------------------------------------------------------
// Desaturation (replaces opacity dimming)
// -----------------------------------------------------------------------------

/** NDC X threshold (0–1) within which items keep full colour. */
export const DESATURATE_CENTER_THRESHOLD = 0.2;

/**
 * Maximum desaturation at screen edges (0 = no effect, 1 = fully gray).
 * Applied as a smooth-step gradient beyond DESATURATE_CENTER_THRESHOLD.
 */
export const DESATURATE_DIM = 0.92;

// -----------------------------------------------------------------------------
// Click-to-centre animation
// -----------------------------------------------------------------------------

/** Duration (seconds) for the tween that scrolls a clicked item to centre. */
export const CENTER_TWEEN_DURATION = 0.7;

/** Ease for the click-to-centre tween. */
export const CENTER_TWEEN_EASE = 'power3.out';

// -----------------------------------------------------------------------------
// Camera
// -----------------------------------------------------------------------------

export const CAMERA_FOV = 50;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 100;
export const CAMERA_POSITION = { x: 0, y: -0.5, z: 10 } as const;

// -----------------------------------------------------------------------------
// Renderer
// -----------------------------------------------------------------------------

/** Caps `window.devicePixelRatio` to avoid excessive GPU load on HiDPI screens. */
export const MAX_PIXEL_RATIO = 2;

// -----------------------------------------------------------------------------
// Lights
// -----------------------------------------------------------------------------

export const AMBIENT_LIGHT_INTENSITY = 0.3;
export const AMBIENT_LIGHT_COLOR = '#ffffff';

export const DIR_LIGHT_INTENSITY = 1.2;
export const DIR_LIGHT_COLOR = '#ffffff';
export const DIR_LIGHT_POSITION = { x: 3, y: 5, z: 2 } as const;

export const FILL_LIGHT_INTENSITY = 0.3;
export const FILL_LIGHT_POSITION = { x: -3, y: 2, z: -2 } as const;

export const ACCENT_POINT_LIGHT_INTENSITY = 0.4;
export const ACCENT_POINT_LIGHT_COLOR = '#ffffff';

// -----------------------------------------------------------------------------
// Magnetic hover effect
// -----------------------------------------------------------------------------

/**
 * Maximum world-unit displacement applied to a hovered item's position
 * along X and Y as the cursor moves across it.
 * Smaller = subtler pull.
 */
export const MAGNETIC_MAX_OFFSET = 0.65;

/**
 * Duration (seconds) for the tween that eases the magnetic offset in/out.
 * Out-tween uses the same duration.
 */
export const MAGNETIC_TWEEN_DURATION = 0.6;

/** Ease used when the magnetic offset animates back to zero on hover-leave. */
export const MAGNETIC_TWEEN_OUT_EASE = 'elastic.out(1, 0.4)';

// -----------------------------------------------------------------------------
// Info panel
// -----------------------------------------------------------------------------

/** Horizontal margin from the left edge of the viewport (px). */
export const INFO_PANEL_MARGIN_X = '2rem';
/** Distance from the bottom of the viewport (px). */
export const INFO_PANEL_MARGIN_BOTTOM = '2rem';
/** Maximum width so the panel doesn't stretch on wide screens. */
export const INFO_PANEL_MAX_WIDTH = '28rem';
export const INFO_PANEL_BACKGROUND = 'rgba(255, 255, 255, 0.14)';
export const INFO_PANEL_BLUR = 'blur(20px)';
export const INFO_PANEL_BORDER = '1px solid rgba(255,255,255,0.25)';
export const INFO_PANEL_PADDING = '1.25rem 1.5rem';
export const INFO_PANEL_BORDER_RADIUS = '1rem';
export const INFO_PANEL_COLOR = '#1a1a2e';
export const INFO_PANEL_TRANSITION = 'opacity 0.4s ease';
/** z-index — sits above the carousel canvas (which has no explicit z-index). */
export const INFO_PANEL_Z_INDEX = '50';

// -----------------------------------------------------------------------------
// Desaturation colour
// -----------------------------------------------------------------------------

/** Target colour for fully desaturated items — used in the saturation lerp. */
export const GRAY = new THREE.Color(0.55, 0.55, 0.55);
