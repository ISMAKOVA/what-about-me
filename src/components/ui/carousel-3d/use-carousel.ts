'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';

import { CAROUSEL_ITEMS } from './config';
import { ensureGsapPlugins } from '@/lib/gsap';
import { carouselStore } from '@/lib/stores/useCarouselStore';

import {
  CIRCLE_RADIUS,
  DESATURATE_CENTER_THRESHOLD,
  DESATURATE_DIM,
  IMAGE_SWING_AMPLITUDE,
  IMAGE_SWING_SPEED,
  ITEM_HEIGHT_FRACTION,
  SELF_ROTATION_SPEED,
} from './config';
import { createInfoPanel } from './info-panel';
import { createInteractionController } from './interaction';
import {
  createLabelElement,
  positionLabelElement,
  scaleGroupToWorldHeight,
  setItemSaturation,
} from './items';
import type { CarouselItemRuntime, InfoPanelElements, InteractionController } from './types';

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
        baseAngle: 0,
        spinAngle: 0,
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

    const total = items.length;
    items.forEach((item, i) => {
      item.baseAngle = (i / total) * Math.PI * 2;
      item.spinAngle = 0;
      item.group.userData.baseAngle = item.baseAngle;
    });
    pivotRef.current.userData.rotationAngle = 0;

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

    // Inertia + hover raycasting (interaction controller drives rotation velocity)
    interactionRef.current.applyInertia();

    const rotationAngle: number = pivotRef.current!.userData.rotationAngle ?? 0;

    frameRef.current++;

    // Circle layout: position, rotation, label, and desaturation in one pass
    const w = container.clientWidth;
    const h = container.clientHeight;

    items.forEach((item) => {
      const currentAngle = item.baseAngle + rotationAngle;

      item.group.position.x = Math.sin(currentAngle) * CIRCLE_RADIUS + item.magneticOffset.x;
      item.group.position.y = item.magneticOffset.y;
      item.group.position.z = Math.cos(currentAngle) * CIRCLE_RADIUS;

      if (item.config.imagePath) {
        item.group.rotation.y =
          -currentAngle +
          Math.sin(frameRef.current * IMAGE_SWING_SPEED + item.swingPhase) * IMAGE_SWING_AMPLITUDE;
      } else {
        item.spinAngle += SELF_ROTATION_SPEED;
        item.group.rotation.y = -currentAngle + item.spinAngle;
      }

      item.group.getWorldPosition(worldPosRef.current);
      ndcRef.current.copy(worldPosRef.current).project(camera);
      positionLabelElement(item.labelEl, ndcRef.current, w, h);

      let norm = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      if (norm > Math.PI) norm -= 2 * Math.PI;
      const distFromFront = Math.abs(norm) / Math.PI;
      const t = Math.max(
        0,
        (distFromFront - DESATURATE_CENTER_THRESHOLD) / (1 - DESATURATE_CENTER_THRESHOLD),
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
