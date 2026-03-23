/**
 * Creates and appends the info panel DOM element directly to `document.body`
 * so it sits on a dedicated z-index layer above the Three.js canvas.
 *
 * The panel is fixed at the bottom-left of the viewport with configurable
 * margins and rounded corners. Visibility is driven by setting `opacity`
 * directly on the element — no React state involved.
 */
import {
  INFO_PANEL_BACKGROUND,
  INFO_PANEL_BLUR,
  INFO_PANEL_BORDER,
  INFO_PANEL_BORDER_RADIUS,
  INFO_PANEL_COLOR,
  INFO_PANEL_MARGIN_BOTTOM,
  INFO_PANEL_MARGIN_X,
  INFO_PANEL_MAX_WIDTH,
  INFO_PANEL_PADDING,
  INFO_PANEL_TRANSITION,
  INFO_PANEL_Z_INDEX,
} from './config';
import type { InfoPanelElements } from './types';

export function createInfoPanel(): InfoPanelElements {
  const panel = document.createElement('div');

  panel.style.position = 'fixed';
  panel.style.bottom = INFO_PANEL_MARGIN_BOTTOM;
  panel.style.left = INFO_PANEL_MARGIN_X;
  panel.style.maxWidth = INFO_PANEL_MAX_WIDTH;
  panel.style.background = INFO_PANEL_BACKGROUND;
  panel.style.backdropFilter = INFO_PANEL_BLUR;
  (panel.style as CSSStyleDeclaration & { WebkitBackdropFilter: string }).WebkitBackdropFilter =
    INFO_PANEL_BLUR;
  panel.style.border = INFO_PANEL_BORDER;
  panel.style.borderRadius = INFO_PANEL_BORDER_RADIUS;
  panel.style.padding = INFO_PANEL_PADDING;
  panel.style.display = 'flex';
  panel.style.flexDirection = 'column';
  panel.style.gap = '0.375rem';
  panel.style.opacity = '0';
  panel.style.pointerEvents = 'none';
  panel.style.transition = INFO_PANEL_TRANSITION;
  panel.style.zIndex = INFO_PANEL_Z_INDEX;
  panel.style.fontFamily = 'var(--font-satoshi)';
  panel.style.color = INFO_PANEL_COLOR;

  const nameEl = document.createElement('p');
  nameEl.style.fontSize = '0.75rem';
  nameEl.style.fontWeight = '700';
  nameEl.style.letterSpacing = '0.15em';
  nameEl.style.textTransform = 'uppercase';

  const descriptionEl = document.createElement('p');
  descriptionEl.style.fontSize = '0.8rem';
  descriptionEl.style.fontWeight = '400';
  descriptionEl.style.lineHeight = '1.5';
  descriptionEl.style.opacity = '0.65';

  panel.appendChild(nameEl);
  panel.appendChild(descriptionEl);

  document.body.appendChild(panel);

  return { panel, nameEl, descriptionEl };
}
