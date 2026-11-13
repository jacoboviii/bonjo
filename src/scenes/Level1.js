import Phaser from 'phaser';
import GUI from 'lil-gui';
import Dog from '../objects/Dog.js';
import Crow from '../objects/Crow.js';
import Squirrel from '../objects/Squirrel.js';
import RivalDog from '../objects/RivalDog.js';
import Pinata from '../objects/Pinata.js';
import { tuning, DEFAULTS } from '../tuning.js';
import { makePlatformTexture, makeLedgeTexture } from '../art.js';
import { SCALE } from '../scale.js';
import { sfx } from '../sfx.js';
import TouchControls from '../ui/TouchControls.js';
import { drawFolkCard } from '../ui/FolkCard.js';
import { t } from '../i18n.js';
import { markLevelComplete } from '../progress.js';
import { getLevelData } from '../levels/index.js';
import { laCuadra } from '../levels/laCuadra.js';

const S = SCALE;
// Small UI offsets were authored in the old 2x render space.
const U = S / 2;

let WORLD_W;
let WORLD_H;
let PLATFORMS;
let BONES;
let RINGS;
let SQUIRRELS;
let RIVALS;
let PINATAS;
let AWNINGS;
let CROWS;
let CHECKPOINT_X;
let CHECKPOINT2_X;
let CHECKPOINT_Y;
let FOODS;
let LIVES;
let END_REWARD;
let PARKED_CARS;
let BIKES;
let STREET_PROPS;
let LEDGES;
let LEDGE_BONES;
let LEDGE_FOODS;
let TACO_CARTS;
let TRASH_SPOTS;
let GATE_X;
let POLO_X;
let CHIHUAHUA_X;
let BELL_X;
let CATS;
let BIRDS;
let ROOSTER_X;
let NIGHT_FLIERS;
let FOREGROUND_HOUSES;
let AGAVE_FIELDS;
let AGAVES;

function applyLevelData(level) {
  WORLD_W = level.world.width * S;
  WORLD_H = level.world.height * S;
  PLATFORMS = level.platforms;
  BONES = level.bones;
  RINGS = level.rings;
  SQUIRRELS = level.squirrels;
  RIVALS = level.rivals;
  PINATAS = level.pinatas;
  AWNINGS = level.awnings;
  CROWS = level.crows;
  CHECKPOINT_X = level.checkpoints.first;
  CHECKPOINT2_X = level.checkpoints.second;
  CHECKPOINT_Y = level.checkpoints.y;
  FOODS = level.foods;
  LIVES = level.lives || [];
  END_REWARD = level.endReward || null;
  PARKED_CARS = level.parkedCars;
  BIKES = level.bikes;
  STREET_PROPS = level.streetProps;
  LEDGES = level.ledges;
  LEDGE_BONES = level.ledgeBones;
  LEDGE_FOODS = level.ledgeFoods;
  TACO_CARTS = level.tacoCarts;
  TRASH_SPOTS = level.trashSpots;
  GATE_X = level.gateX;
  POLO_X = level.poloX;
  CHIHUAHUA_X = level.chihuahuaX;
  BELL_X = level.bellX;
  CATS = level.cats;
  BIRDS = level.birds;
  ROOSTER_X = level.roosterX;
  NIGHT_FLIERS = level.nightFliers;
  FOREGROUND_HOUSES = level.foregroundHouses;
  AGAVE_FIELDS = level.agaveFields;
  AGAVES = level.agaves;
}

applyLevelData(laCuadra);

export default class Level1 extends Phaser.Scene {
  constructor() {
    super('Level1');
  }

  init(data = {}) {
    const levelId = data.levelId || this.levelId || 'laCuadra';
    const level = getLevelData(levelId) || laCuadra;
    this.levelId = level.id;
    this.levelData = level;
    this.features = level.features || {};
    applyLevelData(level);
  }

  create() {
    this.touchDevice =
      !!(this.sys.game.device.input.touch || navigator.maxTouchPoints > 0);
    this.bonesCount = 0;
    this.won = false;
    this.gameOverFlag = false;
    this.guiOpen = true;
    this.hintTimer = 16;
    this.checkpointActive = false;
    this.checkpoint2Active = false;
    this.spawnPoint = {
      x: this.levelData.spawn.x * S,
      y: this.levelData.spawn.y * S,
    };
    this.startedAt = this.time.now;

    // survival state
    this.maxHealth = 3;
    this.maxLives = 4;
    this.health = 3;
    this.maxHunger = 100;
    this.hunger = 80;
    this.hungerTick = 0;
    this.phase = 'day';
    this.dayNumber = 1;
    this.phaseTime = this.levelData.timings.day;
    this.nightsSurvived = 0;
    this.nightsToSurvive = this.levelData.nightsToSurvive ?? 2;
    this.waveSpawned = 0;
    this.waveTotal = 0;
    this.nextWave = 0;
    this.runStats = { damage: 0, falls: 0, food: 0, waves: 0, starved: 0 };

    // finale, defense, scoring and day errands
    this.alphaSpawned = false;
    this.alphaDefeated = false;
    this.alphaActive = false;
    this.alphaEnding = false;
    this.alpha = null;
    this.gateHealth = 3;
    this.gateMaxHealth = 3;
    this.gateBroken = false;
    this.gateRusherSpawned = false;
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
    this.rivalsSubdued = 0;
    this.powerUps = 0;
    this.score = 0;
    this.rank = 'D';
    this.poloGift = true;
    this.bellRung = false;
    this.nextAlarm = 0;
    this.nextAllyBark = 0;
    this.nextChirp = 0;
    this.nextDistantBark = 0;
    this.nextRooster = 0;
    this.interactQueued = false;
    this.nextInteractAt = 0;
    this.activeInteractable = null;
    this.dialogOpen = false;
    this.dialogTimer = null;
    this.hintWasVisible = false;
    this.objectivesOpen = false;
    this.objectivesWasTouch = false;

    this.buildBackground();
    this.createStreetDressing();
    this.createAgave();
    this.createCritters();
    this.createNightFliers();
    this.createBoundary();
    this.buildLevel();
    this.createForegroundHouses();
    this.createLedges();
    this.createInteractiveProps();
    if (this.features.porch !== false) this.createPorch();
    if (this.features.gateDefense !== false) this.createPorchGate();
    if (this.features.errands !== false) this.createAllyNpcs();
    this.setupInteractables();
    this.createInput();
    this.createDog();
    this.createPickups();
    this.createFood();
    this.createLives();
    this.createEndReward();
    this.createCrows();
    this.createSquirrels();
    this.createRivals();
    this.createPinatas();
    this.createAwnings();
    this.createCamera();
    this.createHud();
    this.createInteractionUi();
    this.createDialogUi();
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
    if (this.sun) this.sun.x = W - 51 * S;
    if (this.moon) this.moon.x = W * 0.74;
    this.cloudsFar?.setSize(W, 64 * S);
    this.cloudsNear?.setSize(W, 64 * S);
    this.town?.setSize(W, 100 * S);
    this.nearTown?.setSize(W, 100 * S);
    this.banner?.setSize(W, 14 * S);
    this.skyNight?.setPosition(W / 2, 72 * S).setSize(W, 144 * S);
    this.envHaze?.setPosition(W / 2, 72 * S).setSize(W, 144 * S);
    this.nightOverlay?.setPosition(W / 2, 72 * S).setSize(W, 144 * S);

    const hudRight = W - 8 * S;
    if (this.boneText) {
      this.boneText.x = this.touchDevice ? 132 * S : hudRight;
    }
    if (this.storyLabel?.active) this.storyLabel.x = W / 2;
    if (this.comboText) this.comboText.x = hudRight;
    if (this.objectivesButton) this.objectivesButton.x = hudRight;
    if (this.hint) this.hint.x = W / 2;
    if (this.introLabel?.active) this.introLabel.x = W / 2;
    if (this.phaseBanner?.active) this.phaseBanner.x = W / 2;

    this.touch?.relayout(W);
    this.layoutDialog(W);
    this.layoutObjectives(W);
    this.layoutEndScreen(W);
  }

  layoutEndScreen(W) {
    const e = this.endLayout;
    if (!e?.overlay?.active) return;
    e.overlay.setPosition(W / 2, 72 * S).setSize(W, 144 * S);
    if (e.card) {
      drawFolkCard(e.card, W / 2, 144 * U, Math.min(W - 64 * U, 440 * U), 220 * U);
    }
    e.title.x = W / 2;
    e.stats.x = W / 2;
    if (e.epilogue) {
      e.epilogue.x = W / 2;
      e.epilogue.setWordWrapWidth(Math.min(W - 64 * U, 440 * U) - 24 * U);
    }
    if (e.rank) e.rank.x = W / 2;
    e.box.x = W / 2;
    e.prompt.x = W / 2;
    if (e.mapButton) {
      const touch = this.touchDevice;
      const cardW = Math.min(W - 64 * U, 440 * U);
      e.mapButton.setPosition(
        touch ? W / 2 : W / 2 + cardW / 2 - 20 * U,
        144 * U + 110 * U - (touch ? 8 * U : 18 * U),
      );
    }
  }

  update(time, delta) {
    if (this.objectivesOpen) return;
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
    this.updateInteractions();
    this.updateCritters();
    this.updateNightFliers(dt);
    this.keepDogInBounds();
    this.updateAlphaCrown();

    if (!this.won && !this.gameOverFlag && this.dog.y > WORLD_H + 40 * S) {
      this.fall();
    }
  }

  updateAlphaCrown() {
    if (!this.alphaCrown) return;
    if (this.won || this.gameOverFlag) {
      this.alphaCrown.setVisible(false);
      return;
    }
    if (this.alpha?.active && this.alphaActive) {
      this.alphaCrown
        .setPosition(this.alpha.x, this.alpha.y - 24 * S)
        .setFlipX(this.alpha.flipX)
        .setVisible(true);
    } else {
      this.alphaCrown.setVisible(false);
    }
  }

  keepDogInBounds() {
    if (!this.dog || this.dog.dead) return;
    const margin = 42 * S;
    const min = margin;
    const max = WORLD_W - margin;

    if (this.dog.x < min) {
      this.dog.x = min;
      if (this.dog.body.velocity.x < 0) this.dog.body.velocity.x = 0;
    } else if (this.dog.x > max) {
      this.dog.x = max;
      if (this.dog.body.velocity.x > 0) this.dog.body.velocity.x = 0;
    }
  }

  // --- world building ------------------------------------------------------

  buildBackground() {
    const W = this.scale.width;
    const theme = this.levelData.theme || {};

    this.sky = this.add
      .image(W / 2, 72 * S, theme.sky || 'sky')
      .setDisplaySize(W, 144 * S)
      .setScrollFactor(0)
      .setDepth(-30);
    this.sun = this.add
      .image(W - 51 * S, 56 * S, 'sun')
      .setScrollFactor(0.04)
      .setDepth(-28)
      .setAlpha(0.95);

    this.moon = this.add
      .image(W * 0.74, 48 * S, 'moon')
      .setScrollFactor(0.04)
      // Sky layer: behind clouds, town, gameplay and the HUD.
      .setDepth(-27)
      .setAlpha(0)
      .setVisible(false);

    this.cloudsFar = this.add
      .tileSprite(0, 8 * S, W, 64 * S, theme.cloudsFar || 'cloudsFar')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-25)
      .setAlpha(0.5);

