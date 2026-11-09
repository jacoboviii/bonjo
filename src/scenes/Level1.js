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

const S = SCALE;

const WORLD_W = 3200 * S;
const WORLD_H = 900 * S;

// x,y,w,h in design pixels (the 256x144 space). x,y is the top-left corner.
// Everything is multiplied by S when it is placed in the 2x world.
const PLATFORMS = [
  { x: 0, y: 600, w: 520, h: 300 }, // starting ground
  { x: 600, y: 600, w: 360, h: 300 },
  { x: 1010, y: 512, w: 120, h: 16 },
  { x: 1180, y: 440, w: 100, h: 16 },
  { x: 1320, y: 600, w: 240, h: 300 },
  { x: 1600, y: 520, w: 90, h: 16 },
  { x: 1730, y: 450, w: 80, h: 16 },
  { x: 1860, y: 380, w: 80, h: 16 },
  { x: 1980, y: 600, w: 420, h: 300 },
  { x: 2460, y: 520, w: 100, h: 16 },
  { x: 2600, y: 450, w: 90, h: 16 },
  { x: 2730, y: 380, w: 90, h: 16 },
  { x: 2860, y: 310, w: 80, h: 16 },
  { x: 2960, y: 600, w: 240, h: 300 }, // goal ground
];

const BONES = [
  [200, 590], [360, 590], [470, 590],
  [700, 590], [820, 590], [900, 590],
  [1060, 502], [1215, 430],
  [1380, 590], [1480, 590],
  [1650, 510], [1770, 440], [1900, 370],
  [2060, 590], [2300, 590],
  [2500, 510], [2640, 440], [2770, 370], [2900, 300],
  [3060, 590],
];

// Wind rings refill your flaps and give a little lift.
const RINGS = [
  [560, 540],
  [2425, 470],
  [2915, 415],
];

const SQUIRRELS = [
  { x: 760, y: 588, min: 640, max: 940 },
  { x: 1110, y: 500, min: 1015, max: 1125 },
  { x: 1450, y: 588, min: 1350, max: 1530 },
];

// Dogs from other houses, guarding their turf.
const RIVALS = [
  { x: 360, y: 587, min: 180, max: 480 },
  { x: 2300, y: 587, min: 2220, max: 2380 },
  { x: 3050, y: 587, min: 2990, max: 3170 },
];

// Hanging piñatas: jump/flap/dive into them.
const PINATAS = [
  [240, 525],
  [2100, 515],
];

// Market awnings: land on them to bounce.
const AWNINGS = [
  [560, 578],
  [2430, 560],
];

// One crow stays as a rarer aerial hazard.
const CROWS = [
  { x: 2690, y: 432, min: 2605, max: 2795 },
];

const CHECKPOINT_X = 2150;
const GOAL_X = 3120;
const CHECKPOINT_Y = 582;
const GOAL_Y = 580;

export default class Level1 extends Phaser.Scene {
  constructor() {
    super('Level1');
  }

