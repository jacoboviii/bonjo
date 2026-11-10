// ---------------------------------------------------------------------------
// Blue-Hour La Cuadra folk-print UI:
// a limited palette, ink borders, lotería-card frames and papel picado trim.
// ---------------------------------------------------------------------------

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
};

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
  g.fillRect(left + 6, top + 6, w, h);

  // paper + lighter inset
  g.fillStyle(FOLK.paper, 1);
  g.fillRect(left, top, w, h);
  g.fillStyle(FOLK.paperLight, 1);
  g.fillRect(left + 4, top + 4, w - 8, h - 8);

  // double ink/coral frame
  g.lineStyle(6, FOLK.ink, 1);
  g.strokeRect(left, top, w, h);
  g.lineStyle(2, FOLK.coral, 1);
  g.strokeRect(left + 8, top + 8, w - 16, h - 16);
  g.lineStyle(1, FOLK.ink, 0.35);
  g.strokeRect(left + 13, top + 13, w - 26, h - 26);

  // corner stamps
  for (const [x, y] of [
    [left + 8, top + 8],
    [right - 8, top + 8],
    [left + 8, bottom - 8],
    [right - 8, bottom - 8],
  ]) {
    g.fillStyle(FOLK.ink, 1);
    g.fillRect(x - 4, y - 4, 8, 8);
    g.fillStyle(FOLK.marigold, 1);
    g.fillRect(x - 2, y - 2, 4, 4);
  }

  // papel picado strings, outside the paper edge
  const stringTop = top - 11;
  const stringBottom = bottom + 11;

  g.lineStyle(1, FOLK.ink, 1);
  g.lineBetween(left + 10, stringTop, right - 10, stringTop);
  g.lineBetween(left + 10, stringBottom, right - 10, stringBottom);

  let i = 0;
  for (let x = left + 14; x < right - 12; x += 19, i++) {
    const color = FLAG_COLORS[i % FLAG_COLORS.length];

    // top flags hang down
    g.fillStyle(color, 1);
    g.fillTriangle(x, stringTop + 1, x + 10, stringTop + 1, x + 5, stringTop + 10);
    g.fillStyle(FOLK.ink, 0.35);
    g.fillRect(x + 4, stringTop + 3, 1, 3);

    // bottom flags point up
    g.fillStyle(color, 1);
    g.fillTriangle(x, stringBottom - 1, x + 10, stringBottom - 1, x + 5, stringBottom - 10);
    g.fillStyle(FOLK.ink, 0.35);
    g.fillRect(x + 4, stringBottom - 6, 1, 3);
  }

  return g;
}
