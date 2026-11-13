// Las Orillas — the agricultural edge of town. A continuous field floor,
// snakes and a three-night Chihuahua boss. Geometry is in design units.
export const lasOrillas = {
  id: 'orillas',
  nameKey: 'map.orillas',
  introKey: 'level.intro.orillas',
  winTitleKey: 'win.orillasTitle',
  storyIntroKey: 'story.orillas',
  winEpilogueKey: 'win.orillasEpilogue',
  world: { width: 4600, height: 900 },
  spawn: { x: 64, y: 548 },
  theme: {
    sky: 'orillasSky',
    cloudsFar: 'cloudsFar',
    cloudsNear: 'cloudsNear',
    town: 'orillasTown',
    nearTown: 'orillasNearTown',
    banner: 'banner',
    haze: 0x79643f,
    hazeAlpha: 0.13,
  },
  platformTint: 0xd7b47a,
  features: { porch: false, errands: false, gateDefense: false },
  safeZone: 24,
  nightsToSurvive: 3,
  goalKey: 'goal.orillas',
  objectiveDescKey: 'objectives.nowDesc.orillas',
  critters: {
    idleTexture: 'snake',
    runTexture: 'snakeRun',
    nightIdleTexture: 'snake',
    nightRunTexture: 'snakeRun',
  },
  boss: {
    texture: 'chihuahuaBoss',
    runTexture: 'chihuahuaBossRun',
    titleKey: 'boss.chihuahua',
    goalKey: 'goal.orillasBoss',
    defeatKey: 'boss.chihuahuaDown',
    scale: 1.4,
    tint: null,
    health: 3,
    baseSpeed: 80,
    chaseSpeed: 170,
    crown: false,
  },

  // One continuous field floor: no pit gaps, so farmhouses and props sit on
  // solid ground. The segments abut exactly and share the same top surface.
  platforms: [
    { x: 0, y: 600, w: 520, h: 300 },
    { x: 520, y: 600, w: 400, h: 300 },
    { x: 920, y: 600, w: 520, h: 300 },
    { x: 1440, y: 600, w: 380, h: 300 },
    { x: 1820, y: 600, w: 480, h: 300 },
    { x: 2300, y: 600, w: 420, h: 300 },
    { x: 2720, y: 600, w: 1080, h: 300 },
    { x: 3800, y: 600, w: 800, h: 300 }, // east extension
  ],

  bones: [
    [120, 590], [300, 590], [470, 590],
    [700, 590], [880, 590], [980, 590],
    [1180, 590], [1360, 590], [1540, 590],
    [1780, 590], [1950, 590], [2040, 590],
    [2240, 590], [2420, 590], [2600, 590],
    [2820, 590], [3010, 590], [3120, 590],
    [3340, 590], [3520, 590], [3680, 590],
    [3900, 590], [4050, 590], [4200, 590], [4350, 590], [4500, 590],
  ],

  rings: [
    [560, 540],
    [1020, 540],
    [1620, 540],
    [2080, 540],
    [2660, 540],
    [3200, 540],
    [4000, 540], [4450, 540],
    [1640, 460], [1760, 380], [1640, 300], [1760, 220],
    [3940, 460], [4060, 380], [3940, 300], [4060, 220],
  ],

  squirrels: [
    { x: 800, y: 588, min: 640, max: 1000 },
    { x: 1420, y: 588, min: 1120, max: 1600 },
    { x: 2500, y: 588, min: 2180, max: 2620 },
    { x: 3350, y: 588, min: 3280, max: 3560 },
    { x: 4100, y: 588, min: 3850, max: 4300 },
  ],

  rivals: [
    { x: 350, y: 587, min: 60, max: 500 },
    { x: 1480, y: 587, min: 1120, max: 1600 },
    { x: 2380, y: 587, min: 2180, max: 2620 },
    { x: 3420, y: 587, min: 3280, max: 3760 },
    { x: 4300, y: 587, min: 3900, max: 4500 },
  ],

  pinatas: [
    [1220, 515],
    { x: 3000, y: 525, life: true },
    [4350, 520],
    [1850, 300],
  ],

  // One placed life heart per level; the marked piñata hides another.
  lives: [[1850, 590]],
  endReward: { x: 4360, y: 570, type: 'flap' },

  awnings: [
    [560, 578],
    [1620, 578],
    [2080, 578],
    [3200, 578],
    [4000, 578], [4450, 578],
  ],

  crows: [
    { x: 2600, y: 520, min: 2180, max: 2620 },
    { x: 3550, y: 520, min: 3280, max: 3760 },
    { x: 4400, y: 520, min: 3900, max: 4500 },
    { x: 1900, y: 300, min: 1700, max: 1950 },
  ],

  checkpoints: { first: 1900, second: 3220, y: 582 },

  foods: [
    [250, 590],
    [900, 590],
    [1280, 590],
    [1980, 590],
    [2470, 590],
    [2860, 590],
    [3580, 590],
    [3900, 590], [4300, 590], [4550, 590],
  ],

  parkedCars: [
    { x: 3540, key: 'carC', flip: true },
    { x: 4450, key: 'carB', flip: true },
  ],

  bikes: [],
  streetProps: [
    { x: 680, key: 'planter' },
    { x: 2320, key: 'hydrant' },
    { x: 3950, key: 'planter' }, { x: 4520, key: 'hydrant' },
  ],

  ledges: [
    { x: 300, y: 500, w: 90, kind: 'laundry' },
    { x: 980, y: 470, w: 100, kind: 'fire' },
    { x: 1600, y: 500, w: 110, kind: 'laundry' },
    { x: 2350, y: 480, w: 100, kind: 'fire' },
    { x: 3040, y: 470, w: 110, kind: 'laundry' },
    { x: 3900, y: 500, w: 110, kind: 'laundry' },
    { x: 4300, y: 480, w: 100, kind: 'fire' },
    // high field climbs: farmhouse roofs over the west fields and east edge
    { x: 1680, y: 420, w: 100, kind: 'roof' },
    { x: 1800, y: 340, w: 90, kind: 'fire' },
    { x: 1690, y: 260, w: 100, kind: 'laundry' },
    { x: 1810, y: 180, w: 90, kind: 'roof' },
    { x: 3980, y: 420, w: 100, kind: 'roof' },
    { x: 4100, y: 340, w: 90, kind: 'fire' },
    { x: 3990, y: 260, w: 100, kind: 'laundry' },
    { x: 4110, y: 180, w: 90, kind: 'roof' },
  ],

  ledgeBones: [
    [330, 490], [1010, 460], [1640, 490], [2380, 470], [3070, 460],
    [3930, 490], [4330, 470],
    [1710, 410], [1830, 330], [1710, 250], [1830, 170],
    [4010, 410], [4130, 330], [4010, 250], [4130, 170],
  ],

  ledgeFoods: [
    [360, 485],
    [1060, 455],
    [2430, 465],
    [3100, 455],
    [3970, 485], [4370, 465],
    [1740, 320], [4040, 320],
  ],

  tacoCarts: [1250, 4000],
  trashSpots: [],
  gateX: 160,
  enemySpawnY: 587,
  dawnFood: [70, 590],
  poloX: 135,
  chihuahuaX: 88,
  bellX: 2450,

  cats: [
    { x: 900, key: 'cat', s: 0.9, flip: false },
    { x: 2700, key: 'catGray', s: 0.85, flip: true },
    { x: 4100, key: 'cat', s: 0.9, flip: true },
  ],
  birds: [
    { x: 1500, s: 0.9 },
    { x: 3100, s: 0.8 },
    { x: 4400, s: 0.85 },
  ],
  roosterX: 2100,

  nightFliers: [
    { x: 180, y: 508, amp: 7, speed: 24, dir: 1 },
    { x: 520, y: 516, amp: 9, speed: 30, dir: -1 },
    { x: 1100, y: 506, amp: 8, speed: 22, dir: 1 },
    { x: 1760, y: 512, amp: 9, speed: 28, dir: -1 },
    { x: 2460, y: 506, amp: 8, speed: 24, dir: 1 },
    { x: 3180, y: 514, amp: 10, speed: 31, dir: -1 },
    { x: 4200, y: 508, amp: 8, speed: 26, dir: 1 },
  ],

  foregroundHouses: [
    { x: 1100, key: 'foregroundHouseB' },
    { x: 2800, key: 'foregroundHouseC' },
    { x: 4200, key: 'foregroundHouseA' },
  ],

  agaveFields: [300, 1800, 3200, 4300],

  agaves: [
    { x: 180, key: 'agave', s: 0.9, flip: true },
    { x: 720, key: 'agaveBloom', s: 0.9, flip: false },
    { x: 1500, key: 'agave', s: 1.05, flip: true },
    { x: 2400, key: 'agaveBloom', s: 0.85, flip: false },
    { x: 3300, key: 'agave', s: 1.05, flip: true },
    { x: 3700, key: 'agave', s: 0.95, flip: false },
    { x: 4550, key: 'agaveBloom', s: 1.0, flip: true },
  ],

  timings: {
    day: 35,
    night: 31,
    nightStep: 5,
    day2: 31,
  },
};
