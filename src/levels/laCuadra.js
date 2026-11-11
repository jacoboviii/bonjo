// La Cuadra — the first playable neighborhood. All coordinates are in the
// 256x144 design space; the level scene scales them by SCALE when it starts.
export const laCuadra = {
  id: 'laCuadra',
  nameKey: 'map.casa',
  world: { width: 4200, height: 900 },
  spawn: { x: 64, y: 548 },
  theme: {
    sky: 'sky',
    cloudsFar: 'cloudsFar',
    cloudsNear: 'cloudsNear',
    town: 'town',
    nearTown: 'nearTown',
    banner: 'banner',
  },
  porch: { x: 105, key: 'bonjoHouse', roofWidth: 130 },
  safeZone: 160,
  features: { porch: true, errands: true, gateDefense: true },

  platforms: [
    { x: 0, y: 600, w: 520, h: 300 }, // starting ground
    { x: 600, y: 600, w: 400, h: 300 },
    { x: 1000, y: 600, w: 100, h: 300 }, // filled under the first foreground house
    { x: 1100, y: 600, w: 400, h: 300 },
    { x: 1620, y: 600, w: 380, h: 300 },
    { x: 2000, y: 600, w: 100, h: 300 }, // filled under the second foreground house
    { x: 2100, y: 600, w: 400, h: 300 }, // checkpoint block
    { x: 2620, y: 600, w: 380, h: 300 },
    { x: 3000, y: 600, w: 80, h: 300 }, // filled under the third foreground house
    { x: 3080, y: 600, w: 120, h: 300 },
    { x: 3260, y: 600, w: 340, h: 300 }, // east block
    { x: 3660, y: 600, w: 300, h: 300 },
    { x: 4020, y: 600, w: 180, h: 300 }, // far end
  ],

  bones: [
    [150, 590], [300, 590], [450, 590],
    [700, 590], [850, 590], [950, 590],
    [1150, 590], [1300, 590], [1450, 590],
    [1700, 590], [1850, 590], [1950, 590],
    [2150, 590], [2250, 590], [2400, 590],
    [2700, 590], [2850, 590], [2950, 590],
    [3100, 590], [3185, 590],
    [3300, 590], [3450, 590], [3550, 590],
    [3700, 590], [3850, 590], [4050, 590], [4150, 590],
  ],

  rings: [
    [560, 540],
    [1560, 540],
    [2560, 540],
    [3240, 540],
    [3640, 540],
    [3980, 540],
  ],

  squirrels: [
    { x: 700, y: 588, min: 640, max: 960 },
    { x: 1300, y: 588, min: 1140, max: 1460 },
    { x: 2700, y: 588, min: 2660, max: 2960 },
    { x: 3400, y: 588, min: 3280, max: 3580 },
    { x: 3900, y: 588, min: 3680, max: 3940 },
  ],

  rivals: [
    { x: 360, y: 587, min: 180, max: 480 },
    { x: 1750, y: 587, min: 1660, max: 1960 },
    { x: 3120, y: 587, min: 3090, max: 3190 },
    { x: 3850, y: 587, min: 3680, max: 3950 },
    { x: 4100, y: 587, min: 4030, max: 4180 },
  ],

  pinatas: [
    [240, 525],
    [2150, 515],
    { x: 3350, y: 525, life: true },
    [3880, 515],
  ],

  // One placed life heart per level; the marked piñata hides another.
  lives: [[1380, 590]],

  awnings: [
    [560, 578],
    [1560, 578],
    [2560, 578],
    [3240, 578],
    [3640, 578],
    [3980, 578],
  ],

  crows: [
    { x: 2900, y: 520, min: 2660, max: 2960 },
    { x: 4100, y: 520, min: 4030, max: 4180 },
  ],

  checkpoints: { first: 2300, second: 3900, y: 582 },

  foods: [
    [350, 590],
    [900, 590],
    [1450, 590],
    [2250, 590],
    [2900, 590],
    [3350, 590],
    [3750, 590],
    [4100, 590],
  ],

  parkedCars: [
    { x: 215, key: 'carB', flip: false },
    { x: 760, key: 'carA', flip: true, alarm: true },
    { x: 1790, key: 'carB', flip: true },
    { x: 2390, key: 'carC', flip: true },
    { x: 3320, key: 'carB', flip: false },
    { x: 4110, key: 'carA', flip: false },
  ],

  bikes: [
    { x: 1430, key: 'bikeMint', flip: true },
    { x: 2460, key: 'bikeMint', flip: false },
    { x: 3700, key: 'bikeCoral', flip: false },
  ],

  streetProps: [
    { x: 470, key: 'hydrant' },
    { x: 660, key: 'streetlamp' },
    { x: 1730, key: 'hydrant' },
    { x: 2660, key: 'streetlamp' },
    { x: 4060, key: 'planter' },
  ],

  ledges: [
    { x: 260, y: 520, w: 90, kind: 'fire' },
    { x: 540, y: 500, w: 110, kind: 'laundry' },
    { x: 1180, y: 470, w: 100, kind: 'fire' },
    { x: 1960, y: 480, w: 110, kind: 'laundry' },
    { x: 2700, y: 500, w: 100, kind: 'fire' },
    { x: 3300, y: 500, w: 100, kind: 'fire' },
    { x: 3760, y: 470, w: 110, kind: 'laundry' },
    { x: 4040, y: 490, w: 90, kind: 'fire' },
  ],

  ledgeBones: [
    [288, 510], [576, 490], [1218, 460], [2004, 470], [2738, 490],
    [3330, 490], [3800, 460], [4070, 480],
  ],

  ledgeFoods: [
    [600, 485],
    [2040, 465],
    [3360, 485],
    [3820, 455],
  ],

  tacoCarts: [640, 3500],
  trashSpots: [960, 3820],
  gateX: 160,
  enemySpawnY: 587,
  dawnFood: [70, 590],
  poloX: 135,
  chihuahuaX: 88,
  bellX: 2450,

  cats: [
    { x: 850, key: 'catGray', s: 1, flip: false },
    { x: 1850, key: 'cat', s: 0.85, flip: false },
  ],
  birds: [
    { x: 1120, s: 1 },
    { x: 2350, s: 0.85 },
  ],
  roosterX: 500,

  nightFliers: [
    { x: 80, y: 508, amp: 7, speed: 22, dir: 1 },
    { x: 210, y: 518, amp: 9, speed: 28, dir: -1 },
    { x: 430, y: 506, amp: 8, speed: 25, dir: 1 },
    { x: 760, y: 514, amp: 10, speed: 30, dir: -1 },
    { x: 1400, y: 504, amp: 7, speed: 20, dir: 1 },
    { x: 2300, y: 512, amp: 9, speed: 28, dir: -1 },
    { x: 3200, y: 506, amp: 8, speed: 23, dir: 1 },
    { x: 3950, y: 514, amp: 11, speed: 32, dir: -1 },
  ],

  foregroundHouses: [
    { x: 1040, key: 'foregroundHouseA' },
    { x: 2040, key: 'foregroundHouseB' },
    { x: 3040, key: 'foregroundHouseC' },
  ],

  agaveFields: [1300, 2780, 3380],

  agaves: [
    { x: 250, key: 'agave', s: 0.85, flip: true },
    { x: 1220, key: 'agave', s: 1.05, flip: false },
    { x: 2150, key: 'agaveBloom', s: 0.85, flip: true },
    { x: 2700, key: 'agave', s: 1.05, flip: true },
    { x: 4140, key: 'agave', s: 1.05, flip: false },
  ],

  timings: {
    day: 35,
    night: 28,
    nightStep: 5,
    day2: 30,
  },
};
