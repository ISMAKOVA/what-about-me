/**
 * Imperative bridge between non-React code (Three.js, GSAP) and the
 * CursorContext pill system.
 *
 * Pattern: CursorProvider registers its `setSticky` implementation once on
 * mount via `registerCursorBridge`. Imperative code anywhere in the app
 * then calls `setCursorPill` to activate/deactivate the pill without
 * needing React context access.
 *
 * No React imports here — this file must be importable in non-React modules.
 */

type SetStickyFn = (
  el: HTMLElement | null,
  config?: { text?: string; magnet?: number; rotate?: boolean } | null,
) => void;

let _setSticky: SetStickyFn | null = null;

/**
 * Called once by CursorProvider to register the context's setSticky function.
 */
export function registerCursorBridge(fn: SetStickyFn): void {
  _setSticky = fn;
}

/**
 * Called by imperative (non-React) code to show a text pill on the cursor,
 * or pass `null` to revert to the default cursor.
 *
 * Uses a minimal sentinel element so StickyCursor has a valid stickyRef
 * without requiring an actual DOM element to track.
 */

// A singleton sentinel element that acts as the stickyRef.
// It is positioned off-screen so it never actually captures events.
let _sentinel: HTMLElement | null = null;

function getSentinel(): HTMLElement {
  if (typeof window === 'undefined') throw new Error('getSentinel called on server');
  if (!_sentinel) {
    _sentinel = document.createElement('div');
    _sentinel.style.position = 'fixed';
    _sentinel.style.top = '0px';
    _sentinel.style.left = '0px';
    _sentinel.style.width = '1px';
    _sentinel.style.height = '1px';
    _sentinel.style.pointerEvents = 'none';
    document.body.appendChild(_sentinel);
  }
  return _sentinel;
}

export function setCursorPill(text: string | null): void {
  if (!_setSticky) return;
  if (text !== null) {
    _setSticky(getSentinel(), { text, magnet: 0.3 });
  } else {
    _setSticky(null);
  }
}

/**
 * Repositions the sentinel element so StickyCursor orbits around the given
 * screen-space rectangle. Call every animation frame while the pill is active.
 *
 * x, y — CSS pixel coords of the sentinel's top-left corner
 * w, h — CSS pixel dimensions (approximate rendered size of the 3-D item)
 */
export function updatePillPosition(x: number, y: number, w: number, h: number): void {
  if (!_sentinel) return;
  _sentinel.style.left = `${x}px`;
  _sentinel.style.top = `${y}px`;
  _sentinel.style.width = `${w}px`;
  _sentinel.style.height = `${h}px`;
}
