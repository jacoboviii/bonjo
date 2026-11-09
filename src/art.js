// ---------------------------------------------------------------------------
// All art is generated in code as tiny pixel textures, so the prototype needs
// zero image files. Later, swap these for real Aseprite PNGs: keep the same
// texture keys ('dog', 'dogGlide', 'crow', etc.) and nothing else changes.
//
// Palette: deep plum, coral, gold, mint, cream.
// ---------------------------------------------------------------------------

import { SCALE } from './scale.js';

const INK = 0x2b1b3d;
const CREAM = 0xfff4e0;
const CORAL = 0xf26b5e;
const GOLD = 0xffd166;
const MINT = 0x6ec6a8;
const ORANGE = 0xf0a03c;
const ORANGE_DARK = 0xc97a25;

// Every drawing call is written in design units (as if the game were 256x144)
// and scaled here by SCALE, so textures are generated at 2x resolution.
function gfx(scene) {
  const k = SCALE;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  return {
    raw: g,
    fillStyle: (color, alpha = 1) => g.fillStyle(color, alpha),
    fillRect: (x, y, w, h) => g.fillRect(x * k, y * k, w * k, h * k),
    fillCircle: (x, y, r) => g.fillCircle(x * k, y * k, r * k),
    fillTriangle: (x1, y1, x2, y2, x3, y3) =>
      g.fillTriangle(x1 * k, y1 * k, x2 * k, y2 * k, x3 * k, y3 * k),
    lineStyle: (width, color, alpha = 1) =>
      g.lineStyle(Math.max(1, width * k), color, alpha),
    lineBetween: (x1, y1, x2, y2) => g.lineBetween(x1 * k, y1 * k, x2 * k, y2 * k),
    strokeCircle: (x, y, r) => g.strokeCircle(x * k, y * k, r * k),
    generateTexture: (key, w, h) =>
      g.generateTexture(key, Math.round(w * k), Math.round(h * k)),
    destroy: () => g.destroy(),
  };
}

// Deterministic pseudo-random so speckles look identical every run.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function buildTextures(scene) {
  if (scene.textures.exists('dog')) return;

  makeSky(scene);
  makeSun(scene);
  makeCloudBand(scene, 'cloudsFar', 5, 1, 1337);
  makeCloudBand(scene, 'cloudsNear', 3, 2, 4242);
  makeTown(scene);
  makeBanner(scene);

  makeDog(scene, 'dog', 'idle');
  makeDog(scene, 'dogSit', 'sit');
  makeDog(scene, 'dogWalkA', 'walkA');
  makeDog(scene, 'dogWalkB', 'walkB');
  makeDog(scene, 'dogGlide', 'glide');
  makeDog(scene, 'dogDive', 'dive');
  makeTongue(scene);
  makeSquirrel(scene, 'squirrel', 'idle');
  makeSquirrel(scene, 'squirrelRun', 'run');
  makeRivalDog(scene, 'rival', 'idle');
  makeRivalDog(scene, 'rivalRun', 'run');
  makePinata(scene);
  makeRope(scene);
  makeAwning(scene);
  makeControlButtons(scene);

  makeCrow(scene);
  makeBone(scene);
  makeBalloon(scene, 'balloon', CORAL, false);
  makeBalloon(scene, 'goalBalloon', GOLD, true);
  makeRing(scene);
  makePuff(scene);
}

// --- background ------------------------------------------------------------

function mixColor(a, b, t) {
  const ar = (a >> 16) & 255;
  const ag = (a >> 8) & 255;
  const ab = a & 255;
  const br = (b >> 16) & 255;
  const bg = (b >> 8) & 255;
  const bb = b & 255;
  return (
    (Math.round(ar + (br - ar) * t) << 16) |
    (Math.round(ag + (bg - ag) * t) << 8) |
    Math.round(ab + (bb - ab) * t)
  );
}

function makeSky(scene) {
  const g = gfx(scene);

  // Graphics gradients don't survive generateTexture (canvas renderer), so
  // paint the sunset as horizontal bands instead.
  const bands = 90;
  const top = 0x1b1029;
  const bottom = 0xe0715f;
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    g.fillStyle(mixColor(top, bottom, t * t * 0.85 + t * 0.15), 1);
    g.fillRect(0, Math.floor((i * 144) / bands), 256, Math.ceil(144 / bands) + 1);
  }

  // a few early stars, only in the cool upper sky
  g.fillStyle(0x9a8aa8, 1);
  for (const [x, y] of [
    [22, 16], [58, 9], [96, 22], [140, 11], [188, 18],
    [236, 8], [284, 20], [304, 44], [36, 40], [120, 34],
  ]) {
    if (x < 256 && y < 144) g.fillRect(x, y, 1, 1);
  }

  g.generateTexture('sky', 256, 144);
  g.destroy();
}

