/* eslint-disable react/no-unknown-property */
'use client';

import { MeshTransmissionMaterial, useGLTF, useTexture } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { CAROUSEL_ITEMS } from './config';
import type { GlassProps, ItemProps } from './types';

// ---------------------------------------------------------------------------
// Helper — collect meshes from a GLTF scene, with transforms resolved
// relative to the scene root so they can be placed in their own group.
// ---------------------------------------------------------------------------

function collectMeshData(root: THREE.Object3D) {
  root.updateMatrixWorld(true);
  const rootMatInverse = new THREE.Matrix4().copy(root.matrixWorld).invert();

  const result: Array<{
    geometry: THREE.BufferGeometry;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
    uuid: string;
  }> = [];

  root.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;

    const rel = new THREE.Matrix4().copy(rootMatInverse).multiply(mesh.matrixWorld);
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    rel.decompose(pos, quat, scale);

    result.push({
      geometry: mesh.geometry,
      position: pos,
      rotation: new THREE.Euler().setFromQuaternion(quat),
      scale,
      uuid: mesh.uuid,
    });
  });

  return result;
}

// ---------------------------------------------------------------------------
// Glass GLB item — renders extracted meshes with MeshTransmissionMaterial
// ---------------------------------------------------------------------------

function GlbGlassItem({ config, index, totalCount, glassProps, onRegister }: ItemProps) {
  const { scene: gltfScene } = useGLTF(config.modelPath!);
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  const meshData = useMemo(() => {
    const cloned = gltfScene.clone(true);
    return collectMeshData(cloned);
  }, [gltfScene]);

  useEffect(() => {
    const meshes = meshRefs.current.filter((m): m is THREE.Mesh => m !== null);
    if (groupRef.current && meshes.length > 0) {
      onRegister(meshes, groupRef.current);
    }
  }, [meshData, onRegister]);

  // Dispose cloned geometries on unmount to prevent GPU memory leaks
  useEffect(() => {
    return () => {
      meshData.forEach((md) => md.geometry.dispose());
    };
  }, [meshData]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {meshData.map((md, i) => (
        <mesh
          key={md.uuid}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          geometry={md.geometry}
          position={md.position}
          rotation={md.rotation}
          scale={md.scale}
          castShadow
          receiveShadow
        >
          <MeshTransmissionMaterial
            thickness={glassProps.thickness}
            roughness={glassProps.roughness}
            transmission={glassProps.transmission}
            ior={glassProps.ior}
            chromaticAberration={glassProps.chromaticAbberation}
            backside={glassProps.backside}
            samples={4}
            resolution={256}
          />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Standard GLB item (non-glass) — renders GLTF as-is via <primitive>
// ---------------------------------------------------------------------------

function GlbItem({ config, index, totalCount, onRegister }: Omit<ItemProps, 'glassProps'>) {
  const { scene: gltfScene } = useGLTF(config.modelPath!);
  const groupRef = useRef<THREE.Group>(null);

  const clonedScene = useMemo(() => gltfScene.clone(true), [gltfScene]);

  const meshes = useMemo(() => {
    const result: THREE.Mesh[] = [];
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        result.push(mesh);
      }
    });
    return result;
  }, [clonedScene]);

  useEffect(() => {
    if (groupRef.current && meshes.length > 0) {
      onRegister(meshes, groupRef.current);
    }
  }, [meshes, onRegister]);

  // Dispose cloned scene resources on unmount to prevent GPU memory leaks
  useEffect(() => {
    return () => {
      clonedScene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => m.dispose());
      });
    };
  }, [clonedScene]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Image item — flat plane with texture
// ---------------------------------------------------------------------------

function ImageItem({ config, index, totalCount, onRegister }: Omit<ItemProps, 'glassProps'>) {
  const texture = useTexture(config.imagePath!);
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const aspect = texture.image
    ? (texture.image as HTMLImageElement).naturalWidth /
      (texture.image as HTMLImageElement).naturalHeight
    : 1;

  useEffect(() => {
    if (meshRef.current && groupRef.current) {
      onRegister([meshRef.current], groupRef.current);
    }
  }, [texture, onRegister]);

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <planeGeometry args={[aspect, 1]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Public component — dispatches to the correct variant
// ---------------------------------------------------------------------------

export default function CarouselItem(props: ItemProps) {
  const { config } = props;

  if (config.imagePath) {
    return <ImageItem {...props} />;
  }

  if (config.glass) {
    return <GlbGlassItem {...props} />;
  }

  return <GlbItem {...props} />;
}

// Preload all GLB models up-front to avoid mid-session hitches
CAROUSEL_ITEMS.forEach((item) => {
  if (item.modelPath) useGLTF.preload(item.modelPath);
});