    this.cloudsNear = this.add
      .tileSprite(0, 38 * S, W, 64 * S, theme.cloudsNear || 'cloudsNear')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-24)
      .setAlpha(0.75);

    // Night darkens the sky/clouds/sun without crushing the street and
    // gameplay sprites; the full-scene overlay stays lighter than this.
    this.skyNight = this.add
      .rectangle(W / 2, 72 * S, W, 144 * S, 0x05030d, 1)
      .setScrollFactor(0)
      .setDepth(-29)
      .setAlpha(0);

    this.town = this.add
      .tileSprite(0, 500 * S, W, 100 * S, theme.town || 'town')
      .setOrigin(0, 0)
      .setScrollFactor(0, 1)
      .setDepth(-20);

    this.nearTown = this.add
      .tileSprite(0, 500 * S, W, 100 * S, theme.nearTown || 'nearTown')
      .setOrigin(0, 0)
      .setScrollFactor(0, 1)
      .setDepth(-19);

    this.banner = this.add
      .tileSprite(0, 32 * S, W, 14 * S, theme.banner || 'banner')
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
      .rectangle(
        W / 2,
        72 * S,
        W,
        144 * S,
        this.levelData.theme?.haze ?? 0x2b5a86,
        this.levelData.theme?.hazeAlpha ?? 0.14,
      )
      .setScrollFactor(0)
      .setDepth(0.5);
  }

  createStreetDressing() {
    const groundY = 600 * S;

    for (const car of PARKED_CARS) {
      const img = this.add
        .image(car.x * S, groundY, car.key)
        .setOrigin(0.5, 1)
        .setDepth(0)
        .setFlipX(!!car.flip);

      if (car.alarm) {
        this.alarmCar = img;
        this.alarmMarker = this.add
          .text(car.x * S, groundY - 34 * S, '!', {
            fontFamily: 'monospace',
            fontSize: 8 * S,
            color: '#ffd166',
            stroke: '#2b1b3d',
            strokeThickness: 2 * S,
          })
          .setOrigin(0.5)
          .setDepth(4);
        this.tweens.add({
          targets: this.alarmMarker,
          alpha: 0.25,
          duration: 550,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
        });
      }
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
      // art is generated at 3x from these design dimensions
      makePlatformTexture(this, key, p.w, p.h, seed);
      const img = this.platforms.create(
        (p.x + p.w / 2) * S,
        (p.y + p.h / 2) * S,
        key,
      );
      if (this.levelData.platformTint) img.setTint(this.levelData.platformTint);
      img.setDepth(1);
    }

    this.platforms.refresh();
  }

  createForegroundHouses() {
    this.foregroundHouseGroup = this.physics.add.staticGroup();

    for (const h of FOREGROUND_HOUSES) {
      // Decorative facade: no wall body, so Bonjo walks in front of it.
      this.add
        .image(h.x * S, 520 * S, h.key)
        .setOrigin(0.5, 0)
        .setDepth(4);

      // Invisible one-way rooftop platform.
      const roof = this.add.zone(
        h.x * S,
        (520 + 3) * S,
        70 * S,
        6 * S,
      );
      this.physics.add.existing(roof, true);
      roof.body.checkCollision.down = false;
      roof.body.checkCollision.left = false;
      roof.body.checkCollision.right = false;
      this.foregroundHouseGroup.add(roof);
    }
  }

  createLedges() {
    this.oneWayGroup = this.physics.add.staticGroup();

    LEDGES.forEach((l, i) => {
      const key = `ledge_${i}_${l.kind}_${l.w}`;
      makeLedgeTexture(this, key, l.w, l.kind);
      const ledge = this.oneWayGroup.create(
        (l.x + l.w / 2) * S,
        (l.y + 6) * S,
        key,
      );
      ledge.setDepth(3);
      ledge.body.setSize(l.w * S, 6 * S);
      ledge.body.setOffset(0, 0);
      ledge.body.checkCollision.down = false;
      ledge.body.checkCollision.left = false;
      ledge.body.checkCollision.right = false;
      ledge.body.updateFromGameObject?.();
    });
  }

  createAgave() {
    for (const x of AGAVE_FIELDS) {
      this.add
        .image(x * S, 600 * S, 'agaveField')
        .setOrigin(0.5, 1)
        .setDepth(-1);
    }

    for (const plant of AGAVES) {
      this.add
        .image(plant.x * S, 600 * S, plant.key)
        .setOrigin(0.5, 1)
        .setScale(plant.s)
        .setFlipX(!!plant.flip)
        .setDepth(-1);
    }
  }

  createBoundary() {
    this.add
      .image(12 * S, 600 * S, 'fence')
      .setOrigin(0.5, 1)
      .setDepth(3);
    this.add
      .image(WORLD_W - 12 * S, 600 * S, 'fence')
      .setOrigin(0.5, 1)
      .setDepth(3);
  }

  createCritters() {
    this.cats = CATS.map((c) => {
      const cat = this.add
        .image(c.x * S, 600 * S, c.key)
        .setOrigin(0.5, 1)
        .setScale(c.s)
        .setFlipX(!!c.flip)
        .setDepth(3);
      cat.setData('nextHiss', 0);
      return cat;
    });

    this.birds = BIRDS.map((b) => {
      const bird = this.add
        .image(b.x * S, 600 * S, 'bird')
        .setOrigin(0.5, 1)
        .setScale(b.s)
        .setDepth(3);
      bird.setData('homeX', b.x * S);
      bird.setData('homeScale', b.s);
      bird.setData('scattered', false);
      bird.setData('nextChirp', 0);
      return bird;
    });

    this.rooster = this.add
      .image(ROOSTER_X * S, 600 * S, 'rooster')
      .setOrigin(0.5, 1)
      .setDepth(3);
  }

  createNightFliers() {
    this.nightFliers = NIGHT_FLIERS.map((b, i) => {
      const bat = this.add
        .image(b.x * S, b.y * S, 'bat')
        .setDepth(2)
        .setVisible(false);
      bat.setData({
        baseY: b.y * S,
        amp: b.amp * S,
        speed: b.speed * S,
        dir: b.dir,
        phase: i * 1.7,
      });
      return bat;
    });
  }

  updateNightFliers(dt) {
    if (this.phase !== 'night' || !this.nightFliers) return;

    const t = this.time.now / 1000;
    for (const bat of this.nightFliers) {
      const speed = bat.getData('speed');
      const dir = bat.getData('dir');
      let x = bat.x + dir * speed * dt;
      if (x < -20 * S) x = WORLD_W + 20 * S;
      else if (x > WORLD_W + 20 * S) x = -20 * S;

      bat.x = x;
      bat.y =
        bat.getData('baseY') +
        Math.sin(t * 2.1 + bat.getData('phase')) * bat.getData('amp');
      bat.setFlipX(dir < 0);
      bat.setScale(1, 0.82 + 0.18 * Math.sin(t * 8 + bat.getData('phase')));
    }
  }

  setNightCreatures(night) {
    // Day company and diurnal wildlife leave the street after dark.
    this.polo?.setVisible(!night).setActive(!night);
    this.chihuahua?.setVisible(!night).setActive(!night);
    this.rooster?.setVisible(!night).setActive(!night);

    for (const bird of this.birds || []) {
      this.tweens.killTweensOf(bird);
      bird.setActive(!night).setVisible(!night);
      if (night) {
        bird.setData('scattered', false);
      } else {
        bird
          .setPosition(bird.getData('homeX'), 600 * S)
          .setAlpha(1)
          .setAngle(0)
          .setScale(bird.getData('homeScale') || 1);
        bird.setData('scattered', false);
      }
    }

    if (night) {
      this.activeInteractable = null;
      this.interactPrompt?.setVisible(false);
    }

    // Squirrels and crows trade shifts with skunks and owls.
    this.squirrelGroup?.children.iterate((squirrel) => {
      squirrel?.setNightMode?.(night);
    });
    this.crowGroup?.children.iterate((crow) => {
      crow?.setNightMode?.(night);
    });

    for (const bat of this.nightFliers || []) bat.setVisible(night);
  }

  updateCritters() {
    if (this.won || this.gameOverFlag || this.dog.dead) return;

    const now = this.time.now;
    const dog = this.dog;

    for (const cat of this.cats) {
      if (
        now > cat.getData('nextHiss') &&
        Phaser.Math.Distance.Between(cat.x, cat.y, dog.x, dog.y) < 54 * S
      ) {
        cat.setData('nextHiss', now + 4200);
        sfx.hiss();
        this.floatText(cat.x, cat.y - 18 * S, t('float.hiss'), '#f26b5e');
        this.tweens.add({
          targets: cat,
          scaleX: cat.scaleX * 0.85,
          scaleY: cat.scaleY * 1.15,
          duration: 90,
          yoyo: true,
          ease: 'Quad.out',
        });
      }
    }

    for (const bird of this.birds) {
      if (!bird.active || !bird.visible) continue;
      if (bird.getData('scattered')) continue;
      if (
        Phaser.Math.Distance.Between(bird.x, bird.y, dog.x, dog.y) < 62 * S
      ) {
        this.scatterBird(bird);
      }
    }

    if (this.phase === 'day') {
      if (now > this.nextChirp) {
        const bird = this.birds.find(
          (b) =>
            b.active &&
            b.visible &&
            !b.getData('scattered') &&
            Phaser.Math.Distance.Between(b.x, b.y, dog.x, dog.y) < 260 * S,
        );
        if (bird) {
          sfx.chirp();
          this.nextChirp = now + 6200 + Math.random() * 3600;
        }
      }

      if (
        this.rooster?.active &&
        now > this.nextRooster &&
        Phaser.Math.Distance.Between(
          this.rooster.x,
          this.rooster.y,
          dog.x,
          dog.y,
        ) < 210 * S
      ) {
        this.nextRooster = now + 16000;
        sfx.rooster();
        this.floatText(
          this.rooster.x,
          this.rooster.y - 26 * S,
          t('float.crow'),
          '#ffd166',
        );
        this.tweens.add({
          targets: this.rooster,
          scaleY: 1.12,
          duration: 120,
          yoyo: true,
        });
      }
    }

    if (this.phase === 'night' && now > this.nextDistantBark) {
      const rival = this.rivalGroup
        ?.getChildren()
        .find((r) => r?.active && !r.defeated);
      if (rival) {
        sfx.bark();
        this.floatText(rival.x, rival.y - 20 * S, t('bark'), '#ffd166');
        this.nextDistantBark = now + 5000 + Math.random() * 4000;
      }
    }
  }

  scatterBird(bird) {
    if (bird.getData('scattered')) return;
    bird.setData('scattered', true);

    const dir = bird.x <= this.dog.x ? -1 : 1;
    sfx.chirp();
    this.floatText(bird.x, bird.y - 16 * S, t('float.chirp'), '#ffd166');
    this.tweens.add({
      targets: bird,
      x: bird.x + dir * 38 * S,
      y: bird.y - 52 * S,
      angle: dir * 22,
      alpha: 0,
      duration: 420,
      ease: 'Quad.out',
    });

    this.time.delayedCall(9000, () => {
      if (!bird.active) return;
      bird
        .setPosition(bird.getData('homeX'), 600 * S)
        .setAlpha(1)
        .setAngle(0);
      bird.setData('scattered', false);
    });
  }

  createInteractiveProps() {
    this.tacoGroup = this.physics.add.staticGroup();
    for (const x of TACO_CARTS) {
      const cart = this.tacoGroup
        .create(x * S, 600 * S - 15 * S, 'tacocart')
        .setDepth(3);
      cart.body.setSize(38 * S, 26 * S);
      cart.setData('next', 0);
    }

    this.trashGroup = this.physics.add.staticGroup();
    for (const x of TRASH_SPOTS) {
      const can = this.trashGroup
        .create(x * S, 600 * S - 8 * S, 'trashcan')
        .setDepth(0);
      can.body.setSize(10 * S, 14 * S);
      can.setData('looted', false);
    }

    this.bikeGroup = this.physics.add.staticGroup();
    for (const bike of BIKES) {
      const img = this.bikeGroup
        .create(bike.x * S, 600 * S - 9 * S, bike.key)
        .setDepth(0)
        .setFlipX(!!bike.flip);
      img.body.setSize(18 * S, 14 * S);
      img.setData('knocked', false);
    }
  }

  createPorchGate() {
    this.porchGate = this.add
      .image(GATE_X * S, 600 * S, 'gate')
      .setOrigin(0.5, 1)
      .setDepth(2.5);

    this.gateSign = this.add
      .text(GATE_X * S, 600 * S - 34 * S, t('porch.sign'), {
        fontFamily: 'monospace',
        fontSize: 5 * S,
        color: '#fff4e0',
        stroke: '#1b1029',
        strokeThickness: 2 * S,
      })
      .setOrigin(0.5, 1)
      .setDepth(3);
  }

  createAllyNpcs() {
    this.polo = this.add
      .image(POLO_X * S, 600 * S, 'polo')
      .setOrigin(0.5, 1)
      .setDepth(3);

    this.chihuahua = this.add
      .image(CHIHUAHUA_X * S, 600 * S, 'chihuahua')
      .setOrigin(0.5, 1)
      .setDepth(3);

    this.bellPost = this.add
      .image(BELL_X * S, 600 * S, 'bellpost')
      .setOrigin(0.5, 1)
      .setDepth(3);

    this.poloIcon = this.add
      .image(POLO_X * S, 600 * S - 48 * S, 'concha')
      .setScale(0.6)
      .setDepth(4)
      .setAlpha(0.9);
    this.bellIcon = this.add
      .image(BELL_X * S, 600 * S - 48 * S, 'bell')
      .setScale(0.9)
      .setDepth(4)
      .setAlpha(0.9);

    this.tweens.add({
      targets: [this.poloIcon, this.bellIcon],
      y: '-=4',
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
    this.tweens.add({
      targets: this.chihuahua,
      y: '-=2',
      duration: 450,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  setupInteractables() {
    // Friendly faces and quest objects answer E / the touch interact button.
    // Enemies and pickups keep their existing jump/dive/overlap verbs.
    const items = [];

    if (this.polo) {
      items.push({
        id: 'polo',
        target: this.polo,
        range: 58 * S,
        prompt: 'prompt.talk',
        action: () => this.talkToPolo(),
      });
    }
    if (this.chihuahua) {
      items.push({
        id: 'chihuahua',
        target: this.chihuahua,
        range: 52 * S,
        prompt: 'prompt.talk',
        action: () => this.talkToChihuahua(),
      });
    }
    for (const cat of this.cats || []) {
      items.push({
        id: 'cat',
        target: cat,
        range: 48 * S,
        prompt: 'prompt.talk',
        action: () => this.talkToCat(cat),
      });
    }
    if (this.rooster) {
      items.push({
        id: 'rooster',
        target: this.rooster,
        range: 54 * S,
        prompt: 'prompt.talk',
        available: () => this.phase === 'day',
        action: () => this.talkToRooster(),
      });
    }
    if (this.bellPost) {
      items.push({
        id: 'bell',
        target: this.bellPost,
        range: 58 * S,
        prompt: 'prompt.ring',
        available: () => this.phase === 'day' && !this.bellRung,
        action: () => this.talkToBell(),
      });
    }

    this.interactables = items;
  }

  talkToPolo() {
    if (this.phase !== 'day') {
      this.showDialog('name.polo', 'dialog.polo.night');
      return;
    }

    if (this.poloGift) {
      this.showDialog('name.polo', 'dialog.polo.gift');
      // Let the line land before the concha appears in Polo's hand.
      this.time.delayedCall(380, () => {
        if (this.phase === 'day' && this.poloGift) this.givePoloGift();
      });
    } else {
      this.showDialog('name.polo', 'dialog.polo.thanks');
    }
  }

  talkToChihuahua() {
    this.alertChihuahua();
    this.showDialog(
      'name.chihuahua',
      this.phase === 'day'
        ? 'dialog.chihuahua.day'
        : 'dialog.chihuahua.night',
    );
  }

  talkToCat() {
    this.showDialog('name.cat', 'dialog.cat');
  }

  talkToRooster() {
    sfx.rooster();
    this.showDialog('name.rooster', 'dialog.rooster');
  }

  talkToBell() {
    if (this.phase !== 'day' || this.bellRung) return;
    this.ringBell();
    this.showDialog('name.bell', 'dialog.bell');
  }

  createPorch() {
    const porch = this.levelData.porch || {
      x: 105,
      key: 'bonjoHouse',
      roofWidth: 130,
    };
    this.add
      .image(porch.x * S, 600 * S, porch.key)
      .setOrigin(0.5, 1)
      .setDepth(2);

    // Bonjo's existing roofline is a one-way standable platform.
    const roof = this.add.zone(
      porch.x * S,
      (520 + 3) * S,
      porch.roofWidth * S,
      6 * S,
    );
    this.physics.add.existing(roof, true);
    roof.body.checkCollision.down = false;
    roof.body.checkCollision.left = false;
    roof.body.checkCollision.right = false;
    this.foregroundHouseGroup.add(roof);
  }

  createFood() {
    this.foodGroup = this.physics.add.group({ allowGravity: false, immovable: true });

    for (const [x, y] of [...FOODS, ...LEDGE_FOODS]) {
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

  createLives() {
    this.lifeGroup = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    for (const [x, y] of LIVES) this.spawnLifeAt(x * S, y * S);

    this.physics.add.overlap(
      this.dog,
      this.lifeGroup,
      this.collectLife,
      null,
      this,
    );
  }

  createEndReward() {
    if (!END_REWARD) return;

    this.rewardGroup = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
    this.endReward = this.rewardGroup.create(
      END_REWARD.x * S,
      END_REWARD.y * S,
      'wingToken',
    );
    this.endReward.setDepth(7);
    this.endReward.body.setSize(12 * S, 12 * S);

    this.tweens.add({
      targets: this.endReward,
      scaleX: 1.14,
      scaleY: 1.14,
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
    this.tweens.add({
      targets: this.endReward,
      alpha: 0.72,
      duration: 820,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    this.physics.add.overlap(
      this.dog,
      this.rewardGroup,
      this.collectEndReward,
      null,
      this,
    );
  }

  collectEndReward(dog, reward) {
    if (!reward.active) return;

    this.tweens.killTweensOf(reward);
    reward.disableBody(true, true);
    this.powerUps += 1;
    this.dog.maxFlaps = Math.max(this.dog.maxFlaps, tuning.maxFlaps + 1);
    this.dog.flaps = this.dog.maxFlaps;
    sfx.life();
    this.spawnPuff(reward.x, reward.y, 1.2);
    this.floatText(
      reward.x,
      reward.y - 10 * S,
      t('float.powerFlap'),
      '#ffd166',
    );
  }

  spawnLifeAt(x, y) {
    const life = this.lifeGroup.create(x, y, 'lifeHeart');
    life.setDepth(7);
    life.body.setSize(12 * S, 12 * S);
    life.setData('hintAt', 0);

    this.tweens.add({
      targets: life,
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
    this.tweens.add({
      targets: life,
      alpha: 0.78,
      duration: 840,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    return life;
  }

  collectLife(dog, life) {
    if (!life.active) return;

    const gained = this.gainLife();
    if (!gained) {
      // Leave the heart for later instead of wasting it at full health.
      if (this.time.now >= (life.getData('hintAt') || 0)) {
        life.setData('hintAt', this.time.now + 900);
        this.floatText(life.x, life.y - 8 * S, t('float.lifeFull'), '#ffd166');
      }
      return;
    }

    this.tweens.killTweensOf(life);
    life.disableBody(true, true);
    sfx.life();
    this.spawnPuff(life.x, life.y, 0.9);
    this.floatText(
      life.x,
      life.y - 8 * S,
      t(gained === 'max' ? 'float.lifeMax' : 'float.life'),
      '#f26b5e',
    );
  }

  gainLife() {
    if (this.maxHealth < this.maxLives) {
      this.maxHealth += 1;
      this.health = this.maxHealth;
      this.addHudHeart(this.maxHealth - 1);
      this.layoutHealthText();
      this.updateSurvivalHud();
      return 'max';
    }

    if (this.health < this.maxHealth) {
      this.health += 1;
      this.updateSurvivalHud();
      return 'heal';
    }

    return null;
  }

  useTacoCart(dog, cart) {
    const now = this.time.now;
    if (now < (cart.getData('next') || 0)) return;
    if (this.hunger >= this.maxHunger) return;

    cart.setData('next', now + 18000);
    this.hunger = Math.min(this.maxHunger, this.hunger + 28);
    sfx.eat();
    this.spawnPuff(cart.x, cart.y - 12 * S, 0.8);
    this.floatText(cart.x, cart.y - 26 * S, t('float.taco'), '#6ec6a8');
    this.tweens.add({
      targets: cart,
      scaleY: 0.9,
      duration: 90,
      yoyo: true,
      ease: 'Quad.out',
    });
  }

  lootTrash(dog, can) {
    if (can.getData('looted')) return;
    can.setData('looted', true);
    can.body.enable = false;

    this.spawnBoneAt(can.x - 5 * S, can.y - 8 * S);
    this.spawnBoneAt(can.x + 6 * S, can.y - 6 * S);
    sfx.burst();
    this.floatText(can.x, can.y - 22 * S, t('float.crash'), '#ffd166');

    this.tweens.add({
      targets: can,
      angle: 80,
      y: can.y + 4 * S,
      alpha: 0,
      duration: 240,
      onComplete: () => can.setVisible(false),
    });

    this.time.delayedCall(12000, () => {
      if (!can.active) return;
      can.setVisible(true).setAlpha(1).setAngle(0);
      can.setY(600 * S - 8 * S);
      can.body.enable = true;
      can.body.updateFromGameObject?.();
      can.setData('looted', false);
    });
  }

  knockBike(dog, bike) {
    if (bike.getData('knocked')) return;
    bike.setData('knocked', true);
    bike.body.enable = false;

    const dir = dog.x <= bike.x ? 1 : -1;
    sfx.crash();
    this.floatText(bike.x, bike.y - 16 * S, t('float.crash'), '#f26b5e');
    this.spawnPuff(bike.x, bike.y, 0.6);
    this.tweens.add({
      targets: bike,
      angle: 78 * dir,
      y: bike.y + 3 * S,
      alpha: 0.75,
      duration: 220,
      ease: 'Quad.out',
    });
  }

  triggerCarAlarm() {
    if (!this.alarmCar || this.time.now < this.nextAlarm) return;
    this.nextAlarm = this.time.now + 8000;

    sfx.alarm();
    this.floatText(this.alarmCar.x, this.alarmCar.y - 38 * S, t('float.alarm'), '#ffd166');
    this.alarmCar.setTint(0xffd166);
    this.time.delayedCall(260, () => this.alarmCar?.clearTint());
    this.cameras.main.shake(120, 0.004);
    this.cameras.main.flash(100, 255, 209, 102);

    this.rivalGroup.children.iterate((rival) => {
      if (
        rival &&
        rival.active &&
        Math.abs(rival.x - this.alarmCar.x) < 190 * S
      ) {
        rival.stun?.(1800);
      }
    });
  }

  updateInteractions() {
    if (this.won || this.gameOverFlag || this.dog.dead) {
      this.touch?.setInteractAvailable(false);
      this.updateInteractionPrompt(null);
      return;
    }

    if (
      this.alarmCar &&
      this.time.now > this.nextAlarm &&
      Math.abs(this.dog.body.velocity.x) > 25 * S &&
      Phaser.Math.Distance.Between(
        this.dog.x,
        this.dog.y,
        this.alarmCar.x,
        this.alarmCar.y - 10 * S,
      ) < 38 * S
    ) {
      this.triggerCarAlarm();
    }

    if (this.dialogOpen) {
      this.activeInteractable = null;
      this.touch?.setInteractAvailable(false);
      this.updateInteractionPrompt(null);
      if (this.consumeInteractPress()) this.closeDialog();
      return;
    }

    const item = this.findInteractable();
    this.activeInteractable = item;
    this.touch?.setInteractAvailable(!!item);
    this.updateInteractionPrompt(item);

    if (this.consumeInteractPress() && item) item.action();
  }

  findInteractable() {
    let best = null;
    let bestDistance = Infinity;

    for (const item of this.interactables || []) {
      if (!item.target?.active) continue;
      if (item.available && !item.available()) continue;

      const distance = Phaser.Math.Distance.Between(
        this.dog.x,
        this.dog.y,
        item.target.x,
        item.target.y - 10 * S,
      );
      if (distance < item.range && distance < bestDistance) {
        best = item;
        bestDistance = distance;
      }
    }

    return best;
  }

  consumeInteractPress() {
    const pressed = this.interactQueued || this.touch?.consumeInteract() || false;
    this.interactQueued = false;

    if (!pressed || this.time.now < this.nextInteractAt) return false;
    this.nextInteractAt = this.time.now + 220;
    return true;
  }

  givePoloGift() {
    this.poloGift = false;
    this.poloIcon.setVisible(false);
    this.spawnFoodAt(this.polo.x + 8 * S, 585 * S);
    sfx.eat();
    this.floatText(
      this.polo.x,
      this.polo.y - 38 * S,
      t('float.gift'),
      '#ffd166',
    );
  }

  ringBell() {
    this.bellRung = true;
    this.bellIcon.setVisible(false);
    sfx.bell();
    this.spawnFoodAt(this.bellPost.x, 582 * S);
    this.floatText(
      this.bellPost.x,
      this.bellPost.y - 54 * S,
      t('float.bell'),
      '#ffd166',
    );
  }

  alertChihuahua() {
    if (!this.chihuahua?.active || this.time.now < this.nextAllyBark) return;
    this.nextAllyBark = this.time.now + 900;
    sfx.bark();
    this.floatText(
      this.chihuahua.x,
      this.chihuahua.y - 22 * S,
      t('bark'),
      '#ffd166',
    );
    this.tweens.add({
      targets: this.chihuahua,
      scaleY: 1.15,
      duration: 90,
      yoyo: true,
    });
  }

  canLandOnLedge(dog) {
    return dog.body.velocity.y >= 0;
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');

    this.input.keyboard.on('keydown-T', () => {
      this.guiOpen = !this.guiOpen;
      this.gui?.show(this.guiOpen);
    });

    this.input.keyboard.on('keydown-R', () => {
      this.closeObjectives();
      this.scene.restart();
    });
    this.input.keyboard.on('keydown-E', () => {
      this.interactQueued = true;
    });
    this.input.keyboard.on('keydown-O', () => this.toggleObjectives());
    this.input.keyboard.on('keydown-M', () => {
      if (this.won || this.gameOverFlag) this.scene.start('Map');
    });
    this.input.on('pointerdown', () => {
      if (this.dialogOpen) this.closeDialog();
    });

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
    this.physics.add.collider(
      this.dog,
      this.foregroundHouseGroup,
      null,
      this.canLandOnLedge,
      this,
    );
    this.physics.add.collider(
      this.dog,
      this.oneWayGroup,
      null,
      this.canLandOnLedge,
      this,
    );

    this.physics.add.overlap(this.dog, this.tacoGroup, this.useTacoCart, null, this);
    this.physics.add.overlap(this.dog, this.trashGroup, this.lootTrash, null, this);
    this.physics.add.overlap(this.dog, this.bikeGroup, this.knockBike, null, this);
  }

  createPickups() {
    // bones
    this.boneGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    for (const [x, y] of [...BONES, ...LEDGE_BONES]) {
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

    this.checkpoint2 = this.physics.add
      .staticImage(CHECKPOINT2_X * S, CHECKPOINT_Y * S, 'balloon')
      .setDepth(7)
      .setTint(0x6ec6a8);
    this.checkpoint2.body.setSize(12 * S, 18 * S);
    this.physics.add.overlap(
      this.dog,
      this.checkpoint2,
      this.touchCheckpoint2,
      null,
      this,
    );
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
        new Squirrel(
          this,
          s.x * S,
          s.y * S,
          s.min * S,
          s.max * S,
          this.levelData.critters,
        ),
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

    for (const entry of PINATAS) {
      const x = Array.isArray(entry) ? entry[0] : entry.x;
      const y = Array.isArray(entry) ? entry[1] : entry.y;
      const hasLife = !Array.isArray(entry) && entry.life === true;
      this.pinataGroup.add(
        new Pinata(this, x * S, y * S, {
          life: hasLife,
          groundY: PLATFORMS[0].y,
        }),
      );
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
    // Let the camera scroll at sub-pixel precision. Phaser rounds a
    // roundPixels camera with floor(), so a lerped follow can stall up to
    // 10px short of its target and then creep there in visible 1px steps.
    // The renderer still snaps the world art to whole pixels.
    cam.startFollow(this.dog, false, tuning.cameraLerp, tuning.cameraLerp);
    cam.setFollowOffset(0, 18 * S);
    cam.fadeIn(350, 27, 16, 41);
  }

  createHud() {
    const W = this.scale.width;

    this.pips = this.add.graphics().setScrollFactor(0).setDepth(100);

    this.boneText = this.add
      .text(
        this.touchDevice ? 132 * S : W - 8 * S,
        this.touchDevice ? 17 * S : 5 * S,
        `${t('hud.bones')} 0`,
        {
          fontFamily: 'monospace',
          fontSize: this.touchDevice ? 6.5 * S : 8 * S,
          color: '#fff4e0',
          stroke: '#2b1b3d',
          strokeThickness: 2 * S,
        },
      )
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this.comboText = this.add
      .text(W - 8 * S, 31 * S, '', {
        fontFamily: 'monospace',
        fontSize: 7 * S,
        color: '#ffd166',
        stroke: '#2b1b3d',
        strokeThickness: 2 * S,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(false);

    this.hint = this.add
      .text(W / 2, 138 * S, t('level.hint'), {
        fontFamily: 'monospace',
        fontSize: 6 * S,
        color: '#fff4e0',
        stroke: '#2b1b3d',
        strokeThickness: 2 * S,
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0.85);

    const hasGate = this.features.gateDefense !== false;
    const statusH = this.touchDevice ? 30 : hasGate ? 68 : 60;
    const statusW = this.touchDevice ? 132 : 84;
    this.statusPanel = this.add.graphics().setScrollFactor(0).setDepth(99);
    if (!this.touchDevice) {
      this.statusPanel.fillStyle(0x1b1029, 0.42);
      this.statusPanel.fillRect(4 * S, 4 * S, statusW * S, statusH * S);
      this.statusPanel.lineStyle(1 * S, 0xfff4e0, 0.18);
      this.statusPanel.strokeRect(4 * S, 4 * S, statusW * S, statusH * S);
      this.statusPanel.lineStyle(1 * S, 0xfff4e0, 0.16);
      this.statusPanel.lineBetween(8 * S, 44 * S, 84 * S, 44 * S);
    }

    const statusStyle = {
      fontFamily: 'monospace',
      fontSize: 4.5 * S,
      color: '#ffd166',
      stroke: '#2b1b3d',
      strokeThickness: 1.5 * S,
    };
    this.statusFlapLabel = this.add
      .text(8 * S, 10 * S, t('hud.flaps'), statusStyle)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0.9)
      .setVisible(!this.touchDevice);
    this.statusHealthLabel = this.add
      .text(8 * S, 22 * S, t('hud.health'), statusStyle)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0.9)
      .setVisible(!this.touchDevice);
    this.statusHungerLabel = this.add
      .text(8 * S, 34 * S, t('hud.hunger'), statusStyle)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0.9)
      .setVisible(!this.touchDevice);

    // hearts
    this.hearts = [];
    for (let i = 0; i < this.maxHealth; i++) this.addHudHeart(i);

    this.healthText = this.add
      .text(70 * S, 22 * S, `${this.health}/${this.maxHealth}`, {
        fontFamily: 'monospace',
        fontSize: 4.5 * S,
        color: '#fff4e0',
        stroke: '#2b1b3d',
        strokeThickness: 1.5 * S,
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(!this.touchDevice);
    this.layoutHealthText();

    // hunger: concha icon + bar
    this.hungerIcon = this.add
      .image(
        (this.touchDevice ? 124 : 78) * S,
        (this.touchDevice ? 10 : 34) * S,
        'concha',
      )
      .setOrigin(0, 0.5)
      .setScale(this.touchDevice ? 0.6 : 0.7)
      .setScrollFactor(0)
      .setDepth(100);

    this.hungerBar = this.add.graphics().setScrollFactor(0).setDepth(100);

    this.phaseText = this.add
      .text(8 * S, this.touchDevice ? 19 * S : 48 * S, '', {
        fontFamily: 'monospace',
        fontSize: this.touchDevice ? 5.4 * S : 8 * S,
        color: '#fff4e0',
        stroke: '#2b1b3d',
        strokeThickness: 2 * S,
      })
      .setScrollFactor(0)
      .setDepth(100);

    if (this.features.gateDefense !== false) {
      this.gateText = this.add
        .text(8 * S, 58 * S, '', {
          fontFamily: 'monospace',
          fontSize: 6 * S,
          color: '#6ec6a8',
          stroke: '#2b1b3d',
          strokeThickness: 2 * S,
        })
        .setScrollFactor(0)
        .setDepth(100)
        .setVisible(!this.touchDevice);
    } else {
      this.gateText = null;
    }

    this.createObjectivesUi();
    this.updateSurvivalHud();

    // On touch devices the buttons are the tutorial, and they occupy the
    // bottom of the screen where the keyboard hint would sit.
    if (this.touch?.visible) this.hint.setVisible(false);
  }

  addHudHeart(index) {
    const heart = this.add
      .image(
        (this.touchDevice ? 36 + index * 10 : 30 + index * 12) * S,
        (this.touchDevice ? 10 : 22) * S,
        'heart',
      )
      .setOrigin(0, 0.5)
      .setScale(this.touchDevice ? 1.35 : 1.1)
      .setScrollFactor(0)
      .setDepth(100);
    this.hearts.push(heart);
    return heart;
  }

  layoutHealthText() {
    if (this.healthText) {
      this.healthText.x = this.touchDevice
        ? 50 * S
        : (this.maxHealth >= 4 ? 76 : 70) * S;
    }
  }

  createInteractionUi() {
    this.interactPrompt = this.add
      .text(0, 0, '', {
        fontFamily: 'monospace',
        fontSize: 5 * S,
        color: '#1b1029',
        backgroundColor: '#ffd166',
      })
      .setOrigin(0.5, 1)
      .setDepth(20)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });
    this.interactPrompt.setPadding(3 * S, 1 * S, 3 * S, 1 * S);
    this.interactPrompt.on('pointerdown', () => {
      this.interactQueued = true;
    });

    this.interactBubble = this.add
      .image(0, 0, 'speechBubble')
      .setOrigin(0.5, 1)
      .setScale(0.55)
      .setDepth(20)
      .setVisible(false);
  }

  createDialogUi() {
    this.dialogRoot = this.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(145)
      .setVisible(false);

    this.dialogCard = this.add.graphics();
    this.dialogName = this.add
      .text(0, 0, '', {
        fontFamily: 'monospace',
        fontSize: 6 * S,
        color: '#ffd166',
        backgroundColor: '#1d1326',
      })
      .setOrigin(0, 0);
    this.dialogName.setPadding(3 * S, 1 * S, 3 * S, 1 * S);

    this.dialogBody = this.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: 6 * S,
      color: '#2b1b3d',
      lineSpacing: 2 * S,
    });
    this.dialogHint = this.add
      .text(0, 0, '', {
        fontFamily: 'monospace',
        fontSize: 4 * S,
        color: '#2b1b3d',
      })
      .setOrigin(1, 1)
      .setAlpha(0.55);

    this.dialogRoot.add([
      this.dialogCard,
      this.dialogName,
      this.dialogBody,
      this.dialogHint,
    ]);
    this.layoutDialog(this.scale.width);
  }

  layoutDialog(W = this.scale.width) {
    if (!this.dialogRoot) return;

    const w = Math.min(W - 32 * U, 430 * U);
    const h = 72 * U;
    this.dialogRoot.setPosition(W / 2, this.scale.height - 54 * U);
    drawFolkCard(this.dialogCard, 0, 0, w, h);

    this.dialogName.setPosition(-w / 2 + 22 * U, -h / 2 + 9 * U);
    this.dialogBody.setPosition(-w / 2 + 22 * U, -h / 2 + 30 * U);
    this.dialogBody.setWordWrapWidth(w - 44 * U);
    this.dialogHint.setPosition(w / 2 - 18 * U, h / 2 - 8 * U);
    this.dialogHint.setText(
      this.touch?.visible ? t('dialog.closeTouch') : t('dialog.close'),
    );
  }

  updateInteractionPrompt(item) {
    if (!this.interactPrompt) return;
    if (!item || this.dialogOpen) {
      this.interactPrompt.setVisible(false);
      this.interactBubble?.setVisible(false);
      if (this.interactPrompt.input) this.interactPrompt.input.enabled = false;
      return;
    }

    const x = item.target.x;
    const y = item.target.y - item.target.displayHeight - 6 * S;
    this.interactBubble.setPosition(x, y);

    if (this.touch?.visible) {
      // On touch, the action button already says what to do. A quiet floating
      // bubble above the character is enough of a prompt.
      this.interactPrompt.setVisible(false);
      if (this.interactPrompt.input) this.interactPrompt.input.enabled = false;
      this.interactBubble
        .setScale(0.52 + Math.sin(this.time.now * 0.006) * 0.025)
        .setVisible(true);
      return;
    }

    this.interactBubble.setVisible(false);
    this.interactPrompt
      .setText(`E · ${t(item.prompt)}`)
      .setPosition(x, y)
      .setVisible(true);
    if (this.interactPrompt.input) this.interactPrompt.input.enabled = true;
  }

  showDialog(nameKey, textKey) {
    const firstOpen = !this.dialogOpen;
    this.dialogOpen = true;
    this.dialogName.setText(t(nameKey));
    this.dialogBody.setText(t(textKey));
    this.dialogHint.setText(
      this.touch?.visible ? t('dialog.closeTouch') : t('dialog.close'),
    );
    this.interactPrompt?.setVisible(false);
    this.interactBubble?.setVisible(false);
    if (this.interactPrompt?.input) this.interactPrompt.input.enabled = false;
    this.hintWasVisible = this.hint?.visible || false;
    this.hint?.setVisible(false);
    this.touch?.setDialogMode(true);
    this.dialogRoot.setVisible(true).setAlpha(1);

    if (firstOpen) {
      this.dialogRoot.setAlpha(0);
      this.tweens.add({
        targets: this.dialogRoot,
        alpha: 1,
        duration: 120,
        ease: 'Quad.out',
      });
    }

    this.dialogTimer?.remove(false);
    this.dialogTimer = this.time.delayedCall(3800, () => this.closeDialog());
  }

  closeDialog() {
    if (!this.dialogOpen) return;
    this.dialogOpen = false;
    this.dialogTimer?.remove(false);
    this.dialogTimer = null;
    this.tweens.killTweensOf(this.dialogRoot);
    this.dialogRoot?.setVisible(false);
    if (this.hintWasVisible && !this.won && !this.gameOverFlag) {
      this.hint?.setVisible(true);
    }
    this.hintWasVisible = false;
    this.touch?.setDialogMode(false);
  }

  createObjectivesUi() {
    const W = this.scale.width;

    this.objectivesButton = this.add
      .text(
        W - 8 * S,
        17 * S,
        'II',
        {
          fontFamily: 'monospace',
          fontStyle: 'bold',
          fontSize: this.touchDevice ? 7 * S : 6 * S,
          color: '#fff4e0',
          backgroundColor: '#1b1029',
        },
      )
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(160)
      .setInteractive({ useHandCursor: true });
    this.objectivesButton.setPadding(
      this.touchDevice ? 6 * S : 5 * S,
      this.touchDevice ? 4 * S : 2 * S,
      this.touchDevice ? 6 * S : 5 * S,
      this.touchDevice ? 4 * S : 2 * S,
    );
    this.objectivesButton.on('pointerdown', () => this.toggleObjectives());

    this.objectivesScrim = this.add
      .rectangle(0, 0, W, this.scale.height, 0x120a1c, 0.62)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(150)
      .setVisible(false);

    this.objectivesRoot = this.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(155)
      .setVisible(false);

    this.objectivesCard = this.add.graphics();

    const titleStyle = {
      fontFamily: 'monospace',
      fontSize: 8 * S,
      color: '#c94f3d',
      stroke: '#1d1326',
      strokeThickness: 1.5 * S,
    };
    const headingStyle = {
      fontFamily: 'monospace',
      fontSize: 5.5 * S,
      color: '#2f7f78',
    };
    const bodyStyle = {
      fontFamily: 'monospace',
      fontSize: 5 * S,
      color: '#2b1b3d',
      lineSpacing: 2 * S,
    };
    const goalStyle = {
      fontFamily: 'monospace',
      fontSize: 7 * S,
      color: '#6ec6a8',
      stroke: '#2b1b3d',
      strokeThickness: 1.5 * S,
    };

    this.objectivesTitle = this.add.text(0, 0, t('objectives.title'), titleStyle).setOrigin(0.5, 0);
    this.objectivesNowHead = this.add.text(0, 0, t('objectives.now'), headingStyle);
    this.objectivesNowGoal = this.add.text(0, 0, t('goal.survive'), goalStyle);
    this.objectivesNowDesc = this.add.text(0, 0, t('objectives.nowDesc'), bodyStyle);
    this.objectivesErrandsHead = this.add.text(0, 0, t('objectives.errands'), headingStyle);
    this.objectivesErrandsLine = this.add.text(0, 0, t('objectives.errandsLine'), bodyStyle);
    this.objectivesErrandsDesc = this.add.text(0, 0, t('objectives.errandsDesc'), bodyStyle);
    this.objectivesPowersHead = this.add.text(0, 0, t('objectives.powers'), headingStyle);
    this.objectivesPowers = this.add
      .text(
        0,
        0,
        [
          t('objectives.healthDesc'),
          t('objectives.flapsDesc'),
          t('objectives.hungerDesc'),
        ].join('\n'),
        {
          ...bodyStyle,
          fontSize: 4.5 * S,
        },
      );
    this.objectivesClose = this.add
      .text(0, 0, t('objectives.close'), {
        fontFamily: 'monospace',
        fontSize: this.touchDevice ? 5 * S : 4 * S,
        color: this.touchDevice ? '#fff4e0' : '#2b1b3d',
        backgroundColor: this.touchDevice ? '#1b1029' : undefined,
      })
      .setOrigin(1, 0)
      .setAlpha(this.touchDevice ? 1 : 0.6)
      .setScrollFactor(0)
      .setDepth(160)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });
    this.objectivesClose.setPadding(
      this.touchDevice ? 6 * U : 2 * S,
      this.touchDevice ? 8 * U : 1 * S,
      this.touchDevice ? 6 * U : 2 * S,
      this.touchDevice ? 8 * U : 1 * S,
    );
    this.objectivesClose.on('pointerdown', () => this.closeObjectives());

    this.objectivesRoot.add([
      this.objectivesCard,
      this.objectivesTitle,
      this.objectivesNowHead,
      this.objectivesNowGoal,
      this.objectivesNowDesc,
      this.objectivesErrandsHead,
      this.objectivesErrandsLine,
      this.objectivesErrandsDesc,
      this.objectivesPowersHead,
      this.objectivesPowers,
    ]);

    this.layoutObjectives(W);
  }

  layoutObjectives(W = this.scale.width) {
    if (!this.objectivesRoot) return;

    const w = Math.min(W - 40 * U, 500 * U);
    const h = 240 * U;
    this.objectivesW = w;
    this.objectivesH = h;

    this.objectivesButton
      .setPosition(W - 8 * S, this.touchDevice ? 8 * S : 17 * S)
      .setText('II');
    this.objectivesScrim.setPosition(0, 0).setSize(W, this.scale.height);
    this.objectivesRoot.setPosition(W / 2, this.scale.height / 2);
    drawFolkCard(this.objectivesCard, 0, 0, w, h);

    const top = -h / 2;
    const left = -w / 2 + 30 * U;
    const wrap = w - 60 * U;
    this.objectivesTitle.setPosition(0, top + 12 * U);
    this.objectivesNowHead.setPosition(left, top + 48 * U);
    this.objectivesNowGoal.setPosition(left, top + 64 * U);
    this.objectivesNowDesc.setPosition(left, top + 84 * U).setWordWrapWidth(wrap);
    this.objectivesErrandsHead.setPosition(left, top + 112 * U);
    this.objectivesErrandsLine.setPosition(left, top + 128 * U);
    this.objectivesErrandsDesc.setPosition(left, top + 146 * U).setWordWrapWidth(wrap);
    this.objectivesPowersHead.setPosition(left, top + 172 * U);
    this.objectivesPowers.setPosition(left, top + 186 * U).setWordWrapWidth(wrap);
    this.objectivesClose.setPosition(
      W / 2 + w / 2 - 16 * U,
      this.scale.height / 2 - h / 2 + 13 * U,
    );
  }

  toggleObjectives() {
    if (this.won || this.gameOverFlag) return;
    if (this.objectivesOpen) this.closeObjectives();
    else this.openObjectives();
  }

  openObjectives() {
    if (this.objectivesOpen || this.won || this.gameOverFlag) return;
    if (this.dialogOpen) this.closeDialog();

    this.objectivesOpen = true;
    this.objectivesWasTouch = !!this.touch?.visible;
    this.objectivesButton.setVisible(false);
    this.objectivesClose.setVisible(true);
    this.interactPrompt?.setVisible(false);
    this.interactBubble?.setVisible(false);
    this.touch?.show(false);
    this.updateObjectivesPanel();
    this.objectivesScrim.setVisible(true);
    this.objectivesRoot.setVisible(true);
    this.physics.world.pause();
    this.time.paused = true;
    this.tweens.pauseAll();
  }

  closeObjectives() {
    if (!this.objectivesOpen) return;

    this.objectivesOpen = false;
    this.objectivesScrim.setVisible(false);
    this.objectivesRoot.setVisible(false);
    this.objectivesClose.setVisible(false);
    this.objectivesButton.setVisible(true);
    if (this.objectivesWasTouch) this.touch?.show(true);
    this.objectivesWasTouch = false;
    this.physics.world.resume();
    this.time.paused = false;
    this.tweens.resumeAll();
  }

  updateObjectivesPanel() {
    if (!this.objectivesNowGoal) return;

    let text = t(this.levelData.goalKey || 'goal.survive');
    let color = '#6ec6a8';
    if (this.alphaActive && !this.alphaDefeated) {
      text = t(this.levelData.boss?.goalKey || 'goal.alpha', {
        hits: this.alpha?.health ?? 3,
      });
      color = '#ffd166';
    } else if (this.alphaDefeated && this.alphaEnding) {
      text = t('goal.dawnNow');
      color = '#b5533a';
    } else if (this.phase === 'night' && this.phaseTime <= 10) {
      text = t('goal.dawn', {
        seconds: Math.ceil(Math.max(0, this.phaseTime)),
      });
      color = '#ffd166';
    }

    this.objectivesNowGoal.setText(text).setColor(color);
    this.objectivesNowDesc?.setText(
      t(this.levelData.objectiveDescKey || 'objectives.nowDesc'),
    );

    const hasErrands = this.features?.errands !== false;
    this.objectivesErrandsHead?.setVisible(hasErrands);
    this.objectivesErrandsLine?.setVisible(hasErrands);
    this.objectivesErrandsDesc?.setVisible(hasErrands);
    if (hasErrands) {
      this.objectivesErrandsLine.setText(t('objectives.errandsLine'));
    }
  }

  createTuningPanel() {
    const gui = new GUI({ title: t('tuning.title') });
    this.gui = gui;
    // Keep the live tuning panel out of the top-right HUD cluster.
    gui.domElement.style.top = 'auto';
    gui.domElement.style.bottom = '0';

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
      .text(
        this.scale.width / 2,
        50 * S,
        t(this.levelData.introKey || 'level.intro'),
        {
          fontFamily: 'monospace',
          fontSize: 12 * S,
          color: '#fff4e0',
          stroke: '#2b1b3d',
          strokeThickness: 3 * S,
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0);

    this.tweens.add({
      targets: this.introLabel,
      alpha: 1,
      duration: 400,
      hold: 2200,
      yoyo: true,
      onComplete: () => this.introLabel?.destroy(),
    });

    if (this.levelData.storyIntroKey) {
      this.storyLabel = this.add
        .text(
          this.scale.width / 2,
          65 * S,
          t(this.levelData.storyIntroKey),
          {
            fontFamily: 'monospace',
            fontSize: 5.5 * S,
            color: '#fff4e0',
            stroke: '#2b1b3d',
            strokeThickness: 2 * S,
            align: 'center',
            wordWrap: { width: this.scale.width - 40 * U },
          },
        )
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(100)
        .setAlpha(0);

      this.tweens.add({
        targets: this.storyLabel,
        alpha: 1,
        duration: 400,
        hold: 2800,
        yoyo: true,
        onComplete: () => this.storyLabel?.destroy(),
      });
    }
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
    const maxFlaps = this.dog?.maxFlaps ?? tuning.maxFlaps;
    for (let i = 0; i < maxFlaps; i++) {
      const x = ((this.touchDevice ? 8 : 30) + i * (this.touchDevice ? 9 : 10)) * S;
      if (i < this.dog.flaps) {
        this.pips.fillStyle(0xffd166, 1);
        this.pips.fillCircle(x, 10 * S, (this.touchDevice ? 4.8 : 3.8) * S);
        this.pips.lineStyle(1 * S, 0x2b1b3d, 0.5);
        this.pips.strokeCircle(x, 10 * S, (this.touchDevice ? 4.8 : 3.8) * S);
      } else {
        this.pips.lineStyle(1 * S, 0xfff4e0, 0.45);
        this.pips.strokeCircle(x, 10 * S, (this.touchDevice ? 4.8 : 3.8) * S);
      }
    }

    this.boneText.setText(`${t('hud.bones')} ${this.bonesCount}`);

    if (this.comboTimer > 0) {
      this.comboTimer -= delta / 1000;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.comboText.setVisible(false);
      }
    }

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
    this.healthText
      ?.setText(`${this.health}/${this.maxHealth}`)
      .setColor(this.health <= 1 ? '#f26b5e' : '#fff4e0');
    this.statusHealthLabel?.setColor(this.health <= 1 ? '#f26b5e' : '#ffd166');
    this.statusHungerLabel?.setColor(this.hunger < 25 ? '#f26b5e' : '#ffd166');

    this.hungerBar.clear();
    this.hungerBar.fillStyle(0x2b1b3d, 0.8);
    const hungerX = this.touchDevice ? 76 * S : 30 * S;
    const hungerY = this.touchDevice ? 7 * S : 31 * S;
    this.hungerBar.fillRect(hungerX, hungerY, 44 * S, 6 * S);
    this.hungerBar.lineStyle(1 * S, 0xfff4e0, 0.55);
    this.hungerBar.strokeRect(hungerX, hungerY, 44 * S, 6 * S);

    const width = Math.max(0, (this.hunger / this.maxHunger) * 42 * S);
    this.hungerBar.fillStyle(this.hunger < 25 ? 0xf26b5e : 0xf0a03c, 1);
    this.hungerBar.fillRect(hungerX + 1 * S, hungerY + 1 * S, width, 4 * S);

    const label = this.phase === 'day' ? t('hud.day') : t('hud.night');
    const number = this.phase === 'day' ? this.dayNumber : this.nightsSurvived + 1;
    const phaseLabel = `${label} ${number} · ${Math.ceil(Math.max(0, this.phaseTime))}s`;
    let gateLabel = '';
    if (this.gateText) {
      gateLabel = this.gateBroken
        ? `${t('hud.gate')} 0/${this.gateMaxHealth}`
        : `${t('hud.gate')} ${this.gateHealth}/${this.gateMaxHealth}`;
      this.gateText.setText(gateLabel);
      this.gateText.setColor(
        this.gateBroken || this.gateHealth <= 1 ? '#f26b5e' : '#6ec6a8',
      );
    }
    this.phaseText.setText(
      this.touchDevice && gateLabel ? `${phaseLabel} · ${gateLabel}` : phaseLabel,
    );
    this.phaseText.setColor(this.phase === 'night' ? '#ffd166' : '#fff4e0');

    this.updateGoalHud();
  }

  updateGoalHud() {
    if (this.won || this.gameOverFlag) return;
    this.updateObjectivesPanel();
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

      if (
        this.nightsSurvived === this.nightsToSurvive - 1 &&
        !this.alphaSpawned &&
        this.phaseTime <= 12
      ) {
        this.spawnAlpha();
      }

      if (
        this.features.gateDefense !== false &&
        !this.gateRusherSpawned &&
        !this.gateBroken &&
        this.phaseTime <= 18
      ) {
        this.spawnGateRusher();
      }

      if (this.phaseTime <= 0) {
        if (
          this.nightsSurvived === this.nightsToSurvive - 1 &&
          !this.alphaDefeated
        ) {
          if (!this.alphaSpawned) this.spawnAlpha();
          this.phaseTime = 0;
          this.alphaActive = true;
        } else if (!this.alphaEnding) {
          this.endNight();
        }
      }
    }
  }

  startNight() {
    this.phase = 'night';
    this.phaseTime =
      this.levelData.timings.night +
      this.nightsSurvived * this.levelData.timings.nightStep;
    this.waveTotal = 2 + this.nightsSurvived;
    this.waveSpawned = 0;
    this.nextWave = 2;
    this.gateRusherSpawned = false;
    this.closeDialog();
    this.setNightCreatures(true);

    this.poloIcon?.setVisible(false);
    this.bellIcon?.setVisible(false);

    this.tweens.killTweensOf([this.sun, this.moon]);
    this.tweens.add({
      targets: this.sun,
      alpha: 0,
      duration: 500,
      onComplete: () => this.sun?.setVisible(false),
    });
    this.moon.setVisible(true).setAlpha(0);
    this.tweens.add({
      targets: this.moon,
      alpha: 0.96,
      duration: 900,
    });

    this.tweens.add({
      targets: this.nightOverlay,
      alpha: 0.45,
      duration: 900,
    });
    this.tweens.add({
      targets: this.skyNight,
      alpha: 0.68,
      duration: 900,
    });
    this.tweens.add({
      targets: this.cloudsFar,
      alpha: 0.28,
      duration: 900,
    });
    this.tweens.add({
      targets: this.cloudsNear,
      alpha: 0.42,
      duration: 900,
    });

    this.showPhaseBanner(`${t('hud.night')} ${this.nightsSurvived + 1}`, '#ffd166');
    sfx.bell();
    sfx.night();
  }

  endNight() {
    if (this.won || this.gameOverFlag) return;
    if (
      this.nightsSurvived === this.nightsToSurvive - 1 &&
      !this.alphaDefeated
    ) {
      return;
    }

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
    this.phaseTime = this.levelData.timings.day2;
    this.waveSpawned = 0;
    this.waveTotal = 0;
    this.gateRusherSpawned = false;
    this.closeDialog();
    this.setNightCreatures(false);

    this.health = Math.min(this.maxHealth, this.health + 1);
    this.hunger = Math.min(this.maxHunger, this.hunger + 10);

    this.gateHealth = this.gateMaxHealth;
    this.gateBroken = false;
    this.porchGate?.clearTint().setAlpha(1);
    this.gateSign?.setVisible(true);

    this.poloGift = true;
    this.bellRung = false;
    this.poloIcon?.setVisible(true);
    this.bellIcon?.setVisible(true);

    this.tweens.killTweensOf([this.sun, this.moon]);
    this.tweens.add({
      targets: this.moon,
      alpha: 0,
      duration: 500,
      onComplete: () => this.moon?.setVisible(false),
    });
    this.sun.setVisible(true).setAlpha(0);
    this.tweens.add({
      targets: this.sun,
      alpha: 0.95,
      duration: 900,
    });

    this.tweens.add({
      targets: this.nightOverlay,
      alpha: 0,
      duration: 900,
    });
    this.tweens.add({
      targets: this.skyNight,
      alpha: 0,
      duration: 900,
    });
    this.tweens.add({
      targets: this.cloudsFar,
      alpha: 0.5,
      duration: 900,
    });
    this.tweens.add({
      targets: this.cloudsNear,
      alpha: 0.75,
      duration: 900,
    });

    this.showPhaseBanner(`${t('hud.day')} ${this.dayNumber}`, '#6ec6a8');
    sfx.bell();
    sfx.day();
    this.time.delayedCall(420, () => {
      if (!this.won && !this.gameOverFlag) sfx.rooster();
    });

    const dawnFood = this.levelData.dawnFood || [70, 590];
    this.spawnFoodAt(dawnFood[0] * S, dawnFood[1] * S);
    this.updateSurvivalHud();
  }

  pickWaveRole() {
    if (this.nightsSurvived === 0) {
      return this.waveSpawned === 1 ? 'fast' : 'normal';
    }
    return ['fast', 'thief', 'brute', 'normal'][this.waveSpawned % 4];
  }

  safeMinX(platform) {
    if (platform.x !== 0) return (platform.x + 12) * S;
    const safeZone =
      this.levelData.safeZone ??
      (this.features.porch !== false ? GATE_X : 0);
    return (this.gateBroken ? 12 : safeZone) * S;
  }

  roleOptions(role) {
    switch (role) {
      case 'fast':
        return {
          role,
          texture: 'rivalFast',
          runTexture: 'rivalFastRun',
          scale: 0.85,
          baseSpeed: 72,
          chaseSpeed: 152,
          lungeSpeed: 220,
          attackCooldown: 2400,
        };
      case 'thief':
        return {
          role,
          texture: 'rivalThief',
          runTexture: 'rivalThiefRun',
          scale: 0.95,
          baseSpeed: 66,
          chaseSpeed: 138,
          lungeSpeed: 190,
          attackCooldown: 3000,
        };
      case 'brute':
        return {
          role,
          texture: 'rivalBrute',
          runTexture: 'rivalBruteRun',
          scale: 1.22,
          health: 2,
          baseSpeed: 40,
          chaseSpeed: 96,
          lungeSpeed: 165,
          attackCooldown: 3600,
        };
      default:
        return {
          role: 'normal',
          lungeSpeed: 190,
          attackCooldown: 3200,
        };
    }
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

    const minX = this.safeMinX(platform);
    const maxX = (platform.x + platform.w - 12) * S;
    const enemyY = (this.levelData.enemySpawnY ?? 587) * S;

    const role = this.pickWaveRole();
    const rival = new RivalDog(
      this,
      sx * S,
      enemyY,
      minX,
      maxX,
      this.roleOptions(role),
    );
    this.rivalGroup.add(rival);
    this.runStats.waves += 1;

    this.spawnPuff(sx * S, 580 * S, 1);
    this.floatText(sx * S, 558 * S, t('bark'), '#ffd166');
    sfx.bark();
    this.alertChihuahua();
  }

  spawnGateRusher() {
    if (
      this.features.gateDefense === false ||
      this.gateRusherSpawned ||
      this.gateBroken ||
      this.won ||
      this.gameOverFlag
    ) {
      return;
    }
    this.gateRusherSpawned = true;

    const enemyY = (this.levelData.enemySpawnY ?? 587) * S;
    const rival = new RivalDog(
      this,
      500 * S,
      enemyY,
      140 * S,
      520 * S,
      {
        role: 'rusher',
        scale: 0.9,
        tint: 0xffa8c0,
        baseSpeed: 80,
        chaseSpeed: 150,
      },
    );
    this.rivalGroup.add(rival);
    this.floatText(500 * S, 558 * S, t('bark'), '#ffd166');
    this.alertChihuahua();
  }

  spawnAlpha() {
    if (this.alphaSpawned || this.won || this.gameOverFlag) return;
    this.alphaSpawned = true;
    this.alphaActive = true;
    this.waveSpawned = this.waveTotal;

    const designX = this.dog.x / S;
    let platform = PLATFORMS.find(
      (p) => designX >= p.x && designX <= p.x + p.w,
    );
    if (!platform) platform = PLATFORMS[PLATFORMS.length - 1];

    const mid = platform.x + platform.w / 2;
    let sx = this.dog.x / S + (this.dog.facing >= 0 ? 95 : -95);
    sx = Phaser.Math.Clamp(sx, platform.x + 22, platform.x + platform.w - 22);
    if (Math.abs(sx - this.dog.x / S) < 40) {
      sx = this.dog.x / S < mid
        ? platform.x + platform.w - 22
        : platform.x + 22;
    }
    const minX = this.safeMinX(platform);
    const maxX = (platform.x + platform.w - 12) * S;
    const enemyY = (this.levelData.enemySpawnY ?? 587) * S;
    const boss = this.levelData.boss || {};

    this.alpha = new RivalDog(this, sx * S, enemyY, minX, maxX, {
      role: 'alpha',
      texture: boss.texture,
      runTexture: boss.runTexture,
      scale: boss.scale ?? 1.35,
      tint: boss.tint === undefined ? 0xffd166 : boss.tint,
      health: boss.health ?? 3,
      baseSpeed: boss.baseSpeed ?? 62,
      chaseSpeed: boss.chaseSpeed ?? 142,
    });
    this.rivalGroup.add(this.alpha);

    if (boss.crown !== false) {
      this.alphaCrown = this.add
        .image(this.alpha.x, this.alpha.y - 24 * S, 'crown')
        .setDepth(10.5);
    } else {
      this.alphaCrown = null;
    }

    this.showPhaseBanner(t(boss.titleKey || 'alpha.title'), '#ffd166');
    this.spawnPuff(this.alpha.x, 580 * S, 1.5);
    this.floatText(this.alpha.x, 558 * S, t('bark'), '#ffd166');
    sfx.bark();
    this.alertChihuahua();
    this.updateGoalHud();
  }

  damageGate(rival = null) {
    if (this.gateBroken || this.won || this.gameOverFlag) return;

    this.gateHealth -= 1;
    this.porchGate?.setTint(0xff6b6b);
    this.time.delayedCall(160, () => {
      if (!this.gateBroken) this.porchGate?.clearTint();
    });

    this.cameras.main.shake(120, 0.004);
    this.floatText(
      GATE_X * S,
      560 * S,
      `${t('hud.gate')} ${this.gateHealth}/${this.gateMaxHealth}`,
      '#f26b5e',
    );
    sfx.stomp();
    this.alertChihuahua();
    this.updateSurvivalHud();

    if (this.gateHealth <= 0) {
      this.gateBroken = true;
      this.porchGate?.setTint(0x6a5a76).setAlpha(0.55);
      this.gateSign?.setVisible(false);
      this.showPhaseBanner(t('gate.broken'), '#f26b5e');
      this.cameras.main.flash(160, 242, 107, 94);
      if (rival?.active) {
        rival.defeated = true;
        rival.body.enable = false;
        this.tweens.add({
          targets: rival,
          y: rival.y - 12 * S,
          alpha: 0,
          duration: 250,
          onComplete: () => rival.destroy(),
        });
      }
    }
  }

  onAlphaDefeated() {
    if (this.alphaDefeated) return;
    this.alphaDefeated = true;
    this.alphaActive = false;
    this.alphaEnding = true;

    this.alphaCrown?.destroy();
    this.alphaCrown = null;
    this.showPhaseBanner(
      t(this.levelData.boss?.defeatKey || 'alpha.cleared'),
      '#ffd166',
    );
    sfx.burst();
    this.alertChihuahua();

    this.time.delayedCall(850, () => {
      this.alphaEnding = false;
      if (!this.won && !this.gameOverFlag) this.endNight();
    });
  }

  showPhaseBanner(text, color) {
    const fontSize = Math.min(
      22 * S,
      Math.max(10 * S, Math.floor((this.scale.width - 48) / (text.length * 0.62))),
    );

    this.phaseBanner = this.add
      .text(this.scale.width / 2, 72 * S, text, {
        fontFamily: 'monospace',
        fontSize,
        color,
        stroke: '#2b1b3d',
        strokeThickness: Math.max(2, fontSize * 0.16),
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

  onLand() {
    sfx.land();
  }

  onFootstep() {
    sfx.footstep();
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
    this.combo += 1;
    this.comboTimer = 2.5;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.comboText
      .setText(t('hud.combo', { combo: this.combo }))
      .setVisible(this.combo > 1);
    sfx.bone();
    this.spawnPuff(bone.x, bone.y, 0.7);
    this.floatText(bone.x, bone.y - 6 * S, '+1');
  }

  touchRing(dog, ring) {
    const now = this.time.now;
    if (now - ring.getData('last') < 500) return;
    ring.setData('last', now);

    if (this.dog.flaps >= this.dog.maxFlaps) return;

    this.dog.flaps = this.dog.maxFlaps;
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

  touchCheckpoint2() {
    if (this.checkpoint2Active) return;
    this.checkpoint2Active = true;

    this.checkpoint2.clearTint();
    this.spawnPoint = { x: CHECKPOINT2_X * S, y: 548 * S };

    sfx.checkpoint();
    this.spawnPuff(this.checkpoint2.x, this.checkpoint2.y, 1.3);
    this.floatText(
      this.checkpoint2.x,
      this.checkpoint2.y - 16 * S,
      t('float.checkpoint'),
    );
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
      if (rival.maxHealth > 1) {
        if (this.time.now < (rival.nextHit || 0)) return;
        rival.nextHit = this.time.now + 520;
        rival.health -= 1;
        rival.setTint(0xfff4e0);
        this.time.delayedCall(140, () => {
          if (!rival.active || rival.defeated) return;
          if (rival.baseTint !== null) rival.setTint(rival.baseTint);
          else rival.clearTint();
        });

        if (rival.health > 0) {
          sfx.yelp();
          this.spawnPuff(rival.x, rival.y, 0.8);
          this.floatText(
            rival.x,
            rival.y - 16 * S,
            `${rival.health}/${rival.maxHealth}`,
            '#ffd166',
          );
          this.dog.body.velocity.y = -tuning.flapImpulse * 0.7 * S;
          return;
        }
      }

      rival.defeated = true;
      rival.body.enable = false;

      let reward = 1;
      if (rival.role === 'alpha') {
        reward = 3;
        this.onAlphaDefeated();
      } else if (rival.role === 'brute') {
        reward = 2;
      }

      if (rival.stolenBones) {
        this.bonesCount += rival.stolenBones;
        rival.stolenBones = 0;
      }

      this.bonesCount += reward;
      this.rivalsSubdued += 1;
      sfx.yelp();
      this.spawnPuff(rival.x, rival.y, rival.role === 'alpha' ? 1.5 : 1);
      this.floatText(rival.x, rival.y - 12 * S, `+${reward}`, '#ffd166');

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
      if (pinata.hasLife) {
        this.spawnLifeAt(pinata.x, pinata.y + 20 * S);
      } else {
        this.spawnFoodAt(pinata.x, pinata.y + 20 * S);
      }
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
    dog.flaps = dog.maxFlaps;

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

  resetCombo() {
    this.combo = 0;
    this.comboTimer = 0;
    this.comboText?.setVisible(false);
  }

  hurt(source = null) {
    if (this.won || this.gameOverFlag || this.dog.dead) return;
    if (this.dog.invuln > 0) return;

    this.resetCombo();
    this.health -= 1;
    this.runStats.damage += 1;
    this.updateSurvivalHud();

    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    if (
      source?.role === 'thief' &&
      !source.stolenBones &&
      this.bonesCount > 0
    ) {
      this.bonesCount -= 1;
      source.stolenBones = 1;
      source.setTint(0xd6a8ff);
      this.floatText(source.x, source.y - 24 * S, t('float.stolen'), '#f26b5e');
    }

    sfx.hurt();
    this.dog.invuln = 1.7;
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

    this.resetCombo();
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
    this.dog.invuln = 1.5;
    this.dog.flaps = this.dog.maxFlaps;
    this.touch?.reset();

    this.cameras.main.flash(120, 255, 244, 224);
  }

  starve() {
    if (this.won || this.gameOverFlag) return;

    this.resetCombo();
    this.health -= 1;
    this.runStats.starved += 1;
    this.updateSurvivalHud();
    this.cameras.main.flash(100, 242, 107, 94);

    if (this.health <= 0) this.gameOver();
  }

  hideEndHud() {
    this.closeObjectives();
    this.pips.setVisible(false);
    this.boneText.setVisible(false);
    this.comboText?.setVisible(false);
    this.hint.setVisible(false);
    this.statusPanel?.setVisible(false);
    this.statusFlapLabel?.setVisible(false);
    this.statusHealthLabel?.setVisible(false);
    this.statusHungerLabel?.setVisible(false);
    this.healthText?.setVisible(false);
    this.objectivesButton?.setVisible(false);
    this.objectivesScrim?.setVisible(false);
    this.objectivesRoot?.setVisible(false);
    this.objectivesClose?.setVisible(false);
    this.interactBubble?.setVisible(false);
    this.hearts.forEach((heart) => heart.setVisible(false));
    this.hungerIcon.setVisible(false);
    this.hungerBar.setVisible(false);
    this.phaseText.setVisible(false);
    this.gateText?.setVisible(false);
    this.poloIcon?.setVisible(false);
    this.bellIcon?.setVisible(false);
    this.alphaCrown?.setVisible(false);
    this.gui?.hide();
    this.closeDialog();
    this.touch?.show(false);
  }

  computeScore(elapsed = (this.time.now - this.startedAt) / 1000) {
    const timeBonus = Math.max(0, Math.round(120 - elapsed)) * 2;
    const noHit =
      this.runStats.damage === 0 &&
      this.runStats.falls === 0 &&
      this.runStats.starved === 0
        ? 100
        : 0;
    const alphaBonus = this.alphaDefeated ? 150 : 0;

    return (
      this.bonesCount * 10 +
      this.maxCombo * 20 +
      this.rivalsSubdued * 30 +
      this.health * 50 +
      this.powerUps * 100 +
      timeBonus +
      noHit +
      alphaBonus
    );
  }

  computeRank(score) {
    if (score >= 900) return 'S';
    if (score >= 700) return 'A';
    if (score >= 500) return 'B';
    if (score >= 300) return 'C';
    return 'D';
  }

  finalizeScore() {
    this.score = this.computeScore();
    this.rank = this.computeRank(this.score);
  }

  logRun(outcome) {
    const run = {
      outcome,
      nights: this.nightsSurvived,
      bones: this.bonesCount,
      health: this.health,
      hunger: Math.round(this.hunger),
      seconds: +((this.time.now - this.startedAt) / 1000).toFixed(1),
      score: this.score,
      rank: this.rank,
      maxCombo: this.maxCombo,
      rivals: this.rivalsSubdued,
      alpha: this.alphaDefeated,
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
    this.dog.tongue.setVisible(false);

    this.hideEndHud();
    this.finalizeScore();
    this.logRun('gameover');
    sfx.gameover();
    this.cameras.main.shake(200, 0.008);

    this.time.delayedCall(250, () => this.showGameOverOverlay());
  }

  showGameOverOverlay() {
    const W = this.scale.width;
    const cardW = Math.min(W - 64 * U, 440 * U);
    const titleText = t('gameover.title');
    const titleSize = Math.min(
      18 * S,
      Math.max(10 * S, Math.floor((cardW - 48 * U) / (titleText.length * 0.62))),
    );

    const overlay = this.add
      .rectangle(W / 2, 72 * S, W, 144 * S, 0x120a1c, 0.82)
      .setScrollFactor(0)
      .setDepth(200);

    this.enableReplay(overlay);

    const card = this.add
      .graphics()
      .setScrollFactor(0)
      .setDepth(201);
    drawFolkCard(card, W / 2, 144 * U, cardW, 220 * U);

    const title = this.add
      .text(W / 2, 40 * S, titleText, {
        fontFamily: 'monospace',
        fontSize: titleSize,
        color: '#c94f3d',
        stroke: '#1d1326',
        strokeThickness: 3 * S,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(202);

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
          color: '#1d1326',
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(202);

    const rank = this.add
      .text(W / 2, 82 * S, t('run.score', { score: this.score, rank: this.rank }), {
        fontFamily: 'monospace',
        fontSize: 8 * S,
        color: '#2f7f78',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(202);

    const promptY = this.touchDevice ? 96 * S : 100 * S;
    const box = this.add
      .rectangle(W / 2, promptY, 170 * S, 18 * S, 0xc94f3d, 1)
      .setStrokeStyle(2 * S, 0x1d1326, 1)
      .setScrollFactor(0)
      .setDepth(202);

    const prompt = this.add
      .text(W / 2, promptY, t('gameover.again'), {
        fontFamily: 'monospace',
        fontSize: 8 * S,
        color: '#fff4e0',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(203);

    const mapButton = this.addEndMapButton(W);
    this.endLayout = { overlay, card, title, stats, rank, box, prompt, mapButton };
  }

  win() {
    if (this.won) return;
    this.won = true;

    this.dog.dead = true;
    this.dog.setVelocity(0, 0);
    this.dog.setTexture('dogSit');
    this.dog.setRotation(0);
    this.dog.tongue.setVisible(false);

    this.hideEndHud();
    this.sun.setVisible(false);
    this.finalizeScore();
    markLevelComplete(this.levelId, this.score);
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
    const cardW = Math.min(W - 64 * U, 440 * U);
    const titleText = t(this.levelData.winTitleKey || 'win.title');
    const titleSize = Math.min(
      18 * S,
      Math.max(10 * S, Math.floor((cardW - 48 * U) / (titleText.length * 0.62))),
    );

    const overlay = this.add
      .rectangle(W / 2, 72 * S, W, 144 * S, 0x120a1c, 0.82)
      .setScrollFactor(0)
      .setDepth(200);

    this.enableReplay(overlay);

    const card = this.add
      .graphics()
      .setScrollFactor(0)
      .setDepth(201);
    drawFolkCard(card, W / 2, 144 * U, cardW, 220 * U);

    const title = this.add
      .text(W / 2, 40 * S, titleText, {
        fontFamily: 'monospace',
        fontSize: titleSize,
        color: '#2f7f78',
        stroke: '#1d1326',
        strokeThickness: 3 * S,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(202);

    const epilogue = this.add
      .text(
        W / 2,
        53 * S,
        t(this.levelData.winEpilogueKey || 'win.casaEpilogue'),
        {
          fontFamily: 'monospace',
          fontSize: 4 * S,
          color: '#2b1b3d',
          align: 'center',
          wordWrap: { width: cardW - 24 * U },
        },
      )
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(202);

    const stats = this.add
      .text(W / 2, 66 * S, t('win.stats', { bones: this.bonesCount, nights: this.nightsSurvived, time: elapsed }), {
        fontFamily: 'monospace',
        fontSize: 9 * S,
        color: '#1d1326',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(202);

    const rank = this.add
      .text(W / 2, 82 * S, t('run.score', { score: this.score, rank: this.rank }), {
        fontFamily: 'monospace',
        fontSize: 8 * S,
        color: '#c94f3d',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(202);

    const promptY = this.touchDevice ? 96 * S : 100 * S;
    const box = this.add
      .rectangle(W / 2, promptY, 170 * S, 18 * S, 0xc94f3d, 1)
      .setStrokeStyle(2 * S, 0x1d1326, 1)
      .setScrollFactor(0)
      .setDepth(202);

    const prompt = this.add
      .text(W / 2, promptY, t('win.again'), {
        fontFamily: 'monospace',
        fontSize: 8 * S,
        color: '#fff4e0',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(203);

    const mapButton = this.addEndMapButton(W);
    this.endLayout = { overlay, card, title, epilogue, stats, rank, box, prompt, mapButton };
  }

  addEndMapButton(W) {
    const touch = this.touchDevice;
    const cardW = Math.min(W - 64 * U, 440 * U);
    const mapButton = this.add
      .text(
        touch ? W / 2 : W / 2 + cardW / 2 - 20 * U,
        144 * U + 110 * U - (touch ? 8 * U : 18 * U),
        t('map.shortcut'),
        {
          fontFamily: 'monospace',
          fontSize: touch ? 6 * S : 4 * S,
          color: '#fff4e0',
          backgroundColor: '#1b1029',
        },
      )
      .setPadding(
        touch ? 8 * U : 3 * U,
        touch ? 8 * U : 1.5 * U,
        touch ? 8 * U : 3 * U,
        touch ? 8 * U : 1.5 * U,
      )
      .setOrigin(touch ? 0.5 : 1, 1)
      .setScrollFactor(0)
      .setDepth(204)
      .setInteractive({ useHandCursor: true });

    mapButton.on('pointerdown', (pointer, x, y, event) => {
      event?.stopPropagation?.();
      this.scene.start('Map');
    });
    return mapButton;
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