function makeSun(scene) {
  const g = gfx(scene);
  g.fillStyle(GOLD, 1);
  g.fillCircle(24, 24, 11);
  g.fillStyle(CREAM, 1);
  g.fillCircle(20, 20, 4);
  g.generateTexture('sun', 48, 48);
  g.destroy();
}

function drawCloud(g, x, y, s) {
  g.fillStyle(0xffe8d6, 1);
  g.fillRect(x, y + 6 * s, 26 * s, 5 * s);
  g.fillRect(x + 4 * s, y + 3 * s, 16 * s, 5 * s);
  g.fillRect(x + 9 * s, y, 9 * s, 5 * s);
}

function makeCloudBand(scene, key, count, scale, seed) {
  const g = gfx(scene);
  const rnd = rng(seed);

  for (let i = 0; i < count; i++) {
    const cx = Math.floor(rnd() * 320);
    const cy = 6 + Math.floor(rnd() * 16);
    // draw off-screen copies too so the 320px band tiles seamlessly
    for (const off of [-320, 0, 320]) drawCloud(g, cx + off, cy, scale);
  }

  g.generateTexture(key, 320, 64);
  g.destroy();
}

function makeTown(scene) {
  const g = gfx(scene);
  const W = 320;
  const H = 100;

  // distant mountains
  g.fillStyle(0x4a3550, 1);
  for (const off of [-W, 0, W]) {
    g.fillTriangle(off + 10, 82, off + 70, 44, off + 130, 82);
    g.fillTriangle(off + 110, 82, off + 165, 52, off + 225, 82);
    g.fillTriangle(off + 215, 82, off + 265, 36, off + 315, 82);
  }

  // agricultural fields at the edge of town
  g.fillStyle(0x5c7048, 1);
  g.fillRect(0, 79, W, 21);
  g.fillStyle(0x4a5d3a, 1);
  for (let x = 0; x < W; x += 9) g.fillRect(x, 81, 4, 19);
  g.fillStyle(0x3f5233, 1);
  for (const ax of [16, 74, 138, 208, 286]) {
    for (const off of [-W, 0, W]) {
      const x = ax + off;
      g.fillTriangle(x, 92, x + 5, 74, x + 10, 92);
      g.fillTriangle(x, 92, x - 5, 79, x, 92);
      g.fillTriangle(x + 10, 92, x + 15, 79, x + 10, 92);
    }
  }

  // low houses with flat roofs and lit windows
  const buildings = [
    { x: -12, w: 36, h: 30, c: 0x8a5a44, r: 0x5a3328, win: 2 },
    { x: 26, w: 30, h: 38, c: 0x9a6a4a, r: 0x5a3328, win: 2 },
    { x: 58, w: 34, h: 24, c: 0x6f8a80, r: 0x4a2f2a, win: 2 },
    { x: 94, w: 26, h: 34, c: 0x9a7a4f, r: 0x5a3328, win: 2 },
    { x: 122, w: 40, h: 28, c: 0x8a4f3a, r: 0x4a2f2a, win: 3 },
    { x: 164, w: 30, h: 40, c: 0x7a6a52, r: 0x5a3328, win: 2 },
    { x: 196, w: 26, h: 26, c: 0x8f6a55, r: 0x4a2f2a, win: 2 },
    { x: 254, w: 34, h: 32, c: 0x9a5f4a, r: 0x5a3328, win: 2 },
    { x: 290, w: 30, h: 36, c: 0x6f8a80, r: 0x4a2f2a, win: 2 },
  ];

  const drawBuilding = (b, off) => {
    const x = b.x + off;
    const top = 80 - b.h;
    g.fillStyle(b.c, 1);
    g.fillRect(x, top, b.w, b.h);

    // parapet
    g.fillStyle(b.r, 1);
    g.fillRect(x, top - 3, b.w, 3);
    g.fillRect(x, top - 3, 2, 6);
    g.fillRect(x + b.w - 2, top - 3, 2, 6);

    // windows
    g.fillStyle(0xffcf6a, 1);
    for (let row = 0; row < b.win; row++) {
      for (let wx = x + 5; wx < x + b.w - 5; wx += 11) {
        g.fillRect(wx, top + 6 + row * 10, 3, 4);
      }
    }

    // door
    g.fillStyle(0x3a241f, 1);
    g.fillRect(x + Math.floor(b.w / 2) - 2, 80 - 9, 5, 9);
  };

  for (const off of [-W, 0, W]) {
    for (const b of buildings) drawBuilding(b, off);
  }

  // parish church tower and cross
  for (const off of [-W, 0, W]) {
    const x = 224 + off;
    g.fillStyle(0x9a7a5a, 1);
    g.fillRect(x, 30, 24, 50);
    g.fillStyle(0x5a3328, 1);
    g.fillRect(x - 2, 28, 28, 3);
    g.fillStyle(0x8a5a44, 1);
    g.fillRect(x + 2, 34, 20, 6);
    g.fillStyle(0x2b1b3d, 1);
    g.fillRect(x + 8, 36, 8, 3);
    g.fillStyle(0x8a5a44, 1);
    g.fillTriangle(x + 2, 30, x + 22, 30, x + 12, 22);
    g.fillStyle(0xd9b26a, 1);
    g.fillRect(x + 11, 12, 2, 16);
    g.fillRect(x + 7, 16, 10, 2);
  }

  // rooftop details
  for (const off of [-W, 0, W]) {
    g.fillStyle(0x2b1b3d, 1);
    g.fillRect(46 + off, 34, 1, 8);
    g.fillRect(150 + off, 30, 1, 10);
    g.fillStyle(0x6f8a80, 1);
    g.fillRect(100 + off, 36, 8, 6);
    g.fillRect(102 + off, 33, 4, 3);
    g.fillStyle(0x2b1b3d, 1);
    g.fillRect(101 + off, 42, 1, 8);
    g.fillRect(106 + off, 42, 1, 8);
  }

  g.generateTexture('town', W, H);
  g.destroy();
}

