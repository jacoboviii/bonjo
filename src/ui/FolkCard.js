// ---------------------------------------------------------------------------
// Blue-Hour La Cuadra UI:
// a limited palette, ink borders, hand-painted card frames, clock seals and
// string-light trim.
// ---------------------------------------------------------------------------

import { SCALE } from '../scale.js';

const U = SCALE / 2;

export const FOLK = {
  ink: 0x1d1326,
  paper: 0xf4dfb0,
  paperLight: 0xf8e9c6,
  coral: 0xe85a4f,
  terracotta: 0xc46b4a,
  marigold: 0xf2b544,
  teal: 0x2f7f78,
  mint: 0x7fc7a3,
  magenta: 0xb54a78,
  cobalt: 0x244a7a,
  cream: 0xfff4e0,
  muted: 0x6a5a70,
  danger: 0xf26b5e,
};

// CSS-string and type tokens for Phaser Text styles. Keep menu copy in this
// palette instead of giving each screen its own near-matching color.
export const FOLK_CSS = {
  ink: '#1d1326',
  paper: '#f4dfb0',
  paperLight: '#f8e9c6',
  coral: '#e85a4f',
  terracotta: '#c46b4a',
  marigold: '#f2b544',
  teal: '#2f7f78',
  mint: '#7fc7a3',
  magenta: '#b54a78',
  cobalt: '#244a7a',
  cream: '#fff4e0',
  muted: '#6a5a70',
  gold: '#ffd166',
  night: '#9fd8ff',
  danger: '#f26b5e',
  dawn: '#b5533a',
};

export const FONT = 'monospace';

const BUTTON_STYLES = {
  primary: {
    fill: FOLK.coral,
    text: FOLK_CSS.cream,
    textStroke: FOLK_CSS.ink,
    border: FOLK.ink,
  },
  secondary: {
    fill: FOLK.paper,
    text: FOLK_CSS.ink,
    border: FOLK.ink,
  },
  dark: {
    fill: FOLK.ink,
    text: FOLK_CSS.cream,
    border: FOLK.coral,
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
    fontSize = 6 * SCALE,
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
    .setStrokeStyle(1.5 * U, style.border, 1)
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
    bg.setStrokeStyle(1.5 * U, nextStyle.border, 1);
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

function drawClockSeal(g, x, y, color) {
  const r = 4.5 * U;
  g.fillStyle(FOLK.paperLight, 1);
  g.fillCircle(x, y, r);
  g.lineStyle(1.1 * U, FOLK.ink, 1);
  g.strokeCircle(x, y, r);

  // four cardinal ticks
  g.lineStyle(0.7 * U, FOLK.ink, 0.65);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    g.lineBetween(
      x + Math.cos(a) * r * 0.72,
      y + Math.sin(a) * r * 0.72,
      x + Math.cos(a) * r * 0.9,
      y + Math.sin(a) * r * 0.9,
    );
  }

  // hands and center pin
  g.lineStyle(1.1 * U, color, 1);
  g.lineBetween(x, y, x, y - r * 0.52);
  g.lineBetween(x, y, x + r * 0.4, y + r * 0.22);
  g.fillStyle(color, 1);
  g.fillCircle(x, y, 1.1 * U);
}

function drawStringLights(g, y, left, right) {
  g.lineStyle(0.9 * U, FOLK.ink, 0.9);
  g.lineBetween(left + 10 * U, y, right - 10 * U, y);

  let i = 0;
  for (let x = left + 18 * U; x < right - 16 * U; x += 18 * U, i++) {
    const color = i % 4 === 0 ? FOLK.mint : FOLK.marigold;
    const bulbY = y + 3.2 * U;
    g.fillStyle(color, 0.2);
    g.fillCircle(x, bulbY, 3.4 * U);
    g.fillStyle(color, 1);
    g.fillCircle(x, bulbY, 1.35 * U);
    g.fillStyle(FOLK.cream, 0.95);
    g.fillCircle(x - 0.45 * U, bulbY - 0.45 * U, 0.55 * U);
  }
}

/**
 * Draw a hand-painted Blue-Hour card with an ink frame, clock-seal corners and
 * string-light trim. All coordinates are in game pixels.
 */
export function drawFolkCard(graphics, cx, cy, w, h) {
  const g = graphics;
  g.clear();

  const left = cx - w / 2;
  const top = cy - h / 2;
  const right = cx + w / 2;
  const bottom = cy + h / 2;

  // offset ink shadow
  g.fillStyle(FOLK.ink, 0.32);
  g.fillRect(left + 6 * U, top + 6 * U, w, h);

  // paper + lighter inset
  g.fillStyle(FOLK.paper, 1);
  g.fillRect(left, top, w, h);
  g.fillStyle(FOLK.paperLight, 1);
  g.fillRect(left + 4 * U, top + 4 * U, w - 8 * U, h - 8 * U);

  // double ink/coral frame
  g.lineStyle(6 * U, FOLK.ink, 1);
  g.strokeRect(left, top, w, h);
  g.lineStyle(2 * U, FOLK.coral, 1);
  g.strokeRect(left + 8 * U, top + 8 * U, w - 16 * U, h - 16 * U);
  g.lineStyle(1 * U, FOLK.ink, 0.35);
  g.strokeRect(left + 13 * U, top + 13 * U, w - 26 * U, h - 26 * U);

  // Guardian paws first, time-of-day seals second.
  const cornerSeals = [
    [left + 8 * U, top + 8 * U, FOLK.coral, 'paw'],
    [right - 8 * U, top + 8 * U, FOLK.marigold, 'paw'],
    [left + 8 * U, bottom - 8 * U, FOLK.teal, 'clock'],
    [right - 8 * U, bottom - 8 * U, FOLK.marigold, 'clock'],
  ];
  for (const [x, y, color, kind] of cornerSeals) {
    if (kind === 'paw') drawPawSeal(g, x, y, color);
    else drawClockSeal(g, x, y, color);
  }

  // Warm string-light trim.
  drawStringLights(g, top - 8 * U, left, right);
  drawStringLights(g, bottom + 8 * U, left, right);

  return g;
}
