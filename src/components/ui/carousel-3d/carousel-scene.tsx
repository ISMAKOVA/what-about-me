'use client';

import { Suspense, useMemo } from 'react';
import * as THREE from 'three';

import { CAROUSEL_ITEMS } from '@/lib/carousel-items';
import CarouselItem, { GlassProps } from './carousel-item';
import { useCarousel } from './use-carousel';

interface CarouselSceneProps {
  glassProps: GlassProps;
}

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
