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
// and scaled here by SCALE, so textures are generated at 3x resolution.
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
  makeNearTown(scene);
  makeAgave(scene, 'agave', false);
  makeAgave(scene, 'agaveBloom', true);
  makeAgaveField(scene);
  makeCat(scene, 'cat', 0xd98a4f, 0xffd166);
  makeCat(scene, 'catGray', 0x6a5a70, 0xffd166);
  makeBird(scene);
  makeRooster(scene);
  makeFence(scene);
  makeForegroundHouse(scene, 'foregroundHouseA', 0xc46b4a, 0x8a4f3a, 0xffd166);
  makeForegroundHouse(scene, 'foregroundHouseB', 0x2f7f78, 0x1d4a47, 0xf2b544);
  makeForegroundHouse(scene, 'foregroundHouseC', 0xd99a63, 0xb5533a, 0x2f7f78);
  makeBanner(scene);
  makeStreetProps(scene);
  makeCar(scene, 'carA', 0xf26b5e, 0xfff4e0, 'sedan');
  makeCar(scene, 'carB', 0x6ec6a8, 0xfff4e0, 'hatch');
  makeCar(scene, 'carC', 0xffd166, 0x2b1b3d, 'pickup');
  makeBike(scene, 'bikeMint', 0x6ec6a8);
  makeBike(scene, 'bikeCoral', 0xf26b5e);
  makeGate(scene);
  makeTacoCart(scene);
  makePolo(scene);
  makeChihuahua(scene);
  makeBell(scene);
  makeBellPost(scene);
  makeCrown(scene);

  makeDog(scene, 'dog', 'idle');
  makeDog(scene, 'dogSit', 'sit');
  makeDog(scene, 'dogWalkA', 'walkA');
  makeDog(scene, 'dogWalkB', 'walkB');
  makeDog(scene, 'dogWalkC', 'walkC');
  makeDog(scene, 'dogWalkD', 'walkD');
  makeDog(scene, 'dogGlide', 'glide');
  makeDog(scene, 'dogDive', 'dive');
  makeTongue(scene);
  makeSquirrel(scene, 'squirrel', 'idle');
  makeSquirrel(scene, 'squirrelRun', 'run');
  makeRivalDog(scene, 'rival', 'idle');
  makeRivalDog(scene, 'rivalRun', 'run');
  makeHeart(scene);
  makeFood(scene);
  makeBonjoHouse(scene);
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
  // paint the clear-day sky as horizontal bands instead.
  const bands = 90;
  const top = 0x2b5b96;
  const mid = 0x82b6df;
  const bottom = 0xf7d5a8;
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    const color =
      t < 0.55
        ? mixColor(top, mid, t / 0.55)
        : mixColor(mid, bottom, (t - 0.55) / 0.45);
    g.fillStyle(color, 1);
    g.fillRect(0, Math.floor((i * 144) / bands), 256, Math.ceil(144 / bands) + 1);
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
  g.fillStyle(0xfff8ef, 1);
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

  // distant mountains, cool with distance
  g.fillStyle(0x4a6f8a, 1);
  for (const off of [-W, 0, W]) {
    g.fillTriangle(off + 10, 82, off + 70, 44, off + 130, 82);
    g.fillTriangle(off + 110, 82, off + 165, 52, off + 225, 82);
    g.fillTriangle(off + 215, 82, off + 265, 36, off + 315, 82);
  }

  // agricultural fields at the edge of town
  g.fillStyle(0x6f8f5a, 1);
  g.fillRect(0, 79, W, 21);
  g.fillStyle(0x557044, 1);
  for (let x = 0; x < W; x += 9) g.fillRect(x, 81, 4, 19);
  g.fillStyle(0x4f8877, 1);
  for (const ax of [10, 44, 78, 116, 150, 184, 218, 252, 286, 312]) {
    for (const off of [-W, 0, W]) {
      const x = ax + off;
      g.fillTriangle(x, 93, x + 5, 75, x + 10, 93);
      g.fillTriangle(x, 93, x - 5, 80, x, 93);
      g.fillTriangle(x + 10, 93, x + 15, 80, x + 10, 93);
      g.fillTriangle(x + 2, 93, x + 7, 70, x + 8, 93);
    }
  }
  g.fillStyle(0x7fb8a0, 1);
  for (const ax of [10, 44, 78, 116, 150, 184, 218, 252, 286, 312]) {
    for (const off of [-W, 0, W]) {
      const x = ax + off;
      g.fillRect(x + 4, 76, 1, 4);
      g.fillRect(x + 6, 71, 1, 4);
      g.fillRect(x + 11, 80, 1, 3);
    }
  }

  // low houses with flat roofs and lit windows
  const buildings = [
    { x: -12, w: 36, h: 30, c: 0x8a5a44, r: 0x5a3328, win: 2 },
    { x: 26, w: 30, h: 38, c: 0x9a6a4a, r: 0x5a3328, win: 2 },
    { x: 94, w: 26, h: 34, c: 0x9a7a4f, r: 0x5a3328, win: 2 },
    { x: 164, w: 30, h: 40, c: 0x7a6a52, r: 0x5a3328, win: 2 },
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
    g.fillRect(170 + off, 30, 1, 10);
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

// Closer storefronts that sit in front of the tiled town. This layer is mostly
// transparent above the rooflines, so the church tower and distant hills still
// show through; the ground floor is hidden behind the sidewalk/platform art.
function makeNearTown(scene) {
  const g = gfx(scene);
  const W = 320;
  const H = 100;

  const blocks = [
    { x: 0, w: 44, top: 50, body: 0x7d4b58, roof: 0x382431, trim: 0xa86570, a: 0xf26b5e, b: 0xfff4e0, sign: 0xffd166 },
    { x: 58, w: 34, top: 58, body: 0x5d7a74, roof: 0x2c3b39, trim: 0x82a39a, a: 0x6ec6a8, b: 0x1b1029, sign: 0xf26b5e },
    { x: 104, w: 38, top: 46, body: 0x8a5a44, roof: 0x3f2927, trim: 0xb07a5a, a: 0xffd166, b: 0x8a4f3a, sign: 0x6ec6a8 },
    { x: 154, w: 30, top: 61, body: 0x655a78, roof: 0x30263c, trim: 0x8b7ea0, a: 0xb45cd6, b: 0xfff4e0, sign: 0xffd166 },
    // 184..252 is open field + church alley; keep the tower visible.
    { x: 252, w: 40, top: 56, body: 0x4f6f6a, roof: 0x293c3a, trim: 0x78a39a, a: 0x6ec6a8, b: 0xfff4e0, sign: 0xf26b5e },
    // 292..320 stays an open planted edge.
  ];

  // low fence / retaining wall in the church alley
  g.fillStyle(0x2b1b3d, 0.85);
  g.fillRect(208, 88, 44, 1);
  for (let x = 210; x < 252; x += 6) g.fillRect(x, 86, 1, 12);
  g.fillStyle(0x3a2836, 1);
  g.fillRect(0, 96, W, 4);

  // a little agave patch growing in the church alley
  const alleyAgave = (x) => {
    g.fillStyle(0x315f54, 1);
    g.fillTriangle(x, 94, x + 3, 84, x + 6, 94);
    g.fillTriangle(x, 94, x - 4, 86, x, 94);
    g.fillTriangle(x + 6, 94, x + 9, 86, x + 6, 94);
    g.fillStyle(0x4f8a79, 1);
    g.fillTriangle(x, 94, x + 3, 87, x + 5, 94);
    g.fillTriangle(x + 1, 94, x - 2, 88, x + 1, 94);
    g.fillRect(x + 3, 85, 1, 3);
  };
  alleyAgave(215);
  alleyAgave(231);
  alleyAgave(245);

  // planted lots between the thinner row of houses
  g.fillStyle(0x6b4a35, 1);
  g.fillRect(184, 86, 24, 10);
  g.fillRect(292, 86, 28, 10);
  g.fillStyle(0x54382b, 1);
  for (let x = 184; x < 320; x += 6) g.fillRect(x, 90, 3, 1);
  alleyAgave(190);
  alleyAgave(202);
  alleyAgave(298);
  alleyAgave(309);

  const drawBlock = (b) => {
    const x = b.x;
    const w = b.w;
    const top = b.top;

    // body + side falloff
    g.fillStyle(b.body, 1);
    g.fillRect(x, top, w, H - top);
    g.fillStyle(0x1b1029, 0.22);
    g.fillRect(x + w - 4, top, 4, H - top);

    // parapet and roof trim
    g.fillStyle(b.roof, 1);
    g.fillRect(x - 1, top - 3, w + 2, 4);
    g.fillRect(x - 1, top - 3, 2, 7);
    g.fillRect(x + w - 1, top - 3, 2, 7);
    g.fillStyle(b.trim, 0.55);
    g.fillRect(x + 3, top - 1, w - 6, 1);

    // upper windows
    const rows = top < 52 ? 3 : 2;
    const cols = Math.max(1, Math.floor((w - 11) / 10));
    for (let row = 0; row < rows; row++) {
      const wy = top + 7 + row * 10;
      if (wy > 62) break;
      for (let c = 0; c < cols; c++) {
        const wx = x + 6 + c * 10;
        if (wx + 6 > x + w - 4) continue;
        const lit = (c + row + b.x) % 3 !== 0;
        g.fillStyle(0x1b1029, 0.85);
        g.fillRect(wx - 1, wy - 1, 7, 7);
        g.fillStyle(lit ? 0xffcf6a : 0x3a2d43, 1);
        g.fillRect(wx, wy, 5, 5);
        g.fillStyle(0x1b1029, 0.65);
        g.fillRect(wx + 2, wy, 1, 5);
      }
    }

    // sign band above the awning
    g.fillStyle(0x1b1029, 0.45);
    g.fillRect(x + 6, 60, w - 12, 8);
    g.fillStyle(b.sign, 1);
    g.fillRect(x + 7, 61, w - 14, 5);
    g.fillStyle(0x1b1029, 0.8);
    const letters = Math.max(1, Math.floor((w - 18) / 6));
    for (let i = 0; i < letters; i++) {
      g.fillRect(x + 9 + i * 6, 63, 3, 1);
    }

    // striped awning
    const aw = w - 8;
    g.fillStyle(b.roof, 0.7);
    g.fillRect(x + 4, 68, aw, 2);
    for (let i = 0; i < Math.ceil(aw / 6); i++) {
      g.fillStyle(i % 2 ? b.b : b.a, 1);
      g.fillRect(x + 4 + i * 6, 70, Math.min(6, aw - i * 6), 5);
    }
    for (let i = 0; i < Math.ceil(aw / 6); i += 2) {
      g.fillStyle(b.a, 1);
      g.fillRect(x + 4 + i * 6, 75, Math.min(4, aw - i * 6), 2);
    }

    // storefront glass and door
    g.fillStyle(0x1b1029, 0.9);
    g.fillRect(x + 5, 78, w - 16, 15);
    g.fillStyle(0xffcf6a, 0.9);
    g.fillRect(x + 6, 79, w - 18, 13);
    g.fillStyle(0x1b1029, 0.75);
    g.fillRect(x + 6 + Math.floor((w - 18) / 2), 79, 1, 13);
    g.fillRect(x + 6, 85, w - 18, 1);

    // door
    g.fillStyle(0x241625, 1);
    g.fillRect(x + w - 10, 78, 6, 19);
    g.fillStyle(0xffd166, 1);
    g.fillRect(x + w - 5, 87, 1, 1);

    // rooftop water tank / antenna
    g.fillStyle(0x2b1b3d, 1);
    g.fillRect(x + 7, top - 10, 9, 8);
    g.fillStyle(0x6a5a70, 1);
    g.fillRect(x + 7, top - 10, 9, 2);
    g.fillRect(x + 8, top - 3, 1, 3);
    g.fillRect(x + 14, top - 3, 1, 3);
    g.fillRect(x + w - 9, top - 9, 1, 7);
    g.fillRect(x + w - 12, top - 6, 7, 1);

    // a little roof garden on some buildings
    if (b.x % 3 === 0) {
      g.fillStyle(MINT, 1);
      g.fillRect(x + w - 16, top - 4, 4, 2);
      g.fillRect(x + w - 13, top - 6, 1, 4);
      g.fillStyle(CORAL, 1);
      g.fillRect(x + w - 15, top - 6, 2, 2);
    }
  };

  for (const b of blocks) drawBlock(b);

  // laundry line between two rooftops
  g.lineStyle(0.5, 0x2b1b3d, 0.65);
  g.lineBetween(80, 42, 126, 42);
  const clothes = [
    [84, 43, 5, 4, CORAL],
    [94, 43, 4, 5, MINT],
    [104, 43, 5, 3, GOLD],
    [114, 43, 4, 4, 0xb45cd6],
  ];
  for (const [x, y, w, h, c] of clothes) {
    g.fillStyle(c, 1);
    g.fillRect(x, y, w, h);
  }

  g.generateTexture('nearTown', W, H);
  g.destroy();
}

// Parked cars for the far curb. One texture per colour/variant; flip at place.
function makeCar(scene, key, body, roof, variant) {
  const g = gfx(scene);
  const W = 44;
  const H = 22;

  // shadow
  g.fillStyle(0x1b1029, 0.3);
  g.fillRect(3, 19, 38, 3);

  if (variant === 'pickup') {
    // bed at the rear (left), cab at the front (right)
    g.fillStyle(body, 1);
    g.fillRect(3, 10, 38, 8);
    g.fillStyle(0x2b1b3d, 0.25);
    g.fillRect(4, 10, 17, 2);
    g.fillStyle(body, 1);
    g.fillRect(23, 6, 16, 12);
    g.fillStyle(roof, 1);
    g.fillRect(25, 4, 13, 3);
    g.fillStyle(0x2b1b3d, 1);
    g.fillRect(26, 7, 5, 4);
    g.fillRect(33, 7, 4, 4);
    g.fillStyle(0xffcf6a, 0.85);
    g.fillRect(35, 8, 2, 2);
    // cargo in the bed
    g.fillStyle(MINT, 1);
    g.fillRect(6, 7, 6, 3);
    g.fillStyle(GOLD, 1);
    g.fillRect(12, 8, 4, 2);
  } else {
    const cabinTop = variant === 'hatch' ? 3 : 4;
    const cabinX = variant === 'hatch' ? 10 : 9;
    const cabinW = variant === 'hatch' ? 25 : 23;

    // lower body and hood
    g.fillStyle(body, 1);
    g.fillRect(3, 10, 38, 8);
    g.fillRect(2, 13, 40, 4);
    // cabin
    g.fillRect(cabinX, 5, cabinW, 6);
    g.fillStyle(roof, 1);
    g.fillRect(cabinX + 2, cabinTop, cabinW - 4, 2);
    // windows
    g.fillStyle(0x2b1b3d, 1);
    g.fillRect(cabinX + 3, 6, Math.floor(cabinW / 2) - 4, 4);
    g.fillRect(cabinX + Math.floor(cabinW / 2) + 1, 6, Math.floor(cabinW / 2) - 4, 4);
    g.fillStyle(0xffcf6a, 0.55);
    g.fillRect(cabinX + 4, 7, 2, 1);
    // side details
    g.fillStyle(0x1b1029, 0.35);
    g.fillRect(22, 10, 1, 7);
    g.fillStyle(0xffd166, 1);
    g.fillRect(38, 12, 2, 2);
    g.fillStyle(CORAL, 1);
    g.fillRect(3, 12, 2, 2);
  }

  // wheels
  g.fillStyle(0x1b1029, 1);
  g.fillCircle(11, 18, 4);
  g.fillCircle(33, 18, 4);
  g.fillStyle(0x6a5a70, 1);
  g.fillCircle(11, 18, 1.5);
  g.fillCircle(33, 18, 1.5);
  g.fillStyle(0x1b1029, 0.6);
  g.fillRect(1, 15, 2, 2);
  g.fillRect(41, 15, 2, 2);

  g.generateTexture(key, W, H);
  g.destroy();
}

function makeBike(scene, key, frameColor) {
  const g = gfx(scene);
  const W = 20;
  const H = 18;

  // wheels
  g.lineStyle(1, 0x1b1029, 1);
  g.strokeCircle(5, 12, 4);
  g.strokeCircle(15, 12, 4);
  g.fillStyle(frameColor, 1);
  g.fillCircle(5, 12, 1);
  g.fillCircle(15, 12, 1);

  // frame
  g.lineStyle(1, frameColor, 1);
  g.lineBetween(5, 12, 9, 6);
  g.lineBetween(9, 6, 15, 12);
  g.lineBetween(9, 6, 7, 12);
  g.lineBetween(7, 12, 15, 12);
  g.lineBetween(9, 6, 10, 4);

  // seat, handlebar, basket
  g.fillStyle(0x1b1029, 1);
  g.fillRect(7, 4, 4, 2);
  g.fillRect(14, 4, 2, 1);
  g.fillRect(15, 4, 1, 3);
  g.fillStyle(GOLD, 1);
  g.fillRect(14, 6, 4, 3);
  g.fillStyle(0x1b1029, 0.6);
  g.fillRect(15, 7, 2, 1);

  g.generateTexture(key, W, H);
  g.destroy();
}

function makeStreetProps(scene) {
  // hydrant
  {
    const g = gfx(scene);
    g.fillStyle(0x1b1029, 1);
    g.fillRect(2, 11, 5, 2);
    g.fillStyle(CORAL, 1);
    g.fillRect(2, 4, 5, 7);
    g.fillCircle(4.5, 3, 2);
    g.fillStyle(0xffcf6a, 1);
    g.fillRect(3, 5, 3, 1);
    g.fillStyle(0x1b1029, 1);
    g.fillRect(0, 6, 2, 2);
    g.fillRect(7, 6, 2, 2);
    g.generateTexture('hydrant', 9, 13);
    g.destroy();
  }

  // trash can
  {
    const g = gfx(scene);
    g.fillStyle(0x1b1029, 0.3);
    g.fillRect(1, 13, 8, 2);
    g.fillStyle(0x4f6f6a, 1);
    g.fillRect(2, 4, 6, 9);
    g.fillStyle(0x2b1b3d, 1);
    g.fillRect(1, 2, 8, 3);
    g.fillRect(5, 1, 3, 2);
    g.fillStyle(0x78a39a, 1);
    g.fillRect(3, 6, 1, 6);
    g.fillRect(6, 6, 1, 6);
    g.generateTexture('trashcan', 10, 15);
    g.destroy();
  }

  // flower planter
  {
    const g = gfx(scene);
    g.fillStyle(0x8a4f3a, 1);
    g.fillRect(1, 6, 10, 5);
    g.fillStyle(0x5a3328, 1);
    g.fillRect(0, 5, 12, 2);
    g.fillStyle(MINT, 1);
    g.fillRect(2, 2, 2, 4);
    g.fillRect(5, 1, 2, 5);
    g.fillRect(8, 2, 2, 4);
    g.fillStyle(CORAL, 1);
    g.fillRect(2, 1, 2, 2);
    g.fillStyle(GOLD, 1);
    g.fillRect(5, 0, 2, 2);
    g.fillStyle(0xb45cd6, 1);
    g.fillRect(8, 1, 2, 2);
    g.generateTexture('planter', 13, 11);
    g.destroy();
  }

  // street lamp
  {
    const g = gfx(scene);
    g.fillStyle(0x1b1029, 1);
    g.fillRect(2, 54, 6, 3);
    g.fillRect(4, 8, 2, 47);
    g.fillRect(3, 8, 4, 2);
    g.fillStyle(0xffd166, 0.13);
    g.fillCircle(5, 8, 6);
    g.fillStyle(0x2b1b3d, 1);
    g.fillRect(2, 5, 6, 4);
    g.fillStyle(GOLD, 1);
    g.fillRect(3, 6, 4, 2);
    g.fillStyle(0xfff4e0, 0.7);
    g.fillRect(4, 6, 2, 1);
    g.generateTexture('streetlamp', 12, 58);
    g.destroy();
  }
}


// One-way ledges: fire escapes and laundry lines over the street.
export function makeLedgeTexture(scene, key, w, kind = 'fire') {
  if (scene.textures.exists(key)) return;
  const g = gfx(scene);
  const H = 12;

  if (kind === 'laundry') {
    // posts and line
    g.fillStyle(0x2b1b3d, 1);
    g.fillRect(0, 0, 2, 12);
    g.fillRect(w - 2, 0, 2, 12);
    g.fillStyle(0xd9b26a, 1);
    g.fillRect(1, 2, w - 2, 1);
    g.fillStyle(MINT, 0.8);
    g.fillRect(5, 1, 1, 2);
    g.fillRect(w - 8, 1, 1, 2);

    const colors = [CORAL, MINT, GOLD, 0xb45cd6];
    for (let i = 0, x = 8; x < w - 10; i++, x += 13) {
      g.fillStyle(colors[i % 4], 1);
      g.fillRect(x, 3, 7, 5);
      g.fillStyle(0x1b1029, 0.45);
      g.fillRect(x + 2, 4, 1, 3);
      g.fillRect(x, 8, 7, 1);
      g.fillStyle(0xd9b26a, 1);
      g.fillRect(x + 3, 2, 1, 2);
    }
    g.fillStyle(0x2b1b3d, 0.55);
    g.fillRect(0, 10, w, 2);
  } else {
    // metal fire escape grating
    g.fillStyle(0x2b1b3d, 1);
    g.fillRect(0, 1, w, 3);
    g.fillRect(0, 8, w, 2);
    g.fillRect(0, 4, 2, 6);
    g.fillRect(w - 2, 4, 2, 6);
    g.fillStyle(MINT, 1);
    g.fillRect(2, 2, w - 4, 1);
    g.fillStyle(GOLD, 1);
    g.fillRect(4, 9, 3, 1);
    g.fillRect(w - 8, 9, 3, 1);
    for (let x = 6; x < w - 6; x += 8) {
      g.fillStyle(0x6a5a70, 1);
      g.fillRect(x, 4, 1, 4);
    }
    // hanging ladder supports
    g.fillStyle(0x2b1b3d, 0.8);
    g.fillRect(3, 9, 1, 3);
    g.fillRect(w - 5, 9, 1, 3);
  }

  g.generateTexture(key, w, H);
  g.destroy();
}

function makeGate(scene) {
  const g = gfx(scene);
  const W = 36;
  const H = 30;

  // warm, open doorway
  g.fillStyle(0xffcf6a, 0.1);
  g.fillRect(8, 4, 20, 23);

  // posts and top beam
  g.fillStyle(0x2b1b3d, 1);
  g.fillRect(0, 0, 36, 4);
  g.fillRect(0, 0, 4, 30);
  g.fillRect(32, 0, 4, 30);
  g.fillStyle(0x8a4f3a, 1);
  g.fillRect(1, 3, 34, 2);
  g.fillRect(2, 4, 2, 26);
  g.fillRect(32, 4, 2, 26);
  g.fillStyle(GOLD, 0.6);
  g.fillRect(1, 6, 1, 2);
  g.fillRect(34, 6, 1, 2);

  // gate leaves folded back against the posts
  g.fillStyle(0x1b1029, 1);
  g.fillRect(5, 6, 2, 20);
  g.fillRect(8, 6, 1, 20);
  g.fillRect(27, 6, 2, 20);
  g.fillRect(30, 6, 1, 20);
  g.fillStyle(0x6a5a70, 1);
  g.fillRect(5, 6, 1, 20);
  g.fillRect(27, 6, 1, 20);
  g.fillStyle(GOLD, 1);
  g.fillRect(5, 9, 2, 1);
  g.fillRect(5, 20, 2, 1);
  g.fillRect(27, 9, 2, 1);
  g.fillRect(27, 20, 2, 1);

  // a painted threshold line marks the porch boundary
  g.fillStyle(0x4f8877, 1);
  g.fillRect(7, 26, 22, 2);
  g.fillStyle(0xd7e3c3, 1);
  for (let x = 8; x < 28; x += 5) g.fillRect(x, 26, 2, 1);

  // little lantern above the opening
  g.fillStyle(0xffcf6a, 0.18);
  g.fillCircle(18, 3, 5);
  g.fillStyle(GOLD, 1);
  g.fillRect(16, 1, 4, 3);
  g.fillStyle(0xfff4e0, 0.8);
  g.fillRect(17, 1, 2, 1);

  g.generateTexture('gate', W, H);
  g.destroy();
}

function makeTacoCart(scene) {
  const g = gfx(scene);
  const W = 44;
  const H = 30;

  // umbrella
  for (let i = 0; i < 5; i++) {
    g.fillStyle(i % 2 ? CORAL : CREAM, 1);
    g.fillTriangle(6 + i * 7, 8, 13 + i * 7, 8, 9.5 + i * 7, 0);
  }
  g.fillStyle(0x2b1b3d, 1);
  g.fillRect(21, 4, 1, 14);

  // cart body
  g.fillStyle(0x8a4f3a, 1);
  g.fillRect(4, 14, 36, 11);
  g.fillStyle(0x5a3328, 1);
  g.fillRect(3, 13, 38, 3);
  g.fillStyle(GOLD, 1);
  g.fillRect(6, 17, 11, 5);
  g.fillStyle(0x2b1b3d, 1);
  g.fillRect(7, 18, 9, 1);
  g.fillRect(18, 17, 9, 5);
  g.fillRect(29, 17, 8, 5);

  // grill + tacos
  g.fillStyle(0x1b1029, 1);
  g.fillRect(18, 15, 11, 2);
  g.fillStyle(CREAM, 1);
  g.fillRect(18, 14, 3, 2);
  g.fillRect(22, 13, 3, 3);
  g.fillRect(26, 14, 3, 2);
  g.fillStyle(MINT, 1);
  g.fillRect(21, 15, 1, 1);
  g.fillRect(25, 16, 1, 1);

  // wheels
  g.fillStyle(0x1b1029, 1);
  g.fillCircle(12, 26, 4);
  g.fillCircle(32, 26, 4);
  g.fillStyle(0x6a5a70, 1);
  g.fillCircle(12, 26, 1.5);
  g.fillCircle(32, 26, 1.5);
  g.fillStyle(0x2b1b3d, 1);
  g.fillRect(3, 24, 2, 3);
  g.fillRect(39, 24, 2, 3);

  g.generateTexture('tacocart', W, H);
  g.destroy();
}

function makePolo(scene) {
  const g = gfx(scene);
  const W = 16;
  const H = 28;

  // shoes and jeans
  g.fillStyle(0x1b1029, 1);
  g.fillRect(3, 25, 4, 3);
  g.fillRect(9, 25, 4, 3);
  g.fillStyle(0x2f5f6a, 1);
  g.fillRect(4, 16, 8, 10);
  g.fillStyle(0x24484f, 1);
  g.fillRect(8, 18, 1, 7);
  g.fillStyle(0xffd166, 1);
  g.fillRect(4, 16, 8, 1);

  // shirt / broad shoulders
  g.fillStyle(0xe85a4f, 1);
  g.fillRect(3, 9, 10, 8);
  g.fillStyle(0xd9a47a, 1);
  g.fillRect(2, 10, 2, 7);
  g.fillRect(12, 10, 2, 7);
  g.fillStyle(0xfff4e0, 0.5);
  g.fillRect(7, 11, 2, 4);

  // neck and head
  g.fillStyle(0xd9a47a, 1);
  g.fillRect(5, 4, 6, 6);
  g.fillStyle(0x2b1b3d, 1);
  g.fillRect(4, 2, 8, 3);
  g.fillRect(4, 4, 1, 3);
  g.fillRect(11, 4, 1, 3);
  // short beard + moustache
  g.fillRect(5, 8, 6, 2);
  g.fillRect(6, 10, 4, 1);
  // eyes and smile
  g.fillStyle(0x1b1029, 1);
  g.fillRect(6, 6, 1, 1);
  g.fillRect(9, 6, 1, 1);
  g.fillStyle(0xb5533a, 1);
  g.fillRect(7, 10, 2, 1);

  // coral chest pocket / little apron line
  g.fillStyle(0xffd166, 1);
  g.fillRect(10, 11, 2, 1);

  g.generateTexture('polo', W, H);
  g.destroy();
}

function makeChihuahua(scene) {
  const g = gfx(scene);
  const W = 14;
  const H = 14;

  g.fillStyle(0xd9a47a, 1);
  g.fillRect(3, 5, 8, 6);
  g.fillRect(9, 3, 4, 4);
  g.fillStyle(0xb07855, 1);
  g.fillRect(2, 6, 2, 4);
  g.fillRect(3, 11, 2, 2);
  g.fillRect(9, 11, 2, 2);
  g.fillStyle(0x1b1029, 1);
  g.fillRect(11, 4, 1, 1);
  g.fillRect(12, 7, 1, 1);
  g.fillRect(10, 2, 2, 2);
  g.fillRect(12, 2, 2, 2);
  g.fillStyle(CORAL, 1);
  g.fillRect(9, 6, 4, 1);
  g.fillStyle(0x1b1029, 1);
  g.fillRect(1, 8, 2, 1);

  g.generateTexture('chihuahua', W, H);
  g.destroy();
}

function makeBell(scene) {
  const g = gfx(scene);
  const W = 14;
  const H = 14;
  g.fillStyle(0x2b1b3d, 1);
  g.fillRect(3, 1, 8, 2);
  g.fillRect(4, 3, 6, 5);
  g.fillTriangle(3, 8, 11, 8, 7, 12);
  g.fillStyle(GOLD, 1);
  g.fillRect(4, 3, 5, 4);
  g.fillRect(5, 7, 3, 2);
  g.fillStyle(0xffcf6a, 1);
  g.fillRect(5, 4, 2, 1);
  g.fillStyle(0x2b1b3d, 1);
  g.fillRect(6, 12, 2, 2);
  g.generateTexture('bell', W, H);
  g.destroy();
}

function makeBellPost(scene) {
  const g = gfx(scene);
  const W = 18;
  const H = 42;
  g.fillStyle(0x2b1b3d, 1);
  g.fillRect(7, 10, 4, 32);
  g.fillRect(4, 38, 10, 4);
  g.fillRect(1, 9, 16, 3);
  g.fillStyle(0xd9b26a, 1);
  g.fillRect(2, 4, 1, 6);
  g.fillRect(15, 4, 1, 6);
  g.fillRect(2, 4, 14, 2);
  g.fillStyle(GOLD, 1);
  g.fillRect(7, 6, 4, 4);
  g.fillTriangle(6, 10, 12, 10, 9, 14);
  g.fillStyle(0xffcf6a, 1);
  g.fillRect(7, 7, 2, 1);
  g.fillStyle(0x1b1029, 1);
  g.fillRect(8, 14, 2, 3);
  g.fillStyle(0xd9b26a, 1);
  g.fillRect(9, 17, 1, 15);
  g.generateTexture('bellpost', W, H);
  g.destroy();
}

function makeCrown(scene) {
  const g = gfx(scene);
  const W = 14;
  const H = 9;
  g.fillStyle(0x2b1b3d, 1);
  g.fillRect(1, 5, 12, 3);
  g.fillStyle(GOLD, 1);
  g.fillRect(2, 4, 10, 3);
  g.fillTriangle(2, 4, 4, 4, 3, 0);
  g.fillTriangle(5, 4, 7, 4, 6, 0);
  g.fillTriangle(10, 4, 12, 4, 11, 0);
  g.fillStyle(CORAL, 1);
  g.fillRect(6, 5, 2, 1);
  g.generateTexture('crown', W, H);
  g.destroy();
}

// Blue-green agave rosettes for the fields and street edges.
function makeAgave(scene, key, bloom) {
  const g = gfx(scene);
  const W = 26;
  const H = bloom ? 38 : 26;
  const baseY = bloom ? 34 : 24;

  g.fillStyle(0x2b3e2d, 0.45);
  g.fillRect(3, baseY - 1, 20, 2);

  const tips = [
    [1, 12], [3, 6], [8, 1], [13, 0],
    [18, 1], [23, 6], [25, 12], [22, 17], [4, 17],
  ];

  // broad dark rosette
  g.fillStyle(0x315f54, 1);
  for (const [tx, ty] of tips) {
    g.fillTriangle(tx, ty, 9, baseY, 17, baseY);
  }

  // mid + highlight leaves
  g.fillStyle(0x4f8a79, 1);
  for (const [tx, ty] of tips) {
    g.fillTriangle(tx, ty, 11, baseY, 15, baseY);
  }
  g.fillStyle(0x82b8a0, 1);
  for (const [tx, ty] of tips) {
    g.fillTriangle(tx, ty, 12, baseY, 14, baseY);
  }

  // pale tips
  g.fillStyle(0xd7e3c3, 1);
  for (const [tx, ty] of tips) {
    g.fillRect(tx, ty, 1, 2);
  }

  // short trunk / center
  g.fillStyle(0x24483f, 1);
  g.fillRect(11, baseY - 4, 4, 4);

  if (bloom) {
    g.fillStyle(0x4f8a79, 1);
    g.fillRect(12, 3, 2, baseY - 5);
    g.fillStyle(0xd7e3c3, 1);
    g.fillRect(12, 3, 1, 4);
    g.fillStyle(GOLD, 1);
    g.fillCircle(13, 2, 2);
    g.fillStyle(CORAL, 1);
    g.fillRect(13, 0, 2, 2);
  }

  g.generateTexture(key, W, H);
  g.destroy();
}

// A low field plot with agave rows: the agricultural edge pushing into town.
function makeAgaveField(scene) {
  const g = gfx(scene);
  const W = 90;
  const H = 26;

  // tilled soil
  g.fillStyle(0x6b4a35, 1);
  g.fillRect(0, 8, W, 18);
  g.fillStyle(0x54382b, 1);
  for (let y = 11; y < 25; y += 4) g.fillRect(0, y, W, 1);
  g.fillStyle(0x7d5a3e, 1);
  for (let x = 2; x < W; x += 9) g.fillRect(x, 12, 5, 1);

  // low stone edge
  g.fillStyle(0x2b1b3d, 0.65);
  g.fillRect(0, 23, W, 3);
  g.fillStyle(0x6a5a70, 1);
  for (let x = 0; x < W; x += 12) g.fillRect(x, 23, 8, 1);

  // rows of small agave rosettes
  const plant = (x, y, s) => {
    g.fillStyle(0x315f54, 1);
    g.fillTriangle(x, y, x + 3 * s, y - 8 * s, x + 6 * s, y);
    g.fillTriangle(x, y, x - 4 * s, y - 6 * s, x, y);
    g.fillTriangle(x + 6 * s, y, x + 9 * s, y - 6 * s, x + 6 * s, y);
    g.fillStyle(0x4f8a79, 1);
    g.fillTriangle(x, y, x + 3 * s, y - 6 * s, x + 5 * s, y);
    g.fillTriangle(x + 1 * s, y, x - 2 * s, y - 4 * s, x + 1 * s, y);
    g.fillStyle(0xd7e3c3, 1);
    g.fillRect(x + 3 * s, y - 8 * s, 1, 2);
  };

  plant(9, 20, 1);
  plant(28, 20, 0.85);
  plant(48, 20, 1.05);
  plant(68, 20, 0.9);
  plant(82, 20, 0.7);

  g.generateTexture('agaveField', W, H);
  g.destroy();
}

// Alley cats and birds for the quieter parts of the block.
function makeCat(scene, key, body, eye) {
  const g = gfx(scene);
  const W = 18;
  const H = 16;

  // body and curled tail
  g.fillStyle(body, 1);
  g.fillRect(4, 7, 10, 7);
  g.fillRect(6, 4, 6, 5);
  g.fillTriangle(6, 4, 7, 1, 9, 4);
  g.fillTriangle(9, 4, 11, 1, 12, 4);
  g.fillStyle(0x1b1029, 0.35);
  g.fillRect(5, 13, 9, 1);
  g.fillRect(2, 10, 2, 1);
  g.fillRect(1, 9, 1, 2);
  g.fillStyle(body, 1);
  g.fillRect(2, 8, 3, 2);
  g.fillRect(1, 7, 2, 2);

  // pale chest, eyes and nose
  g.fillStyle(0xfff4e0, 0.55);
  g.fillRect(7, 9, 4, 4);
  g.fillStyle(eye, 1);
  g.fillRect(7, 6, 1, 1);
  g.fillRect(10, 6, 1, 1);
  g.fillStyle(0xf26b5e, 1);
  g.fillRect(9, 8, 1, 1);

  // paws
  g.fillStyle(body, 1);
  g.fillRect(4, 14, 4, 2);
  g.fillRect(10, 14, 4, 2);

  g.generateTexture(key, W, H);
  g.destroy();
}

function makeBird(scene) {
  const g = gfx(scene);
  const W = 12;
  const H = 10;

  g.fillStyle(0x6f8a9e, 1);
  g.fillRect(2, 4, 7, 4);
  g.fillRect(7, 2, 4, 4);
  g.fillTriangle(9, 3, 12, 4, 9, 5);
  g.fillStyle(0x8fc3d6, 1);
  g.fillRect(3, 5, 5, 2);
  g.fillStyle(0x2b1b3d, 1);
  g.fillRect(9, 3, 1, 1);
  g.fillStyle(CORAL, 1);
  g.fillRect(5, 8, 1, 2);
  g.fillRect(7, 8, 1, 2);
  g.fillRect(2, 6, 2, 1);
  g.generateTexture('bird', W, H);
  g.destroy();
}

function makeRooster(scene) {
  const g = gfx(scene);
  const W = 20;
  const H = 24;

  // tail fan
  g.fillStyle(0x315f54, 1);
  g.fillTriangle(2, 16, 0, 5, 6, 12);
  g.fillTriangle(3, 16, 5, 3, 9, 12);
  g.fillStyle(0x4f8a79, 1);
  g.fillTriangle(4, 16, 7, 5, 10, 13);
  // body
  g.fillStyle(0xd98a4f, 1);
  g.fillRect(7, 10, 9, 9);
  g.fillRect(12, 7, 5, 5);
  // comb + wattle
  g.fillStyle(0xd94f4f, 1);
  g.fillRect(13, 4, 4, 2);
  g.fillRect(14, 2, 2, 3);
  g.fillRect(12, 10, 1, 2);
  // beak, eye, legs
  g.fillStyle(GOLD, 1);
  g.fillRect(17, 8, 2, 1);
  g.fillStyle(0x2b1b3d, 1);
  g.fillRect(15, 7, 1, 1);
  g.fillRect(9, 19, 1, 4);
  g.fillRect(13, 19, 1, 4);
  g.fillStyle(GOLD, 1);
  g.fillRect(8, 23, 3, 1);
  g.fillRect(12, 23, 3, 1);
  // wing
  g.fillStyle(0xffd166, 1);
  g.fillRect(8, 12, 4, 3);
  g.fillStyle(0x8a4f3a, 1);
  g.fillRect(9, 13, 2, 1);

  g.generateTexture('rooster', W, H);
  g.destroy();
}

// Wood-and-wire boundary fence for the ends of the block.
function makeFence(scene) {
  const g = gfx(scene);
  const W = 28;
  const H = 32;

  // posts
  g.fillStyle(0x2b1b3d, 1);
  g.fillRect(1, 2, 4, 30);
  g.fillRect(23, 2, 4, 30);
  g.fillStyle(0x8a4f3a, 1);
  g.fillRect(2, 2, 2, 30);
  g.fillRect(24, 2, 2, 30);

  // rails and pickets
  g.fillStyle(0x5a3328, 1);
  g.fillRect(4, 9, 20, 3);
  g.fillRect(4, 21, 20, 3);
  g.fillStyle(0xd9b26a, 1);
  for (let x = 7; x < 23; x += 5) {
    g.fillRect(x, 6, 2, 22);
    g.fillStyle(0x2b1b3d, 0.35);
    g.fillRect(x + 1, 6, 1, 22);
    g.fillStyle(0xd9b26a, 1);
  }

  // little “no further” sign
  g.fillStyle(0x1b1029, 1);
  g.fillRect(7, 13, 14, 7);
  g.fillStyle(0xf26b5e, 1);
  g.fillRect(8, 14, 12, 5);
  g.fillStyle(0xfff4e0, 1);
  g.fillRect(10, 16, 8, 1);
  g.fillRect(13, 15, 1, 3);

  g.generateTexture('fence', W, H);
  g.destroy();
}

// Small foreground houses. Their roofs are standable platforms; the full body
// is solid, so they read like places on the block rather than floating ledges.
function makeForegroundHouse(scene, key, body, roof, trim) {
  const g = gfx(scene);
  const W = 70;
  const H = 80;

  // roof cap / overhang
  g.fillStyle(INK, 1);
  g.fillRect(0, 0, W, 2);
  g.fillStyle(roof, 1);
  g.fillRect(0, 2, W, 7);
  g.fillStyle(0x1b1029, 0.35);
  g.fillRect(0, 8, W, 3);
  for (let x = 3; x < W; x += 9) {
    g.fillStyle(0x1b1029, 0.22);
    g.fillRect(x, 3, 1, 6);
  }

  // body / facade
  g.fillStyle(body, 1);
  g.fillRect(2, 11, W - 4, H - 11);
  g.fillStyle(0x1b1029, 0.18);
  g.fillRect(W - 7, 11, 5, H - 11);
  g.fillStyle(trim, 0.55);
  g.fillRect(4, 11, W - 8, 1);

  // windows
  for (let row = 0; row < 2; row++) {
    const wy = 22 + row * 20;
    for (let wx = 9; wx < W - 10; wx += 19) {
      g.fillStyle(0x1b1029, 0.85);
      g.fillRect(wx - 1, wy - 1, 12, 13);
      g.fillStyle(0xffcf6a, 0.85);
      g.fillRect(wx, wy, 10, 11);
      g.fillStyle(0x1b1029, 0.7);
      g.fillRect(wx + 4, wy, 1, 11);
      g.fillRect(wx, wy + 5, 10, 1);
    }
  }

  // door + awning
  g.fillStyle(0x1b1029, 1);
  g.fillRect(W / 2 - 9, H - 22, 18, 21);
  g.fillStyle(0xd9b26a, 1);
  g.fillRect(W / 2 - 7, H - 20, 14, 19);
  g.fillStyle(trim, 1);
  g.fillRect(W / 2 - 11, H - 25, 22, 4);
  for (let i = 0; i < 4; i++) {
    g.fillStyle(i % 2 ? trim : 0xfff4e0, 1);
    g.fillRect(W / 2 - 9 + i * 5, H - 22, 5, 2);
  }
  g.fillStyle(0xffd166, 1);
  g.fillRect(W / 2 + 4, H - 12, 2, 2);

  // planters / rooftop details
  g.fillStyle(0x3a2836, 1);
  g.fillRect(7, H - 14, 8, 4);
  g.fillStyle(0x4f8877, 1);
  g.fillRect(8, H - 18, 2, 4);
  g.fillRect(12, H - 18, 2, 4);

  g.fillStyle(0x2b1b3d, 1);
  g.fillRect(48, 2, 12, 7);
  g.fillStyle(0xd9b26a, 1);
  g.fillRect(49, 3, 10, 2);
  g.fillRect(50, 9, 1, 3);
  g.fillRect(57, 9, 1, 3);

  // little corner accents
  g.fillStyle(trim, 1);
  g.fillRect(4, 40, 3, 3);
  g.fillRect(W - 7, 40, 3, 3);

  g.generateTexture(key, W, H);
  g.destroy();
}

// Strings of papel picado across the street.
function makeBanner(scene) {  const g = gfx(scene);
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

// Raw art is authored in the old 2x world space. Scale it with the render
// resolution so hand-drawn props and enemies keep their size and gain detail.
function rawGfx(scene, k = SCALE / 2) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  return {
    raw: g,
    fillStyle: (color, alpha) => g.fillStyle(color, alpha),
    fillRect: (x, y, w, h) =>
      g.fillRect(
        Math.round(x * k),
        Math.round(y * k),
        Math.max(1, Math.round(w * k)),
        Math.max(1, Math.round(h * k)),
      ),
    fillCircle: (x, y, r) =>
      g.fillCircle(Math.round(x * k), Math.round(y * k), Math.max(1, Math.round(r * k))),
    fillTriangle: (x1, y1, x2, y2, x3, y3) =>
      g.fillTriangle(
        Math.round(x1 * k),
        Math.round(y1 * k),
        Math.round(x2 * k),
        Math.round(y2 * k),
        Math.round(x3 * k),
        Math.round(y3 * k),
      ),
    lineStyle: (width, color, alpha) =>
      g.lineStyle(Math.max(1, width * k), color, alpha),
    lineBetween: (x1, y1, x2, y2) =>
      g.lineBetween(
        Math.round(x1 * k),
        Math.round(y1 * k),
        Math.round(x2 * k),
        Math.round(y2 * k),
      ),
    strokeCircle: (x, y, r) =>
      g.strokeCircle(Math.round(x * k), Math.round(y * k), Math.round(r * k)),
    generateTexture: (key, w, h) =>
      g.generateTexture(key, Math.round(w * k), Math.round(h * k)),
    destroy: () => g.destroy(),
  };
}

// Draw the raw character art on a denser grid while keeping its compact
// in-game footprint. Coordinates are rounded so the result still reads as
// crisp pixel art rather than a blurry upscale.
function denseRawGfx(scene, k) {
  // The wrapper's coordinates are already in source pixels; do not apply the
  // raw-art world scale on top of the requested density.
  const g = rawGfx(scene, 1);
  const px = (v) => Math.round(v * k);
  return {
    raw: g,
    fillStyle: (color, alpha) => g.fillStyle(color, alpha),
    fillRect: (x, y, w, h) =>
      g.fillRect(px(x), px(y), Math.max(1, px(w)), Math.max(1, px(h))),
    fillTriangle: (x1, y1, x2, y2, x3, y3) =>
      g.fillTriangle(px(x1), px(y1), px(x2), px(y2), px(x3), px(y3)),
    fillCircle: (x, y, r) => g.fillCircle(px(x), px(y), Math.max(1, px(r))),
    generateTexture: (key, w, h) => g.generateTexture(key, px(w), px(h)),
    destroy: () => g.destroy(),
  };
}

// The chow is drawn on a 32x32 design grid at a denser source resolution so
// it holds finer detail than the rest of the placeholder art.
function makeDog(scene, key, pose) {
  // The hero is drawn denser than the surrounding cast: its 32-unit art grid
  // gets extra source pixels while the collision footprint stays unchanged.
  const g = denseRawGfx(scene, 1.25 * (SCALE / 2));

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
  if (pose !== 'dive' && pose !== 'glide' && pose !== 'sit') {
    // Far hind leg, planted at the hip. The near legs animate over it, so the
    // rear of the dog never reads as a single floating stump.
    g.fillStyle(CHOW_DARK, 1);
    g.fillRect(3, 23, 3, 8);
    g.fillStyle(CHOW_RIM, 1);
    g.fillRect(2, 24, 1, 6);
    g.fillStyle(CHOW_LIGHT, 1);
    g.fillRect(3, 29, 3, 2);
    g.fillStyle(CHOW_DARK, 1);
  }
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
  } else if (pose === 'walkC') {
    g.fillRect(7, 23, 4, 8);
    g.fillRect(21, 23, 4, 8);
  } else if (pose === 'walkD') {
    g.fillRect(11, 23, 4, 8);
    g.fillRect(17, 23, 4, 8);
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
  } else if (pose === 'walkC') {
    g.fillRect(7, 29, 4, 2);
    g.fillRect(21, 29, 4, 2);
  } else if (pose === 'walkD') {
    g.fillRect(11, 29, 4, 2);
    g.fillRect(17, 29, 4, 2);
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
    // Tail root: carry the curled tail down into the haunch so it doesn't
    // float above the back when the silhouette folds into a sit.
    g.fillStyle(CHOW_DARK, 1);
    g.fillRect(2, 14, 5, 9);
    g.fillStyle(CHOW_RIM, 1);
    g.fillRect(2, 14, 1, 6);
    g.fillRect(2, 19, 4, 1);

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

  // Denser pixel pass: tiny rim lights, toe claws, eye/collar glints.
  // These coordinates were authored in the old 2x source grid, so scale them
  // by the same amount as the rest of the render.
  const r = g.raw;
  const d = SCALE / 2;
  const dot = (x, y, w = 1, h = 1) =>
    r.fillRect(
      Math.round(x * d),
      Math.round(y * d),
      Math.max(1, Math.round(w * d)),
      Math.max(1, Math.round(h * d)),
    );

  r.fillStyle(CHOW_RIM, 1);
  dot(9, 12);
  dot(2, 16);
  dot(27, 13);
  dot(14, 18);
  r.fillStyle(CREAM, 1);
  dot(30, 14);
  r.fillStyle(CHOW_LIGHT, 1);
  dot(15, 29, 2, 1);
  r.fillStyle(GOLD, 1);
  dot(23, 29);

  if (pose === 'walkA') {
    r.fillStyle(CHOW_LIGHT, 1);
    dot(7, 38, 2, 1);
    dot(26, 38, 2, 1);
  } else if (pose === 'walkB') {
    r.fillStyle(CHOW_LIGHT, 1);
    dot(12, 38, 2, 1);
    dot(20, 38, 2, 1);
  } else if (pose === 'walkC') {
    r.fillStyle(CHOW_LIGHT, 1);
    dot(9, 38, 2, 1);
    dot(27, 38, 2, 1);
  } else if (pose === 'walkD') {
    r.fillStyle(CHOW_LIGHT, 1);
    dot(14, 38, 2, 1);
    dot(22, 38, 2, 1);
  }

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

// --- survival props ---------------------------------------------------------

function makeHeart(scene) {
  const g = rawGfx(scene);
  g.fillStyle(0xd94f4f, 1);
  g.fillRect(2, 1, 2, 2);
  g.fillRect(6, 1, 2, 2);
  g.fillRect(1, 3, 8, 4);
  g.fillRect(2, 7, 6, 2);
  g.fillRect(3, 9, 4, 1);
  g.fillStyle(0xff9a9a, 1);
  g.fillRect(2, 2, 1, 1);
  g.generateTexture('heart', 10, 10);
  g.destroy();
}

function makeFood(scene) {
  const g = rawGfx(scene);
  // concha: cream base, pink shell
  g.fillStyle(0xf4dcc0, 1);
  g.fillRect(1, 4, 10, 4);
  g.fillStyle(0xf2a6b8, 1);
  g.fillRect(0, 3, 12, 2);
  g.fillRect(1, 2, 10, 2);
  g.fillStyle(0xd97a8e, 1);
  g.fillRect(3, 2, 1, 2);
  g.fillRect(6, 2, 1, 2);
  g.fillRect(9, 2, 1, 2);
  g.fillStyle(0xe8b27a, 1);
  g.fillRect(2, 7, 8, 1);
  g.generateTexture('concha', 12, 8);
  g.destroy();
}

function makeBonjoHouse(scene) {
  const g = gfx(scene);
  const W = 130;
  const H = 80;

  // shadow / base
  g.fillStyle(0x1b1029, 0.28);
  g.fillRect(4, H - 6, W - 8, 6);

  // adobe body
  g.fillStyle(0xc98a5e, 1);
  g.fillRect(2, 10, W - 4, H - 10);
  g.fillStyle(0xa96a45, 0.5);
  g.fillRect(W - 13, 10, 11, H - 10);
  g.fillStyle(0xd99a63, 0.6);
  g.fillRect(4, 10, W - 8, 1);

  // tiled roof and eave
  g.fillStyle(0x1b1029, 1);
  g.fillRect(0, 0, W, 2);
  g.fillStyle(0xb5533a, 1);
  g.fillRect(0, 2, W, 8);
  g.fillStyle(0xd9775a, 1);
  g.fillRect(0, 2, W, 2);
  g.fillStyle(0x8f3f2e, 1);
  for (let x = 0; x < W; x += 9) g.fillRect(x, 3, 1, 6);
  g.fillStyle(0x8f3f2e, 1);
  g.fillRect(0, 10, W, 2);
  g.fillStyle(0x6a3d2e, 0.5);
  g.fillRect(5, 12, W - 10, 1);

  // floor trim
  g.fillStyle(0xa96a45, 0.55);
  g.fillRect(4, 33, W - 8, 2);

  // upper and lower windows
  const window = (x, y) => {
    g.fillStyle(0x1b1029, 0.9);
    g.fillRect(x - 1, y - 1, 15, 14);
    g.fillStyle(0xffcf6a, 0.85);
    g.fillRect(x, y, 13, 12);
    g.fillStyle(0x1b1029, 0.7);
    g.fillRect(x + 6, y, 1, 12);
    g.fillRect(x, y + 5, 13, 1);
    g.fillStyle(0xd9b26a, 1);
    g.fillRect(x - 2, y + 13, 17, 2);
    g.fillStyle(0x4f8877, 1);
    g.fillRect(x + 1, y + 14, 3, 2);
    g.fillRect(x + 10, y + 14, 2, 2);
  };

  window(14, 16);
  window(42, 16);
  window(78, 16);
  window(14, 36);
  window(42, 36);

  // door under the CASA gateway
  g.fillStyle(0x1b1029, 1);
  g.fillRect(96, 49, 28, 31);
  g.fillStyle(0x8f5a2e, 1);
  g.fillRect(99, 52, 22, 28);
  g.fillStyle(0xffcf6a, 1);
  g.fillRect(99, 53, 22, 4);
  g.fillStyle(0x5a3328, 1);
  g.fillRect(102, 60, 16, 20);
  g.fillStyle(0xffd166, 1);
  g.fillRect(116, 71, 2, 2);
  g.fillStyle(0x9a5a3c, 1);
  g.fillRect(93, 78, 34, 2);

  // flower boxes / little porch details
  g.fillStyle(0x8f3f2e, 1);
  g.fillRect(10, H - 8, 11, 5);
  g.fillStyle(0x4f8877, 1);
  g.fillRect(11, H - 13, 2, 5);
  g.fillRect(14, H - 15, 2, 7);
  g.fillRect(17, H - 12, 2, 4);
  g.fillStyle(0xe85a4f, 1);
  g.fillRect(14, H - 16, 2, 2);
  g.fillStyle(0x6f8a80, 1);
  g.fillRect(82, H - 4, 9, 3);
  g.fillStyle(0xf4dcc0, 1);
  g.fillRect(84, H - 6, 5, 2);

  // rooftop tank / pots
  g.fillStyle(0x2b1b3d, 1);
  g.fillRect(88, 2, 14, 8);
  g.fillStyle(0xd9b26a, 1);
  g.fillRect(89, 3, 12, 2);
  g.fillRect(90, 10, 1, 3);
  g.fillRect(99, 10, 1, 3);
  g.fillStyle(0x4f8877, 1);
  g.fillRect(24, 3, 3, 3);
  g.fillRect(27, 1, 2, 5);

  // small balcony rail above the door
  g.fillStyle(0x2b1b3d, 1);
  g.fillRect(94, 39, 32, 2);
  for (let x = 96; x < 124; x += 6) g.fillRect(x, 39, 1, 5);
  g.fillStyle(0xe85a4f, 1);
  g.fillRect(120, 36, 3, 3);
  g.fillStyle(0x4f8877, 1);
  g.fillRect(122, 34, 1, 4);

  g.generateTexture('bonjoHouse', W, H);
  g.destroy();
}

// On-screen touch buttons (64x64 textures used at various scales).
function makeControlButtons(scene) {
  const defs = [
    ['btn-left', 'left'],
    ['btn-right', 'right'],
    ['btn-jump', 'jump'],
    ['btn-dive', 'dive'],
    ['btn-interact', 'interact'],
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
    } else if (kind === 'interact') {
      // speech bubble + three dots
      g.fillRect(17, 17, 30, 20);
      g.fillTriangle(23, 37, 33, 37, 25, 46);
      g.fillStyle(0x1b1029, 1);
      g.fillRect(24, 24, 4, 4);
      g.fillRect(30, 24, 4, 4);
      g.fillRect(36, 24, 4, 4);
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