// Strings of papel picado across the street.
function makeBanner(scene) {
  const g = gfx(scene);
  const W = 320;
  const H = 14;
  const colors = [0xf26b5e, 0x6ec6a8, 0xffd166, 0xb45cd6];

  g.fillStyle(0xd9b26a, 1);
  for (let x = 0; x < W; x += 4) {
    g.fillRect(x, 2 + (x % 40 < 20 ? 1 : 0), 4, 1);
  }

  for (let i = 0; i < 16; i++) {
    const x = i * 20 + 5;
    const c = colors[i % 4];
    g.fillStyle(c, 1);
    g.fillRect(x, 4, 10, 7);
    g.fillRect(x + 2, 11, 2, 2);
    g.fillRect(x + 6, 11, 2, 2);
    g.fillStyle(0x1b1029, 1);
    g.fillRect(x + 4, 6, 2, 2);
  }

  g.generateTexture('banner', W, H);
  g.destroy();
}

// --- the dog: a black chow with a purple tongue -----------------------------

const CHOW_FUR = 0x2a2135;
const CHOW_DARK = 0x1a1224;
const CHOW_LIGHT = 0x453857;
const CHOW_RIM = 0x6f5c86;
const CHOW_TONGUE = 0xb45cd6;
const CHOW_TONGUE_DARK = 0x8a3fb0;
const CHOW_AMBER = 0xffcf5c;
const CHOW_INK = 0x0d0813;

function rawGfx(scene) {
  return scene.make.graphics({ x: 0, y: 0, add: false });
}

