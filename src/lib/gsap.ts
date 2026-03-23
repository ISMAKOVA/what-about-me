'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import Draggable from 'gsap/Draggable';
import InertiaPlugin from 'gsap/InertiaPlugin';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SplitText from 'gsap/SplitText';

let registered = false;
export function ensureGsapPlugins() {
  if (registered) return;
  gsap.registerPlugin(Draggable, InertiaPlugin, ScrollTrigger, SplitText, useGSAP);
  registered = true;
}

export { Draggable, gsap, InertiaPlugin, ScrollTrigger, SplitText, useGSAP };
