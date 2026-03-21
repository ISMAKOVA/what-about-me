import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { CarouselItemConfig } from '@/lib/carousel-items';
import { ITEM_SPACING } from './config';

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
}

// ---------------------------------------------------------------------------
// Label DOM helpers
// Kept here alongside the items they describe. Direct DOM mutation avoids
// React re-renders on every animation frame.
// ---------------------------------------------------------------------------

export function createLabelElement(text: string, container: HTMLDivElement): HTMLDivElement {
  const el = document.createElement('div');
  el.textContent = text;
  el.style.position = 'absolute';
  el.style.pointerEvents = 'none';
  el.style.userSelect = 'none';
  el.style.fontFamily = 'var(--font-satoshi)';
  el.style.fontSize = '0.65rem';
  el.style.fontWeight = '600';
  el.style.letterSpacing = '0.12em';
  el.style.textTransform = 'uppercase';
  el.style.color = '#1a1a2e';
  el.style.opacity = '0';
  el.style.transition = 'opacity 0.3s ease';
  el.style.transform = 'translateX(-50%)';
  el.style.whiteSpace = 'nowrap';
  container.appendChild(el);
  return el;
}

export function positionLabelElement(
  el: HTMLDivElement,
  worldPos: THREE.Vector3,
  camera: THREE.PerspectiveCamera,
  containerWidth: number,
  containerHeight: number,
): void {
  const ndc = worldPos.clone().project(camera);
  const x = ((ndc.x + 1) / 2) * containerWidth;
  // +60 px vertical offset so the label sits below the object
  const y = ((-ndc.y + 1) / 2) * containerHeight + 60;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
}

// ---------------------------------------------------------------------------
// Scale helper
// ---------------------------------------------------------------------------

/**
 * Scales `group` uniformly so its bounding-box height equals `targetHeight`
 * in world units. Call after the group has been added to the scene so
 * world-space transforms are resolved.
 */
export function scaleGroupToWorldHeight(group: THREE.Group, targetHeight: number): void {
  const box = new THREE.Box3().setFromObject(group);
  const size = new THREE.Vector3();
  box.getSize(size);
  if (size.y > 0) {
    group.scale.setScalar((group.scale.x * targetHeight) / size.y);
  }
}

// ---------------------------------------------------------------------------
// Opacity helper
// ---------------------------------------------------------------------------

/**
 * Sets uniform opacity on every material in the item's mesh list.
 * Also toggles `transparent` so Three.js depth-sorts correctly.
 */
export function setItemOpacity(item: CarouselItemRuntime, opacity: number): void {
  item.meshes.forEach((mesh) => {
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((mat) => {
      mat.transparent = opacity < 1;
      mat.opacity = opacity;
    });
  });
}

// ---------------------------------------------------------------------------
// GLTF loading
// ---------------------------------------------------------------------------

export { ITEM_SPACING } from './config';

/**
 * Loads every config entry as a GLTF model, positions it on the carousel
 * circle, adds it to `pivotGroup`, and creates a label element in `container`.
 *
 * Returns a Promise that resolves once all models have loaded. Individual
 * failures are caught and logged — the item is skipped so the rest of the
 * carousel still works.
 */
export async function loadCarouselItems(
  configs: CarouselItemConfig[],
  pivotGroup: THREE.Group,
  container: HTMLDivElement,
  loadingManager: THREE.LoadingManager,
): Promise<CarouselItemRuntime[]> {
  const loader = new GLTFLoader(loadingManager);

  const settled = await Promise.allSettled(
    configs.map(
      (config, index): Promise<CarouselItemRuntime> =>
        new Promise((resolve, reject) => {
          loader.load(
            config.modelPath,
            (gltf) => {
              const group = gltf.scene as THREE.Group;

              // Collect all meshes for raycasting
              const meshes: THREE.Mesh[] = [];
              group.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                  meshes.push(child as THREE.Mesh);
                  (child as THREE.Mesh).castShadow = true;
                  (child as THREE.Mesh).receiveShadow = true;
                }
              });

              // Position on a flat horizontal track, centred around the origin
              const offset = ((configs.length - 1) / 2) * ITEM_SPACING;
              group.position.set(index * ITEM_SPACING - offset, 0, 0);

              pivotGroup.add(group);

              const labelEl = createLabelElement(config.label, container);

              resolve({ config, group, meshes, labelEl, baseScale: 1 });
            },
            undefined,
            (error) => reject(error),
          );
        }),
    ),
  );

  const items: CarouselItemRuntime[] = [];
  settled.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      items.push(result.value);
    } else {
      console.error(
        `[Carousel3D] Failed to load model "${configs[index].modelPath}":`,
        result.reason,
      );
    }
  });

  return items;
}