// The chow is drawn directly at 32x32 (2x the design grid) so it can hold
// finer detail than the rest of the placeholder art.
function makeDog(scene, key, pose) {
  const g = rawGfx(scene);

  // curled fluffy tail over the back
  g.fillStyle(CHOW_DARK, 1);
  g.fillRect(1, 9, 6, 7);
  g.fillRect(3, 6, 5, 4);
  g.fillRect(0, 12, 4, 4);
  g.fillRect(5, 7, 3, 3);
  g.fillStyle(CHOW_RIM, 1);
  g.fillRect(4, 6, 3, 1);
  g.fillRect(1, 9, 2, 1);

  // legs
  g.fillStyle(CHOW_DARK, 1);
  if (pose === 'dive') {
    g.fillRect(2, 19, 10, 4);
    g.fillRect(14, 21, 4, 3);
  } else if (pose === 'glide') {
    g.fillRect(6, 24, 5, 3);
    g.fillRect(16, 24, 4, 3);
  } else if (pose === 'walkA') {
    g.fillRect(5, 23, 4, 8);
    g.fillRect(19, 23, 4, 8);
  } else if (pose === 'walkB') {
    g.fillRect(9, 23, 4, 8);
    g.fillRect(15, 23, 4, 8);
  } else if (pose === 'sit') {
    // folded haunch at the back, upright front leg
    g.fillRect(4, 22, 10, 8);
    g.fillRect(19, 21, 4, 10);
  } else {
    g.fillRect(7, 23, 4, 8);
    g.fillRect(17, 23, 4, 8);
  }
  g.fillStyle(CHOW_LIGHT, 1);
  if (pose === 'dive') {
    g.fillRect(2, 22, 4, 1);
    g.fillRect(15, 23, 3, 1);
  } else if (pose === 'glide') {
    g.fillRect(6, 26, 5, 1);
    g.fillRect(16, 26, 4, 1);
  } else if (pose === 'walkA') {
    g.fillRect(5, 29, 4, 2);
    g.fillRect(19, 29, 4, 2);
  } else if (pose === 'walkB') {
    g.fillRect(9, 29, 4, 2);
    g.fillRect(15, 29, 4, 2);
  } else if (pose === 'sit') {
    g.fillRect(4, 29, 6, 2);
    g.fillRect(19, 29, 4, 2);
  } else {
    g.fillRect(7, 29, 4, 2);
    g.fillRect(17, 29, 4, 2);
  }

  // body + fluffy mane
  g.fillStyle(CHOW_FUR, 1);
  if (pose === 'sit') {
    // chest up, back sloping down to the hips
    g.fillRect(8, 17, 7, 10);
    g.fillRect(4, 20, 6, 9);
  } else {
    g.fillRect(5, 15, 16, 11);
  }
  g.fillRect(12, 11, 9, 16);
  g.fillRect(15, 9, 6, 4);
  // mane tufts
  g.fillRect(11, 13, 2, 2);
  g.fillRect(11, 17, 2, 2);
  g.fillRect(12, 21, 2, 3);
  g.fillRect(14, 25, 3, 2);
  g.fillRect(20, 8, 3, 3);

  // chest / belly shading
  g.fillStyle(CHOW_LIGHT, 1);
  if (pose !== 'sit') g.fillRect(7, 24, 10, 1);
  g.fillRect(13, 20, 2, 4);

  // rim light along the back and mane
  g.fillStyle(CHOW_RIM, 1);
  if (pose === 'sit') {
    g.fillRect(12, 15, 9, 1);
    g.fillRect(8, 17, 4, 1);
    g.fillRect(4, 20, 4, 1);
  } else {
    g.fillRect(7, 15, 9, 1);
  }
  g.fillRect(16, 9, 4, 1);
  g.fillRect(13, 11, 3, 1);
  g.fillRect(21, 8, 2, 1);
  // ...and around the silhouette so the black fur reads at night
  g.fillRect(19, 9, 8, 1);
  g.fillRect(11, 14, 1, 8);
  g.fillRect(12, 22, 1, 3);
  g.fillRect(2, 12, 1, 5);
  g.fillRect(6, 15, 1, 3);

  // sitting: a big folded haunch at the back reads as "sit" at 32px
  if (pose === 'sit') {
    g.fillStyle(CHOW_FUR, 1);
    g.fillRect(2, 20, 12, 11);
    g.fillStyle(CHOW_DARK, 1);
    g.fillRect(3, 27, 10, 4);
    g.fillStyle(CHOW_LIGHT, 1);
    g.fillRect(4, 29, 9, 2);
    g.fillStyle(CHOW_RIM, 1);
    g.fillRect(3, 20, 9, 1);
    g.fillRect(2, 24, 1, 4);
  }

  // shaggy mane / curled tail tufts
  g.fillStyle(CHOW_LIGHT, 1);
  g.fillRect(10, 14, 2, 1);
  g.fillRect(9, 16, 2, 1);
  g.fillRect(9, 19, 2, 1);
  g.fillRect(10, 22, 2, 1);
  g.fillRect(12, 25, 2, 1);
  g.fillStyle(CHOW_RIM, 1);
  g.fillRect(11, 14, 1, 1);
  g.fillRect(10, 17, 1, 1);
  g.fillRect(10, 20, 1, 1);
  g.fillRect(11, 23, 1, 1);
  g.fillRect(1, 9, 2, 1);
  g.fillRect(0, 12, 2, 1);
  g.fillRect(3, 6, 3, 1);

  // head
  g.fillStyle(CHOW_FUR, 1);
  g.fillRect(18, 9, 10, 11);
  g.fillRect(16, 12, 3, 7);
  g.fillRect(22, 8, 3, 2);

  // ears
  g.fillStyle(CHOW_DARK, 1);
  if (pose === 'glide') {
    g.fillRect(21, 6, 4, 3);
    g.fillRect(25, 6, 4, 3);
  } else {
    g.fillRect(18, 5, 4, 5);
    g.fillRect(24, 4, 4, 6);
    g.fillStyle(0x4a3a5a, 1);
    g.fillRect(19, 6, 2, 2);
    g.fillRect(25, 5, 2, 3);
  }

  // muzzle
  g.fillStyle(CHOW_LIGHT, 1);
  g.fillRect(24, 14, 8, 6);
  g.fillStyle(CHOW_DARK, 1);
  g.fillRect(25, 17, 6, 2);
  g.fillStyle(CHOW_INK, 1);
  g.fillRect(30, 14, 2, 3);

  // amber eye + glint
  g.fillStyle(CHOW_AMBER, 1);
  g.fillRect(23, 11, 2, 2);
  g.fillStyle(CHOW_INK, 1);
  g.fillRect(24, 11, 1, 2);
  g.fillStyle(CREAM, 1);
  g.fillRect(23, 11, 1, 1);

  // mint collar + gold tag
  g.fillStyle(MINT, 1);
  g.fillRect(19, 19, 2, 6);
  g.fillStyle(GOLD, 1);
  g.fillRect(18, 23, 2, 2);

  // stray guard hairs on the silhouette
  g.fillStyle(CHOW_FUR, 1);
  g.fillRect(4, 14, 2, 1);
  g.fillRect(2, 8, 2, 1);
  g.fillRect(28, 7, 2, 1);

  g.generateTexture(key, 32, 32);
  g.destroy();
}

