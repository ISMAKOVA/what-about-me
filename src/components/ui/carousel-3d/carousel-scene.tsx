'use client';

import { Suspense, useMemo } from 'react';
import * as THREE from 'three';

import CarouselItem from './carousel-item';
import { CAROUSEL_ITEMS } from './config';
import type { CarouselSceneProps } from './types';
import { useCarousel } from './use-carousel';

export default function CarouselScene({ glassProps }: CarouselSceneProps) {
  const { pivotRef, registerMeshes } = useCarousel();

  // Stable per-index callbacks — only recreated when registerMeshes changes
  const registerCallbacks = useMemo(
    () =>
      CAROUSEL_ITEMS.map(
        (_, index) => (meshes: THREE.Mesh[], group: THREE.Group) =>
          registerMeshes(meshes, group, index),
      ),
    [registerMeshes],
  );

  return (
    <group ref={pivotRef}>
      {CAROUSEL_ITEMS.map((config, index) => (
        <Suspense key={config.id} fallback={null}>
          <CarouselItem
            config={config}
            index={index}
            totalCount={CAROUSEL_ITEMS.length}
            glassProps={glassProps}
            onRegister={registerCallbacks[index]}
          />
        </Suspense>
      ))}
    </group>
  );
}