  create() {
    this.bonesCount = 0;
    this.won = false;
    this.guiOpen = true;
    this.hintTimer = 16;
    this.checkpointActive = false;
    this.spawnPoint = { x: 64 * S, y: 548 * S };
    this.startedAt = this.time.now;

    this.buildBackground();
    this.buildLevel();
    this.createInput();
    this.createDog();
    this.createPickups();
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
      this.gui?.destroy();
    });
  }

  update(time, delta) {
    if (!this.won) this.dog.update(delta);

    this.crowGroup.children.iterate((crow) => {
      if (crow) crow.update(delta / 1000);
    });

    this.squirrelGroup.children.iterate((squirrel) => {
      if (squirrel) squirrel.update(delta / 1000);
    });

    this.rivalGroup.children.iterate((rival) => {
      if (rival) rival.update(delta / 1000);
    });

    this.updateCamera(delta);
    this.updateHud(delta);

    if (!this.won && this.dog.y > WORLD_H + 40 * S) this.hurt();
  }

  // --- world building ------------------------------------------------------

  buildBackground() {
    this.add.image(128 * S, 72 * S, 'sky').setScrollFactor(0).setDepth(-30);
    this.sun = this.add
      .image(205 * S, 56 * S, 'sun')
      .setScrollFactor(0.04)
      .setDepth(-29)
      .setAlpha(0.95);

    this.cloudsFar = this.add
      .tileSprite(0, 8 * S, 320 * S, 64 * S, 'cloudsFar')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-25)
      .setAlpha(0.5);

    this.cloudsNear = this.add
      .tileSprite(0, 38 * S, 320 * S, 64 * S, 'cloudsNear')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-24)
      .setAlpha(0.75);

    this.town = this.add
      .tileSprite(0, 30 * S, 320 * S, 100 * S, 'town')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-20);

    this.banner = this.add
      .tileSprite(0, 32 * S, 320 * S, 14 * S, 'banner')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-18)
      .setAlpha(0.95);
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

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');

    this.input.keyboard.on('keydown-T', () => {
      this.guiOpen = !this.guiOpen;
      this.gui?.show(this.guiOpen);
    });

    this.input.keyboard.on('keydown-R', () => this.scene.restart());
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

    // goal balloon
    this.goal = this.physics.add
      .staticImage(GOAL_X * S, GOAL_Y * S, 'goalBalloon')
      .setDepth(7);
    this.goal.body.setSize(16 * S, 26 * S);
    this.tweens.add({
      targets: this.goal,
      scaleX: 1.07,
      scaleY: 1.07,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
    this.physics.add.overlap(this.dog, this.goal, this.win, null, this);
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
    this.pips = this.add.graphics().setScrollFactor(0).setDepth(100);

    this.boneText = this.add
      .text(128 * S, 5 * S, 'BONES 0', {
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
      .text(128 * S, 138 * S, 'A/D move  ·  SPACE flap/glide  ·  S dive  ·  T tuning', {
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

    // On touch devices the buttons are the tutorial, and they occupy the
    // bottom of the screen where the keyboard hint would sit.
    if (this.touch?.visible) this.hint.setVisible(false);
  }

  createTuningPanel() {
    const gui = new GUI({ title: 'BONJO · feel tuning' });
    this.gui = gui;

    const move = gui.addFolder('Movement');
    move.add(tuning, 'runSpeed', 80, 500, 5).name('run speed');
    move.add(tuning, 'groundAccel', 400, 6000, 50).name('ground accel');
    move.add(tuning, 'airAccel', 200, 4000, 50).name('air accel');
    move.add(tuning, 'groundFriction', 400, 6000, 50).name('ground friction');
    move.close();

    const air = gui.addFolder('Air');
    air.add(tuning, 'gravity', 400, 4000, 10).name('gravity');
    air.add(tuning, 'glideGravity', 50, 1200, 10).name('glide gravity');
    air.add(tuning, 'glideMaxFall', 30, 400, 5).name('glide fall speed');
    air.add(tuning, 'diveGravity', 800, 6000, 50).name('dive gravity');
    air.add(tuning, 'diveMaxFall', 300, 1600, 10).name('dive fall speed');
    air.add(tuning, 'jumpImpulse', 200, 700, 5).name('jump power');
    air.add(tuning, 'flapImpulse', 150, 700, 5).name('flap power');
    air.add(tuning, 'maxFlaps', 0, 5, 1).name('flaps');
    air.add(tuning, 'jumpCut', 0.1, 1, 0.05).name('jump cut');
    air.add(tuning, 'minJumpMs', 0, 250, 5).name('min jump hold (ms)');
    air.add(tuning, 'coyoteMs', 0, 300, 5).name('coyote (ms)');
    air.add(tuning, 'jumpBufferMs', 0, 300, 5).name('jump buffer (ms)');
    air.close();

    const cam = gui.addFolder('Camera');
    cam.add(tuning, 'lookAhead', 0, 80, 1).name('look ahead');
    cam.add(tuning, 'cameraLerp', 0.02, 0.5, 0.01).name('camera smoothing');
    cam.close();

    const actions = gui.addFolder('Actions');
    actions.add({ restart: () => this.scene.restart() }, 'restart').name('restart level (R)');
    actions.add(
      {
        reset: () => {
          Object.assign(tuning, DEFAULTS);
          gui.controllersRecursive().forEach((c) => c.updateDisplay());
        },
      },
      'reset',
    ).name('reset defaults');
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
    const t = this.add
      .text(128 * S, 50 * S, 'LEVEL 1 · LA CUADRA', {
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
      targets: t,
      alpha: 1,
      duration: 350,
      hold: 900,
      yoyo: true,
      onComplete: () => t.destroy(),
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

    this.boneText.setText(`BONES ${this.bonesCount}`);

    if (this.hintTimer > 0) {
      this.hintTimer -= delta / 1000;
    } else if (this.hint.alpha > 0) {
      this.hint.setAlpha(Math.max(0, this.hint.alpha - delta / 1200));
    }
  }

  // --- juice ---------------------------------------------------------------

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
    const t = this.add
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
      targets: t,
      y: y - 12 * S,
      alpha: 0,
      duration: 700,
      ease: 'Quad.out',
      onComplete: () => t.destroy(),
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
    this.floatText(ring.x, ring.y - 10 * S, 'FLAP+', '#6ec6a8');
  }

  touchCheckpoint() {
    if (this.checkpointActive) return;
    this.checkpointActive = true;

    this.checkpoint.clearTint();
    this.spawnPoint = { x: CHECKPOINT_X * S, y: 548 * S };

    sfx.checkpoint();
    this.spawnPuff(this.checkpoint.x, this.checkpoint.y, 1.3);
    this.floatText(this.checkpoint.x, this.checkpoint.y - 16 * S, 'CHECKPOINT');
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

    this.hurt();
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

    this.hurt();
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
    this.floatText(squirrel.x, squirrel.y - 22 * S, 'HEY!', '#ffd166');
  }

  dropSquirrelBone(squirrel) {
    const bone = squirrel.carried;
    if (!bone) return;

    squirrel.carried = null;
    squirrel.carrying = false;
    squirrel.boneIcon.setVisible(false);

    bone.enableBody(true, squirrel.x, squirrel.y - 6 * S, true, true);
    bone.body.setSize(8 * S, 6 * S);
    this.floatText(squirrel.x, squirrel.y - 20 * S, 'BONE!', '#fff4e0');
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
      this.floatText(squirrel.x, squirrel.y - 20 * S, 'GONE!', '#f26b5e');
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

    this.hurt();
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
      pinata.hits >= 3 ? '¡ÓRALE!' : '¡ÉCHALE!',
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

  hurt() {
    if (this.won || this.dog.dead || this.dog.invuln > 0) return;

    sfx.hurt();
    this.dog.dead = true;
    this.dog.setVelocity(0, 0);
    this.dog.setTint(0xff6b6b);

    this.cameras.main.shake(160, 0.007);
    this.cameras.main.flash(100, 242, 107, 94);

    this.time.delayedCall(300, () => this.respawn());
  }

  respawn() {
    this.dog.clearTint();
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

  win() {
    if (this.won) return;
    this.won = true;

    this.dog.dead = true;
    this.dog.setVelocity(0, 0);
    this.dog.setTexture('dogGlide');
    this.dog.setRotation(0);

    // clear the HUD and tuning bar for the end screen
    this.pips.setVisible(false);
    this.boneText.setVisible(false);
    this.hint.setVisible(false);
    this.gui?.hide();
    this.goal.setVisible(false);
    this.sun.setVisible(false);
    this.touch?.show(false);

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

    this.add
      .rectangle(128 * S, 72 * S, 256 * S, 144 * S, 0x120a1c, 0.82)
      .setScrollFactor(0)
      .setDepth(200);

    this.add
      .text(128 * S, 40 * S, 'THE BLOCK IS YOURS', {
        fontFamily: 'monospace',
        fontSize: 18 * S,
        color: '#ffd166',
        stroke: '#2b1b3d',
        strokeThickness: 4 * S,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);

    this.add
      .text(128 * S, 64 * S, `BONES ${this.bonesCount}   ·   ${elapsed}s`, {
        fontFamily: 'monospace',
        fontSize: 9 * S,
        color: '#fff4e0',
        stroke: '#2b1b3d',
        strokeThickness: 2 * S,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);

    this.add
      .text(128 * S, 112 * S, 'press R to fly again', {
        fontFamily: 'monospace',
        fontSize: 8 * S,
        color: '#6ec6a8',
        stroke: '#2b1b3d',
        strokeThickness: 2 * S,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);
  }
}
