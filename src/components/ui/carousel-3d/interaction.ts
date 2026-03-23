import * as THREE from 'three';

import { setCursorPill, updatePillPosition } from '@/lib/cursor-bridge';
import { gsap } from '@/lib/gsap';
import { carouselStore } from '@/lib/stores/useCarouselStore';

import {
  CENTER_TWEEN_DURATION,
  CENTER_TWEEN_EASE,
  HOVER_SCALE,
  ITEM_HEIGHT_FRACTION,
  MAGNETIC_MAX_OFFSET,
  MAGNETIC_TWEEN_DURATION,
  MAGNETIC_TWEEN_OUT_EASE,
  SCALE_IN_DURATION,
  SCALE_IN_EASE,
  SCALE_OUT_DURATION,
  SCALE_OUT_EASE,
  SCROLL_DAMPING,
  SELECT_SCALE,
  WHEEL_FACTOR,
} from './config';
import type { CarouselItemRuntime, InfoPanelElements, InteractionController } from './types';

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
  infoPanel: InfoPanelElements,
): InteractionController {
  // Mutable imperative state — intentionally not React state
  let rotationVelocity = 0;
  let hoveredIndex: number | null = null;
  let selectedIndex: number | null = null;

  const scaleTweens: Array<gsap.core.Tween | null> = items.map(() => null);
  const magneticTweens: Array<gsap.core.Tween | null> = items.map(() => null);
  let centeringTween: gsap.core.Tween | null = null;
  let isScrollingTracked = false;

  const raycaster = new THREE.Raycaster();
  // Start pointer far off-screen so nothing is hovered on mount
  const pointer = new THREE.Vector2(9999, 9999);
  // Scratch objects reused every frame to avoid per-frame allocations
  const _worldPos = new THREE.Vector3();

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

  /**
   * Springs the magnetic offset of item[index] back to zero.
   * Called on hover-leave so the item returns to its natural resting position.
   */
  function resetMagnetic(index: number): void {
    magneticTweens[index]?.kill();
    magneticTweens[index] = gsap.to(items[index].magneticOffset, {
      x: 0,
      y: 0,
      duration: MAGNETIC_TWEEN_DURATION,
      ease: MAGNETIC_TWEEN_OUT_EASE,
    });
  }

  function showInfoPanel(index: number): void {
    const { config } = items[index];
    infoPanel.nameEl.textContent = config.label;
    infoPanel.descriptionEl.textContent = config.description;
    infoPanel.panel.style.opacity = '1';
    infoPanel.panel.style.pointerEvents = 'auto';
  }

  function hideInfoPanel(): void {
    infoPanel.panel.style.opacity = '0';
    infoPanel.panel.style.pointerEvents = 'none';
  }

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  const onMouseMove = (event: MouseEvent): void => {
    const rect = container.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    mouseClientX = event.clientX;
    mouseClientY = event.clientY;
  };

  const onMouseLeave = (): void => {
    pointer.set(9999, 9999);
    mouseClientX = -9999;
    mouseClientY = -9999;
    container.style.cursor = '';

    // Clear magnetic offsets and cursor pill for any hovered item
    if (hoveredIndex !== null) {
      if (hoveredIndex !== selectedIndex) {
        tweenScale(hoveredIndex, items[hoveredIndex].baseScale, false);
      }
      resetMagnetic(hoveredIndex);
      hoveredIndex = null;
      carouselStore.getState().setHoveredItem(null);
      setCursorPill(null);
    }
  };

  const onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    // Wheel is blocked while an item is selected
    if (selectedIndex !== null) return;
    rotationVelocity += event.deltaY * WHEEL_FACTOR;
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

      // Stop scroll inertia and smoothly rotate the clicked item to the front
      rotationVelocity = 0;
      centeringTween?.kill();
      const baseAngle = items[selectedIndex].group.userData.baseAngle as number ?? 0;
      const currentRotation: number = pivotGroup.userData.rotationAngle ?? 0;
      let delta = (-baseAngle - currentRotation) % (2 * Math.PI);
      if (delta > Math.PI) delta -= 2 * Math.PI;
      if (delta < -Math.PI) delta += 2 * Math.PI;
      const targetRotation = currentRotation + delta;
      centeringTween = gsap.to(pivotGroup.userData, {
        rotationAngle: targetRotation,
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

  // Raw mouse position in CSS pixels (updated by onMouseMove)
  let mouseClientX = -9999;
  let mouseClientY = -9999;

  function updateHover(): void {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(allMeshes, false);

    const newHoveredIndex: number | null =
      intersects.length > 0 ? (meshToItemIndex.get(intersects[0].object.uuid) ?? null) : null;

    if (newHoveredIndex !== hoveredIndex) {
      // Animate previous hovered item back — unless it's selected
      if (hoveredIndex !== null && hoveredIndex !== selectedIndex) {
        tweenScale(hoveredIndex, items[hoveredIndex].baseScale, false);
        resetMagnetic(hoveredIndex);
      }

      // Animate newly hovered item — unless it's selected
      if (newHoveredIndex !== null && newHoveredIndex !== selectedIndex) {
        tweenScale(newHoveredIndex, items[newHoveredIndex].baseScale * HOVER_SCALE, true);
      }

      // Update native cursor so all items feel clickable
      container.style.cursor = newHoveredIndex !== null ? 'pointer' : '';

      hoveredIndex = newHoveredIndex;
      carouselStore
        .getState()
        .setHoveredItem(hoveredIndex !== null ? items[hoveredIndex].config.id : null);

      // Update cursor pill text
      setCursorPill(hoveredIndex !== null ? items[hoveredIndex].config.label : null);
    }

    // Continuous per-frame magnetic pull toward cursor while an item is hovered
    if (hoveredIndex !== null) {
      updateMagneticOffset(hoveredIndex);
    }
  }

  /**
   * Computes how far the cursor is from the hovered item's projected screen
   * centre and maps that to a world-space XY offset, then directly sets the
   * magneticOffset so it tracks the cursor smoothly (GSAP spring handles lag).
   */
  function updateMagneticOffset(index: number): void {
    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // Project item world position to NDC in-place — no allocation
    items[index].group.getWorldPosition(_worldPos);
    _worldPos.project(camera);

    const itemScreenX = rect.left + ((_worldPos.x + 1) / 2) * w;
    const itemScreenY = rect.top + ((-_worldPos.y + 1) / 2) * h;

    // Normalised delta: -1 to +1 across the container
    const dx = (mouseClientX - itemScreenX) / (w * 0.5);
    const dy = (mouseClientY - itemScreenY) / (h * 0.5);

    // Clamp so the offset never exceeds MAGNETIC_MAX_OFFSET in world units
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    const targetX = clamp(dx) * MAGNETIC_MAX_OFFSET;
    // Invert Y: screen Y grows downward, world Y grows upward
    const targetY = -clamp(dy) * MAGNETIC_MAX_OFFSET;

    magneticTweens[index]?.kill();
    magneticTweens[index] = gsap.to(items[index].magneticOffset, {
      x: targetX,
      y: targetY,
      duration: 0.25,
      ease: 'power2.out',
      overwrite: true,
    });

    // Reposition the cursor sentinel so the pill orbits the item in screen space
    const sentinelSize =
      h * ITEM_HEIGHT_FRACTION * (items[index].group.scale.x / items[index].baseScale);
    updatePillPosition(
      itemScreenX - sentinelSize / 2,
      itemScreenY - sentinelSize / 2,
      sentinelSize,
      sentinelSize,
    );
  }

  // ---------------------------------------------------------------------------
  // applyInertia — called once per animation frame by the render loop
  // ---------------------------------------------------------------------------

  const applyInertia = (): void => {
    updateHover();
    pivotGroup.userData.rotationAngle = (pivotGroup.userData.rotationAngle ?? 0) - rotationVelocity;
    rotationVelocity *= SCROLL_DAMPING;

    // Sync scrolling state to the store — only when the boolean flips to avoid
    // calling setScrolling on every frame while the carousel is idle.
    const nowScrolling = Math.abs(rotationVelocity) > 0.0001;
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
    container.style.cursor = '';
    scaleTweens.forEach((t) => t?.kill());
    magneticTweens.forEach((t) => t?.kill());
    centeringTween?.kill();
    setCursorPill(null);
  };

  return { applyInertia, destroy };
}
