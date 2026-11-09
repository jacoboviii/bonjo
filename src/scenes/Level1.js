import Phaser from 'phaser';
import GUI from 'lil-gui';
import Dog from '../objects/Dog.js';
import Crow from '../objects/Crow.js';
import Squirrel from '../objects/Squirrel.js';
import RivalDog from '../objects/RivalDog.js';
import Pinata from '../objects/Pinata.js';
import { tuning, DEFAULTS } from '../tuning.js';
import { makePlatformTexture } from '../art.js';
import { SCALE } from '../scale.js';
import { sfx } from '../sfx.js';
import TouchControls from '../ui/TouchControls.js';
import { t } from '../i18n.js';

const S = SCALE;

const WORLD_W = 3200 * S;
const WORLD_H = 900 * S;

// x,y,w,h in design pixels (the 256x144 space). x,y is the top-left corner.
// Everything is multiplied by S when it is placed in the 2x world.
const PLATFORMS = [
  { x: 0, y: 600, w: 520, h: 300 }, // starting ground
  { x: 600, y: 600, w: 400, h: 300 },
  { x: 1100, y: 600, w: 400, h: 300 },
  { x: 1620, y: 600, w: 380, h: 300 },
  { x: 2100, y: 600, w: 400, h: 300 }, // checkpoint block
  { x: 2620, y: 600, w: 380, h: 300 },
  { x: 3080, y: 600, w: 120, h: 300 }, // goal block
];

const BONES = [
  [150, 590], [300, 590], [450, 590],
  [700, 590], [850, 590], [950, 590],
  [1150, 590], [1300, 590], [1450, 590],
  [1700, 590], [1850, 590], [1950, 590],
  [2150, 590], [2250, 590], [2400, 590],
  [2700, 590], [2850, 590], [2950, 590],
  [3100, 590], [3185, 590],
];

// Wind rings refill your flaps and give a little lift.
const RINGS = [
  [560, 540],
  [1560, 540],
  [2560, 540],
];

const SQUIRRELS = [
  { x: 700, y: 588, min: 640, max: 960 },
  { x: 1300, y: 588, min: 1140, max: 1460 },
  { x: 2700, y: 588, min: 2660, max: 2960 },
];

// Dogs from other houses, guarding their turf.
const RIVALS = [
  { x: 360, y: 587, min: 180, max: 480 },
  { x: 1750, y: 587, min: 1660, max: 1960 },
  { x: 3120, y: 587, min: 3090, max: 3190 },
];

// Hanging piñatas: jump/flap/dive into them.
const PINATAS = [
  [240, 525],
  [2150, 515],
];

// Market awnings: land on them to bounce.
const AWNINGS = [
  [560, 578],
  [1560, 578],
  [2560, 578],
];

// One crow stays as a rarer aerial hazard.
const CROWS = [
  { x: 2900, y: 520, min: 2660, max: 2960 },
];

const CHECKPOINT_X = 2300;
const CHECKPOINT_Y = 582;

// Concha pickups: restore hunger.
const FOODS = [
  [350, 590],
  [900, 590],
  [1450, 590],
  [2250, 590],
  [2900, 590],
];

// Street dressing. These are background-only props at the far curb: they sit
// behind Bonjo and the sidewalk (depth 0) so they never block movement.
const PARKED_CARS = [
  { x: 215, key: 'carB', flip: false },
  { x: 760, key: 'carA', flip: true },
  { x: 1290, key: 'carC', flip: false },
  { x: 1790, key: 'carB', flip: true },
  { x: 2390, key: 'carC', flip: true },
  { x: 2980, key: 'carA', flip: false },
];

const BIKES = [
  { x: 120, key: 'bikeMint', flip: false },
  { x: 980, key: 'bikeCoral', flip: true },
  { x: 1430, key: 'bikeMint', flip: true },
  { x: 1950, key: 'bikeCoral', flip: false },
  { x: 2460, key: 'bikeMint', flip: false },
  { x: 2940, key: 'bikeCoral', flip: true },
  { x: 3140, key: 'bikeMint', flip: false },
];

const STREET_PROPS = [
  { x: 470, key: 'hydrant' },
  { x: 960, key: 'trashcan' },
  { x: 1450, key: 'planter' },
  { x: 1730, key: 'hydrant' },
  { x: 2280, key: 'trashcan' },
  { x: 2470, key: 'planter' },
  { x: 2840, key: 'hydrant' },
  { x: 660, key: 'streetlamp' },
  { x: 1660, key: 'streetlamp' },
  { x: 2660, key: 'streetlamp' },
];

export default class Level1 extends Phaser.Scene {
  constructor() {
    super('Level1');
  }

