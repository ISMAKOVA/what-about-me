'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';

import { CAROUSEL_ITEMS } from '@/lib/carousel-items';
import { ensureGsapPlugins } from '@/lib/gsap';
import { carouselStore } from '@/lib/stores/useCarouselStore';

import {
  CYLINDER_RADIUS,
  DESATURATE_CENTER_THRESHOLD,
  DESATURATE_DIM,
  IMAGE_SWING_AMPLITUDE,
  IMAGE_SWING_SPEED,
  ITEM_HEIGHT_FRACTION,
  SELF_ROTATION_SPEED,
} from './config';
import { createInfoPanel, InfoPanelElements } from './info-panel';
import { createInteractionController, InteractionController } from './interaction';
import {
  CarouselItemRuntime,
  createLabelElement,
  ITEM_SPACING,
  positionLabelElement,
  scaleGroupToWorldHeight,
  setItemSaturation,
} from './items';

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCarousel() {
  const { camera: cameraBase, gl } = useThree();
  const camera = cameraBase as THREE.PerspectiveCamera;

  const pivotRef = useRef<THREE.Group>(null);

  // Per-item runtime data — populated by registerMeshes callbacks from items
  const itemsRef = useRef<(CarouselItemRuntime | null)[]>(
    new Array(CAROUSEL_ITEMS.length).fill(null),
  );
  const registeredCount = useRef(0);

  // Deferred setup: set to true once all items have registered; consumed on
  // the first useFrame after that so world matrices are fully resolved.
  const setupPendingRef = useRef(false);

  // Interaction and info panel — created in setupAfterLoad
  const interactionRef = useRef<InteractionController | null>(null);
  const infoPanelRef = useRef<InfoPanelElements | null>(null);

  // Per-frame state
  const frameRef = useRef(0);
  const worldPosRef = useRef(new THREE.Vector3());
  // Scratch Vector3 for NDC projection — avoids allocating inside useFrame
  const ndcRef = useRef(new THREE.Vector3());

  // ---------------------------------------------------------------------------
  // Called from carousel-item.tsx once each item's meshes are ready
  // ---------------------------------------------------------------------------

  const registerMeshes = useCallback(
    (meshes: THREE.Mesh[], group: THREE.Group, index: number) => {
      const config = CAROUSEL_ITEMS[index];
      const container = gl.domElement.parentElement as HTMLDivElement;

      const labelEl = createLabelElement(config.label, container);

      // Snapshot original mesh colours for the desaturation lerp
      const originalColors = new Map<string, THREE.Color[]>();
      meshes.forEach((mesh) => {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        originalColors.set(
          mesh.uuid,
          mats.map((m) =>
            'color' in m && m.color instanceof THREE.Color
              ? (m.color as THREE.Color).clone()
              : new THREE.Color(1, 1, 1),
          ),
        );
      });

      itemsRef.current[index] = {
        config,
        group,
        meshes,
        labelEl,
        baseScale: 1,
        originalColors,
        magneticOffset: { x: 0, y: 0 },
        swingPhase: config.imagePath ? index * (Math.PI / 3) : 0,
      };

      registeredCount.current++;

      if (registeredCount.current === CAROUSEL_ITEMS.length) {
        setupPendingRef.current = true;
      }
    },
    [gl],
  );

  // ---------------------------------------------------------------------------
  // Setup — scales items and wires interaction once all items are registered
  // ---------------------------------------------------------------------------

  function setupAfterLoad() {
    if (!pivotRef.current) return;

    const items = itemsRef.current.filter((x): x is CarouselItemRuntime => x !== null);
    const container = gl.domElement.parentElement as HTMLDivElement;

    // Scale each item so it appears as ITEM_HEIGHT_FRACTION of screen height
    const distToFront = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
    const halfFovRad = ((camera.fov * Math.PI) / 180) * 0.5;
    const screenWorldHeight = 2 * distToFront * Math.tan(halfFovRad);
    const targetWorldHeight = screenWorldHeight * ITEM_HEIGHT_FRACTION;

    items.forEach((item) => {
      scaleGroupToWorldHeight(item.group, targetWorldHeight);
      if (item.config.scale !== undefined) {
        item.group.scale.multiplyScalar(item.config.scale);
      }
      item.baseScale = item.group.scale.x;
    });

    // Build flat mesh list + lookup map for raycasting
    const allMeshes = items.flatMap((item) => item.meshes);
    const meshToItemIndex = new Map<string, number>();
    items.forEach((item, i) => {
      item.meshes.forEach((mesh) => meshToItemIndex.set(mesh.uuid, i));
    });

    infoPanelRef.current = createInfoPanel();

    interactionRef.current = createInteractionController(
      container,
      camera,
      items,
      allMeshes,
      meshToItemIndex,
      pivotRef.current,
      infoPanelRef.current,
    );

    carouselStore.getState().setStatus('ready');
  }

  // ---------------------------------------------------------------------------
  // Animation frame
  // ---------------------------------------------------------------------------

  useFrame(() => {
    // Do not attempt any rendering work while the WebGL context is unavailable.
    // gl.getContext() returns the underlying WebGL2RenderingContext; isContextLost()
    // is the canonical way to detect that the GPU surface has been reclaimed.
    if (gl.getContext().isContextLost()) return;

    // Deferred first-frame setup
    if (setupPendingRef.current) {
      setupPendingRef.current = false;
      setupAfterLoad();
      return;
    }

    if (!interactionRef.current || !pivotRef.current) return;

    const items = itemsRef.current.filter((x): x is CarouselItemRuntime => x !== null);
    if (items.length === 0) return;

    const container = gl.domElement.parentElement as HTMLDivElement;

    // Inertia + hover raycasting (interaction controller drives scroll velocity)
    interactionRef.current.applyInertia();

    // Infinite loop + cylinder arc
    const totalWidth = items.length * ITEM_SPACING;
    const wrapThreshold = totalWidth / 2;

    items.forEach((item) => {
      // Strip magnetic offset before wrap/arc math
      item.group.position.x -= item.magneticOffset.x;
      item.group.position.y -= item.magneticOffset.y;

      let worldX = pivotRef.current!.position.x + item.group.position.x;

      if (worldX > wrapThreshold) {
        item.group.position.x -= totalWidth;
        worldX -= totalWidth;
      } else if (worldX < -wrapThreshold) {
        item.group.position.x += totalWidth;
        worldX += totalWidth;
      }

      // Parabolic cylinder arc: edges curve away from the camera
      item.group.position.z = -(worldX * worldX) / (2 * CYLINDER_RADIUS);

      // Re-apply magnetic offset on top of resolved position
      item.group.position.x += item.magneticOffset.x;
      item.group.position.y += item.magneticOffset.y;
    });

    // Self-rotation: 3D models spin on Y; image items gently swing (pendulum)
    items.forEach((item) => {
      if (item.config.imagePath) {
        item.group.rotation.y =
          Math.sin(frameRef.current * IMAGE_SWING_SPEED + item.swingPhase) * IMAGE_SWING_AMPLITUDE;
      } else {
        item.group.rotation.y += SELF_ROTATION_SPEED;
      }
    });

    frameRef.current++;

    // Label positions + desaturation
    const w = container.clientWidth;
    const h = container.clientHeight;

    items.forEach((item) => {
      item.group.getWorldPosition(worldPosRef.current);
      // Project once into scratch ref — no per-frame allocation
      ndcRef.current.copy(worldPosRef.current).project(camera);
      positionLabelElement(item.labelEl, ndcRef.current, w, h);

      const ndcAbsX = Math.abs(ndcRef.current.x);
      const t = Math.max(
        0,
        (ndcAbsX - DESATURATE_CENTER_THRESHOLD) / (1 - DESATURATE_CENTER_THRESHOLD),
      );
      const smooth = t * t * (3 - 2 * t);
      const saturation = 1 - Math.min(1, smooth) * DESATURATE_DIM;
      setItemSaturation(item, saturation);
    });
  });

  // ---------------------------------------------------------------------------
  // Mount / unmount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    ensureGsapPlugins();
    carouselStore.getState().setStatus('loading');

    // Snapshot mutable refs at effect time so cleanup closure captures stable values
    const itemsSnapshot = itemsRef;
    const interactionSnapshot = interactionRef;
    const infoPanelSnapshot = infoPanelRef;

    return () => {
      interactionSnapshot.current?.destroy();

      const store = carouselStore.getState();
      store.setStatus('idle');
      store.setSelectedItem(null);
      store.setHoveredItem(null);

      const container = gl.domElement.parentElement as HTMLDivElement;
      const items = itemsSnapshot.current.filter((x): x is CarouselItemRuntime => x !== null);

      items.forEach((item) => {
        if (container?.contains(item.labelEl)) {
          container.removeChild(item.labelEl);
        }
      });

      const panel = infoPanelSnapshot.current?.panel;
      if (panel && document.body.contains(panel)) {
        document.body.removeChild(panel);
      }
    };
  }, [gl]);

  return { pivotRef, registerMeshes };
}
