'use client';

import { FC, useEffect, useRef } from 'react';
import * as THREE from 'three';

import { CAROUSEL_ITEMS } from '@/lib/carousel-items';
import { ensureGsapPlugins } from '@/lib/gsap';
import { carouselStore } from '@/lib/stores/useCarouselStore';

import {
  CANVAS_FADE_IN_TRANSITION,
  CYLINDER_RADIUS,
  ITEM_HEIGHT_FRACTION,
  OPACITY_ACTIVE,
  OPACITY_CENTER_THRESHOLD,
  OPACITY_DIM,
  SELF_ROTATION_SPEED,
} from './config';
import { createInfoPanel } from './info-panel';
import { createInteractionController } from './interaction';
import {
  ITEM_SPACING,
  loadCarouselItems,
  positionLabelElement,
  scaleGroupToWorldHeight,
  setItemOpacity,
} from './items';
import { createScene } from './scene';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Carousel3DProps {
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Carousel3D: FC<Carousel3DProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ensureGsapPlugins();

    const container = containerRef.current;
    if (!container) return;

    // ------------------------------------------------------------------
    // Scene setup
    // ------------------------------------------------------------------
    const { scene, camera, renderer } = createScene(container);

    // ------------------------------------------------------------------
    // Loading state — fade in canvas once models are ready
    // ------------------------------------------------------------------
    renderer.domElement.style.opacity = '0';
    renderer.domElement.style.transition = CANVAS_FADE_IN_TRANSITION;

    // ------------------------------------------------------------------
    // Carousel pivot — translates along X to scroll items
    // ------------------------------------------------------------------
    const pivotGroup = new THREE.Group();
    scene.add(pivotGroup);

    // ------------------------------------------------------------------
    // Info panel
    // ------------------------------------------------------------------
    const infoPanel = createInfoPanel(container);

    // ------------------------------------------------------------------
    // Render loop — started immediately so the (empty) scene renders
    // while models load; populated once loadCarouselItems resolves.
    // ------------------------------------------------------------------
    let rafId: number;
    // Reused each frame to avoid per-frame allocation
    const worldPos = new THREE.Vector3();

    // These are populated once loadCarouselItems resolves
    let interaction: ReturnType<typeof createInteractionController> | null = null;
    let runtimeItems: Awaited<ReturnType<typeof loadCarouselItems>> = [];

    const tick = (): void => {
      rafId = requestAnimationFrame(tick);

      if (interaction !== null) {
        // Apply wheel inertia
        interaction.applyInertia();

        // Infinite loop + cylinder arc — each frame:
        // 1. Wrap items that have drifted past ±half the total band width.
        // 2. Update Z so items follow a parabolic arc (concave toward camera).
        const totalWidth = runtimeItems.length * ITEM_SPACING;
        const wrapThreshold = totalWidth / 2;

        runtimeItems.forEach((item) => {
          let worldX = pivotGroup.position.x + item.group.position.x;

          if (worldX > wrapThreshold) {
            item.group.position.x -= totalWidth;
            worldX -= totalWidth;
          } else if (worldX < -wrapThreshold) {
            item.group.position.x += totalWidth;
            worldX += totalWidth;
          }

          // Parabolic approximation of cylinder: edges closest, centre curves back
          item.group.position.z = -(worldX * worldX) / (2 * CYLINDER_RADIUS);
        });

        // Self-rotation — each item spins on its own Y axis
        runtimeItems.forEach((item) => {
          item.group.rotation.y += SELF_ROTATION_SPEED;
        });

        // Update label positions and opacity every frame
        const w = container.clientWidth;
        const h = container.clientHeight;
        runtimeItems.forEach((item) => {
          item.group.getWorldPosition(worldPos);
          positionLabelElement(item.labelEl, worldPos, camera, w, h);

          // Items near the screen centre are fully opaque; side items are dimmed
          const ndc = worldPos.clone().project(camera);
          const opacity = Math.abs(ndc.x) < OPACITY_CENTER_THRESHOLD ? OPACITY_ACTIVE : OPACITY_DIM;
          setItemOpacity(item, opacity);
        });
      }

      renderer.render(scene, camera);
    };

    tick();

    // ------------------------------------------------------------------
    // Load models (async — does not block the render loop)
    // ------------------------------------------------------------------
    const loadingManager = new THREE.LoadingManager();
    let destroyed = false;

    carouselStore.getState().setStatus('loading');

    loadCarouselItems(CAROUSEL_ITEMS, pivotGroup, container, loadingManager)
      .then((items) => {
        // Guard: component may have unmounted while models were loading
        if (destroyed) {
          items.forEach((item) => {
            item.meshes.forEach((mesh) => {
              mesh.geometry.dispose();
              const mat = mesh.material;
              if (Array.isArray(mat)) {
                mat.forEach((m) => m.dispose());
              } else {
                mat.dispose();
              }
            });
            if (container.contains(item.labelEl)) {
              container.removeChild(item.labelEl);
            }
          });
          return;
        }

        runtimeItems = items;

        // Scale each item so it appears as ITEM_HEIGHT_FRACTION of screen height.
        // Centre item sits at world origin (0, 0, 0).
        const frontItemPos = new THREE.Vector3(0, 0, 0);
        const distToFront = camera.position.distanceTo(frontItemPos);
        const halfFovRad = (camera.fov * Math.PI) / 180 / 2;
        const screenWorldHeight = 2 * distToFront * Math.tan(halfFovRad);
        const targetWorldHeight = screenWorldHeight * ITEM_HEIGHT_FRACTION;

        items.forEach((item) => {
          scaleGroupToWorldHeight(item.group, targetWorldHeight);
          // Apply optional per-item scale multiplier from carousel-items.ts
          if (item.config.scale !== undefined) {
            item.group.scale.multiplyScalar(item.config.scale);
          }
          // Store the computed scale so hover/select tweens use it as their base
          item.baseScale = item.group.scale.x;
        });

        // Build flat mesh list + index map for raycasting
        const allMeshes = items.flatMap((item) => item.meshes);
        const meshToItemIndex = new Map<string, number>();
        items.forEach((item, i) => {
          item.meshes.forEach((mesh) => meshToItemIndex.set(mesh.uuid, i));
        });

        // Wire up interaction
        interaction = createInteractionController(
          container,
          camera,
          items,
          allMeshes,
          meshToItemIndex,
          pivotGroup,
          infoPanel,
        );

        // Fade canvas in
        renderer.domElement.style.opacity = '1';

        carouselStore.getState().setStatus('ready');
      })
      .catch((err: unknown) => {
        console.error('[Carousel3D] Unexpected error during model loading:', err);
        carouselStore.getState().setStatus('error');
      });

    // ------------------------------------------------------------------
    // Resize
    // ------------------------------------------------------------------
    const onResize = (): void => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    // ------------------------------------------------------------------
    // Cleanup
    // ------------------------------------------------------------------
    return () => {
      destroyed = true;

      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();

      interaction?.destroy();

      const store = carouselStore.getState();
      store.setStatus('idle');
      store.setSelectedItem(null);
      store.setHoveredItem(null);

      runtimeItems.forEach((item) => {
        item.meshes.forEach((mesh) => {
          mesh.geometry.dispose();
          const mat = mesh.material;
          if (Array.isArray(mat)) {
            mat.forEach((m) => m.dispose());
          } else {
            mat.dispose();
          }
        });
        if (container.contains(item.labelEl)) {
          container.removeChild(item.labelEl);
        }
      });

      if (container.contains(infoPanel)) {
        container.removeChild(infoPanel);
      }

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
    // Intentionally empty deps — imperative setup, runs once on mount.
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className ?? ''}`}
    />
  );
};