  create() {
    this.bonesCount = 0;
    this.won = false;
    this.gameOverFlag = false;
    this.guiOpen = true;
    this.hintTimer = 16;
    this.checkpointActive = false;
    this.spawnPoint = { x: 64 * S, y: 548 * S };
    this.startedAt = this.time.now;

    // survival state
    this.maxHealth = 3;
    this.health = 3;
    this.maxHunger = 100;
    this.hunger = 80;
    this.hungerTick = 0;
    this.phase = 'day';
    this.dayNumber = 1;
    this.phaseTime = 35;
    this.nightsSurvived = 0;
    this.nightsToSurvive = 2;
    this.waveSpawned = 0;
    this.waveTotal = 0;
    this.nextWave = 0;
    this.runStats = { damage: 0, falls: 0, food: 0, waves: 0, starved: 0 };

    this.buildBackground();
    this.createStreetDressing();
    this.buildLevel();
    this.createPorch();
    this.createInput();
    this.createDog();
    this.createPickups();
    this.createFood();
    this.createCrows();
    this.createSquirrels();
    this.createRivals();
    this.createPinatas();
    this.createAwnings();
    this.createCamera();
    this.createHud();
    this.createTuningPanel();
    this.showIntro();
    this.updateHud(0);

    // Dev-only handle so automated playtests can read the dog's state.
    if (import.meta.env.DEV) {
      window.__bonjo = this;
      window.__tuning = tuning;
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.onResize, this);
      this.gui?.destroy();
    });

    this.layoutWidth = this.scale.width;
    this.scale.on('resize', this.onResize, this);
  }

  onResize(gameSize) {
    const width = gameSize?.width ?? this.scale.width;
    if (Math.abs(width - this.layoutWidth) <= 1) return;
    this.layoutWidth = width;
    this.applyLayout(width);
  }

  // Re-anchor width-dependent UI/backgrounds without restarting the run.
  applyLayout(W) {
    if (this.sky) this.sky.setPosition(W / 2, 72 * S).setDisplaySize(W, 144 * S);
    if (this.sun) this.sun.x = W - 102;
    this.cloudsFar?.setSize(W, 64 * S);
    this.cloudsNear?.setSize(W, 64 * S);
    this.town?.setSize(W, 100 * S);
    this.nearTown?.setSize(W, 100 * S);
    this.banner?.setSize(W, 14 * S);
    this.envHaze?.setPosition(W / 2, 72 * S).setSize(W, 144 * S);
    this.nightOverlay?.setPosition(W / 2, 72 * S).setSize(W, 144 * S);

    if (this.boneText) this.boneText.x = W / 2;
    if (this.hint) this.hint.x = W / 2;
    if (this.introLabel?.active) this.introLabel.x = W / 2;
    if (this.phaseBanner?.active) this.phaseBanner.x = W / 2;

    this.touch?.relayout(W);
    this.layoutEndScreen(W);
  }

  layoutEndScreen(W) {
    const e = this.endLayout;
    if (!e?.overlay?.active) return;
    e.overlay.setPosition(W / 2, 72 * S).setSize(W, 144 * S);
    e.title.x = W / 2;
    e.stats.x = W / 2;
    e.box.x = W / 2;
    e.prompt.x = W / 2;
  }

  update(time, delta) {
    const dt = delta / 1000;

    if (!this.won && !this.gameOverFlag) {
      this.dog.update(delta);
      this.updateSurvival(dt);

      this.crowGroup.children.iterate((crow) => {
        if (crow) crow.update(dt);
      });

      this.squirrelGroup.children.iterate((squirrel) => {
        if (squirrel) squirrel.update(dt);
      });

      this.rivalGroup.children.iterate((rival) => {
        if (rival) rival.update(dt);
      });
    }

    this.updateCamera(delta);
    this.updateHud(delta);

    if (!this.won && !this.gameOverFlag && this.dog.y > WORLD_H + 40 * S) {
      this.fall();
    }
  }

  // --- world building ------------------------------------------------------

  buildBackground() {
    const W = this.scale.width;

    this.sky = this.add
      .image(W / 2, 72 * S, 'sky')
      .setDisplaySize(W, 144 * S)
      .setScrollFactor(0)
      .setDepth(-30);
    this.sun = this.add
      .image(W - 102, 56 * S, 'sun')
      .setScrollFactor(0.04)
      .setDepth(-29)
      .setAlpha(0.95);

    this.cloudsFar = this.add
      .tileSprite(0, 8 * S, W, 64 * S, 'cloudsFar')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-25)
      .setAlpha(0.5);

    this.cloudsNear = this.add
      .tileSprite(0, 38 * S, W, 64 * S, 'cloudsNear')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-24)
      .setAlpha(0.75);

    this.town = this.add
      .tileSprite(0, 500 * S, W, 100 * S, 'town')
      .setOrigin(0, 0)
      .setScrollFactor(0, 1)
      .setDepth(-20);

    this.nearTown = this.add
      .tileSprite(0, 500 * S, W, 100 * S, 'nearTown')
      .setOrigin(0, 0)
      .setScrollFactor(0, 1)
      .setDepth(-19);

    this.banner = this.add
      .tileSprite(0, 32 * S, W, 14 * S, 'banner')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-18)
      .setAlpha(0.95);

    // Night falls over La Cuadra.
    this.nightOverlay = this.add
      .rectangle(W / 2, 72 * S, W, 144 * S, 0x0b0614, 1)
      .setScrollFactor(0)
      .setDepth(60)
      .setAlpha(0);

    // Push the city back visually. This sits above the background and the
    // parked street dressing but below the platform/props and every gameplay
    // sprite, so the playable street stays bright and readable.
    this.envHaze = this.add
      .rectangle(W / 2, 72 * S, W, 144 * S, 0x1b1029, 0.3)
      .setScrollFactor(0)
      .setDepth(0.5);
  }

  createStreetDressing() {
    const groundY = 600 * S;

    for (const car of PARKED_CARS) {
      this.add
        .image(car.x * S, groundY, car.key)
        .setOrigin(0.5, 1)
        .setDepth(0)
        .setFlipX(!!car.flip);
    }

    for (const bike of BIKES) {
      this.add
        .image(bike.x * S, groundY, bike.key)
        .setOrigin(0.5, 1)
        .setDepth(0)
        .setFlipX(!!bike.flip);
    }

    for (const prop of STREET_PROPS) {
      this.add
        .image(prop.x * S, groundY, prop.key)
        .setOrigin(0.5, 1)
        .setDepth(0);
    }
  }

  buildLevel() {
    this.platforms = this.physics.add.staticGroup();
    for (const p of PLATFORMS) {
      const key = `plat_${p.x}_${p.y}_${p.w}_${p.h}`;
      const seed = (p.x * 73856093) ^ (p.y * 19349663) ^ (p.w * 83492791);
      // art is generated at 2x from these design dimensions
      makePlatformTexture(this, key, p.w, p.h, seed);
      const img = this.platforms.create(
        (p.x + p.w / 2) * S,
        (p.y + p.h / 2) * S,
        key,
      );
      img.setDepth(1);
    }

    this.platforms.refresh();
  }

  createPorch() {
    this.add
      .image(28 * S, 600 * S, 'porch')
      .setOrigin(0.5, 1)
      .setDepth(2);
  }

  createFood() {
    this.foodGroup = this.physics.add.group({ allowGravity: false, immovable: true });

    for (const [x, y] of FOODS) {
      this.spawnFoodAt(x * S, y * S);
    }

    this.physics.add.overlap(this.dog, this.foodGroup, this.eatFood, null, this);
  }

  spawnFoodAt(x, y) {
    const food = this.foodGroup.create(x, y, 'concha');
    food.setDepth(7);
    food.body.setSize(10 * S, 6 * S);

    this.tweens.add({
      targets: food,
      alpha: 0.6,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    return food;
  }

  eatFood(dog, food) {
    if (!food.active) return;

    food.disableBody(true, true);
    this.runStats.food += 1;
    this.hunger = Math.min(this.maxHunger, this.hunger + 30);
    this.updateSurvivalHud();

    sfx.eat();
    this.spawnPuff(food.x, food.y, 0.7);
    this.floatText(food.x, food.y - 8 * S, t('float.food'), '#6ec6a8');
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');

    this.input.keyboard.on('keydown-T', () => {
      this.guiOpen = !this.guiOpen;
      this.gui?.show(this.guiOpen);
    });

    this.input.keyboard.on('keydown-R', () => this.scene.restart());

    // Dev helper: skip to the next phase without waiting.
    if (import.meta.env.DEV) {
      this.input.keyboard.on('keydown-N', () => {
        if (!this.won && !this.gameOverFlag) this.phaseTime = 0;
      });
    }
    this.input.keyboard.on('keydown-V', () => this.touch?.toggle());
  }

  createDog() {
    this.controls = {
      cursors: this.cursors,
      wasd: this.wasd,
      touch: null,
      consumeTouchJump: null,
    };

    this.dog = new Dog(this, this.spawnPoint.x, this.spawnPoint.y);
    this.dog.controls = this.controls;

    this.touch = new TouchControls(this);
    this.controls.touch = this.touch.state;
    this.controls.consumeTouchJump = () => this.touch.consumeJump();

    this.physics.add.collider(this.dog, this.platforms);
  }

  createPickups() {
    // bones
    this.boneGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    for (const [x, y] of BONES) {
      const bone = this.boneGroup.create(x * S, y * S, 'bone');
      bone.setDepth(7);
      bone.body.setSize(8 * S, 6 * S);
      this.tweens.add({
        targets: bone,
        alpha: 0.5,
        duration: 650 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
      });
    }
    this.physics.add.overlap(this.dog, this.boneGroup, this.collectBone, null, this);

    // wind rings
    this.ringGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    for (const [x, y] of RINGS) {
      const ring = this.ringGroup.create(x * S, y * S, 'ring');
      ring.setDepth(7);
      ring.body.setCircle(7 * S, 1 * S, 1 * S);
      ring.setData('last', -9999);
      this.tweens.add({
        targets: ring,
        alpha: 0.55,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
      });
    }
    this.physics.add.overlap(this.dog, this.ringGroup, this.touchRing, null, this);

    // checkpoint balloon
    this.checkpoint = this.physics.add
      .staticImage(CHECKPOINT_X * S, CHECKPOINT_Y * S, 'balloon')
      .setDepth(7)
      .setTint(0x6a5a76);
    this.checkpoint.body.setSize(12 * S, 18 * S);
    this.physics.add.overlap(this.dog, this.checkpoint, this.touchCheckpoint, null, this);
  }

  createCrows() {
    this.crowGroup = this.add.group();
    for (const c of CROWS) {
      this.crowGroup.add(new Crow(this, c.x * S, c.y * S, c.min * S, c.max * S));
    }
    this.physics.add.overlap(this.dog, this.crowGroup, this.hitCrow, null, this);
  }

  createSquirrels() {
    // A plain group preserves the gravity/speed set in the Squirrel
    // constructor (an Arcade physics group would reset those on add).
    this.squirrelGroup = this.add.group();

    for (const s of SQUIRRELS) {
      this.squirrelGroup.add(
        new Squirrel(this, s.x * S, s.y * S, s.min * S, s.max * S),
      );
    }

    this.physics.add.collider(this.squirrelGroup, this.platforms);
    this.physics.add.overlap(this.dog, this.squirrelGroup, this.hitSquirrel, null, this);
    this.physics.add.overlap(
      this.squirrelGroup,
      this.boneGroup,
      this.squirrelSteals,
      null,
      this,
    );
  }

  createRivals() {
    this.rivalGroup = this.add.group();

    for (const r of RIVALS) {
      this.rivalGroup.add(
        new RivalDog(this, r.x * S, r.y * S, r.min * S, r.max * S),
      );
    }

    this.physics.add.collider(this.rivalGroup, this.platforms);
    this.physics.add.overlap(this.dog, this.rivalGroup, this.hitRival, null, this);
  }

  createPinatas() {
    this.pinataGroup = this.add.group();

    for (const [x, y] of PINATAS) {
      this.pinataGroup.add(new Pinata(this, x * S, y * S));
    }

    this.physics.add.overlap(this.dog, this.pinataGroup, this.hitPinata, null, this);
  }

  createAwnings() {
    this.awningGroup = this.physics.add.staticGroup();

    for (const [x, y] of AWNINGS) {
      this.awningGroup.create(x * S, y * S, 'awning').setDepth(2);
    }

    this.physics.add.collider(
      this.dog,
      this.awningGroup,
      this.bounceAwning,
      this.canLandOnAwning,
      this,
    );
  }

  createCamera() {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, WORLD_W, WORLD_H);
    cam.startFollow(this.dog, true, tuning.cameraLerp, tuning.cameraLerp);
    cam.setFollowOffset(0, 18 * S);
    cam.fadeIn(350, 27, 16, 41);
  }

  createHud() {
    const W = this.scale.width;

    this.pips = this.add.graphics().setScrollFactor(0).setDepth(100);

    this.boneText = this.add
      .text(W / 2, 5 * S, `${t('hud.bones')} 0`, {
        fontFamily: 'monospace',
        fontSize: 8 * S,
        color: '#fff4e0',
        stroke: '#2b1b3d',
        strokeThickness: 2 * S,
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this.hint = this.add
      .text(W / 2, 138 * S, t('level.hint'), {
        fontFamily: 'monospace',
        fontSize: 7 * S,
        color: '#fff4e0',
        stroke: '#2b1b3d',
        strokeThickness: 2 * S,
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0.85);

    // hearts
    this.hearts = [];
    for (let i = 0; i < this.maxHealth; i++) {
      this.hearts.push(
        this.add
          .image((8 + i * 14) * S, 23 * S, 'heart')
          .setOrigin(0, 0)
          .setScrollFactor(0)
          .setDepth(100),
      );
    }

    // hunger: concha icon + bar
    this.hungerIcon = this.add
      .image(60 * S, 34 * S, 'concha')
      .setOrigin(0, 0)
      .setScale(0.7)
      .setScrollFactor(0)
      .setDepth(100);

    this.hungerBar = this.add.graphics().setScrollFactor(0).setDepth(100);

    this.phaseText = this.add
      .text(8 * S, 54 * S, '', {
        fontFamily: 'monospace',
        fontSize: 8 * S,
        color: '#fff4e0',
        stroke: '#2b1b3d',
        strokeThickness: 2 * S,
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.updateSurvivalHud();

    // On touch devices the buttons are the tutorial, and they occupy the
    // bottom of the screen where the keyboard hint would sit.
    if (this.touch?.visible) this.hint.setVisible(false);
  }

  createTuningPanel() {
    const gui = new GUI({ title: t('tuning.title') });
    this.gui = gui;

    const move = gui.addFolder(t('tuning.movement'));
    move.add(tuning, 'runSpeed', 80, 500, 5).name(t('tuning.runSpeed'));
    move.add(tuning, 'groundAccel', 400, 6000, 50).name(t('tuning.groundAccel'));
    move.add(tuning, 'airAccel', 200, 4000, 50).name(t('tuning.airAccel'));
    move.add(tuning, 'groundFriction', 400, 6000, 50).name(t('tuning.groundFriction'));
    move.close();

    const air = gui.addFolder(t('tuning.air'));
    air.add(tuning, 'gravity', 400, 4000, 10).name(t('tuning.gravity'));
    air.add(tuning, 'glideGravity', 50, 1200, 10).name(t('tuning.glideGravity'));
    air.add(tuning, 'glideMaxFall', 30, 400, 5).name(t('tuning.glideFall'));
    air.add(tuning, 'diveGravity', 800, 6000, 50).name(t('tuning.diveGravity'));
    air.add(tuning, 'diveMaxFall', 300, 1600, 10).name(t('tuning.diveFall'));
    air.add(tuning, 'jumpImpulse', 200, 700, 5).name(t('tuning.jump'));
    air.add(tuning, 'flapImpulse', 150, 700, 5).name(t('tuning.flap'));
    air.add(tuning, 'maxFlaps', 0, 5, 1).name(t('tuning.flaps'));
    air.add(tuning, 'jumpCut', 0.1, 1, 0.05).name(t('tuning.jumpCut'));
    air.add(tuning, 'minJumpMs', 0, 250, 5).name(t('tuning.minJump'));
    air.add(tuning, 'coyoteMs', 0, 300, 5).name(t('tuning.coyote'));
    air.add(tuning, 'jumpBufferMs', 0, 300, 5).name(t('tuning.buffer'));
    air.close();

    const cam = gui.addFolder(t('tuning.camera'));
    cam.add(tuning, 'lookAhead', 0, 80, 1).name(t('tuning.lookAhead'));
    cam.add(tuning, 'cameraLerp', 0.02, 0.5, 0.01).name(t('tuning.cameraLerp'));
    cam.close();

    const actions = gui.addFolder(t('tuning.actions'));
    actions.add({ restart: () => this.scene.restart() }, 'restart').name(t('tuning.restart'));
    actions.add(
      {
        reset: () => {
          Object.assign(tuning, DEFAULTS);
          gui.controllersRecursive().forEach((c) => c.updateDisplay());
        },
      },
      'reset',
    ).name(t('tuning.reset'));
    actions.close();

    // Start collapsed so the panel is a single title bar over the sky.
    gui.close();

    // Phones don't need (or have room for) the desktop tuning panel.
    if (this.touch?.visible) {
      this.guiOpen = false;
      gui.hide();
    }
  }

  showIntro() {
    this.introLabel = this.add
      .text(this.scale.width / 2, 50 * S, t('level.intro'), {
        fontFamily: 'monospace',
        fontSize: 12 * S,
        color: '#fff4e0',
        stroke: '#2b1b3d',
        strokeThickness: 3 * S,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0);

    this.tweens.add({
      targets: this.introLabel,
      alpha: 1,
      duration: 350,
      hold: 900,
      yoyo: true,
      onComplete: () => this.introLabel?.destroy(),
    });
  }

  // --- per-frame helpers ---------------------------------------------------

  updateCamera(delta) {
    const cam = this.cameras.main;
    const k = Phaser.Math.Clamp(tuning.cameraLerp, 0.01, 0.5);

    cam.lerp.x = k;
    cam.lerp.y = k;

    const targetX = -this.dog.facing * tuning.lookAhead * S;
    cam.followOffset.x = Phaser.Math.Linear(cam.followOffset.x, targetX, 0.08);
    cam.followOffset.y = Phaser.Math.Linear(cam.followOffset.y, 18 * S, 0.08);

    // parallax layers are fixed to the screen; scroll their texture instead
    this.cloudsFar.tilePositionX = cam.scrollX * 0.05;
    this.cloudsNear.tilePositionX = cam.scrollX * 0.13;
    this.town.tilePositionX = cam.scrollX * 0.3;
    this.nearTown.tilePositionX = cam.scrollX * 0.55;
    this.banner.tilePositionX = cam.scrollX * 0.12;
  }

  updateHud(delta) {
    // flap pips, top-left
    this.pips.clear();
    for (let i = 0; i < tuning.maxFlaps; i++) {
      const x = (10 + i * 10) * S;
      if (i < this.dog.flaps) {
        this.pips.fillStyle(0xffd166, 1);
        this.pips.fillCircle(x, 11 * S, 3.5 * S);
        this.pips.lineStyle(1 * S, 0x2b1b3d, 0.5);
        this.pips.strokeCircle(x, 11 * S, 3.5 * S);
      } else {
        this.pips.lineStyle(1 * S, 0xfff4e0, 0.45);
        this.pips.strokeCircle(x, 11 * S, 3.5 * S);
      }
    }

    this.boneText.setText(`${t('hud.bones')} ${this.bonesCount}`);

    if (this.hintTimer > 0) {
      this.hintTimer -= delta / 1000;
    } else if (this.hint.alpha > 0) {
      this.hint.setAlpha(Math.max(0, this.hint.alpha - delta / 1200));
    }

    this.updateSurvivalHud();
  }

  updateSurvivalHud() {
    if (!this.hearts) return;

    this.hearts.forEach((heart, i) => {
      heart.setAlpha(i < this.health ? 1 : 0.22);
    });

    this.hungerBar.clear();
    this.hungerBar.fillStyle(0x2b1b3d, 0.65);
    this.hungerBar.fillRect(8 * S, 35 * S, 48 * S, 6 * S);
    this.hungerBar.lineStyle(1 * S, 0xfff4e0, 0.5);
    this.hungerBar.strokeRect(8 * S, 35 * S, 48 * S, 6 * S);

    const width = Math.max(0, (this.hunger / this.maxHunger) * 46 * S);
    this.hungerBar.fillStyle(this.hunger < 25 ? 0xf26b5e : 0xf0a03c, 1);
    this.hungerBar.fillRect(9 * S, 36 * S, width, 4 * S);

    const label = this.phase === 'day' ? t('hud.day') : t('hud.night');
    const number = this.phase === 'day' ? this.dayNumber : this.nightsSurvived + 1;
    this.phaseText.setText(
      `${label} ${number} · ${Math.ceil(Math.max(0, this.phaseTime))}s`,
    );
    this.phaseText.setColor(this.phase === 'night' ? '#ffd166' : '#fff4e0');
  }

  // --- survival loop -------------------------------------------------------

  updateSurvival(dt) {
    if (this.won || this.gameOverFlag) return;

    this.phaseTime -= dt;
    this.hunger = Math.max(0, this.hunger - dt * 0.8);

    if (this.hunger <= 0) {
      this.hungerTick += dt;
      if (this.hungerTick >= 8) {
        this.hungerTick = 0;
        this.starve();
      }
    } else {
      this.hungerTick = 0;
    }

    if (this.won || this.gameOverFlag) return;

    if (this.phase === 'day') {
      if (this.phaseTime <= 0) this.startNight();
    } else {
      if (this.waveSpawned < this.waveTotal) {
        this.nextWave -= dt;
        if (this.nextWave <= 0) {
          this.spawnWaveRival();
          this.waveSpawned += 1;
          this.nextWave = 6;
        }
      }

      if (this.phaseTime <= 0) this.endNight();
    }
  }

  startNight() {
    this.phase = 'night';
    this.phaseTime = 28 + this.nightsSurvived * 5;
    this.waveTotal = 3 + this.nightsSurvived;
    this.waveSpawned = 0;
    this.nextWave = 2;

    this.tweens.add({
      targets: this.nightOverlay,
      alpha: 0.38,
      duration: 900,
    });

    this.showPhaseBanner(`${t('hud.night')} ${this.nightsSurvived + 1}`, '#ffd166');
    sfx.night();
  }

  endNight() {
    this.nightsSurvived += 1;

    if (this.nightsSurvived >= this.nightsToSurvive) {
      this.win();
      return;
    }

    this.startDay();
  }

  startDay() {
    this.phase = 'day';
    this.dayNumber += 1;
    this.phaseTime = 30;
    this.waveSpawned = 0;
    this.waveTotal = 0;

    this.health = Math.min(this.maxHealth, this.health + 1);
    this.hunger = Math.min(this.maxHunger, this.hunger + 10);

    this.tweens.add({
      targets: this.nightOverlay,
      alpha: 0,
      duration: 900,
    });

    this.showPhaseBanner(`${t('hud.day')} ${this.dayNumber}`, '#6ec6a8');
    sfx.day();

    this.spawnFoodAt(70 * S, 590 * S);
    this.updateSurvivalHud();
  }

  spawnWaveRival() {
    const designX = this.dog.x / S;

    let platform = PLATFORMS.find(
      (p) => designX >= p.x && designX <= p.x + p.w,
    );

    if (!platform) {
      platform = PLATFORMS.reduce((best, p) => {
        const bestDist = Math.abs(best.x + best.w / 2 - designX);
        const dist = Math.abs(p.x + p.w / 2 - designX);
        return dist < bestDist ? p : best;
      }, PLATFORMS[0]);
    }

    const mid = platform.x + platform.w / 2;
    let sx = designX < mid ? platform.x + platform.w - 24 : platform.x + 24;

    if (Math.abs(sx - designX) < 70) {
      sx = designX < mid ? platform.x + 24 : platform.x + platform.w - 24;
    }

    // The porch (x < 160 on the first block) is a safe zone.
    const minX = (platform.x === 0 ? 160 : platform.x + 12) * S;
    const maxX = (platform.x + platform.w - 12) * S;

    const rival = new RivalDog(this, sx * S, 587 * S, minX, maxX);
    this.rivalGroup.add(rival);
    this.runStats.waves += 1;

    this.spawnPuff(sx * S, 580 * S, 1);
    this.floatText(sx * S, 558 * S, t('bark'), '#ffd166');
    sfx.bark();
  }

  showPhaseBanner(text, color) {
    this.phaseBanner = this.add
      .text(this.scale.width / 2, 72 * S, text, {
        fontFamily: 'monospace',
        fontSize: 22 * S,
        color,
        stroke: '#2b1b3d',
        strokeThickness: 4 * S,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0);

    this.tweens.add({
      targets: this.phaseBanner,
      alpha: 1,
      duration: 250,
      hold: 700,
      yoyo: true,
      onComplete: () => this.phaseBanner?.destroy(),
    });
  }

  // --- damage & end states -------------------------------------------------

  spawnPuff(x, y, scale = 1) {
    const puff = this.add.image(x, y, 'puff').setDepth(20).setScale(scale).setAlpha(0.8);
    this.tweens.add({
      targets: puff,
      y: y - 6 * S,
      scale: scale * 1.8,
      alpha: 0,
      duration: 320,
      ease: 'Quad.out',
      onComplete: () => puff.destroy(),
    });
  }

  floatText(x, y, message, color = '#ffd166') {
    const label = this.add
      .text(x, y, message, {
        fontFamily: 'monospace',
        fontSize: 7 * S,
        color,
        stroke: '#2b1b3d',
        strokeThickness: 2 * S,
      })
      .setOrigin(0.5)
      .setDepth(50);

    this.tweens.add({
      targets: label,
      y: y - 12 * S,
      alpha: 0,
      duration: 700,
      ease: 'Quad.out',
      onComplete: () => label.destroy(),
    });
  }

  onJump() {
    sfx.jump();
    this.spawnPuff(this.dog.x, this.dog.y + 7 * S, 0.8);
  }

  onFlap() {
    sfx.flap();
    this.spawnPuff(this.dog.x - this.dog.facing * 3 * S, this.dog.y + 5 * S, 0.65);
    this.spawnPuff(this.dog.x + this.dog.facing * 3 * S, this.dog.y + 6 * S, 0.5);
  }

  onDiveLand() {
    sfx.stomp();
    this.cameras.main.shake(120, 0.005);
    for (let i = 0; i < 4; i++) {
      this.spawnPuff(
        this.dog.x + Phaser.Math.Between(-9 * S, 9 * S),
        this.dog.y + 7 * S,
        0.8,
      );
    }
  }

  // --- game events ---------------------------------------------------------

  collectBone(dog, bone) {
    if (!bone.active) return;
    bone.disableBody(true, true);
    this.bonesCount += 1;
    sfx.bone();
    this.spawnPuff(bone.x, bone.y, 0.7);
    this.floatText(bone.x, bone.y - 6 * S, '+1');
  }

  touchRing(dog, ring) {
    const now = this.time.now;
    if (now - ring.getData('last') < 500) return;
    ring.setData('last', now);

    if (this.dog.flaps >= tuning.maxFlaps) return;

    this.dog.flaps = tuning.maxFlaps;
    this.dog.body.velocity.y = Math.min(this.dog.body.velocity.y, -140 * S);
    sfx.ring();
    this.spawnPuff(ring.x, ring.y, 1.2);
    this.floatText(ring.x, ring.y - 10 * S, t('float.flap'), '#6ec6a8');
  }

  touchCheckpoint() {
    if (this.checkpointActive) return;
    this.checkpointActive = true;

    this.checkpoint.clearTint();
    this.spawnPoint = { x: CHECKPOINT_X * S, y: 548 * S };

    sfx.checkpoint();
    this.spawnPuff(this.checkpoint.x, this.checkpoint.y, 1.3);
    this.floatText(this.checkpoint.x, this.checkpoint.y - 16 * S, t('float.checkpoint'));
  }

  hitCrow(dog, crow) {
    if (crow.defeated || !crow.active) return;

    // diving (or falling fast) pops the crow
    if (this.dog.diving || this.dog.body.velocity.y > 160 * S) {
      crow.defeated = true;
      crow.body.enable = false;

      this.bonesCount += 1;
      sfx.stomp();
      this.spawnPuff(crow.x, crow.y, 0.9);
      this.floatText(crow.x, crow.y - 8 * S, '+1');
      this.tweens.add({
        targets: crow,
        y: crow.y - 10 * S,
        alpha: 0,
        angle: 90,
        duration: 250,
        onComplete: () => crow.destroy(),
      });

      this.dog.body.velocity.y = -tuning.flapImpulse * 0.8 * S;
      return;
    }

    this.hurt(crow);
  }

  hitSquirrel(dog, squirrel) {
    if (squirrel.defeated || !squirrel.active) return;

    // dive or land on it: it drops the bone and flees
    if (this.dog.diving || this.dog.body.velocity.y > 160 * S) {
      squirrel.defeated = true;
      squirrel.body.enable = false;

      this.dropSquirrelBone(squirrel);
      sfx.stomp();
      this.spawnPuff(squirrel.x, squirrel.y, 1);
      this.tweens.add({
        targets: squirrel,
        y: squirrel.y - 14 * S,
        alpha: 0,
        angle: 90,
        duration: 250,
        onComplete: () => squirrel.destroy(),
      });

      this.dog.body.velocity.y = -tuning.flapImpulse * 0.8 * S;
      return;
    }

    this.hurt(squirrel);
  }

  squirrelSteals(squirrel, bone) {
    if (squirrel.defeated || squirrel.carrying || !bone.active) return;
    if (this.dog.dead) return;

    // only steal when the dog is close enough to see it happen
    if (
      Phaser.Math.Distance.Between(
        squirrel.x,
        squirrel.y,
        this.dog.x,
        this.dog.y,
      ) > 140 * S
    ) {
      return;
    }

    bone.disableBody(true, true);
    squirrel.carried = bone;
    squirrel.carrying = true;
    squirrel.startled = 0.65;
    squirrel.boneIcon.setVisible(true).setPosition(squirrel.x, squirrel.y - 12 * S);

    sfx.steal();
    this.floatText(squirrel.x, squirrel.y - 22 * S, t('float.hey'), '#ffd166');
  }

  dropSquirrelBone(squirrel) {
    const bone = squirrel.carried;
    if (!bone) return;

    squirrel.carried = null;
    squirrel.carrying = false;
    squirrel.boneIcon.setVisible(false);

    bone.enableBody(true, squirrel.x, squirrel.y - 6 * S, true, true);
    bone.body.setSize(8 * S, 6 * S);
    this.floatText(squirrel.x, squirrel.y - 20 * S, t('float.bone'), '#fff4e0');
  }

  squirrelEscapes(squirrel) {
    if (squirrel.defeated) return;
    squirrel.defeated = true;
    squirrel.body.enable = false;
    squirrel.boneIcon.setVisible(false);

    if (squirrel.carried) {
      // the thief gets away with it
      squirrel.carried.destroy();
      squirrel.carried = null;
      squirrel.carrying = false;
      this.floatText(squirrel.x, squirrel.y - 20 * S, t('float.gone'), '#f26b5e');
    }

    this.spawnPuff(squirrel.x, squirrel.y, 0.8);
    this.tweens.add({
      targets: squirrel,
      y: squirrel.y + 8 * S,
      scaleX: 0.6,
      scaleY: 0.6,
      alpha: 0,
      duration: 240,
      onComplete: () => squirrel.destroy(),
    });
  }

  hitRival(dog, rival) {
    if (rival.defeated || !rival.active) return;

    // dive or land on it: the other dog yelps and runs home
    if (this.dog.diving || this.dog.body.velocity.y > 160 * S) {
      rival.defeated = true;
      rival.body.enable = false;

      this.bonesCount += 1;
      sfx.yelp();
      this.spawnPuff(rival.x, rival.y, 1);
      this.floatText(rival.x, rival.y - 12 * S, '+1');

      this.tweens.add({
        targets: rival,
        y: rival.y - 16 * S,
        alpha: 0,
        scaleX: 0.7,
        scaleY: 0.7,
        duration: 260,
        onComplete: () => rival.destroy(),
      });

      this.dog.body.velocity.y = -tuning.flapImpulse * 0.8 * S;
      return;
    }

    this.hurt(rival);
  }

  hitPinata(dog, pinata) {
    const now = this.time.now;
    if (!pinata.active || now - pinata.lastHit < 350) return;

    pinata.lastHit = now;
    pinata.hits += 1;

    sfx.pinata();
    this.tweens.add({
      targets: pinata,
      angle: 12,
      duration: 70,
      yoyo: true,
      repeat: 1,
      onComplete: () => pinata.setAngle(0),
    });

    this.spawnBoneAt(pinata.x, pinata.y + 12 * S);
    this.floatText(
      pinata.x,
      pinata.y - 22 * S,
      pinata.hits >= 3 ? t('float.orale') : t('float.echale'),
      '#ffd166',
    );

    if (pinata.hits >= 3) {
      for (let i = 0; i < 3; i++) {
        this.spawnBoneAt(
          pinata.x + (i - 1) * 16 * S,
          pinata.y + (i % 2 ? 8 : 18) * S,
        );
      }
      this.spawnPuff(pinata.x, pinata.y, 1.5);
      sfx.burst();
      this.spawnFoodAt(pinata.x, pinata.y + 20 * S);
      pinata.destroy();
    }
  }

  spawnBoneAt(x, y) {
    const bone = this.boneGroup.create(x, y, 'bone');
    bone.setDepth(7);
    bone.body.setSize(8 * S, 6 * S);

    this.tweens.add({
      targets: bone,
      alpha: 0.5,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    this.spawnPuff(x, y, 0.6);
  }

  canLandOnAwning(dog) {
    return dog.body.velocity.y > 0;
  }

  bounceAwning(dog, awning) {
    dog.body.velocity.y = -620 * S;
    dog.jumpCutReady = false;
    dog.grounded = false;
    dog.flaps = tuning.maxFlaps;

    this.tweens.add({
      targets: awning,
      scaleY: 0.55,
      duration: 90,
      yoyo: true,
      ease: 'Quad.out',
    });

    sfx.boing();
    this.spawnPuff(dog.x, dog.y + 8 * S, 1.2);
  }

  hurt(source = null) {
    if (this.won || this.gameOverFlag || this.dog.dead) return;
    if (this.dog.invuln > 0) return;

    this.health -= 1;
    this.runStats.damage += 1;
    this.updateSurvivalHud();

    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    sfx.hurt();
    this.dog.invuln = 1.2;
    this.dog.setTint(0xff6b6b);
    this.time.delayedCall(180, () => this.dog.clearTint());

    const dir = source
      ? Math.sign(this.dog.x - source.x) || 1
      : -this.dog.facing;

    this.dog.body.velocity.x = dir * 170 * S;
    this.dog.body.velocity.y = -220 * S;

    this.cameras.main.shake(150, 0.007);
    this.cameras.main.flash(100, 242, 107, 94);
  }

  fall() {
    if (this.won || this.gameOverFlag) return;

    this.health -= 1;
    this.runStats.falls += 1;
    this.updateSurvivalHud();

    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    this.dog.body.reset(this.spawnPoint.x, this.spawnPoint.y);
    this.dog.setVelocity(0, 0);
    this.dog.setRotation(0);
    this.dog.setAlpha(1);
    this.dog.dead = false;
    this.dog.invuln = 1.1;
    this.dog.flaps = tuning.maxFlaps;
    this.touch?.reset();

    this.cameras.main.flash(120, 255, 244, 224);
  }

  starve() {
    if (this.won || this.gameOverFlag) return;

    this.health -= 1;
    this.runStats.starved += 1;
    this.updateSurvivalHud();
    this.cameras.main.flash(100, 242, 107, 94);

    if (this.health <= 0) this.gameOver();
  }

  hideEndHud() {
    this.pips.setVisible(false);
    this.boneText.setVisible(false);
    this.hint.setVisible(false);
    this.hearts.forEach((heart) => heart.setVisible(false));
    this.hungerIcon.setVisible(false);
    this.hungerBar.setVisible(false);
    this.phaseText.setVisible(false);
    this.gui?.hide();
    this.touch?.show(false);
  }

  logRun(outcome) {
    const run = {
      outcome,
      nights: this.nightsSurvived,
      bones: this.bonesCount,
      health: this.health,
      hunger: Math.round(this.hunger),
      seconds: +((this.time.now - this.startedAt) / 1000).toFixed(1),
      ...this.runStats,
    };

    this.lastRun = run;
    try {
      localStorage.setItem('bonjo.lastRun', JSON.stringify(run));
    } catch {
      // ignore storage failures
    }
    console.info('BONJO RUN', JSON.stringify(run));
  }

  gameOver() {
    if (this.gameOverFlag || this.won) return;

    this.gameOverFlag = true;
    this.dog.dead = true;
    this.dog.setVelocity(0, 0);
    this.dog.setTexture('dogSit');
    this.dog.setRotation(0);
    this.dog.clearTint();
    this.dog.outline?.setVisible(false);
    this.dog.tongue.setVisible(false);

    this.hideEndHud();
    this.logRun('gameover');
    sfx.gameover();
    this.cameras.main.shake(200, 0.008);

    this.time.delayedCall(250, () => this.showGameOverOverlay());
  }

  showGameOverOverlay() {
    const W = this.scale.width;

    const overlay = this.add
      .rectangle(W / 2, 72 * S, W, 144 * S, 0x120a1c, 0.82)
      .setScrollFactor(0)
      .setDepth(200);

    this.enableReplay(overlay);

    const title = this.add
      .text(W / 2, 40 * S, t('gameover.title'), {
        fontFamily: 'monospace',
        fontSize: 18 * S,
        color: '#f26b5e',
        stroke: '#2b1b3d',
        strokeThickness: 4 * S,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);

    const stats = this.add
      .text(
        W / 2,
        64 * S,
        t('gameover.stats', {
          bones: this.bonesCount,
          nights: this.nightsSurvived,
        }),
        {
          fontFamily: 'monospace',
          fontSize: 9 * S,
          color: '#fff4e0',
          stroke: '#2b1b3d',
          strokeThickness: 2 * S,
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);

    const box = this.add
      .rectangle(W / 2, 112 * S, 170 * S, 18 * S, 0x2b1b3d, 0.85)
      .setStrokeStyle(1 * S, 0x6ec6a8, 1)
      .setScrollFactor(0)
      .setDepth(201);

    const prompt = this.add
      .text(W / 2, 112 * S, t('gameover.again'), {
        fontFamily: 'monospace',
        fontSize: 8 * S,
        color: '#6ec6a8',
        stroke: '#2b1b3d',
        strokeThickness: 2 * S,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(202);

    this.endLayout = { overlay, title, stats, box, prompt };
  }

  win() {
    if (this.won) return;
    this.won = true;

    this.dog.dead = true;
    this.dog.setVelocity(0, 0);
    this.dog.setTexture('dogSit');
    this.dog.setRotation(0);
    this.dog.outline?.setVisible(false);
    this.dog.tongue.setVisible(false);

    this.hideEndHud();
    this.sun.setVisible(false);
    this.logRun('win');

    sfx.win();
    this.cameras.main.flash(220, 255, 209, 102);

    for (let i = 0; i < 8; i++) {
      this.time.delayedCall(i * 60, () => {
        this.spawnPuff(
          this.dog.x + Phaser.Math.Between(-20 * S, 20 * S),
          this.dog.y + Phaser.Math.Between(-18 * S, 6 * S),
          1.2,
        );
      });
    }

    this.time.delayedCall(260, () => this.showWinOverlay());
  }

  showWinOverlay() {
    const elapsed = ((this.time.now - this.startedAt) / 1000).toFixed(1);
    const W = this.scale.width;

    const overlay = this.add
      .rectangle(W / 2, 72 * S, W, 144 * S, 0x120a1c, 0.82)
      .setScrollFactor(0)
      .setDepth(200);

    this.enableReplay(overlay);

    const title = this.add
      .text(W / 2, 40 * S, t('win.title'), {
        fontFamily: 'monospace',
        fontSize: 18 * S,
        color: '#ffd166',
        stroke: '#2b1b3d',
        strokeThickness: 4 * S,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);

    const stats = this.add
      .text(W / 2, 64 * S, t('win.stats', { bones: this.bonesCount, nights: this.nightsSurvived, time: elapsed }), {
        fontFamily: 'monospace',
        fontSize: 9 * S,
        color: '#fff4e0',
        stroke: '#2b1b3d',
        strokeThickness: 2 * S,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);

    const box = this.add
      .rectangle(W / 2, 112 * S, 170 * S, 18 * S, 0x2b1b3d, 0.85)
      .setStrokeStyle(1 * S, 0x6ec6a8, 1)
      .setScrollFactor(0)
      .setDepth(201);

    const prompt = this.add
      .text(W / 2, 112 * S, t('win.again'), {
        fontFamily: 'monospace',
        fontSize: 8 * S,
        color: '#6ec6a8',
        stroke: '#2b1b3d',
        strokeThickness: 2 * S,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(202);

    this.endLayout = { overlay, title, stats, box, prompt };
  }

  enableReplay(overlay) {
    // Give the end screen a beat before accepting a tap, so a stray touch
    // during the death/win transition doesn't instantly restart.
    this.time.delayedCall(500, () => {
      if (!overlay.active) return;
      overlay.setInteractive({ useHandCursor: true });
      overlay.once('pointerdown', () => this.scene.restart());
    });
  }
}
