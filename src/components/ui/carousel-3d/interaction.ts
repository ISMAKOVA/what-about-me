import * as THREE from 'three';

import { gsap } from '@/lib/gsap';
import { carouselStore } from '@/lib/stores/useCarouselStore';

import {
  CENTER_TWEEN_DURATION,
  CENTER_TWEEN_EASE,
  HOVER_SCALE,
  SCALE_IN_DURATION,
  SCALE_IN_EASE,
  SCALE_OUT_DURATION,
  SCALE_OUT_EASE,
  SCROLL_DAMPING,
  SELECT_SCALE,
  WHEEL_FACTOR,
} from './config';
import { CarouselItemRuntime } from './items';

// ---------------------------------------------------------------------------
// Public interface
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
// Factory
// ---------------------------------------------------------------------------

/**
 * Wires up all pointer/wheel interactions for the carousel. Returns a
 * controller whose `applyInertia` must be called once per animation frame.
 *
 * No React involved — all state is closed over inside this function.
 */
export function createInteractionController(
  container: HTMLDivElement,
  camera: THREE.PerspectiveCamera,
  items: CarouselItemRuntime[],
  allMeshes: THREE.Mesh[],
  meshToItemIndex: Map<string, number>,
  pivotGroup: THREE.Group,
  infoPanel: HTMLDivElement,
): InteractionController {
  // Mutable imperative state — intentionally not React state
  let translationVelocity = 0;
  let hoveredIndex: number | null = null;
  let selectedIndex: number | null = null;

  const scaleTweens: Array<gsap.core.Tween | null> = items.map(() => null);
  let centeringTween: gsap.core.Tween | null = null;
  let isScrollingTracked = false;

  const raycaster = new THREE.Raycaster();
  // Start pointer far off-screen so nothing is hovered on mount
  const pointer = new THREE.Vector2(9999, 9999);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function getIntersectedIndex(clientX: number, clientY: number): number | null {
    const rect = container.getBoundingClientRect();
    const p = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(p, camera);
    const hits = raycaster.intersectObjects(allMeshes, false);
    return hits.length > 0 ? (meshToItemIndex.get(hits[0].object.uuid) ?? null) : null;
  }

  function tweenScale(index: number, to: number, isIn: boolean): void {
    scaleTweens[index]?.kill();
    scaleTweens[index] = gsap.to(items[index].group.scale, {
      x: to,
      y: to,
      z: to,
      duration: isIn ? SCALE_IN_DURATION : SCALE_OUT_DURATION,
      ease: isIn ? SCALE_IN_EASE : SCALE_OUT_EASE,
    });
  }

  function showInfoPanel(index: number): void {
    infoPanel.innerHTML = `
      <span style="font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;opacity:0.5;margin-bottom:0.5rem;">
        ${items[index].config.label}
      </span>
    `;
    infoPanel.style.opacity = '1';
    infoPanel.style.pointerEvents = 'auto';
  }

  function hideInfoPanel(): void {
    infoPanel.style.opacity = '0';
    infoPanel.style.pointerEvents = 'none';
  }

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  const onMouseMove = (event: MouseEvent): void => {
    const rect = container.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };

  const onMouseLeave = (): void => {
    pointer.set(9999, 9999);
  };

  const onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    // Wheel is blocked while an item is selected
    if (selectedIndex !== null) return;
    translationVelocity += event.deltaY * WHEEL_FACTOR;
  };

  const onClick = (event: MouseEvent): void => {
    const clickedIndex = getIntersectedIndex(event.clientX, event.clientY);
    const { setSelectedItem } = carouselStore.getState();

    // Clicking the already-selected item deselects it
    if (clickedIndex !== null && clickedIndex === selectedIndex) {
      tweenScale(selectedIndex, items[selectedIndex].baseScale, false);
      centeringTween?.kill();
      centeringTween = null;
      selectedIndex = null;
      hideInfoPanel();
      setSelectedItem(null);
      return;
    }

    // Deselect the previously selected item
    if (selectedIndex !== null) {
      tweenScale(selectedIndex, items[selectedIndex].baseScale, false);
    }

    if (clickedIndex !== null) {
      selectedIndex = clickedIndex;
      tweenScale(selectedIndex, items[selectedIndex].baseScale * SELECT_SCALE, true);
      showInfoPanel(selectedIndex);
      setSelectedItem(items[selectedIndex].config.id);

      // Stop scroll inertia and smoothly bring the item to centre
      translationVelocity = 0;
      centeringTween?.kill();
      centeringTween = gsap.to(pivotGroup.position, {
        x: -items[selectedIndex].group.position.x,
        duration: CENTER_TWEEN_DURATION,
        ease: CENTER_TWEEN_EASE,
      });
    } else {
      selectedIndex = null;
      centeringTween?.kill();
      centeringTween = null;
      hideInfoPanel();
      setSelectedItem(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Per-frame hover update — called from the render loop so raycasting runs
  // against the current frame's camera/mesh state.
  // ---------------------------------------------------------------------------

  function updateHover(): void {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(allMeshes, false);

    const newHoveredIndex: number | null =
      intersects.length > 0 ? (meshToItemIndex.get(intersects[0].object.uuid) ?? null) : null;

    if (newHoveredIndex === hoveredIndex) return;

    // Animate previous hovered item back — unless it's selected
    if (hoveredIndex !== null && hoveredIndex !== selectedIndex) {
      tweenScale(hoveredIndex, items[hoveredIndex].baseScale, false);
      items[hoveredIndex].labelEl.style.opacity = '0';
    }

    // Animate newly hovered item — unless it's selected
    if (newHoveredIndex !== null && newHoveredIndex !== selectedIndex) {
      tweenScale(newHoveredIndex, items[newHoveredIndex].baseScale * HOVER_SCALE, true);
      items[newHoveredIndex].labelEl.style.opacity = '1';
    }

    hoveredIndex = newHoveredIndex;
    carouselStore
      .getState()
      .setHoveredItem(hoveredIndex !== null ? items[hoveredIndex].config.id : null);
  }

  // ---------------------------------------------------------------------------
  // applyInertia — called once per animation frame by the render loop
  // ---------------------------------------------------------------------------

  const applyInertia = (): void => {
    updateHover();
    // Scroll down → positive deltaY → move group left so next item slides in from the right
    pivotGroup.position.x -= translationVelocity;
    translationVelocity *= SCROLL_DAMPING;

    // Sync scrolling state to the store — only when the boolean flips to avoid
    // calling setScrolling on every frame while the carousel is idle.
    const nowScrolling = Math.abs(translationVelocity) > 0.001;
    if (nowScrolling !== isScrollingTracked) {
      isScrollingTracked = nowScrolling;
      carouselStore.getState().setScrolling(nowScrolling);
    }
  };

  // ---------------------------------------------------------------------------
  // Wire up listeners
  // ---------------------------------------------------------------------------

  container.addEventListener('mousemove', onMouseMove);
  container.addEventListener('mouseleave', onMouseLeave);
  container.addEventListener('click', onClick);
  container.addEventListener('wheel', onWheel, { passive: false });

  // ---------------------------------------------------------------------------
  // Destroy
  // ---------------------------------------------------------------------------

  const destroy = (): void => {
    container.removeEventListener('mousemove', onMouseMove);
    container.removeEventListener('mouseleave', onMouseLeave);
    container.removeEventListener('click', onClick);
    container.removeEventListener('wheel', onWheel);
    scaleTweens.forEach((t) => t?.kill());
    centeringTween?.kill();
  };

  return { applyInertia, destroy };
}
