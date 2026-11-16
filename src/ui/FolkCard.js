// ---------------------------------------------------------------------------
// Blue-Hour La Cuadra folk-print UI:
// a limited palette, ink borders, lotería-card frames and papel picado trim.
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

const FLAG_COLORS = [FOLK.coral, FOLK.mint, FOLK.marigold, FOLK.magenta];

/**
 * Draw a lotería-style paper card with an ink frame and papel-picado strings
 * hanging just outside its top and bottom edges.
 *
 * All coordinates are in game pixels.
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

  // corner stamps
  for (const [x, y] of [
    [left + 8 * U, top + 8 * U],
    [right - 8 * U, top + 8 * U],
    [left + 8 * U, bottom - 8 * U],
    [right - 8 * U, bottom - 8 * U],
  ]) {
    g.fillStyle(FOLK.ink, 1);
    g.fillRect(x - 4 * U, y - 4 * U, 8 * U, 8 * U);
    g.fillStyle(FOLK.marigold, 1);
    g.fillRect(x - 2 * U, y - 2 * U, 4 * U, 4 * U);
  }

  // papel picado strings, outside the paper edge
  const stringTop = top - 11 * U;
  const stringBottom = bottom + 11 * U;

  g.lineStyle(1 * U, FOLK.ink, 1);
  g.lineBetween(left + 10 * U, stringTop, right - 10 * U, stringTop);
  g.lineBetween(left + 10 * U, stringBottom, right - 10 * U, stringBottom);

  let i = 0;
  for (let x = left + 14 * U; x < right - 12 * U; x += 19 * U, i++) {
    const color = FLAG_COLORS[i % FLAG_COLORS.length];

    // top flags hang down
    g.fillStyle(color, 1);
    g.fillTriangle(
      x,
      stringTop + 1 * U,
      x + 10 * U,
      stringTop + 1 * U,
      x + 5 * U,
      stringTop + 10 * U,
    );
    g.fillStyle(FOLK.ink, 0.35);
    g.fillRect(x + 4 * U, stringTop + 3 * U, 1 * U, 3 * U);

    // bottom flags point up
    g.fillStyle(color, 1);
    g.fillTriangle(
      x,
      stringBottom - 1 * U,
      x + 10 * U,
      stringBottom - 1 * U,
      x + 5 * U,
      stringBottom - 10 * U,
    );
    g.fillStyle(FOLK.ink, 0.35);
    g.fillRect(x + 4 * U, stringBottom - 6 * U, 1 * U, 3 * U);
  }

  return g;
}
