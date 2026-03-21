/**
 * Creates and appends the info panel DOM element to `container`.
 *
 * The panel is positioned absolute in the bottom-left corner with a
 * frosted-glass appearance. Visibility is driven by setting `opacity` directly
 * on the element — no React state involved.
 */
import {
  INFO_PANEL_BACKGROUND,
  INFO_PANEL_BLUR,
  INFO_PANEL_BORDER,
  INFO_PANEL_COLOR,
  INFO_PANEL_HEIGHT,
  INFO_PANEL_PADDING,
  INFO_PANEL_TRANSITION,
  INFO_PANEL_WIDTH,
} from './config';

export function createInfoPanel(container: HTMLDivElement): HTMLDivElement {
  const panel = document.createElement('div');

  panel.style.position = 'absolute';
  panel.style.bottom = '0';
  panel.style.left = '0';
  panel.style.width = INFO_PANEL_WIDTH;
  panel.style.height = INFO_PANEL_HEIGHT;
  panel.style.background = INFO_PANEL_BACKGROUND;
  panel.style.backdropFilter = INFO_PANEL_BLUR;
  panel.style.backdropFilter = INFO_PANEL_BLUR;
  panel.style.borderTop = INFO_PANEL_BORDER;
  panel.style.borderRight = INFO_PANEL_BORDER;
  panel.style.padding = INFO_PANEL_PADDING;
  panel.style.display = 'flex';
  panel.style.flexDirection = 'column';
  panel.style.justifyContent = 'flex-end';
  panel.style.opacity = '0';
  panel.style.pointerEvents = 'none';
  panel.style.transition = INFO_PANEL_TRANSITION;
  panel.style.zIndex = '10';
  panel.style.fontFamily = 'var(--font-satoshi)';
  panel.style.color = INFO_PANEL_COLOR;

  container.appendChild(panel);

  return panel;
}
