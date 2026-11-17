// ---------------------------------------------------------------------------
// Blue-Hour Lumbral UI:
// a limited palette, rounded paper cards, soft shadows, guardian paw badges
// and bold sans-serif type.
// ---------------------------------------------------------------------------

import { SCALE } from '../scale.js';

const U = SCALE / 2;

export const FOLK = {
  ink: 0x1e2b32,
  paper: 0xf3ecde,
  paperLight: 0xfbf6ec,
  coral: 0xe76f51,
  terracotta: 0xc26a4e,
  marigold: 0xe9b44c,
  teal: 0x2a7f78,
  mint: 0x7fb8a4,
  magenta: 0xb65a7a,
  cobalt: 0x2c4f7c,
  cream: 0xfff9ef,
  muted: 0x6f6a63,
  danger: 0xe05858,
};

// CSS-string and type tokens for Phaser Text styles. Keep menu copy in this
// palette instead of giving each screen its own near-matching color.
export const FOLK_CSS = {
  ink: '#1e2b32',
  paper: '#f3ecde',
  paperLight: '#fbf6ec',
  coral: '#e76f51',
  terracotta: '#c26a4e',
  marigold: '#e9b44c',
  teal: '#2a7f78',
  mint: '#7fb8a4',
  magenta: '#b65a7a',
  cobalt: '#2c4f7c',
  cream: '#fff9ef',
  muted: '#6f6a63',
  gold: '#f0c65a',
  night: '#a6d9f5',
  danger: '#e05858',
  dawn: '#b65f45',
};

export const FONT =
  '"Pixelify Sans", "Trebuchet MS", "Segoe UI", Arial, sans-serif';

// Menu type uses a compact three-step role scale: display, heading and body.
// The mobile body floor is 19.5 px internally, which lands at roughly 17.5 CSS
// px on a 390 px-tall landscape phone.
export const MENU_TEXT = {
  display: 14 * SCALE,
  heading: 8 * SCALE,
  body: 6.5 * SCALE,
};

// In-game type uses the same role logic at a slightly tighter display size.
// HUD and prompt copy share the 18 px body floor so it stays readable on a
// 390 px-tall landscape phone.
export const GAME_TEXT = {
  display: 12 * SCALE,
  heading: 8 * SCALE,
  body: 6 * SCALE,
};

const BUTTON_STYLES = {
  primary: {
    fill: FOLK.coral,
    text: FOLK_CSS.cream,
    border: FOLK.coral,
  },
  secondary: {
    fill: FOLK.paperLight,
    text: FOLK_CSS.ink,
    border: FOLK.ink,
  },
  dark: {
    fill: FOLK.ink,
    text: FOLK_CSS.cream,
    border: FOLK.ink,
  },
};

/**
 * Shared paper/folk menu button. Keeping the fill, border, type and touch
 * padding in one place prevents the title, map and end screens from drifting
 * into slightly different button styles.
 */