function makeTongue(scene) {
  const g = rawGfx(scene);
  g.fillStyle(CHOW_TONGUE, 1);
  g.fillRect(2, 0, 2, 1);
  g.fillRect(1, 1, 4, 4);
  g.fillRect(2, 5, 2, 3);
  g.fillStyle(0xd98cf0, 1);
  g.fillRect(2, 1, 1, 1);
  g.fillStyle(CHOW_TONGUE_DARK, 1);
  g.fillRect(2, 3, 1, 3);
  g.generateTexture('tongue', 6, 8);
  g.destroy();
}

// --- squirrel --------------------------------------------------------------

const SQ_FUR = 0xb5652f;
const SQ_DARK = 0x7c3f1d;
const SQ_LIGHT = 0xd98a4a;
const SQ_BELLY = 0xf4dcc0;
const SQ_INK = 0x1a1224;

function makeSquirrel(scene, key, pose) {
  const g = rawGfx(scene);

  // big bushy tail behind the body
  g.fillStyle(SQ_DARK, 1);
  g.fillRect(4, 11, 7, 11);
  g.fillRect(2, 7, 6, 7);
  g.fillRect(3, 3, 5, 5);
  g.fillRect(6, 1, 4, 4);
  g.fillStyle(SQ_FUR, 1);
  g.fillRect(5, 11, 4, 8);
  g.fillRect(3, 7, 4, 4);
  g.fillRect(4, 3, 3, 4);
  g.fillStyle(SQ_LIGHT, 1);
  g.fillRect(5, 3, 1, 3);
  g.fillRect(8, 1, 2, 2);
  g.fillStyle(SQ_BELLY, 1);
  g.fillRect(7, 0, 3, 2);

  // body
  g.fillStyle(SQ_FUR, 1);
  g.fillRect(8, 13, 14, 11);
  g.fillRect(10, 11, 9, 3);
  g.fillRect(10, 24, 10, 2);

  // belly
  g.fillStyle(SQ_BELLY, 1);
  g.fillRect(10, 19, 11, 5);

  // legs
  g.fillStyle(SQ_DARK, 1);
  if (pose === 'run') {
    g.fillRect(10, 23, 4, 4);
    g.fillRect(17, 23, 4, 4);
  } else {
    g.fillRect(9, 23, 3, 4);
    g.fillRect(19, 23, 3, 4);
  }
  g.fillStyle(SQ_BELLY, 1);
  if (pose === 'run') {
    g.fillRect(10, 26, 4, 1);
    g.fillRect(17, 26, 4, 1);
  } else {
    g.fillRect(9, 26, 3, 1);
    g.fillRect(19, 26, 3, 1);
  }

  // head + cheek
  g.fillStyle(SQ_FUR, 1);
  g.fillRect(20, 9, 9, 10);
  g.fillRect(19, 13, 3, 5);

  // ear
  g.fillStyle(SQ_DARK, 1);
  g.fillRect(22, 5, 3, 4);
  g.fillStyle(SQ_LIGHT, 1);
  g.fillRect(23, 6, 1, 2);

  // muzzle, nose, tooth
  g.fillStyle(SQ_BELLY, 1);
  g.fillRect(26, 14, 5, 4);
  g.fillRect(28, 17, 1, 2);
  g.fillStyle(SQ_DARK, 1);
  g.fillRect(30, 15, 1, 1);

  // eye
  g.fillStyle(SQ_INK, 1);
  g.fillRect(25, 12, 2, 2);
  g.fillStyle(SQ_BELLY, 1);
  g.fillRect(25, 12, 1, 1);

  // highlights
  g.fillStyle(SQ_LIGHT, 1);
  g.fillRect(9, 13, 8, 1);
  g.fillRect(21, 9, 5, 1);
  g.fillRect(4, 7, 2, 1);

  if (pose === 'run') {
    g.fillStyle(SQ_LIGHT, 1);
    g.fillRect(6, 2, 2, 1);
  }

  g.generateTexture(key, 32, 28);
  g.destroy();
}

