import * as THREE from 'three';

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
  SCENE_BACKGROUND_COLOR,
} from './config';

export interface SceneRig {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
}

/**
 * Creates a Three.js scene, camera, renderer, and standard lights for the
 * carousel. Appends the renderer canvas to `container`. Pure Three.js — no
 * React, no side-effects beyond DOM mutation on `container`.
 *
 * Caller is responsible for calling `renderer.dispose()` and removing the
 * canvas on teardown.
 */
export function createScene(container: HTMLDivElement): SceneRig {
  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SCENE_BACKGROUND_COLOR);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    container.clientWidth / container.clientHeight,
    CAMERA_NEAR,
    CAMERA_FAR,
  );
  camera.position.set(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z);
  camera.lookAt(0, 0, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // Canvas sits behind the label overlay divs
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.inset = '0';
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, AMBIENT_LIGHT_INTENSITY);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, DIR_LIGHT_INTENSITY);
  dirLight.position.set(DIR_LIGHT_POSITION.x, DIR_LIGHT_POSITION.y, DIR_LIGHT_POSITION.z);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, FILL_LIGHT_INTENSITY);
  fillLight.position.set(FILL_LIGHT_POSITION.x, FILL_LIGHT_POSITION.y, FILL_LIGHT_POSITION.z);
  scene.add(fillLight);

  return { scene, camera, renderer };
}