export function addMenuButton(
  scene,
  {
    x = 0,
    y = 0,
    label = '',
    variant = 'primary',
    fontSize = MENU_TEXT.body,
    minWidth = 0,
    height = 0,
    paddingX = 12 * U,
    paddingY = 7 * U,
    depth = 20,
    scrollFactor = 0,
    onClick = null,
  } = {},
) {
  const style = BUTTON_STYLES[variant] || BUTTON_STYLES.primary;
  const textStyle = {
    fontFamily: FONT,
    fontStyle: 'bold',
    fontSize,
    color: style.text,
    align: 'center',
  };
  if (style.textStroke) {
    textStyle.stroke = style.textStroke;
    textStyle.strokeThickness = 1.5 * U;
  }

  const text = scene.add
    .text(x, y, label, textStyle)
    .setOrigin(0.5)
    .setScrollFactor(scrollFactor)
    .setDepth(depth + 1);

  const w = Math.max(minWidth, Math.ceil(text.width + paddingX * 2));
  const h = height || Math.ceil(text.height + paddingY * 2);
  const bg = scene.add
    .rectangle(x, y, w, h, style.fill, 1)
    .setStrokeStyle(1 * U, style.border, 0.9)
    .setScrollFactor(scrollFactor)
    .setDepth(depth);

  if (onClick) {
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', (pointer, localX, localY, event) => {
      event?.stopPropagation?.();
      onClick(pointer);
    });
  }

  const button = { bg, text, w, h, variant };
  button.setPosition = (nextX, nextY) => {
    bg.setPosition(nextX, nextY);
    text.setPosition(nextX, nextY);
    return button;
  };
  button.setVisible = (visible) => {
    bg.setVisible(visible);
    text.setVisible(visible);
    return button;
  };
  button.setAlpha = (alpha) => {
    bg.setAlpha(alpha);
    text.setAlpha(alpha);
    return button;
  };
  button.setEnabled = (enabled) => {
    if (bg.input) bg.input.enabled = enabled;
    button.setAlpha(enabled ? 1 : 0.72);
    return button;
  };
  button.setLabel = (nextLabel) => {
    text.setText(nextLabel);
    const nextWidth = Math.max(
      minWidth,
      Math.ceil(text.width + paddingX * 2),
    );
    const nextHeight = height || Math.ceil(text.height + paddingY * 2);
    bg.setSize(nextWidth, nextHeight);
    button.w = nextWidth;
    button.h = nextHeight;
    return button;
  };
  button.setVariant = (nextVariant) => {
    const nextStyle = BUTTON_STYLES[nextVariant] || BUTTON_STYLES.primary;
    bg.setFillStyle(nextStyle.fill, 1);
    bg.setStrokeStyle(1 * U, nextStyle.border, 0.9);
    text.setColor(nextStyle.text);
    text.setStroke(
      nextStyle.textStroke || '',
      nextStyle.textStroke ? 1.5 * U : 0,
    );
    button.variant = nextVariant;
    return button;
  };

  return button;
}

function drawPawSeal(g, x, y, color) {
  const r = 4.5 * U;
  g.fillStyle(FOLK.paperLight, 1);
  g.fillCircle(x, y, r);
  g.lineStyle(1.1 * U, FOLK.ink, 1);
  g.strokeCircle(x, y, r);

  // A small guardian paw: one pad and four toes.
  g.fillStyle(color, 1);
  g.fillCircle(x, y + 1.1 * U, 1.7 * U);
  for (const [dx, dy] of [
    [-2.1, -0.5],
    [-0.7, -1.8],
    [0.7, -1.8],
    [2.1, -0.5],
  ]) {
    g.fillCircle(x + dx * U, y + dy * U, 0.82 * U);
  }
}

/**
 * Draw a hand-painted Blue-Hour card: a soft rounded paper surface, a thin ink
 * rule, one guardian paw and one time-of-day clock. All coordinates are in game
 * pixels.
 */
export function drawFolkCard(graphics, cx, cy, w, h) {
  const g = graphics;
  g.clear();

  const left = cx - w / 2;
  const top = cy - h / 2;
  const right = cx + w / 2;
  const radius = 10 * U;

  // Soft layered shadow instead of a hard offset block.
  g.fillStyle(FOLK.ink, 0.08);
  g.fillRoundedRect(left + 2 * U, top + 4 * U, w, h, radius);
  g.fillStyle(FOLK.ink, 0.14);
  g.fillRoundedRect(left + 5 * U, top + 7 * U, w, h, radius);

  // Paper surface and hairline rule.
  g.fillStyle(FOLK.paper, 1);
  g.fillRoundedRect(left, top, w, h, radius);
  g.lineStyle(1.2 * U, FOLK.ink, 0.9);
  g.strokeRoundedRect(left, top, w, h, radius);
  g.lineStyle(1 * U, FOLK.ink, 0.1);
  g.strokeRoundedRect(
    left + 6 * U,
    top + 6 * U,
    w - 12 * U,
    h - 12 * U,
    Math.max(2 * U, radius - 4 * U),
  );

  // One guardian badge keeps the card calm and puts Bonjo first.
  drawPawSeal(g, left + 12 * U, top + 12 * U, FOLK.coral);

  return g;
}