// --- rival neighborhood dog ------------------------------------------------

function makeRivalDog(scene, key, pose) {
  const g = rawGfx(scene);
  const F = 0xc98a4f;
  const D = 0x8f5a2e;
  const L = 0xe0a86a;
  const B = 0xf4dcc0;
  const R = 0xd94f4f;
  const INK = 0x1a1224;

  // tail
  g.fillStyle(D, 1);
  g.fillRect(1, 12, 5, 7);
  g.fillRect(2, 9, 4, 4);
  g.fillStyle(L, 1);
  g.fillRect(2, 10, 2, 1);

  // legs
  g.fillStyle(D, 1);
  if (pose === 'run') {
    g.fillRect(6, 24, 4, 6);
    g.fillRect(17, 24, 4, 6);
  } else {
    g.fillRect(7, 24, 3, 6);
    g.fillRect(18, 24, 3, 6);
  }
  g.fillStyle(B, 1);
  if (pose === 'run') {
    g.fillRect(6, 28, 4, 2);
    g.fillRect(17, 28, 4, 2);
  } else {
    g.fillRect(7, 28, 3, 2);
    g.fillRect(18, 28, 3, 2);
  }

  // body
  g.fillStyle(F, 1);
  g.fillRect(5, 14, 17, 12);
  g.fillRect(8, 12, 11, 3);
  g.fillStyle(B, 1);
  g.fillRect(8, 22, 11, 4);

  // scruff
  g.fillStyle(F, 1);
  g.fillRect(4, 14, 3, 3);
  g.fillRect(10, 11, 3, 2);
  g.fillRect(16, 11, 3, 2);
  g.fillStyle(L, 1);
  g.fillRect(6, 14, 10, 1);

  // head + cheek
  g.fillStyle(F, 1);
  g.fillRect(20, 7, 9, 13);
  g.fillRect(18, 12, 3, 6);

  // floppy ear
  g.fillStyle(D, 1);
  g.fillRect(19, 8, 5, 8);
  g.fillRect(18, 14, 4, 3);
  g.fillStyle(L, 1);
  g.fillRect(20, 10, 2, 2);

  // muzzle, nose, mouth
  g.fillStyle(B, 1);
  g.fillRect(25, 14, 7, 6);
  g.fillStyle(INK, 1);
  g.fillRect(30, 15, 2, 3);
  g.fillRect(27, 18, 3, 1);

  // eye + angry brow
  g.fillStyle(INK, 1);
  g.fillRect(24, 11, 2, 2);
  g.fillStyle(B, 1);
  g.fillRect(24, 11, 1, 1);
  g.fillStyle(D, 1);
  g.fillRect(23, 9, 4, 1);

  // red bandana
  g.fillStyle(R, 1);
  g.fillRect(19, 19, 5, 3);
  g.fillTriangle(19, 22, 28, 22, 23, 27);
  g.fillRect(18, 21, 3, 3);

  g.fillStyle(L, 1);
  g.fillRect(21, 7, 5, 1);

  g.generateTexture(key, 32, 30);
  g.destroy();
}

