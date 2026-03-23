# YODANIK Beats Platform

A premium, minimal, design-driven platform for selling beats and sample packs.

## Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **UI:** React 19, TypeScript 5, Tailwind CSS 4
- **3D:** React Three Fiber 9 + Drei 10 + Three.js 0.183
- **Animation:** GSAP 3 + Framer Motion 12
- **State:** Zustand 5 (vanilla + hooks hybrid)
- **Testing:** Playwright

## Directory Reference

```
src/
  app/                    # Next.js App Router pages
    api/checkout/         # Checkout API route
    shop/[id]/            # Dynamic product pages
  components/
    layout/               # Navbar, Footer, Container
    ui/                   # Interactive components
      carousel-3d/        # 3D carousel (scene, interaction, config)
      cursor/             # CursorProvider, StickyCursor, useCursorStick
      player/             # Audio player with oscilloscope
    sections/             # Page-level sections (Hero, etc.)
    primitives/           # Low-level components (SmoothArea)
    playground/           # Experimental / demo components
  lib/
    stores/               # useCarouselStore, usePlayerStore (Zustand)
    types.ts              # Beat interface and shared types
    beats.ts              # Beat data
    gsap.ts               # GSAP configuration
    cursor-bridge.ts      # Cursor interaction utilities
    constants.ts
  utils/
    cn.ts                 # Class name utility (use for all className merging)
    animations.ts         # Animation helpers
  providers/
    GsapProvider.tsx      # GSAP context provider (wrap animations in this)
```

## Core Philosophy

- Visual quality > quantity
- Performance is critical
- Minimalism and calm UI
- Physical-inspired design (CDs, tapes, glass, light)

## Performance Rules (CRITICAL)

- Never create Three.js objects inside render — always use `useMemo`
- Use a single `<Canvas>` instance (never remount)
- Limit DPR: `[1, 1.5]`
- Avoid heavy postprocessing
- Avoid unnecessary shadows
- Prefer fake effects over expensive real ones
- Prefer video/image sequences over heavy 3D

## Architecture Rules

- Clean separation: UI components / 3D scene components / logic+hooks
- Avoid monolithic components — keep them small and reusable
- Barrel exports via `index.ts` for cleaner imports

## React Three Fiber Rules

- Use `useFrame` only for animation — no heavy logic inside
- Avoid re-renders inside `<Canvas>`
- Memoize everything

```tsx
// Bad
const mat = new MeshStandardMaterial()

// Good
const mat = useMemo(() => new MeshStandardMaterial(), [])
```

## State Patterns

Zustand stores use a **vanilla + hooks hybrid** so Three.js effects and GSAP callbacks can access state imperatively (outside React):

```ts
// Imperative access (Three.js / GSAP callbacks)
import { useCarouselStore } from '@/lib/stores/useCarouselStore'
const { activeIndex } = useCarouselStore.getState()

// React components
const activeIndex = useCarouselStore(s => s.activeIndex)
```

## Animation Patterns

- **GSAP:** Use inside `GsapProvider` context for scoped cleanup
- **Framer Motion:** Use for component-level enter/exit animations
- **Cursor:** Magnetic interactions via `useCursorStick` hook + `CursorProvider`

## Visual Strategy

1. Start from lighting (not objects)
2. Add depth via shadows and gradients
3. Add imperfections (noise, variation)
4. Keep everything subtle

## What to Avoid

- Overengineering
- Too many lights or animations
- Sharp edges and harsh shadows
- "Game-like" 3D look

## Preferred Solutions

| Instead of | Use |
|---|---|
| Complex shaders | Gradients |
| Real-time 3D | Video/image |
| Heavy physics | Fake interactions |

## Decision Rule

If something looks:
- complex AND heavy → simplify
- realistic BUT slow → fake it
- impressive BUT distracting → remove it

## Goal

Create a calm, premium, visually unique platform that feels like a physical design object — not a typical website.
