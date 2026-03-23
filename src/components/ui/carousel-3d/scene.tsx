/* eslint-disable react/no-unknown-property */
'use client';

import { ContactShadows, Environment } from '@react-three/drei';
import type { RootState } from '@react-three/fiber';
import { Canvas } from '@react-three/fiber';
import { folder, useControls } from 'leva';
import { Suspense, useCallback, useState } from 'react';
import * as THREE from 'three';

import CarouselScene from './carousel-scene';
import {
  ACCENT_POINT_LIGHT_COLOR,
  ACCENT_POINT_LIGHT_INTENSITY,
  AMBIENT_LIGHT_COLOR,
  AMBIENT_LIGHT_INTENSITY,
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_NEAR,
  CAMERA_POSITION,
  DIR_LIGHT_COLOR,
  DIR_LIGHT_INTENSITY,
  DIR_LIGHT_POSITION,
  FILL_LIGHT_INTENSITY,
  FILL_LIGHT_POSITION,
  MAX_PIXEL_RATIO,
} from './config';
import type { GlassProps, LightValues } from './types';

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

function SceneContent({
  glassProps,
}: {
  glassProps: GlassProps;
}) {
  const lights = useLightControls();

  return (
    <>
      {/* Base — very low warm ambient to avoid pitch-black shadows */}
      <ambientLight intensity={lights.ambientIntensity} color={AMBIENT_LIGHT_COLOR} />

      {/* Key light — top-left, warm, soft shadows */}
      <directionalLight
        intensity={lights.dirIntensity}
        color={DIR_LIGHT_COLOR}
        position={[lights.dirX, lights.dirY, lights.dirZ]}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-camera-far={30}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-bias={-0.001}
      />

      {/* Fill light — opposite side, prevents harsh contrast */}
      <directionalLight
        intensity={lights.fillIntensity}
        position={[FILL_LIGHT_POSITION.x, FILL_LIGHT_POSITION.y, FILL_LIGHT_POSITION.z]}
      />

      {/* Accent point light — warm glow near items */}
      <pointLight
        position={[0, 0.5, 2]}
        intensity={ACCENT_POINT_LIGHT_INTENSITY}
        color={ACCENT_POINT_LIGHT_COLOR}
        distance={12}
        decay={2}
      />

      {/* Environment — studio preset gives clean reflections on glass */}
      <Suspense fallback={null}>
        <Environment preset="studio" />
      </Suspense>

      {/* Ground contact shadow — critical for depth and grounding */}
      <ContactShadows
        position={[0, -2, 0]}
        opacity={0.25}
        scale={20}
        blur={2.5}
        far={3}
        color="#2a2035"
      />

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
  const { background } = useControls('Scene', {
    background: { label: 'Background', value: 'transparent' },
  });

  const glassProps = useControls('Glass Material', {
    thickness: { value: 0.2, min: 0, max: 5, step: 0.01 },
    roughness: { value: 0, min: 0, max: 1, step: 0.01 },
    transmission: { value: 1, min: 0, max: 1, step: 0.01 },
    ior: { value: 1.2, min: 1, max: 2.333, step: 0.001 },
    chromaticAbberation: { value: 0.02, min: 0, max: 1, step: 0.001 },
    backside: true,
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
      shadows={{ type: THREE.PCFSoftShadowMap }}
      dpr={[1, MAX_PIXEL_RATIO]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
        powerPreference: 'high-performance',
      }}
      style={{ position: 'absolute', inset: 0, background }}
      onCreated={handleCreated}
    >
      <SceneContent glassProps={glassProps} />
    </Canvas>
  );
}