// --- piñata, rope, market awning --------------------------------------------

function makePinata(scene) {
  const g = rawGfx(scene);

  // star body
  g.fillStyle(0xd94f8f, 1);
  g.fillCircle(12, 12, 6);
  g.fillTriangle(12, 0, 9, 9, 15, 9);
  g.fillTriangle(1, 7, 9, 10, 12, 13);
  g.fillTriangle(23, 7, 15, 10, 12, 13);
  g.fillTriangle(4, 21, 10, 13, 12, 10);
  g.fillTriangle(20, 21, 14, 13, 12, 10);

  // colored points
  g.fillStyle(0xffd166, 1);
  g.fillTriangle(12, 0, 9, 9, 15, 9);
  g.fillStyle(0x6ec6a8, 1);
  g.fillTriangle(1, 7, 9, 10, 12, 13);
  g.fillStyle(0xb45cd6, 1);
  g.fillTriangle(23, 7, 15, 10, 12, 13);
  g.fillStyle(0xfff4e0, 1);
  g.fillTriangle(4, 21, 10, 13, 12, 10);
  g.fillStyle(0xf26b5e, 1);
  g.fillTriangle(20, 21, 14, 13, 12, 10);

  // streamers
  g.fillStyle(0xffd166, 1);
  g.fillRect(6, 22, 1, 5);
  g.fillRect(12, 22, 1, 6);
  g.fillRect(18, 22, 1, 5);
  g.fillStyle(0x6ec6a8, 1);
  g.fillRect(9, 23, 1, 3);
  g.fillRect(15, 23, 1, 3);

  g.generateTexture('pinata', 24, 30);
  g.destroy();
}

function makeRope(scene) {
  const g = rawGfx(scene);
  g.fillStyle(0xd9b26a, 1);
  g.fillRect(0, 0, 2, 8);
  g.fillStyle(0xa97a45, 1);
  g.fillRect(0, 2, 1, 3);
  g.generateTexture('rope', 2, 8);
  g.destroy();
}

function makeAwning(scene) {
  const g = gfx(scene);
  const W = 40;
  const H = 12;

  // striped canvas
  for (let i = 0; i < 10; i++) {
    g.fillStyle(i % 2 ? 0xfff4e0 : 0xf26b5e, 1);
    g.fillRect(i * 4, 0, 4, 8);
  }

  // scalloped edge
  for (let x = 0; x < W; x += 4) {
    g.fillStyle((x / 4) % 2 ? 0xfff4e0 : 0xf26b5e, 1);
    g.fillRect(x, 8, 4, 3);
  }

  g.fillStyle(0x6ec6a8, 1);
  g.fillRect(0, 7, W, 1);
  g.fillStyle(0x8f3f2e, 1);
  g.fillRect(0, 11, W, 1);

  g.generateTexture('awning', W, H);
  g.destroy();
}

// On-screen touch buttons (64x64 textures used at various scales).
function makeControlButtons(scene) {
  const defs = [
    ['btn-left', 'left'],
    ['btn-right', 'right'],
    ['btn-jump', 'jump'],
    ['btn-dive', 'dive'],
  ];

  for (const [key, kind] of defs) {
    const g = rawGfx(scene);

    g.fillStyle(0x1b1029, 1);
    g.fillCircle(32, 32, 30);
    g.lineStyle(3, 0xfff4e0, 1);
    g.strokeCircle(32, 32, 30);

    g.fillStyle(0xffd166, 1);
    if (kind === 'left') {
      g.fillTriangle(40, 18, 40, 46, 20, 32);
    } else if (kind === 'right') {
      g.fillTriangle(24, 18, 24, 46, 44, 32);
    } else if (kind === 'jump') {
      g.fillTriangle(32, 16, 18, 36, 46, 36);
      g.fillRect(28, 34, 8, 10);
    } else {
      g.fillTriangle(32, 48, 18, 28, 46, 28);
      g.fillRect(28, 18, 8, 10);
    }

    g.generateTexture(key, 64, 64);
    g.destroy();
  }
}

// --- enemies & pickups -----------------------------------------------------

