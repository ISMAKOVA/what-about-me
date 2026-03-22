/* eslint-disable react/no-unknown-property */
'use client';

import { Environment } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import type { RootState } from '@react-three/fiber';
import { folder, useControls } from 'leva';
import { Suspense, useCallback, useState } from 'react';
import * as THREE from 'three';

import { GlassProps } from './carousel-item';
import CarouselScene from './carousel-scene';
import {
  AMBIENT_LIGHT_INTENSITY,
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_NEAR,
  CAMERA_POSITION,
  DIR_LIGHT_INTENSITY,
  DIR_LIGHT_POSITION,
  FILL_LIGHT_INTENSITY,
  FILL_LIGHT_POSITION,
  MAX_PIXEL_RATIO,
} from './config';

// ---------------------------------------------------------------------------
// Dev-only light controls — always calls hooks, but only renders in dev
// ---------------------------------------------------------------------------

interface LightValues {
  ambientIntensity: number;
  dirIntensity: number;
  dirX: number;
  dirY: number;
  dirZ: number;
  fillIntensity: number;
}

function useLightControls(): LightValues {
  const values = useControls({
    Lights: folder(
      {
        ambientIntensity: {
          label: 'Ambient',
          value: AMBIENT_LIGHT_INTENSITY,
          min: 0,
          max: 3,
          step: 0.05,
        },
        dirIntensity: {
          label: 'Dir Intensity',
          value: DIR_LIGHT_INTENSITY,
          min: 0,
          max: 5,
          step: 0.05,
        },
        dirX: { label: 'Dir X', value: DIR_LIGHT_POSITION.x, min: -20, max: 20, step: 0.1 },
        dirY: { label: 'Dir Y', value: DIR_LIGHT_POSITION.y, min: -20, max: 20, step: 0.1 },
        dirZ: { label: 'Dir Z', value: DIR_LIGHT_POSITION.z, min: -20, max: 20, step: 0.1 },
        fillIntensity: {
          label: 'Fill Intensity',
          value: FILL_LIGHT_INTENSITY,
          min: 0,
          max: 3,
          step: 0.05,
        },
      },
      { collapsed: true },
    ),
  });

  return values as unknown as LightValues;
}

// ---------------------------------------------------------------------------
// Inner component lives inside Canvas — has access to R3F context
// ---------------------------------------------------------------------------

function SceneContent({ glassProps }: { glassProps: GlassProps }) {
  const lights = useLightControls();

  return (
    <>
      <ambientLight intensity={lights.ambientIntensity} />
      <directionalLight
        intensity={lights.dirIntensity}
        position={[lights.dirX, lights.dirY, lights.dirZ]}
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <directionalLight
        intensity={lights.fillIntensity}
        position={[FILL_LIGHT_POSITION.x, FILL_LIGHT_POSITION.y, FILL_LIGHT_POSITION.z]}
      />
      <Suspense fallback={null}>
        <Environment preset="apartment" />
      </Suspense>
      <Suspense fallback={null}>
        <CarouselScene glassProps={glassProps} />
      </Suspense>
    </>
  );
}

// ---------------------------------------------------------------------------
// Default export — the dynamic-import target from index.tsx
// ---------------------------------------------------------------------------

export default function Scene() {
  const glassProps = useControls('Glass Material', {
    thickness: { value: 0.5, min: 0, max: 5, step: 0.01 },
    roughness: { value: 0, min: 0, max: 1, step: 0.01 },
    transmission: { value: 1, min: 0, max: 1, step: 0.01 },
    ior: { value: 1.5, min: 1, max: 2.333, step: 0.001 },
    chromaticAbberation: { value: 0.06, min: 0, max: 1, step: 0.001 },
    backside: false,
  }) as GlassProps;

  // Incrementing this key forces React to unmount and remount the Canvas,
  // which is the correct recovery path after a WebGL context restore — all
  // Three.js internal GPU resources (textures, programs, VAOs) must be
  // re-uploaded to the new context, and R3F's fiber tree must be rebuilt fresh.
  const [canvasKey, setCanvasKey] = useState(0);

  const handleCreated = useCallback(
    ({ gl }: RootState) => {
      const canvas = gl.domElement;

      const onContextLost = (event: Event): void => {
        // Prevent the browser from immediately discarding the context.
        // This gives us the chance to handle restoration ourselves.
        event.preventDefault();
      };

      const onContextRestored = (): void => {
        // Force a full Canvas remount so Three.js starts with a clean context.
        // R3F disposes the old renderer on unmount, then creates a fresh one.
        setCanvasKey((k) => k + 1);
      };

      canvas.addEventListener('webglcontextlost', onContextLost);
      canvas.addEventListener('webglcontextrestored', onContextRestored);

      // Cleanup is automatic: when canvasKey increments the old Canvas unmounts
      // and R3F calls renderer.dispose(), which destroys the canvas element.
      // The new Canvas mounts and calls handleCreated again with fresh listeners.
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <Canvas
      key={canvasKey}
      camera={{
        fov: CAMERA_FOV,
        near: CAMERA_NEAR,
        far: CAMERA_FAR,
        position: [CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z],
      }}
      shadows={{ type: THREE.PCFShadowMap }}
      dpr={[1, MAX_PIXEL_RATIO]}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0, background: '#ffffff' }}
      onCreated={handleCreated}
    >
      <SceneContent glassProps={glassProps} />
    </Canvas>
  );
}
