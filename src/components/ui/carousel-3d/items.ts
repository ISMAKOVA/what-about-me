import * as THREE from 'three';

import { GRAY } from './config';
import type { CarouselItemRuntime } from './types';

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

/**
 * Positions a label element using pre-computed NDC coordinates.
 * Caller is responsible for projecting world position to NDC before calling
 * to avoid allocating a new Vector3 every frame.
 */
export function positionLabelElement(
  el: HTMLDivElement,
  ndc: THREE.Vector3,
  containerWidth: number,
  containerHeight: number,
): void {
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
// Desaturation helper
// ---------------------------------------------------------------------------

/**
 * Lerps each material's colour between its original value and gray.
 * saturation = 1 → full original colour; saturation = 0 → fully gray.
 * Only affects materials that expose a `color` property (MeshStandard, etc.).
 */
export function setItemSaturation(item: CarouselItemRuntime, saturation: number): void {
  item.meshes.forEach((mesh) => {
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const origColors = item.originalColors.get(mesh.uuid) ?? [];
    mats.forEach((mat, i) => {
      if ('color' in mat && mat.color instanceof THREE.Color) {
        const orig = origColors[i] ?? new THREE.Color(1, 1, 1);
        (mat.color as THREE.Color).lerpColors(GRAY, orig, saturation);
      }
    });
  });
}