function makeCrow(scene) {
  const g = gfx(scene);
  g.fillStyle(0x1d1526, 1);
  g.fillRect(0, 4, 4, 2); // tail
  g.fillRect(3, 3, 7, 5); // body
  g.fillRect(8, 2, 4, 4); // head

  g.fillStyle(0x352a44, 1);
  g.fillRect(3, 1, 5, 3); // raised wing

  g.fillStyle(GOLD, 1);
  g.fillRect(11, 4, 2, 1); // beak

  g.fillStyle(CREAM, 1);
  g.fillRect(9, 3, 1, 1); // eye

  // high-resolution details
  const r = g.raw;
  r.fillStyle(0x4a3a5a, 1);
  r.fillRect(8, 4, 6, 1); // wing edge
  r.fillStyle(CREAM, 1);
  r.fillRect(18, 6, 1, 1); // eye glint

  g.generateTexture('crow', 14, 9);
  g.destroy();
}

function makeBone(scene) {
  const g = gfx(scene);
  g.fillStyle(CREAM, 1);
  g.fillRect(2, 2, 6, 4);
  g.fillRect(0, 1, 3, 3);
  g.fillRect(0, 4, 3, 3);
  g.fillRect(7, 1, 3, 3);
  g.fillRect(7, 4, 3, 3);
  g.fillStyle(0xe6d2b8, 1);
  g.fillRect(3, 5, 4, 1);
  g.generateTexture('bone', 10, 8);
  g.destroy();
}

function makeBalloon(scene, key, color, big) {
  const g = gfx(scene);
  const w = big ? 20 : 12;
  const h = big ? 30 : 20;
  const cx = w / 2;
  const cy = big ? 9 : 6;
  const r = big ? 8 : 5;
  const basketY = h - (big ? 6 : 4);

  g.fillStyle(color, 1);
  g.fillCircle(cx, cy, r);
  g.fillRect(cx - 2, cy + r - 1, 4, 3);

  // shine
  g.fillStyle(0xffd9c9, 1);
  g.fillCircle(cx - r * 0.35, cy - r * 0.35, Math.max(1, r * 0.45));

  // string + basket
  g.lineStyle(1, CREAM, 1);
  g.lineBetween(cx, cy + r + 2, cx, basketY);
  g.fillStyle(GOLD, 1);
  g.fillRect(cx - 2, basketY, 4, big ? 5 : 3);

  g.generateTexture(key, w, h);
  g.destroy();
}

function makeRing(scene) {
  const g = gfx(scene);
  g.lineStyle(2, GOLD, 1);
  g.strokeCircle(8, 8, 6);
  g.lineStyle(1, CREAM, 1);
  g.strokeCircle(8, 8, 4);
  g.generateTexture('ring', 16, 16);
  g.destroy();
}

function makePuff(scene) {
  const g = gfx(scene);
  g.fillStyle(CREAM, 1);
  g.fillCircle(4, 4, 3);
  g.generateTexture('puff', 8, 8);
  g.destroy();
}

// --- level platforms (one texture per rectangle) ---------------------------

export function makePlatformTexture(scene, key, w, h, seed) {
  if (scene.textures.exists(key)) return;

  const g = gfx(scene);
  const rnd = rng(seed);

  // adobe wall body
  g.fillStyle(0xc98a5e, 1);
  g.fillRect(0, 0, w, h);

  // adobe speckles / cracks
  g.fillStyle(0xa96a45, 1);
  const specks = Math.floor((w * h) / 55);
  for (let i = 0; i < specks; i++) {
    g.fillRect(
      Math.floor(rnd() * w),
      10 + Math.floor(rnd() * Math.max(1, h - 10)),
      2,
      2,
    );
  }

  // painted band on taller walls
  if (h > 40) {
    g.fillStyle(0x3f8f8a, 1);
    g.fillRect(0, 20, w, 3);
    g.fillStyle(0xe8c9a0, 1);
    g.fillRect(0, 23, w, 1);
  }

  // terracotta roof cap
  g.fillStyle(0xb5533a, 1);
  g.fillRect(0, 0, w, 6);
  g.fillStyle(0xd9775a, 1);
  g.fillRect(0, 0, w, 2);
  g.fillStyle(0x8f3f2e, 1);
  for (let x = 0; x < w; x += 7) g.fillRect(x, 1, 1, 4);

  // teal band under the roof, like painted Mexican walls
  g.fillStyle(0x3f8f8a, 1);
  g.fillRect(0, 6, w, 3);
  g.fillStyle(0xe8c9a0, 1);
  g.fillRect(0, 9, w, 1);

  // tile overhang
  g.fillStyle(0x8f3f2e, 1);
  for (let x = 0; x < w; x += 4) {
    g.fillRect(x, 5, 3, 2);
  }

  g.generateTexture(key, w, h);
  g.destroy();
}
