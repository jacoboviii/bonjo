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
import {
  drawFolkCard,
  addMenuButton,
  FOLK,
  FOLK_CSS,
  FONT,
  MENU_TEXT,
  GAME_TEXT,
} from '../ui/FolkCard.js';
import LampLightingPipeline from '../ui/LightingPostFX.js';
import { t } from '../i18n.js';
import { markLevelComplete } from '../progress.js';
import { getLevelData, getNextLevel } from '../levels/index.js';
import { parallaxScale } from '../motion.js';
import { laCuadra } from '../levels/laCuadra.js';

const S = SCALE;
// Small UI offsets were authored in the old 2x render space.
const U = S / 2;

// The spin is the default attack, so it starts immediately and recovers
// quickly. The cooldown stays above the rival hit cooldown so chained spins
// can still damage the same target.
const SPIN_COOLDOWN_MS = 420;
const SPIN_DURATION_MS = 260;
const SPIN_RING_MS = 220;

// Words spoken by animals linger longer than combat/UI numbers.
const ANIMAL_WORDS = new Set([
  'WOOF!', '¡GUAU!',
  'CAW!', '¡CAAW!',
  'HOO!', '¡UUH!',
  'HISS!', '¡FSSS!',
  'CHIRP!', '¡PÍO!',
  'COCK-A-DOODLE-DOO!', '¡KIKIRIKÍ!',
  'HEY!', '¡OYE!',
]);

const ROOSTER_SCALE = 0.82;
const VERTICAL_CAMERA_LERP = 0.12;
const WASP_WARN_SECONDS = 1.2;
const WASP_ACTIVE_SECONDS = 0.7;
const WASP_CYCLE_SECONDS = WASP_WARN_SECONDS + WASP_ACTIVE_SECONDS + 1.4;
const TIME_SHARD_SECONDS = 4;
const TIME_SHARD_COUNT = 14;
// Gameplay pickups and enemies sit above the night wash.
const ENTITY_DEPTH = 9.7;
const DAY_START_MINUTES = 6 * 60;
const NIGHT_START_MINUTES = 18 * 60;
const HALF_DAY_MINUTES = 12 * 60;
const SPARK_WARN_SECONDS = 1.2;
const SPARK_LIVE_SECONDS = 0.7;
const SPARK_CYCLE_SECONDS = SPARK_WARN_SECONDS + SPARK_LIVE_SECONDS + 1.4;
const CAMERA_EDGE_PAD = 150; // design px of visual world beyond each barrier

// Small emissive points feed the world-camera bloom pass.
const WARM_LIGHT_COLOR = { r: 1, g: 0.78, b: 0.48 };
const SPARK_LIGHT_COLOR = { r: 0.56, g: 0.84, b: 1 };
const SUN_BLOOM_COLOR = { r: 1, g: 0.84, b: 0.38 };
const MOON_BLOOM_COLOR = { r: 0.68, g: 0.84, b: 1 };
const BLOOM_MAX = 8;

function colorFromHex(hex) {
  return {
    r: ((hex >> 16) & 0xff) / 255,
    g: ((hex >> 8) & 0xff) / 255,
    b: (hex & 0xff) / 255,
  };
}

const CAT_LINES = [
  'dialog.cat',
  'dialog.cat.2',
  'dialog.cat.3',
  'dialog.cat.4',
  'dialog.cat.5',
  'dialog.cat.6',
];
const CHIHUAHUA_DAY_LINES = [
  'dialog.chihuahua.day',
  'dialog.chihuahua.day.2',
  'dialog.chihuahua.day.3',
  'dialog.chihuahua.day.4',
  'dialog.chihuahua.day.5',
];
const CHIHUAHUA_NIGHT_LINES = [
  'dialog.chihuahua.night',
  'dialog.chihuahua.night.2',
  'dialog.chihuahua.night.3',
  'dialog.chihuahua.night.4',
  'dialog.chihuahua.night.5',
];
const ROOSTER_LINES = [
  'dialog.rooster',
  'dialog.rooster.2',
  'dialog.rooster.3',
  'dialog.rooster.4',
  'dialog.rooster.5',
  'dialog.rooster.6',
];

let WORLD_W;
let WORLD_H;
let PLATFORMS;
let BONES;
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
let FINAL_NIGHT_LIVES;
let END_REWARD;
let PARKED_CARS;
let BIKES;
let STREET_PROPS;
let LEDGES;
let LEDGE_BONES;
let LEDGE_FOODS;
let TACO_CARTS;
let TRASH_SPOTS;
let SPARK_POLES;
let DAY_TIME_SHARDS;
let NIGHT_TIME_SHARDS;
let SHOP_SIGNS;
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
let TREES;

function applyLevelData(level) {
  WORLD_W = level.world.width * S;
  WORLD_H = level.world.height * S;
  PLATFORMS = level.platforms;
  BONES = level.bones;
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
  FINAL_NIGHT_LIVES = level.finalNightLives || [];
  END_REWARD = level.endReward || null;
  PARKED_CARS = level.parkedCars;
  BIKES = level.bikes;
  STREET_PROPS = level.streetProps;
  LEDGES = level.ledges;
  LEDGE_BONES = level.ledgeBones;
  LEDGE_FOODS = level.ledgeFoods;
  TACO_CARTS = level.tacoCarts;
  TRASH_SPOTS = level.trashSpots;
  SPARK_POLES = level.sparkPoles || [];
  DAY_TIME_SHARDS = level.timeShards?.day || [];
  NIGHT_TIME_SHARDS = level.timeShards?.night || [];
  SHOP_SIGNS = level.shopSigns || [];
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
  TREES = level.trees || [];
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
    // One compact mobile-style presentation for every device. Input mode is
    // still handled separately by TouchControls.
    this.compactLayout = true;
    this.bonesCount = 0;
    this.won = false;
    this.gameOverFlag = false;
    this.guiOpen = true;
    this.touchWasVisible = false;
    // Scene instances and their old display groups survive scene.start();
    // clear cached references before rebuilding them for a fresh run.
    this.timeShardGroup = null;
    this.lowHealthActive = false;
    this.respawnNotice = null;
    this.endLayout = null;
    this.endTransition = false;
    this.hintTimer = 16;
    this.checkpointActive = false;
    this.checkpoint2Active = false;
    this.checkpointRespawnReady = false;
    this.spawnPoint = {
      x: this.levelData.spawn.x * S,
      y: this.levelData.spawn.y * S,
    };
    this.startedAt = this.time.now;
    this.dialogLineIndex = {};

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
    this.gateAlert = false;
    this.gateCallUsed = false;
    this.gateCallAchievementPending = false;
    this.gateDefenseAchievement = false;
    this.gatePromptOpen = false;
    this.gatePromptPausedAt = 0;
    this.gatePromptWasTouch = false;
    this.achievementToast = null;
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
    this.rivalsSubdued = 0;
    this.powerUps = 0;
    this.score = 0;
    this.rank = 'D';
    this.poloGift = true;
    this.bellRung = false;
    this.finalNightLivesSpawned = false;
    this.gateErrandDone = false;
    this.nightRivalsSubdued = 0;
    this.nextAlarm = 0;
    this.nextAllyBark = 0;
    this.nextChirp = 0;
    this.nextDistantBark = 0;
    this.nextRooster = 0;
    this.interactQueued = false;
    this.actionQueued = false;
    this.nextInteractAt = 0;
    this.nextSpinAt = 0;
    this.spinBufferAt = 0;
    this.activeInteractable = null;
    this.dialogOpen = false;
    this.dialogTimer = null;
    this.dialogPausedAt = 0;
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
    this.createEdgeGround();
    this.createForegroundHouses();
    this.createLedges();
    this.createTrees();
    this.createInteractiveProps();
    this.createSparkPoles();
    if (this.features.porch !== false) this.createPorch();
    if (this.features.gateDefense !== false) this.createPorchGate();
    if (this.features.errands !== false) this.createAllyNpcs();
    this.setupInteractables();
    this.createInput();
    this.createDog();
    this.createWaspNests();
    this.createTimeShards();
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
    this.setupLightingFX();
    this.queueClockHint(this.showIntro() + 500);
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
    this.skyNight?.setPosition(W / 2, 72 * S).setSize(W, 144 * S);
    this.envHaze?.setPosition(W / 2, 72 * S).setSize(W, 144 * S);
    this.nightOverlay?.setPosition(W / 2, 72 * S).setSize(W, 144 * S);

    const hudRight = W - 8 * S;
    if (this.boneText) {
      this.boneText.x = this.compactLayout ? 132 * S : hudRight;
    }
    if (this.storyLabel?.active) this.storyLabel.x = W / 2;
    if (this.comboText) this.comboText.x = hudRight;
    if (this.objectivesButton) this.objectivesButton.x = hudRight;
    if (this.hint) this.hint.x = W / 2;
    if (this.introLabel?.active) this.introLabel.x = W / 2;
    if (this.phaseBanner?.active) this.phaseBanner.x = W / 2;
    this.gateCallButton?.setPosition(W / 2, 42 * S);
    this.layoutClockHud(W);
    this.uiCamera?.setViewport(0, 0, W, this.scale.height).setScroll(0, 0);

    this.touch?.relayout(W);
    this.layoutDialog(W);
    this.layoutGatePrompt(W);
    this.layoutObjectives(W);
    this.layoutEndScreen(W);
  }

  layoutEndScreen(W) {
    const e = this.endLayout;
    if (!e?.overlay?.active) return;
    const cardW = Math.min(W - 64 * U, 440 * U);
    e.cardW = cardW;
    e.overlay.setPosition(W / 2, 72 * S).setSize(W, 144 * S);
    if (e.card) {
      drawFolkCard(e.card, W / 2, 144 * U, cardW, 220 * U);
    }
    e.title.x = W / 2;
    e.stats.x = W / 2;
    if (e.epilogue) {
      e.epilogue.x = W / 2;
      e.epilogue.setWordWrapWidth(cardW - 24 * U);
    }
    if (e.rank) e.rank.x = W / 2;
    if (e.promptButton) {
      e.promptButton.setPosition(W / 2, e.promptY);
    }
    if (e.mapButton) {
      const touch = this.compactLayout;
      const mapY =
        144 * U +
        110 * U -
        (touch ? 8 * U : 18 * U) -
        e.mapButton.h / 2;
      const mapX = touch
        ? W / 2
        : W / 2 + cardW / 2 - 20 * U - e.mapButton.w / 2;
      e.mapButton.setPosition(mapX, mapY);
    }
  }

  update(time, delta) {
    if (this.gatePromptOpen) return;
    if (this.objectivesOpen) return;
    if (this.dialogOpen) {
      if (this.consumeInteractPress() || this.consumeActionPress()) {
        this.closeDialog();
      }
      return;
    }
    const dt = delta / 1000;

    if (!this.won && !this.gameOverFlag) {
      this.dog.update(delta);
      this.updateCheckpoints();
      this.updateErrands();
      this.updateSparkPoles();
      this.updateWaspNests();
      this.updateSpinAttack();
      this.updateSlideTrail();
      if (this.spinBufferAt && this.time.now >= this.spinBufferAt) {
        this.spinBufferAt = 0;
        this.spinAttack();
      }
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
    this.updateLightingFX(delta);
    this.updateBossTracker();
    this.updateHud(delta);
    this.updateInteractions();
    this.updateCritters();
    this.updateNightFliers(dt);
    this.keepDogInBounds();
    this.updateAlphaCrown();
    this.updateAlphaSafety();

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

  updateAlphaSafety() {
    if (
      !this.alphaActive ||
      this.alphaDefeated ||
      !this.alpha?.active ||
      this.won ||
      this.gameOverFlag
    ) {
      return;
    }

    const platform = PLATFORMS.find(
      (p) =>
        this.alpha.x / S >= p.x &&
        this.alpha.x / S <= p.x + p.w,
    );
    if (platform?.y != null) {
      const floorTop = platform.y * S;
      const bottom = this.alpha.body.bottom;
      if (bottom > floorTop + 2 * S) {
        // Stunned bosses can lose their platform collision for a frame. Put
        // the body back on the pavement before it visibly sinks through it.
        const correction = bottom - floorTop;
        this.alpha.y -= correction;
        this.alpha.body.y -= correction;
        if (this.alpha.body.velocity.y > 0) {
          this.alpha.body.setVelocityY(0);
        }
      }
      return;
    }

    const floorLimit = ((this.levelData.enemySpawnY ?? 587) + 30) * S;
    if (this.alpha.y <= floorLimit) return;

    const x = (this.levelData.bossSpawnX ?? this.dog.x / S) * S;
    const y = (this.levelData.enemySpawnY ?? 587) * S;
    this.alpha.body.reset(x, y);
    this.alpha.body.setVelocity(0, 0);
    this.floatText(x, y - 24 * S, t('bark'), FOLK_CSS.gold);
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
      .setScrollFactor(0.04, 0)
      .setDepth(-28)
      .setAlpha(0.95);

    this.moon = this.add
      .image(W * 0.74, 48 * S, 'moon')
      .setScrollFactor(0.04, 0)
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

    // Night falls over La Cuadra.
    this.nightOverlay = this.add
      .rectangle(W / 2, 72 * S, W, 144 * S, 0x0b0614, 1)
      .setScrollFactor(0)
      .setDepth(9.5)
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
    this.streetLightCones = [];
    this.lampGlows = [];

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
            fontFamily: FONT,
            fontSize: GAME_TEXT.heading,
            color: FOLK_CSS.gold,
            stroke: FOLK_CSS.ink,
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

      if (prop.key === 'streetlamp') {
        this.streetLightCones.push(
          this.add
            .image(prop.x * S, groundY, 'lightCone')
            .setOrigin(0.5, 1)
            .setDepth(61)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setVisible(false),
        );
        this.lampGlows.push(
          this.add
            .image(prop.x * S, (600 - 51) * S, 'lampGlow')
            .setDepth(61)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setVisible(false),
        );
      }
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

  createEdgeGround() {
    const pad = CAMERA_EDGE_PAD;
    const groundH = 300;
    const worldW = WORLD_W / S;
    const edges = [
      { x: -pad, seed: 0x1ed6e },
      { x: worldW, seed: 0x2f8a1 },
    ];

    for (const edge of edges) {
      const key = `edgeGround_${this.levelId}_${edge.x}_${pad}`;
      makePlatformTexture(this, key, pad, groundH, edge.seed);
      const img = this.add
        .image(
          (edge.x + pad / 2) * S,
          (600 + groundH / 2) * S,
          key,
        )
        .setDepth(1);
      if (this.levelData.platformTint) img.setTint(this.levelData.platformTint);
    }
  }

  createForegroundHouses() {
    this.foregroundHouseGroup = this.physics.add.staticGroup();
    this.windowGlows = [];

    for (const h of FOREGROUND_HOUSES) {
      // Decorative facade: no wall body, so Bonjo walks in front of it.
      this.add
        .image(h.x * S, 520 * S, h.key)
        .setOrigin(0.5, 0)
        .setDepth(4);

      this.windowGlows.push(
        this.add
          .image(h.x * S, 520 * S, 'foregroundWindows')
          .setOrigin(0.5, 0)
          .setDepth(9.8)
          .setVisible(false),
      );

      // Warm string lights along the house front.
      this.add
        .tileSprite(h.x * S, 522 * S, 110 * S, 14 * S, 'stringLights')
        .setOrigin(0.5, 0)
        .setDepth(4.5);

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
      const ledgeH = l.kind === 'terrace' ? 24 : 12;
      makeLedgeTexture(this, key, l.w, l.kind);
      const ledge = this.oneWayGroup.create(
        (l.x + l.w / 2) * S,
        (l.y + ledgeH / 2) * S,
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
      .setScale(ROOSTER_SCALE)
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
        this.floatText(cat.x, cat.y - 18 * S, t('float.hiss'), FOLK_CSS.danger);
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
          FOLK_CSS.gold,
        );
        this.tweens.add({
          targets: this.rooster,
          scaleY: ROOSTER_SCALE * 1.12,
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
        this.floatText(rival.x, rival.y - 20 * S, t('bark'), FOLK_CSS.gold);
        this.nextDistantBark = now + 5000 + Math.random() * 4000;
      }
    }
  }

  scatterBird(bird) {
    if (bird.getData('scattered')) return;
    bird.setData('scattered', true);

    const dir = bird.x <= this.dog.x ? -1 : 1;
    sfx.chirp();
    this.floatText(bird.x, bird.y - 16 * S, t('float.chirp'), FOLK_CSS.gold);
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

  createTrees() {
    for (const tree of TREES) {
      const key = tree.size === 'large' ? 'treeLarge' : 'treeSmall';
      this.add
        .image(tree.x * S, 600 * S, key)
        .setOrigin(0.5, 1)
        .setDepth(0.4);
    }
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

  createSparkPoles() {
    this.streetLightCones = this.streetLightCones || [];
    this.lampGlows = this.lampGlows || [];
    this.sparkPoles = SPARK_POLES.map((x, i) => {
      const worldX = x * S;
      const pole = this.add
        .image(worldX, 600 * S, 'streetlamp')
        .setOrigin(0.5, 1)
        .setDepth(2.4);
      const cone = this.add
        .image(worldX, 600 * S, 'lightCone')
        .setOrigin(0.5, 1)
        .setDepth(61)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setVisible(false);
      const arc = this.add
        .image(worldX, 600 * S, 'sparkArc')
        .setOrigin(0.5, 1)
        .setDepth(9.9)
        .setVisible(false);
      const glow = this.add
        .image(worldX, (600 - 51) * S, 'lampGlow')
        .setDepth(61)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setVisible(false);
      this.streetLightCones.push(cone);
      this.lampGlows.push(glow);
      return {
        designX: x,
        x: worldX,
        y: 600 * S,
        pole,
        cone,
        glow,
        arc,
        offset: i * 1.65,
        live: false,
        wasLive: false,
      };
    });
  }

  setStreetLights(night) {
    for (const cone of this.streetLightCones || []) {
      cone.setVisible(night).setAlpha(night ? 0.8 : 0);
    }
    for (const glow of this.lampGlows || []) {
      glow.setVisible(night).setAlpha(night ? 0.9 : 0);
    }
    for (const glow of this.windowGlows || []) {
      glow.setVisible(night).setAlpha(night ? 0.95 : 0);
    }
    for (const glow of this.nightGlows || []) {
      glow.setVisible(night).setAlpha(night ? 1 : 0);
    }
    const theme = this.levelData.theme || {};
    if ((theme.town || 'town') === 'town') {
      this.town?.setTexture(night ? 'townNight' : 'town');
    } else if (theme.town === 'orillasTown') {
      this.town?.setTexture(night ? 'orillasTownNight' : 'orillasTown');
    }
    if ((theme.nearTown || 'nearTown') === 'nearTown') {
      this.nearTown?.setTexture(night ? 'nearTownNight' : 'nearTown');
    }
  }

  updateSparkPoles() {
    if (this.won || this.gameOverFlag || !this.sparkPoles?.length) return;
    if (!this.dog?.body || this.dog.dead) return;

    const seconds = this.time.now / 1000;
    for (const spark of this.sparkPoles) {
      const t = (seconds + spark.offset) % SPARK_CYCLE_SECONDS;
      const warning = t < SPARK_WARN_SECONDS;
      const warningSparks =
        warning && t > SPARK_WARN_SECONDS - 0.42;
      const live =
        t >= SPARK_WARN_SECONDS &&
        t < SPARK_WARN_SECONDS + SPARK_LIVE_SECONDS;

      if (live !== spark.wasLive) {
        spark.wasLive = live;
        if (live && Math.abs(this.dog.x - spark.x) < 180 * S) sfx.zap();
      }
      spark.live = live;

      spark.pole.setAlpha(
        warning && Math.sin(seconds * 52) > 0 ? 1 : warning ? 0.62 : 1,
      );
      spark.pole.setTint(
        live ? 0xc8efff : warningSparks ? 0xfff4e0 : 0xffffff,
      );
      spark.arc
        .setVisible(live || warningSparks)
        .setAlpha(
          live
            ? 0.78 + 0.22 * Math.abs(Math.sin(seconds * 45))
            : 0.18,
        )
        .setScale(live ? 1 : 0.82);

      if (spark.cone.visible) {
        spark.cone.setAlpha(live ? 0.18 : warning ? 0.58 : 0.8);
      }
      if (spark.glow.visible) {
        spark.glow.setAlpha(live ? 0.16 : warning ? 0.55 : 0.9);
      }

      if (!live || this.dog.invuln > 0) continue;

      const body = this.dog.body;
      const left = body.x;
      const right = body.x + body.width;
      const top = body.y;
      const bottom = body.y + body.height;
      const reach = 22 * S;
      const arcTop = (600 - 20) * S;
      if (
        right > spark.x - reach &&
        left < spark.x + reach &&
        bottom > arcTop &&
        top < 600 * S
      ) {
        this.hurt(spark);
      }
    }
  }

  createPorchGate() {
    this.porchGate = this.add
      .image(GATE_X * S, 600 * S, 'gate')
      .setOrigin(0.5, 1)
      .setDepth(2.5);

    this.gateSign = this.add
      .text(GATE_X * S, 600 * S - 34 * S, t('porch.sign'), {
        fontFamily: FONT,
        fontStyle: 'bold',
        fontSize: GAME_TEXT.body,
        color: FOLK_CSS.cream,
        stroke: FOLK_CSS.ink,
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
      .image(POLO_X * S, 600 * S - 48 * S, 'conchaIcon')
      .setScale(0.35)
      .setDepth(4)
      .setAlpha(0.9);
    this.bellIcon = this.add
      .image(BELL_X * S, 600 * S - 38 * S, 'bell')
      .setScale(1)
      .setDepth(4)
      .setAlpha(0.95);

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
    // Enemies and pickups keep their existing jump/slide/overlap verbs.
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

  nextDialogLine(key, lines) {
    if (!lines?.length) return null;
    this.dialogLineIndex = this.dialogLineIndex || {};
    const previous = this.dialogLineIndex[key];
    const index =
      previous == null
        ? Phaser.Math.Between(0, lines.length - 1)
        : (previous + 1) % lines.length;
    this.dialogLineIndex[key] = index;
    return lines[index];
  }

  talkToChihuahua() {
    this.alertChihuahua();
    const lines =
      this.phase === 'day' ? CHIHUAHUA_DAY_LINES : CHIHUAHUA_NIGHT_LINES;
    this.showDialog(
      'name.chihuahua',
      this.nextDialogLine(`chihuahua-${this.phase}`, lines),
    );
  }

  talkToCat(cat) {
    const key = cat ? `cat-${cat.x}` : 'cat';
    this.showDialog('name.cat', this.nextDialogLine(key, CAT_LINES));
  }

  talkToRooster() {
    sfx.rooster();
    this.showDialog(
      'name.rooster',
      this.nextDialogLine('rooster', ROOSTER_LINES),
    );
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

    this.windowGlows = this.windowGlows || [];
    this.windowGlows.push(
      this.add
        .image(porch.x * S, 600 * S, 'bonjoHouseWindows')
        .setOrigin(0.5, 1)
        .setDepth(9.8)
        .setVisible(false),
    );

    // Warm string lights along the front of Casa.
    this.add
      .tileSprite(porch.x * S, 522 * S, (porch.roofWidth + 20) * S, 14 * S, 'stringLights')
      .setOrigin(0.5, 0)
      .setDepth(4.5);

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
      const point = this.randomPickupPoint(x, y);
      this.spawnFoodAt(point.x * S, point.y * S);
    }

    this.physics.add.overlap(this.dog, this.foodGroup, this.eatFood, null, this);
  }

  randomPickupPoint(x, y) {
    // Spread pickups across three height bands so they do not read as a single
    // ground row: low, mid-air and high-air.
    const tier = Phaser.Math.Between(0, 2);
    const lift =
      tier === 0
        ? Phaser.Math.Between(4, 18)
        : tier === 1
          ? Phaser.Math.Between(25, 50)
          : Phaser.Math.Between(55, 90);
    return {
      x: x + Phaser.Math.Between(-30, 30),
      y: y - lift,
    };
  }

  spawnFoodAt(x, y, opts = {}) {
    const food = this.foodGroup.create(x, y, 'conchaIcon');
    food.setDepth(ENTITY_DEPTH);
    food.setScale(0.6);
    food.body.setSize(10 * S, 6 * S);

    this.tweens.add({
      targets: food,
      alpha: 0.6,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    if (opts.groundY != null) this.dropPickupToGround(food, opts.groundY);
    return food;
  }

  eatFood(dog, food) {
    if (!food.active) return;

    food.disableBody(true, true);
    this.runStats.food += 1;
    this.grantStamina(1);
    this.updateSurvivalHud();

    sfx.concha();
    this.spawnPuff(food.x, food.y, 0.7);
    this.floatText(food.x, food.y - 8 * S, t('float.charge'), FOLK_CSS.mint);
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
    this.endReward.setDepth(ENTITY_DEPTH);
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
      FOLK_CSS.gold,
    );
  }

  spawnLifeAt(x, y, opts = {}) {
    const life = this.lifeGroup.create(x, y, 'lifeHeart');
    life.setDepth(ENTITY_DEPTH);
    life.body.setSize(16 * S, 16 * S);
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

    if (opts.groundY != null) this.dropPickupToGround(life, opts.groundY);
    return life;
  }

  collectLife(dog, life) {
    if (!life.active) return;

    const gained = this.gainLife();
    if (!gained) {
      // Leave the heart for later instead of wasting it at full health.
      if (this.time.now >= (life.getData('hintAt') || 0)) {
        life.setData('hintAt', this.time.now + 900);
        this.floatText(life.x, life.y - 8 * S, t('float.lifeFull'), FOLK_CSS.gold);
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
      FOLK_CSS.danger,
    );
  }

  healHealth(amount = 1) {
    const before = this.health;
    this.health = Math.min(this.maxHealth, this.health + amount);
    if (this.health !== before) this.updateSurvivalHud();
    return this.health - before;
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
    this.floatText(cart.x, cart.y - 26 * S, t('float.taco'), FOLK_CSS.mint);
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
    this.floatText(can.x, can.y - 22 * S, t('float.crash'), FOLK_CSS.gold);

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
    this.floatText(bike.x, bike.y - 16 * S, t('float.crash'), FOLK_CSS.danger);
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
    this.floatText(this.alarmCar.x, this.alarmCar.y - 38 * S, t('float.alarm'), FOLK_CSS.gold);
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
      if (this.consumeInteractPress() || this.consumeActionPress()) {
        this.closeDialog();
      }
      return;
    }

    const item = this.findInteractable();
    this.activeInteractable = item;
    this.touch?.setInteractAvailable(!!item);
    this.updateInteractionPrompt(item);

    if (this.consumeInteractPress() && item) item.action();
    if (this.consumeActionPress()) this.spinAttack();
  }

  spinAttack() {
    if (this.won || this.gameOverFlag || this.dog.dead || this.dialogOpen) return;
    const now = this.time.now;
    if (now < this.nextSpinAt) {
      // Keep one press buffered so a slightly early input fires as soon as the
      // short recovery ends instead of being lost.
      this.spinBufferAt = this.nextSpinAt;
      return;
    }
    this.spinBufferAt = 0;
    this.nextSpinAt = now + SPIN_COOLDOWN_MS;
    this.dog.dodgeUntil = Math.max(this.dog.dodgeUntil, now + 180);

    this.dog.spinStart = now;
    this.dog.spinUntil = now + SPIN_DURATION_MS;
    this.dog.spinDir = this.dog.facing >= 0 ? 1 : -1;
    // Keep a fresh jump rising through the spin; otherwise releasing jump to
    // tap the spin button can trigger the jump cut mid-attack.
    if (this.dog.body.velocity.y < 0) this.dog.jumpCutReady = false;

    sfx.spin();
    this.spawnPuff(this.dog.x, this.dog.y, 1);

    // The halo is the visual boundary of the spin's hit area, not a second
    // damage source. It follows Bonjo for the whole spin, so moving or jumping
    // carries the ring and its damage window with him.
    const radius = 18 * S;
    const ringBase = 6 * S;
    this.spinRadius = radius;
    this.spinHitTargets = new Set();
    this.spinRing?.destroy();
    this.spinTail?.destroy();
    this.spinTail = this.add.graphics().setDepth(9);
    const ring = this.add
      .circle(this.dog.x, this.dog.y, ringBase, 0x000000, 0)
      .setStrokeStyle(3 * S, 0xffd166, 0.9)
      .setDepth(9);
    this.spinRing = ring;
    this.tweens.add({
      targets: ring,
      scale: radius / ringBase,
      alpha: 0,
      duration: SPIN_RING_MS,
      ease: 'Quad.out',
      onComplete: () => {
        ring.destroy();
        if (this.spinRing === ring) this.spinRing = null;
      },
    });

    this.updateSpinAttack();
  }

  updateSpinAttack() {
    if (this.dog.spinUntil <= this.time.now) {
      this.spinHitTargets = null;
      this.spinTail?.destroy();
      this.spinTail = null;
      return;
    }

    const radius = this.spinRadius || 18 * S;
    this.spinRing?.setPosition(this.dog.x, this.dog.y);
    this.drawSpinTail();
    const hitTargets =
      this.spinHitTargets || (this.spinHitTargets = new Set());

    for (const rival of this.rivalGroup?.getChildren() || []) {
      if (
        rival.active &&
        !rival.defeated &&
        !hitTargets.has(rival) &&
        this.inSpinRange(rival, radius)
      ) {
        hitTargets.add(rival);
        this.applySpinHit(rival);
      }
    }

    for (const squirrel of this.squirrelGroup?.getChildren() || []) {
      if (
        squirrel.active &&
        !squirrel.defeated &&
        !hitTargets.has(squirrel) &&
        this.inSpinRange(squirrel, radius)
      ) {
        hitTargets.add(squirrel);
        this.spinHitSquirrel(squirrel);
      }
    }

    for (const crow of this.crowGroup?.getChildren() || []) {
      if (
        crow.active &&
        !crow.defeated &&
        !hitTargets.has(crow) &&
        this.inSpinRange(crow, radius)
      ) {
        hitTargets.add(crow);
        this.spinHitCrow(crow);
      }
    }

    for (const pinata of this.pinataGroup?.getChildren() || []) {
      if (
        pinata.active &&
        !hitTargets.has(pinata) &&
        this.inSpinRange(pinata, radius)
      ) {
        hitTargets.add(pinata);
        this.hitPinata(this.dog, pinata);
      }
    }
  }

  drawSpinTail() {
    if (!this.spinTail || !this.dog.spinUntil) return;

    const progress = Phaser.Math.Clamp(
      (this.time.now - this.dog.spinStart) /
        (this.dog.spinUntil - this.dog.spinStart),
      0,
      1,
    );
    const direction = this.dog.spinDir || 1;
    const end = -Math.PI / 2 + progress * Math.PI * 2 * direction;
    const start = end - 1.35 * direction;
    const tailRadius = 16 * S;
    const tail = this.spinTail;

    tail.clear();
    tail.lineStyle(6 * S, 0xf0a03c, 0.28);
    tail.beginPath();
    tail.arc(
      this.dog.x,
      this.dog.y,
      tailRadius,
      start,
      end,
      direction < 0,
    );
    tail.strokePath();
    tail.lineStyle(3.5 * S, 0xffd166, 0.95);
    tail.beginPath();
    tail.arc(
      this.dog.x,
      this.dog.y,
      tailRadius,
      start,
      end,
      direction < 0,
    );
    tail.strokePath();

    // Fluffy tail tip at the leading edge of the sweep.
    const tipX = this.dog.x + Math.cos(end) * tailRadius;
    const tipY = this.dog.y + Math.sin(end) * tailRadius;
    tail.fillStyle(0xfff4e0, 0.95);
    tail.fillCircle(tipX, tipY, 4 * S);
    tail.fillStyle(0xf0a03c, 0.75);
    tail.fillCircle(
      tipX - Math.cos(end) * 2 * S,
      tipY - Math.sin(end) * 2 * S,
      2.5 * S,
    );
  }

  inSpinRange(target, radius = 18 * S) {
    if (!target.body) return false;

    // Sprite origins and body offsets differ between Bonjo and each enemy.
    // Measure to the nearest edge of the target body so a visually adjacent
    // target still lands inside the same circular halo.
    const closestX = Phaser.Math.Clamp(
      this.dog.x,
      target.body.left,
      target.body.right,
    );
    const closestY = Phaser.Math.Clamp(
      this.dog.y,
      target.body.top,
      target.body.bottom,
    );
    return (
      Phaser.Math.Distance.Between(
        this.dog.x,
        this.dog.y,
        closestX,
        closestY,
      ) < radius
    );
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

  consumeActionPress() {
    const pressed = this.actionQueued || this.touch?.consumeAction() || false;
    this.actionQueued = false;
    return pressed;
  }

  armSpinGrace() {
    if (
      !this.dog ||
      this.won ||
      this.gameOverFlag ||
      this.dog.dead ||
      this.dialogOpen ||
      this.objectivesOpen
    ) {
      return;
    }
    // Input callbacks can arrive before the next physics step. Give the
    // queued tail sweep a tiny grace window so touching a rival on the press
    // frame does not turn into contact damage before the attack starts.
    if (this.time.now < this.nextSpinAt) return;
    this.dog.dodgeUntil = Math.max(this.dog.dodgeUntil, this.time.now + 180);
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
      FOLK_CSS.gold,
    );
  }

  errandsComplete() {
    if (this.features?.errands === false) return true;
    return !this.poloGift && this.bellRung;
  }

  nightErrandsComplete() {
    if (this.features?.errands === false) return true;
    return this.gateErrandDone && this.nightRivalsSubdued >= 2;
  }

  updateCheckpoints() {
    if (
      !this.checkpointActive &&
      Math.abs(this.dog.x - CHECKPOINT_X * S) < 20 * S
    ) {
      this.touchCheckpoint();
    }
    if (
      !this.checkpoint2Active &&
      Math.abs(this.dog.x - CHECKPOINT2_X * S) < 20 * S
    ) {
      this.touchCheckpoint2();
    }
  }

  updateErrands() {
    if (
      this.features?.errands === false ||
      this.phase !== 'night' ||
      this.gateErrandDone
    ) {
      return;
    }

    if (
      Math.abs(this.dog.x - GATE_X * S) < 42 * S &&
      Math.abs(this.dog.y - 600 * S) < 60 * S
    ) {
      this.gateErrandDone = true;
      this.floatText(GATE_X * S, 560 * S, t('errands.gateDone'), FOLK_CSS.mint);
      this.updateGoalHud();
    }
  }

  ringBell() {
    this.bellRung = true;
    sfx.bell();
    this.tweens.add({
      targets: this.bellIcon,
      angle: 8,
      duration: 90,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.inOut',
      onComplete: () => this.bellIcon?.setAngle(0),
    });
    const gained = this.gainLife();
    this.floatText(
      this.bellPost.x,
      this.bellPost.y - 54 * S,
      t('float.bell'),
      FOLK_CSS.gold,
    );
    if (gained) {
      sfx.life();
      this.spawnPuff(this.bellPost.x, this.bellPost.y - 28 * S, 1.1);
      this.floatText(
        this.bellPost.x,
        this.bellPost.y - 74 * S,
        t(gained === 'max' ? 'float.lifeMax' : 'float.life'),
        FOLK_CSS.danger,
      );
    } else {
      this.floatText(
        this.bellPost.x,
        this.bellPost.y - 74 * S,
        t('float.lifeFull'),
        FOLK_CSS.gold,
      );
    }
  }

  setGateCallVisible(visible) {
    if (!this.gateCallButton) return;
    this.gateCallButton.setVisible(visible);
    this.gateCallButton.setEnabled(visible);
  }

  openGatePrompt() {
    if (
      this.gatePromptOpen ||
      !this.gateAlert ||
      this.gateBroken ||
      this.gateCallUsed ||
      this.won ||
      this.gameOverFlag ||
      this.dog?.dead ||
      this.objectivesOpen ||
      this.dialogOpen
    ) {
      return;
    }
    if (!this.gatePromptRoot) return;

    this.gatePromptOpen = true;
    this.gatePromptWasTouch = !!this.touch?.visible;
    this.gatePromptPausedAt = this.time.now;
    this.setGateCallVisible(false);
    this.interactPrompt?.setVisible(false);
    this.interactBubble?.setVisible(false);
    this.touch?.show(false);
    this.gatePromptScrim.setVisible(true);
    this.gatePromptScrim.input.enabled = true;
    this.gatePromptRoot.setVisible(true);
    this.gatePromptYes.setVisible(true).setEnabled(true);
    this.gatePromptNo.setVisible(true).setEnabled(true);
    this.physics.world.pause();
    this.time.paused = true;
    this.tweens.pauseAll();
  }

  closeGatePrompt() {
    if (!this.gatePromptOpen) return;
    this.gatePromptOpen = false;
    this.gatePromptScrim.setVisible(false);
    this.gatePromptScrim.input.enabled = false;
    this.gatePromptRoot.setVisible(false);
    this.gatePromptYes.setVisible(false).setEnabled(false);
    this.gatePromptNo.setVisible(false).setEnabled(false);
    if (this.gatePromptPausedAt) {
      // Keep menu-reading time out of the run score.
      this.startedAt += this.time.now - this.gatePromptPausedAt;
      this.gatePromptPausedAt = 0;
    }
    this.physics.world.resume();
    this.time.paused = false;
    this.tweens.resumeAll();
    if (this.gatePromptWasTouch) this.touch?.show(true);
    this.gatePromptWasTouch = false;
  }

  answerGatePrompt(yes) {
    if (!this.gatePromptOpen) return;
    this.closeGatePrompt();
    if (yes) this.acceptGateCall();
    else this.failGateDefense();
  }

  failGateDefense() {
    if (this.gateBroken || this.won || this.gameOverFlag) return;
    this.gateCallUsed = true;
    this.gateCallAchievementPending = false;
    this.setGateCallVisible(false);

    const rusher = this.rivalGroup
      ?.getChildren()
      .find((rival) => rival.role === 'rusher' && rival.active && !rival.defeated);
    this.gateHealth = 1;
    this.damageGate(rusher || null);
    this.gateAlert = false;
    this.showPhaseBanner(t('gate.failed'), FOLK_CSS.danger, { hold: 1200 });
  }

  acceptGateCall() {
    if (
      this.gatePromptOpen ||
      !this.gateAlert ||
      this.gateBroken ||
      this.gateCallUsed ||
      this.won ||
      this.gameOverFlag ||
      this.dog?.dead ||
      this.objectivesOpen ||
      this.dialogOpen
    ) {
      return;
    }

    this.gateCallUsed = true;
    this.gateCallAchievementPending = true;
    this.setGateCallVisible(false);

    const x = (GATE_X + 32) * S;
    const y = 580 * S;
    this.dog.body.reset(x, y);
    this.dog.setVelocity(0, 0);
    this.dog.facing = -1;
    this.dog.setFlipX(true);
    this.dog.invuln = Math.max(this.dog.invuln, 1.2);
    this.cameras.main.centerOn(x, 570 * S);
    this.cameras.main.flash(150, 255, 209, 102);
    this.spawnPuff(x, y, 1.1);
    this.floatText(x, y - 38 * S, t('gate.arrived'), FOLK_CSS.gold);
    sfx.checkpoint();
  }

  unlockGateAchievement() {
    if (this.gateBroken) return;
    this.gateCallAchievementPending = false;
    if (this.gateDefenseAchievement) return;
    this.gateDefenseAchievement = true;
    this.showAchievementToast(t('achievement.gatekeeper'));
    sfx.checkpoint();
  }

  showAchievementToast(name) {
    const W = this.scale.width;
    this.achievementToast?.destroy();
    const toast = this.add
      .text(W / 2, 52 * S, t('achievement.unlocked', { name }), {
        fontFamily: FONT,
        fontStyle: 'bold',
        fontSize: GAME_TEXT.body,
        color: FOLK_CSS.cream,
        backgroundColor: FOLK_CSS.ink,
        padding: { x: 8 * U, y: 4 * U },
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(140)
      .setAlpha(0);
    this.achievementToast = toast;
    this.tweens.add({
      targets: toast,
      y: toast.y - 8 * S,
      alpha: 1,
      duration: 180,
      hold: 1500,
      yoyo: true,
      onComplete: () => {
        toast.destroy();
        if (this.achievementToast === toast) this.achievementToast = null;
      },
    });
  }

  alertChihuahua() {
    if (!this.chihuahua?.active || this.time.now < this.nextAllyBark) return;
    this.nextAllyBark = this.time.now + 900;
    sfx.bark();
    this.floatText(
      this.chihuahua.x,
      this.chihuahua.y - 22 * S,
      t('bark'),
      FOLK_CSS.gold,
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
      if (this.gatePromptOpen) return;
      if (this.won) {
        this.advanceAfterWin();
        return;
      }
      this.closeObjectives();
      this.scene.restart();
    });
    this.input.keyboard.on('keydown-E', () => {
      if (this.gatePromptOpen) return;
      this.armSpinGrace();
      this.actionQueued = true;
    });
    this.input.keyboard.on('keydown-F', () => {
      if (this.gatePromptOpen) return;
      this.interactQueued = true;
    });
    this.input.keyboard.on('keydown-G', () => this.openGatePrompt());
    this.input.keyboard.on('keydown-Y', () => {
      if (this.gatePromptOpen) this.answerGatePrompt(true);
    });
    this.input.keyboard.on('keydown-N', () => {
      if (this.gatePromptOpen) {
        this.answerGatePrompt(false);
        return;
      }
      // Dev helper: skip to the next phase without waiting.
      if (import.meta.env.DEV && !this.won && !this.gameOverFlag) {
        this.phaseTime = 0;
      }
    });
    this.input.keyboard.on('keydown-O', () => this.toggleObjectives());
    this.input.keyboard.on('keydown-M', () => {
      if (this.won || this.gameOverFlag) this.scene.start('Map');
    });
    this.input.on('pointerdown', () => {
      if (this.dialogOpen) this.closeDialog();
    });

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

  createWaspNests() {
    const nestingTrees = TREES.filter((tree) => tree.nest);
    if (!nestingTrees.length) return;

    this.waspNestGroup = this.physics.add.staticGroup();
    this.waspNests = [];
    nestingTrees.forEach((tree, i) => {
      const nest = this.waspNestGroup
        .create((tree.x + 12) * S, 572 * S, 'waspNest')
        .setDepth(3);
      // Extend the sting zone well below the visual nest so Bonjo cannot
      // simply walk underneath it.
      nest.body.setSize(14 * S, 42 * S);
      nest.body.enable = false;
      const swarm = this.add
        .image(nest.x, nest.y, 'waspSwarm')
        .setDepth(3.1)
        .setVisible(false);
      this.waspNests.push({ nest, swarm, offset: i * 1.65 });
    });
    this.physics.add.overlap(
      this.dog,
      this.waspNestGroup,
      this.hitWaspNest,
      null,
      this,
    );
  }

  updateWaspNests() {
    if (this.won || this.gameOverFlag || !this.waspNests?.length) return;
    const seconds = this.time.now / 1000;
    for (const wasp of this.waspNests) {
      const t = (seconds + wasp.offset) % WASP_CYCLE_SECONDS;
      const warning = t < WASP_WARN_SECONDS;
      const warningSwarms = warning && t > WASP_WARN_SECONDS - 0.4;
      const active =
        t >= WASP_WARN_SECONDS &&
        t < WASP_WARN_SECONDS + WASP_ACTIVE_SECONDS;

      wasp.nest.body.enable = active;
      wasp.nest
        .setAngle(warning ? Math.sin(seconds * 50) * 3 : 0)
        .setAlpha(warning ? 0.78 : 1)
        .setTint(active ? 0xffd166 : 0xffffff);
      wasp.swarm
        .setVisible(active || warningSwarms)
        .setAlpha(active ? 0.95 : 0.25)
        .setScale(active ? 1 : 0.8);
    }
  }

  hitWaspNest(dog, nest) {
    if (
      this.won ||
      this.gameOverFlag ||
      dog.dead ||
      !nest.active ||
      dog.invuln > 0 ||
      !nest.body.enable
    ) {
      return;
    }
    this.hurt(nest);
    if (this.gameOverFlag || this.won) return;
    this.spawnPuff(nest.x, nest.y, 0.7);
    sfx.hiss();
  }

  createTimeShards() {
    if (!this.timeShardGroup) {
      this.timeShardGroup = this.physics.add.group({
        allowGravity: false,
        immovable: true,
      });
      this.physics.add.overlap(
        this.dog,
        this.timeShardGroup,
        this.collectTimeShard,
        null,
        this,
      );
    } else {
      this.timeShardGroup.clear(true, true);
    }

    const key = this.phase === 'day' ? 'sunShard' : 'moonShard';
    const worldWidth = WORLD_W / S;
    const phaseSlot = this.phase === 'day' ? 0 : 1;
    // Authored positions keep shards airborne and out of the foreground
    // facades. Day and night have independent routes so moon shards do not
    // simply retrace the sun-shard line.
    const fallback = Array.from({ length: TIME_SHARD_COUNT }, (_, i) => [
      180 + phaseSlot * 50 +
        i * ((worldWidth - 360 - phaseSlot * 50) / (TIME_SHARD_COUNT - 1)),
      520 - ((i + phaseSlot) % 3) * 20,
    ]);
    const authored =
      this.phase === 'day' ? DAY_TIME_SHARDS : NIGHT_TIME_SHARDS;
    const positions = authored.length ? authored : fallback;
    positions.forEach(([x, y], i) => {
      const shard = this.timeShardGroup.create(x * S, y * S, key);
      // Time shards glow through the night overlay, so keep them above it.
      shard.setDepth(ENTITY_DEPTH).setScale(0.9);
      shard.body.setSize(10 * S, 10 * S);
      this.tweens.add({
        targets: shard,
        alpha: 0.7,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 650 + (i % 3) * 80,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
      });
    });
  }

  collectTimeShard(dog, shard) {
    if (!shard.active || this.phaseTime <= 0) return;
    this.tweens.killTweensOf(shard);
    shard.disableBody(true, true);
    this.phaseTime = Math.max(0, this.phaseTime - TIME_SHARD_SECONDS);
    this.updateSurvivalHud();
    this.flashClock();
    this.spawnPuff(shard.x, shard.y, 0.6);
    this.floatText(
      shard.x,
      shard.y - 10 * S,
      `+${TIME_SHARD_SECONDS}s`,
      this.phase === 'day' ? FOLK_CSS.gold : FOLK_CSS.night,
      1100,
    );
    sfx.checkpoint();
  }

  createPickups() {
    // bones
    this.boneGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    for (const [x, y] of [...BONES, ...LEDGE_BONES]) {
      const point = this.randomPickupPoint(x, y);
      const bone = this.boneGroup.create(
        point.x * S,
        point.y * S,
        'boneIcon',
      );
      bone.setDepth(ENTITY_DEPTH);
      bone.setScale(0.7);
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

    // checkpoint balloon
    this.checkpoint = this.physics.add
      .staticImage(CHECKPOINT_X * S, CHECKPOINT_Y * S, 'balloon')
      .setDepth(ENTITY_DEPTH)
      .setTint(0x6a5a76);
    this.checkpoint.body.setSize(12 * S, 18 * S);
    this.physics.add.overlap(this.dog, this.checkpoint, this.touchCheckpoint, null, this);

    this.checkpoint2 = this.physics.add
      .staticImage(CHECKPOINT2_X * S, CHECKPOINT_Y * S, 'balloon')
      .setDepth(ENTITY_DEPTH)
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
    const hasShopfront = this.levelData.awningFacade === 'shopfront';
    const hasStall = this.levelData.awningFacade === 'stall';

    for (const [x, y] of AWNINGS) {
      if (hasStall) {
        this.add
          .image(x * S, 600 * S, 'awningStall')
          .setOrigin(0.5, 1)
          .setDepth(-0.2);
      }
      // Mount the canvas on a real storefront instead of leaving it floating
      // above the pavement.
      if (hasShopfront) {
        this.add
          .image(x * S, 600 * S, 'shopfront')
          .setOrigin(0.5, 1)
          .setDepth(1.5);
        this.windowGlows = this.windowGlows || [];
        this.windowGlows.push(
          this.add
            .image(x * S, 600 * S, 'shopfrontWindows')
            .setOrigin(0.5, 1)
            .setDepth(9.8)
            .setVisible(false),
        );
      }
      this.awningGroup.create(x * S, y * S, 'awning').setDepth(2);
    }

    this.physics.add.collider(
      this.dog,
      this.awningGroup,
      this.bounceAwning,
      this.canLandOnAwning,
      this,
    );

    this.nightGlows = this.nightGlows || [];
    for (const sign of SHOP_SIGNS) this.createNightSign(sign);
  }

  createNightSign(sign) {
    const x = sign.x * S;
    const y = sign.y * S;
    const text = this.add
      .text(x, y, sign.text, {
        fontFamily: FONT,
        fontStyle: 'bold',
        fontSize: GAME_TEXT.body,
        color: sign.color,
        stroke: FOLK_CSS.ink,
        strokeThickness: 1.4 * S,
      })
      .setOrigin(0.5)
      .setDepth(61)
      .setShadow(0, 0, sign.color, 6 * S, true, true)
      .setVisible(false);
    // Let the glowing lettering sit directly on the shop's sign band; a dark
    // plaque reads as a floating mask against the night sky.
    this.nightGlows.push(text);
  }

  createCamera() {
    const cam = this.cameras.main;
    cam.setBounds(
      -CAMERA_EDGE_PAD * S,
      0,
      WORLD_W + CAMERA_EDGE_PAD * 2 * S,
      WORLD_H,
    );
    // Let the camera scroll at sub-pixel precision. Phaser rounds a
    // roundPixels camera with floor(), so a lerped follow can stall up to
    // 10px short of its target and then creep there in visible 1px steps.
    // The renderer still snaps the world art to whole pixels.
    cam.startFollow(this.dog, false, tuning.cameraLerp, tuning.cameraLerp);
    cam.setFollowOffset(0, 30 * S);
    // Keep normal jumps from bobbing the whole backdrop. High routes still
    // pull the camera once Bonjo leaves this vertical band.
    cam.setDeadzone(1, 20 * S);
    // The deadzone stops jump bob but can leave the camera high after a
    // high-route descent. Remember the resting frame and return to it on the
    // street.
    this.cameraBaseScrollY = cam.scrollY;
    cam.fadeIn(350, 27, 16, 41);
  }

  setupLightingFX() {
    const renderer = this.game.renderer;
    if (!renderer?.pipelines) return;

    // Canvas and any WebGL device that rejects the post pipeline simply keep
    // the painted lamp cones, glows and flat night wash. The shader is an
    // enhancement, never a renderer requirement.
    try {
      renderer.pipelines.addPostPipeline('LampLighting', LampLightingPipeline);
      this.cameras.main.setPostPipeline('LampLighting');
      this.lampLightFX = this.cameras.main.getPostPipeline('LampLighting');
      if (Array.isArray(this.lampLightFX)) {
        this.lampLightFX = this.lampLightFX[0];
      }
      if (this.lampLightFX) {
        this.lampLightFX.intensity = 0;
        this.lampLightFX.lights = [];
        this.lampLightFX.hero = { x: -9999, y: -9999, r: 1, s: 0 };
      }
    } catch (error) {
      console.warn('Lamp lighting postFX unavailable; using lamp sprites.', error);
      this.lampLightFX = null;
    }

    if (!this.lampLightFX) return;

    // The shader darkens the world at night, so the HUD needs its own clean
    // camera. Without this split, cards and HUD text would sit inside the
    // lighting pass and lose contrast whenever night falls.
    const ui = this.cameras.add(
      0,
      0,
      this.scale.width,
      this.scale.height,
      false,
      'hud',
    );
    ui.setScroll(0, 0);
    ui.setBackgroundColor('rgba(0,0,0,0)');
    this.uiCamera = ui;

    // Classify the display list by depth: HUD starts at 90, every world prop
    // is at or below 61. New objects are sorted once their depth is set.
    this.cameraSplitSeen = new Set();
    this.pendingCameraObjects = [];
    for (const object of this.children.list.slice()) {
      this.assignCameraVisibility(object);
    }

    this.cameraObjectAdded = (gameObject) => {
      this.pendingCameraObjects.push(gameObject);
    };
    this.sys.displayList.events.on(
      Phaser.Scenes.Events.ADDED_TO_SCENE,
      this.cameraObjectAdded,
    );
    this.events.on(
      Phaser.Scenes.Events.POST_UPDATE,
      this.syncCameraVisibility,
      this,
    );
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.sys.displayList.events.off(
        Phaser.Scenes.Events.ADDED_TO_SCENE,
        this.cameraObjectAdded,
      );
      this.events.off(
        Phaser.Scenes.Events.POST_UPDATE,
        this.syncCameraVisibility,
        this,
      );
    });

    // The main camera began fading in before the HUD camera existed.
    ui.fadeIn(350, 27, 16, 41);
  }

  assignCameraVisibility(gameObject) {
    if (!gameObject || this.cameraSplitSeen.has(gameObject)) return;
    this.cameraSplitSeen.add(gameObject);
    if ((gameObject.depth ?? 0) >= 90) {
      this.cameras.main.ignore(gameObject);
    } else {
      this.uiCamera.ignore(gameObject);
    }
  }

  syncCameraVisibility() {
    if (!this.pendingCameraObjects?.length) return;
    for (const object of this.pendingCameraObjects) {
      this.assignCameraVisibility(object);
    }
    this.pendingCameraObjects.length = 0;
  }

  updateLightingFX(delta) {
    const fx = this.lampLightFX;
    if (!fx) return;

    // The existing night wash still owns ambient darkness. This pass adds the
    // lamp pools, Bonjo halo and selective bloom without changing the scene's
    // base exposure; it can fade independently at dawn.
    const target = this.phase === 'night' ? 1 : 0;
    const blend = 1 - Math.pow(0.0025, delta / 1000);
    fx.intensity = Phaser.Math.Linear(fx.intensity, target, blend);
    fx.time = this.time.now / 1000;

    const cam = this.cameras.main;
    const lights = [];
    for (const glow of this.lampGlows || []) {
      if (lights.length >= 8) break;
      // Follow the lamp sprite's own state so sparking poles dim their shader
      // pool during the live-wire phase instead of glowing at full strength.
      const alpha = glow.visible ? glow.alpha : 0;
      if (alpha <= 0.01) continue;
      const spark = this.sparkPoles?.find((pole) => pole.glow === glow);
      lights.push({
        x: glow.x - cam.scrollX,
        // PostFX quad coordinates are bottom-up, so flip the camera-space Y.
        y: cam.height - (glow.y - cam.scrollY),
        r: 54 * S,
        s: 0.36 * alpha,
        color: spark?.live ? SPARK_LIGHT_COLOR : WARM_LIGHT_COLOR,
      });
    }
    fx.lights = lights;

    // Selective point bloom. The shader adds a soft halo around emissive
    // gameplay elements only; the world camera means HUD text stays crisp.
    const bloom = [];
    const pushBloom = (screenX, screenY, radius, strength, color) => {
      if (bloom.length >= BLOOM_MAX || strength <= 0.01) return;
      if (
        screenX < -radius ||
        screenX > cam.width + radius ||
        screenY < -radius ||
        screenY > cam.height + radius
      ) {
        return;
      }
      bloom.push({
        x: screenX,
        y: screenY,
        r: radius,
        s: strength,
        color,
      });
    };
    const pushWorldBloom = (worldX, worldY, radius, strength, color) =>
      pushBloom(
        worldX - cam.scrollX,
        cam.height - (worldY - cam.scrollY),
        radius,
        strength,
        color,
      );

    const shardColor =
      this.phase === 'day' ? SUN_BLOOM_COLOR : MOON_BLOOM_COLOR;
    for (const shard of this.timeShardGroup?.getChildren() || []) {
      if (!shard.active || !shard.visible) continue;
      pushWorldBloom(shard.x, shard.y, 18 * S, 0.5, shardColor);
      if (bloom.length >= BLOOM_MAX) break;
    }

    // The sun and moon keep their baked halos in the background layers. They
    // deliberately do not join the screen-space bloom, which cannot respect
    // building depth and would shine through roofs.
    for (const spark of this.sparkPoles || []) {
      if (bloom.length >= BLOOM_MAX) break;
      if (!spark.live || !spark.glow?.visible) continue;
      pushWorldBloom(
        spark.glow.x,
        spark.glow.y,
        30 * S,
        0.55,
        SPARK_LIGHT_COLOR,
      );
    }

    if (this.phase === 'night') {
      for (const sign of SHOP_SIGNS || []) {
        if (bloom.length >= BLOOM_MAX) break;
        pushWorldBloom(
          sign.x * S,
          sign.y * S,
          22 * S,
          0.3,
          colorFromHex(sign.glow),
        );
      }
    }

    for (const glow of this.lampGlows || []) {
      if (bloom.length >= BLOOM_MAX) break;
      const alpha = glow.visible ? glow.alpha : 0;
      if (alpha <= 0.01) continue;
      const spark = this.sparkPoles?.find((pole) => pole.glow === glow);
      if (spark?.live) continue;
      pushWorldBloom(glow.x, glow.y, 22 * S, 0.34 * alpha, WARM_LIGHT_COLOR);
    }
    fx.bloom = bloom;

    if (this.dog && !this.dog.dead) {
      fx.hero = {
        x: this.dog.x - cam.scrollX,
        y: cam.height - (this.dog.y - cam.scrollY - 10 * S),
        r: 42 * S,
        s: 0.28,
      };
    } else {
      fx.hero = { x: -9999, y: -9999, r: 1, s: 0 };
    }
  }

  createHud() {
    const W = this.scale.width;

    this.pips = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.staminaIcons = [];
    for (let i = 0; i < 3; i++) {
      this.staminaIcons.push(
        this.add
          .image(142 * S + i * 13 * S, 10 * S, 'conchaIcon')
          .setOrigin(0, 0.5)
          .setScale(this.compactLayout ? 0.65 : 0.6)
          .setScrollFactor(0)
          .setDepth(100)
          .setAlpha(0.95),
      );
    }

    this.bossTracker = this.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(180)
      .setVisible(false);
    this.bossArrow = this.add
      .triangle(0, 0, -7 * S, -7 * S, 9 * S, 0, -7 * S, 7 * S, 0xffd166)
      .setStrokeStyle(1.5 * S, 0x1b1029, 1);
    this.bossTrackerLabel = this.add
      .text(0, 0, '', {
        fontFamily: FONT,
        fontStyle: 'bold',
        fontSize: GAME_TEXT.body,
        color: FOLK_CSS.cream,
        backgroundColor: FOLK_CSS.ink,
        padding: { x: 3 * S, y: 2 * S },
      })
      .setOrigin(0, 0.5);
    this.bossTracker.add([this.bossArrow, this.bossTrackerLabel]);

    this.boneText = this.add
      .text(
        this.compactLayout ? 132 * S : W - 8 * S,
        this.compactLayout ? 17 * S : 5 * S,
        `${t('hud.bones')} 0`,
        {
          fontFamily: FONT,
          fontStyle: 'bold',
          fontSize: GAME_TEXT.body,
          color: FOLK_CSS.cream,
          stroke: FOLK_CSS.ink,
          strokeThickness: 2 * S,
        },
      )
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this.comboText = this.add
      .text(W - 8 * S, 31 * S, '', {
        fontFamily: FONT,
        fontStyle: 'bold',
        fontSize: GAME_TEXT.heading,
        color: FOLK_CSS.gold,
        stroke: FOLK_CSS.ink,
        strokeThickness: 2 * S,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(false);

    this.hint = this.add
      .text(W / 2, 138 * S, t('level.hint'), {
        fontFamily: FONT,
        fontSize: GAME_TEXT.body,
        color: FOLK_CSS.cream,
        stroke: FOLK_CSS.ink,
        strokeThickness: 2 * S,
        wordWrap: { width: W - 20 * S },
        align: 'center',
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0.85);

    const hasGate = this.features.gateDefense !== false;
    const statusH = this.compactLayout ? 30 : hasGate ? 68 : 60;
    const statusW = this.compactLayout ? 132 : 84;
    this.statusPanel = this.add.graphics().setScrollFactor(0).setDepth(99);
    if (!this.compactLayout) {
      this.statusPanel.fillStyle(0x1b1029, 0.42);
      this.statusPanel.fillRect(4 * S, 4 * S, statusW * S, statusH * S);
      this.statusPanel.lineStyle(1 * S, 0xfff4e0, 0.18);
      this.statusPanel.strokeRect(4 * S, 4 * S, statusW * S, statusH * S);
      this.statusPanel.lineStyle(1 * S, 0xfff4e0, 0.16);
      this.statusPanel.lineBetween(8 * S, 44 * S, 84 * S, 44 * S);
    }

    const statusStyle = {
      fontFamily: FONT,
      fontSize: GAME_TEXT.body,
      color: FOLK_CSS.gold,
      stroke: FOLK_CSS.ink,
      strokeThickness: 1.5 * S,
    };
    this.statusFlapLabel = this.add
      .text(8 * S, 10 * S, t('hud.flaps'), statusStyle)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0.9)
      .setVisible(!this.compactLayout);
    this.statusHealthLabel = this.add
      .text(8 * S, 22 * S, t('hud.health'), statusStyle)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0.9)
      .setVisible(!this.compactLayout);
    this.statusHungerLabel = this.add
      .text(8 * S, 34 * S, t('hud.hunger'), statusStyle)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0.9)
      .setVisible(!this.compactLayout);

    // hearts
    this.hearts = [];
    for (let i = 0; i < this.maxHealth; i++) this.addHudHeart(i);

    this.healthText = this.add
      .text(70 * S, 22 * S, `${this.health}/${this.maxHealth}`, {
        fontFamily: FONT,
        fontSize: GAME_TEXT.body,
        color: FOLK_CSS.cream,
        stroke: FOLK_CSS.ink,
        strokeThickness: 1.5 * S,
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(!this.compactLayout);
    this.layoutHealthText();

    // hunger: bone icon + bar
    this.hungerIcon = this.add
      .image(
        (this.compactLayout ? 130 : 75) * S,
        (this.compactLayout ? 10 : 34) * S,
        'boneIcon',
      )
      .setOrigin(0, 0.5)
      .setScale(0.6)
      .setScrollFactor(0)
      .setDepth(100);

    this.hungerBar = this.add.graphics().setScrollFactor(0).setDepth(100);

    this.phaseText = this.add
      .text(0, 0, '', {
        fontFamily: FONT,
        fontStyle: 'bold',
        fontSize: GAME_TEXT.body,
        color: FOLK_CSS.cream,
        stroke: FOLK_CSS.ink,
        strokeThickness: 2 * S,
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(100);

    if (this.features.gateDefense !== false) {
      this.gateText = this.add
        .text(8 * S, this.compactLayout ? 29 * S : 58 * S, '', {
          fontFamily: FONT,
          fontStyle: 'bold',
          fontSize: GAME_TEXT.body,
          color: FOLK_CSS.mint,
          stroke: FOLK_CSS.ink,
          strokeThickness: 2 * S,
        })
        .setScrollFactor(0)
        .setDepth(100)
        .setVisible(false);
    } else {
      this.gateText = null;
    }

    if (this.features.gateDefense !== false) {
      this.gateCallButton = addMenuButton(this, {
        label: this.touch?.visible
          ? t('gate.callTouch')
          : t('gate.call'),
        variant: 'primary',
        fontSize: GAME_TEXT.body,
        paddingX: 8 * U,
        paddingY: 5 * U,
        depth: 140,
        scrollFactor: 0,
        onClick: () => this.openGatePrompt(),
      });
      this.gateCallButton.setPosition(this.scale.width / 2, 42 * S);
      this.setGateCallVisible(false);
      this.createGatePromptUi();
    } else {
      this.gateCallButton = null;
    }

    this.createClockHud();

    this.createObjectivesUi();
    this.updateSurvivalHud();

    // On touch devices the buttons are the tutorial, and they occupy the
    // bottom of the screen where the keyboard hint would sit.
    if (this.touch?.visible) this.hint.setVisible(false);
  }

  createGatePromptUi() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.gatePromptScrim = this.add
      .rectangle(0, 0, W, H, FOLK.ink, 0.72)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(170)
      .setVisible(false)
      .setInteractive();
    this.gatePromptScrim.input.enabled = false;

    this.gatePromptRoot = this.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(171)
      .setVisible(false);
    this.gatePromptCard = this.add.graphics();
    this.gatePromptTitle = this.add
      .text(0, 0, t('gate.question'), {
        fontFamily: FONT,
        fontStyle: 'bold',
        fontSize: MENU_TEXT.heading,
        color: FOLK_CSS.danger,
        align: 'center',
      })
      .setOrigin(0.5);
    this.gatePromptBody = this.add
      .text(0, 0, t('gate.questionBody'), {
        fontFamily: FONT,
        fontSize: MENU_TEXT.body,
        color: FOLK_CSS.ink,
        align: 'center',
      })
      .setOrigin(0.5, 0);
    this.gatePromptRoot.add([
      this.gatePromptCard,
      this.gatePromptTitle,
      this.gatePromptBody,
    ]);

    this.gatePromptYes = addMenuButton(this, {
      label: t(
        this.touch?.visible ? 'gate.questionYesTouch' : 'gate.questionYes',
      ),
      variant: 'primary',
      fontSize: MENU_TEXT.body,
      paddingX: 8 * U,
      paddingY: 5 * U,
      depth: 172,
      scrollFactor: 0,
      onClick: () => this.answerGatePrompt(true),
    })
      .setVisible(false)
      .setEnabled(false);
    this.gatePromptNo = addMenuButton(this, {
      label: t(
        this.touch?.visible ? 'gate.questionNoTouch' : 'gate.questionNo',
      ),
      variant: 'dark',
      fontSize: MENU_TEXT.body,
      paddingX: 8 * U,
      paddingY: 5 * U,
      depth: 172,
      scrollFactor: 0,
      onClick: () => this.answerGatePrompt(false),
    })
      .setVisible(false)
      .setEnabled(false);

    this.layoutGatePrompt(W);
  }

  layoutGatePrompt(W = this.scale.width) {
    if (!this.gatePromptRoot) return;
    const H = this.scale.height;
    const w = Math.min(W - 40 * U, 420 * U);
    const h = 156 * U;
    this.gatePromptScrim.setPosition(0, 0).setSize(W, H);
    this.gatePromptRoot.setPosition(W / 2, H / 2);
    drawFolkCard(this.gatePromptCard, 0, 0, w, h);
    this.gatePromptTitle
      .setPosition(0, -h / 2 + 34 * U)
      .setWordWrapWidth(w - 32 * U);
    this.gatePromptBody
      .setPosition(0, -h / 2 + 62 * U)
      .setWordWrapWidth(w - 40 * U);
    const buttonY = H / 2 + h / 2 - 28 * U;
    this.gatePromptYes.setPosition(W / 2 - w / 4, buttonY);
    this.gatePromptNo.setPosition(W / 2 + w / 4, buttonY);
  }

  createClockHud() {
    this.clockGlow = this.add
      .circle(0, 0, 7 * S, 0xffd166, 0)
      .setScrollFactor(0)
      .setDepth(99)
      .setVisible(false);
    this.clockGraphics = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.clockText = this.add
      .text(0, 0, '', {
        fontFamily: FONT,
        fontSize: GAME_TEXT.body,
        color: FOLK_CSS.cream,
        stroke: FOLK_CSS.ink,
        strokeThickness: 1.5 * S,
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this.layoutClockHud(this.scale.width);
    this.updateClockHud();
  }

  layoutClockHud(W = this.scale.width) {
    if (this.clockGlow) {
      this.clockGlow.setPosition(W - 64 * S, 13 * S);
    }
    if (this.clockGraphics) {
      this.clockGraphics.setPosition(W - 64 * S, 13 * S);
    }
    if (this.clockText) {
      this.clockText.setPosition(W - 64 * S, 21 * S);
    }
    if (this.phaseText) {
      this.phaseText.setPosition(W - 54 * S, 13 * S);
    }
  }

  getPhaseDuration() {
    const timings = this.levelData.timings || {};
    if (this.phase === 'day') {
      return this.dayNumber > 1 ? (timings.day2 ?? 33) : (timings.day ?? 38);
    }
    return (
      (timings.night ?? 31) +
      Math.max(0, this.nightsSurvived) * (timings.nightStep ?? 5)
    );
  }

  getTimeOfDayMinutes() {
    const duration = Math.max(0.001, this.getPhaseDuration());
    const progress = Phaser.Math.Clamp(1 - this.phaseTime / duration, 0, 1);
    const start =
      this.phase === 'day' ? DAY_START_MINUTES : NIGHT_START_MINUTES;
    return (start + progress * HALF_DAY_MINUTES) % (24 * 60);
  }

  updateClockHud() {
    if (!this.clockGraphics || !this.clockText) return;

    const g = this.clockGraphics;
    const night = this.phase === 'night';
    const r = 6.5 * S;
    const minutes = this.getTimeOfDayMinutes();
    const handColor = night ? 0x9fd8ff : 0xffd166;

    g.clear();
    g.fillStyle(0x1b1029, 0.72);
    g.fillCircle(0, 0, r);
    g.lineStyle(1 * S, handColor, 0.95);
    g.strokeCircle(0, 0, r);

    for (let i = 0; i < 12; i++) {
      const angle = -Math.PI / 2 + (i * Math.PI) / 6;
      const inner = r * (i % 3 === 0 ? 0.7 : 0.82);
      g.lineStyle((i % 3 === 0 ? 1.2 : 0.8) * S, 0xfff4e0, 0.7);
      g.lineBetween(
        Math.cos(angle) * inner,
        Math.sin(angle) * inner,
        Math.cos(angle) * r * 0.92,
        Math.sin(angle) * r * 0.92,
      );
    }

    const minuteAngle =
      -Math.PI / 2 + ((minutes % 60) / 60) * Math.PI * 2;
    const hourAngle =
      -Math.PI / 2 + ((minutes % 720) / 720) * Math.PI * 2;

    g.lineStyle(1.6 * S, 0xfff4e0, 0.95);
    g.lineBetween(
      0,
      0,
      Math.cos(minuteAngle) * r * 0.68,
      Math.sin(minuteAngle) * r * 0.68,
    );
    g.lineStyle(2.4 * S, handColor, 1);
    g.lineBetween(
      0,
      0,
      Math.cos(hourAngle) * r * 0.46,
      Math.sin(hourAngle) * r * 0.46,
    );
    g.fillStyle(handColor, 1);
    g.fillCircle(0, 0, 1.5 * S);

    const wholeMinutes = Math.floor(minutes);
    const hh = String(Math.floor(wholeMinutes / 60)).padStart(2, '0');
    const mm = String(wholeMinutes % 60).padStart(2, '0');
    this.clockText
      .setText(`${hh}:${mm}`)
      .setColor(night ? FOLK_CSS.night : FOLK_CSS.cream);
  }

  flashClock() {
    if (!this.clockGlow || !this.clockGraphics || !this.clockText) return;

    const color = this.phase === 'night' ? 0x9fd8ff : 0xffd166;

    this.tweens.killTweensOf(this.clockGlow);
    this.clockGlow
      .setPosition(this.clockGraphics.x, this.clockGraphics.y)
      .setFillStyle(color, 0.42)
      .setStrokeStyle(1.5 * S, color, 0.9)
      .setScale(1)
      .setAlpha(1)
      .setVisible(true);
    this.tweens.add({
      targets: this.clockGlow,
      scale: 2.35,
      alpha: 0,
      duration: 900,
      ease: 'Sine.out',
      onComplete: () => this.clockGlow?.setVisible(false),
    });

    this.tweens.killTweensOf(this.clockGraphics);
    this.clockGraphics.setScale(1).setAlpha(1);
    this.tweens.add({
      targets: this.clockGraphics,
      scale: 1.18,
      duration: 220,
      yoyo: true,
      ease: 'Sine.out',
    });

    this.tweens.killTweensOf(this.clockText);
    this.clockText.setScale(1).setAlpha(1);
    this.tweens.add({
      targets: this.clockText,
      scale: 1.18,
      duration: 220,
      yoyo: true,
      ease: 'Sine.out',
    });
  }

  setLowHealthWarning(active) {
    if (!this.hearts?.length) return;
    if (this.lowHealthActive === active) return;
    this.lowHealthActive = active;

    const heart = this.hearts[0];
    const baseScale = heart.getData('baseScale') || heart.scaleX;
    this.tweens.killTweensOf(heart);

    if (!active) {
      heart.setScale(baseScale);
      return;
    }

    heart.setScale(baseScale);
    this.tweens.add({
      targets: heart,
      scaleX: baseScale * 1.28,
      scaleY: baseScale * 1.28,
      duration: 420,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  addHudHeart(index) {
    const scale = this.compactLayout ? 1.35 : 1.1;
    const heart = this.add
      .image(
        (this.compactLayout ? 36 + index * 10 : 30 + index * 12) * S,
        (this.compactLayout ? 10 : 22) * S,
        'heart',
      )
      .setOrigin(0, 0.5)
      .setScale(scale)
      .setScrollFactor(0)
      .setDepth(100);
    heart.setData('baseScale', scale);
    this.hearts.push(heart);
    return heart;
  }

  layoutHealthText() {
    if (this.healthText) {
      this.healthText.x = this.compactLayout
        ? 50 * S
        : (this.maxHealth >= 4 ? 76 : 70) * S;
    }
  }

  createInteractionUi() {
    this.interactPrompt = this.add
      .text(0, 0, '', {
        fontFamily: FONT,
        fontStyle: 'bold',
        fontSize: GAME_TEXT.body,
        color: FOLK_CSS.ink,
        backgroundColor: FOLK_CSS.gold,
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
        fontFamily: FONT,
        fontStyle: 'bold',
        fontSize: MENU_TEXT.heading,
        color: FOLK_CSS.gold,
        backgroundColor: FOLK_CSS.ink,
      })
      .setOrigin(0, 0);
    this.dialogName.setPadding(3 * S, 1 * S, 3 * S, 1 * S);

    this.dialogBody = this.add.text(0, 0, '', {
      fontFamily: FONT,
      fontSize: MENU_TEXT.body,
      color: FOLK_CSS.ink,
      lineSpacing: 2 * S,
    });
    this.dialogHint = this.add
      .text(0, 0, '', {
        fontFamily: FONT,
        fontSize: MENU_TEXT.body,
        color: FOLK_CSS.ink,
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
      .setText(`F · ${t(item.prompt)}`)
      .setPosition(x, y)
      .setVisible(true);
    if (this.interactPrompt.input) this.interactPrompt.input.enabled = true;
  }

  showDialog(nameKey, textKey) {
    if (this.gatePromptOpen) return;
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
      this.dialogPausedAt = this.time.now;
      this.spinBufferAt = 0;
      this.physics.world.pause();
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
    if (this.dialogPausedAt) {
      // Exclude conversation time from the run score timer.
      this.startedAt += this.time.now - this.dialogPausedAt;
      this.dialogPausedAt = 0;
    }
    this.physics.world.resume();
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
    this.objectivesTab = 'objectives';

    this.objectivesButton = this.add
      .image(
        W - 8 * S,
        this.compactLayout ? 8 * S : 17 * S,
        'pauseIcon',
      )
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(160)
      .setScale(this.compactLayout ? 0.9 : 0.7)
      .setInteractive({ useHandCursor: true });
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

    const headingStyle = {
      fontFamily: FONT,
      fontStyle: 'bold',
      fontSize: MENU_TEXT.heading,
      color: FOLK_CSS.teal,
    };
    const bodyStyle = {
      fontFamily: FONT,
      fontSize: MENU_TEXT.body,
      color: FOLK_CSS.ink,
      lineSpacing: 1 * U,
    };
    const goalStyle = {
      fontFamily: FONT,
      fontStyle: 'bold',
      fontSize: MENU_TEXT.heading,
      color: FOLK_CSS.mint,
      stroke: FOLK_CSS.ink,
      strokeThickness: 1 * S,
    };

    this.objectivesNowHead = this.add.text(0, 0, t('objectives.now'), headingStyle);
    this.objectivesNowGoal = this.add.text(0, 0, t('goal.survive'), goalStyle);
    this.objectivesNowDesc = this.add.text(0, 0, t('objectives.nowDesc'), bodyStyle);
    this.objectivesErrandsHead = this.add.text(0, 0, t('objectives.errands'), headingStyle);
    this.objectivesErrandsLine = this.add.text(0, 0, t('objectives.errandsLine'), bodyStyle);
    this.objectivesErrandsDesc = this.add.text(0, 0, t('objectives.errandsDesc'), bodyStyle);

    this.instructionsControlsHead = this.add.text(
      0,
      0,
      t('instructions.controlsHead'),
      headingStyle,
    );
    this.instructionsControls = this.add.text(
      0,
      0,
      this.touch?.visible
        ? t('instructions.controlsTouch')
        : t('instructions.controls'),
      bodyStyle,
    );
    this.objectivesPowersHead = this.add.text(
      0,
      0,
      t('instructions.survivalHead'),
      headingStyle,
    );
    this.objectivesPowers = this.add
      .text(
        0,
        0,
        [
          t('objectives.healthDesc'),
          t('objectives.flapsDesc'),
          t('objectives.staminaDesc'),
          t('objectives.hungerDesc'),
        ].join('\n'),
        bodyStyle,
      );
    this.objectivesTabButtons = {
      objectives: addMenuButton(this, {
        label: t('objectives.title'),
        variant: 'primary',
        fontSize: MENU_TEXT.body,
        height: 24 * U,
        paddingX: 8 * U,
        paddingY: 2 * U,
        depth: 160,
        scrollFactor: 0,
        onClick: () => this.setObjectivesTab('objectives'),
      }).setVisible(false),
      instructions: addMenuButton(this, {
        label: t('instructions.title'),
        variant: 'secondary',
        fontSize: MENU_TEXT.body,
        height: 24 * U,
        paddingX: 8 * U,
        paddingY: 2 * U,
        depth: 160,
        scrollFactor: 0,
        onClick: () => this.setObjectivesTab('instructions'),
      }).setVisible(false),
    };
    this.objectivesMenuButton = addMenuButton(this, {
      label: t('objectives.menu'),
      variant: 'dark',
      fontSize: MENU_TEXT.body,
      paddingX: 8 * U,
      paddingY: 6 * U,
      depth: 160,
      scrollFactor: 0,
      onClick: () => this.returnToMenu(),
    }).setVisible(false);
    this.objectivesClose = addMenuButton(this, {
      label: this.touch?.visible
        ? t('objectives.closeTouch')
        : t('objectives.close'),
      variant: 'dark',
      fontSize: MENU_TEXT.body,
      paddingX: this.compactLayout ? 6 * U : 2 * S,
      paddingY: this.compactLayout ? 8 * U : 1 * S,
      depth: 160,
      scrollFactor: 0,
      onClick: () => this.closeObjectives(),
    }).setVisible(false);

    this.objectivesTabObjects = [
      this.objectivesNowHead,
      this.objectivesNowGoal,
      this.objectivesNowDesc,
      this.objectivesErrandsHead,
      this.objectivesErrandsLine,
      this.objectivesErrandsDesc,
    ];
    this.instructionsTabObjects = [
      this.instructionsControlsHead,
      this.instructionsControls,
      this.objectivesPowersHead,
      this.objectivesPowers,
    ];

    this.objectivesRoot.add([
      this.objectivesCard,
      ...this.objectivesTabObjects,
      ...this.instructionsTabObjects,
    ]);

    this.setObjectivesTab('objectives');
    this.layoutObjectives(W);
  }

  layoutObjectives(W = this.scale.width) {
    if (!this.objectivesRoot) return;

    const w = Math.min(W - 40 * U, 500 * U);
    const h = 264 * U;
    this.objectivesW = w;
    this.objectivesH = h;

    this.objectivesButton
      .setPosition(W - 8 * S, this.compactLayout ? 8 * S : 17 * S)
      .setScale(this.compactLayout ? 0.9 : 0.7);
    this.objectivesScrim.setPosition(0, 0).setSize(W, this.scale.height);
    this.objectivesRoot.setPosition(W / 2, this.scale.height / 2);
    drawFolkCard(this.objectivesCard, 0, 0, w, h);

    const top = -h / 2;
    const left = -w / 2 + 30 * U;
    const wrap = w - 60 * U;
    this.objectivesNowHead.setPosition(left, top + 42 * U);
    this.objectivesNowGoal.setPosition(left, top + 72 * U);
    this.objectivesNowDesc.setPosition(left, top + 100 * U).setWordWrapWidth(wrap);
    this.objectivesErrandsHead.setPosition(left, top + 134 * U);
    this.objectivesErrandsLine.setPosition(left, top + 166 * U);
    this.objectivesErrandsDesc.setPosition(left, top + 192 * U).setWordWrapWidth(wrap);

    this.instructionsControlsHead.setPosition(left, top + 42 * U);
    this.instructionsControls
      .setPosition(left, top + 76 * U)
      .setWordWrapWidth(wrap);
    this.objectivesPowersHead.setPosition(left, top + 126 * U);
    this.objectivesPowers
      .setPosition(left, top + 160 * U)
      .setWordWrapWidth(wrap);

    const tabY = this.scale.height / 2 + top + 26 * U;
    const tabStart = W / 2 - w / 2 + 30 * U;
    const objectivesTab = this.objectivesTabButtons.objectives;
    const instructionsTab = this.objectivesTabButtons.instructions;
    objectivesTab.setPosition(tabStart + objectivesTab.w / 2, tabY);
    instructionsTab.setPosition(
      tabStart + objectivesTab.w + 10 * U + instructionsTab.w / 2,
      tabY,
    );

    this.objectivesClose.setPosition(
      W / 2 + w / 2 - 16 * U - this.objectivesClose.w / 2,
      this.scale.height / 2 - h / 2 + 13 * U + this.objectivesClose.h / 2,
    );
    this.objectivesMenuButton.setPosition(
      W / 2 - w / 2 + 30 * U + this.objectivesMenuButton.w / 2,
      this.scale.height / 2 + h / 2 - 10 * U - this.objectivesMenuButton.h / 2,
    );
  }

  resetMenuConfirm() {
    if (!this.objectivesMenuButton) return;
    this.menuConfirmPending = false;
    this.objectivesMenuButton
      .setLabel(t('objectives.menu'))
      .setVariant('dark');
  }

  returnToMenu() {
    if (!this.menuConfirmPending) {
      this.menuConfirmPending = true;
      this.objectivesMenuButton
        .setLabel(t('objectives.menuConfirm'))
        .setVariant('primary');
      return;
    }

    this.resetMenuConfirm();
    this.closeObjectives();
    this.cameras.main.fadeOut(180, 27, 16, 41);
    this.uiCamera?.fadeOut(180, 27, 16, 41);
    this.time.delayedCall(190, () => this.scene.start('Title'));
  }

  setObjectivesTab(tab) {
    if (!this.objectivesTabButtons) return;
    this.objectivesTab = tab === 'instructions' ? 'instructions' : 'objectives';
    this.resetMenuConfirm();
    const showObjectives = this.objectivesTab === 'objectives';
    this.objectivesTabObjects?.forEach((item) => item.setVisible(showObjectives));
    this.instructionsTabObjects?.forEach((item) =>
      item.setVisible(!showObjectives),
    );
    this.objectivesTabButtons.objectives.setVariant(
      showObjectives ? 'primary' : 'secondary',
    );
    this.objectivesTabButtons.instructions.setVariant(
      showObjectives ? 'secondary' : 'primary',
    );
  }

  toggleObjectives() {
    if (this.gatePromptOpen || this.won || this.gameOverFlag) return;
    if (this.objectivesOpen) this.closeObjectives();
    else this.openObjectives();
  }

  openObjectives() {
    if (this.gatePromptOpen || this.objectivesOpen || this.won || this.gameOverFlag) {
      return;
    }
    if (this.dialogOpen) this.closeDialog();

    this.objectivesOpen = true;
    this.objectivesWasTouch = !!this.touch?.visible;
    this.objectivesButton.setVisible(false);
    this.objectivesTabButtons.objectives.setVisible(true);
    this.objectivesTabButtons.instructions.setVisible(true);
    this.objectivesMenuButton.setVisible(true);
    this.resetMenuConfirm();
    this.objectivesClose
      .setLabel(
        this.objectivesWasTouch
          ? t('objectives.closeTouch')
          : t('objectives.close'),
      )
      .setVisible(true);
    this.setObjectivesTab(this.objectivesTab);
    this.layoutObjectives(this.scale.width);
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
    this.objectivesTabButtons.objectives.setVisible(false);
    this.objectivesTabButtons.instructions.setVisible(false);
    this.objectivesMenuButton.setVisible(false);
    this.resetMenuConfirm();
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
    let color = FOLK_CSS.mint;
    if (this.alphaActive && !this.alphaDefeated) {
      text = t(this.levelData.boss?.goalKey || 'goal.alpha', {
        hits: this.alpha?.health ?? 5,
        max: this.alpha?.maxHealth ?? 5,
      });
      color = FOLK_CSS.gold;
    } else if (this.alphaDefeated && this.alphaEnding) {
      text = t('goal.dawnNow');
      color = FOLK_CSS.dawn;
    } else if (this.phase === 'night' && this.phaseTime <= 10) {
      text = t('goal.dawn');
      color = FOLK_CSS.gold;
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
      const check = (done) => (done ? '✓' : '○');
      const dayDone = this.errandsComplete();
      const nightDone = this.nightErrandsComplete();
      this.objectivesErrandsLine
        .setText(
          `${t('errands.day')} · ${check(!this.poloGift)} ${t('name.polo')}  ${check(this.bellRung)} ${t('name.bell')}`,
        )
        .setColor(dayDone ? FOLK_CSS.teal : FOLK_CSS.ink);
      this.objectivesErrandsDesc
        .setText(
          `${t('errands.night')} · ${check(this.gateErrandDone)} ${t('hud.gate')}  ${check(this.nightRivalsSubdued >= 2)} ${t('errands.rivals')} ${this.nightRivalsSubdued}/2`,
        )
        .setColor(nightDone ? FOLK_CSS.teal : FOLK_CSS.ink);
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
    move.add(tuning, 'enemySpeed', 0.5, 1.5, 0.05).name(t('tuning.enemySpeed'));
    move.add(tuning, 'groundAccel', 400, 6000, 50).name(t('tuning.groundAccel'));
    move.add(tuning, 'airAccel', 200, 4000, 50).name(t('tuning.airAccel'));
    move.add(tuning, 'groundFriction', 400, 6000, 50).name(t('tuning.groundFriction'));
    move.close();

    const air = gui.addFolder(t('tuning.air'));
    air.add(tuning, 'gravity', 400, 4000, 10).name(t('tuning.gravity'));
    air.add(tuning, 'glideGravity', 50, 1200, 10).name(t('tuning.glideGravity'));
    air.add(tuning, 'glideMaxFall', 30, 400, 5).name(t('tuning.glideFall'));
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
    const introDuration = 3000;
    const storyDuration = 3600;

    this.introLabel = this.add
      .text(
        this.scale.width / 2,
        50 * S,
        t(this.levelData.introKey || 'level.intro'),
        {
          fontFamily: FONT,
          fontStyle: 'bold',
          fontSize: GAME_TEXT.display,
          color: FOLK_CSS.cream,
          stroke: FOLK_CSS.ink,
          strokeThickness: 3 * S,
          align: 'center',
          wordWrap: { width: this.scale.width - 40 * U },
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
      onComplete: () => {
        this.introLabel?.destroy();
        this.introLabel = null;
        if (this.levelData.storyIntroKey) this.showStoryIntro();
      },
    });

    return introDuration + (this.levelData.storyIntroKey ? storyDuration : 0);
  }

  showStoryIntro() {
    this.storyLabel = this.add
      .text(
        this.scale.width / 2,
        53 * S,
        t(this.levelData.storyIntroKey),
        {
          fontFamily: FONT,
          fontStyle: 'bold',
          fontSize: GAME_TEXT.heading,
          color: FOLK_CSS.cream,
          stroke: FOLK_CSS.ink,
          strokeThickness: 2 * S,
          align: 'center',
          wordWrap: { width: this.scale.width - 40 * U },
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0);

    this.tweens.add({
      targets: this.storyLabel,
      alpha: 1,
      duration: 400,
      hold: 2800,
      yoyo: true,
      onComplete: () => {
        this.storyLabel?.destroy();
        this.storyLabel = null;
      },
    });
  }

  // --- per-frame helpers ---------------------------------------------------

  updateCamera(delta) {
    const cam = this.cameras.main;
    const k = Phaser.Math.Clamp(tuning.cameraLerp, 0.01, 0.5);

    cam.lerp.x = k;
    cam.lerp.y = VERTICAL_CAMERA_LERP;

    const targetX = -this.dog.facing * tuning.lookAhead * S;
    cam.followOffset.x = Phaser.Math.Linear(cam.followOffset.x, targetX, 0.08);
    cam.followOffset.y = Phaser.Math.Linear(cam.followOffset.y, 30 * S, 0.08);

    // Parallax is deliberately subtle; near-layer motion is a common
    // motion-sickness trigger. Reduced-motion players get a static backdrop.
    // After dropping back to street level, ease the camera back to its
    // original vertical framing instead of leaving it parked up high.
    if (this.dog.grounded && this.dog.y >= 555 * S) {
      cam.scrollY = Phaser.Math.Linear(
        cam.scrollY,
        this.cameraBaseScrollY,
        VERTICAL_CAMERA_LERP,
      );
      cam.midPoint.y = cam.scrollY + cam.height / 2;
    }

    // Safety net: if a fast fall ever outruns the smoothed follow, nudge the
    // camera just enough to keep Bonjo inside the frame rather than losing him.
    const screenY = this.dog.y - cam.scrollY;
    const topMargin = 18 * S;
    const bottomMargin = 18 * S;
    if (screenY > cam.height - bottomMargin) {
      cam.scrollY = this.dog.y - (cam.height - bottomMargin);
      cam.midPoint.y = cam.scrollY + cam.height / 2;
    } else if (screenY < topMargin) {
      cam.scrollY = this.dog.y - topMargin;
      cam.midPoint.y = cam.scrollY + cam.height / 2;
    }

    this.cloudsFar.tilePositionX = cam.scrollX * 0.05 * parallaxScale;
    this.cloudsNear.tilePositionX = cam.scrollX * 0.13 * parallaxScale;
    this.town.tilePositionX = cam.scrollX * 0.3 * parallaxScale;
    this.nearTown.tilePositionX = cam.scrollX * 0.55 * parallaxScale;
  }

  updateBossTracker() {
    if (!this.bossTracker) return;

    const boss = this.alpha;
    if (
      !this.alphaActive ||
      !boss?.active ||
      this.alphaDefeated ||
      this.won ||
      this.gameOverFlag
    ) {
      this.bossTracker.setVisible(false);
      return;
    }

    const cam = this.cameras.main;
    const view = cam.worldView;
    if (!view) {
      this.bossTracker.setVisible(false);
      return;
    }

    const screenX = ((boss.x - view.x) / view.width) * cam.width;
    const screenY = ((boss.y - view.y) / view.height) * cam.height;
    // Keep the locator clear of the enlarged touch button clusters.
    const marginX = this.touch?.visible ? 48 * S : 24 * S;
    const marginTop = 18 * S;
    const marginBottom = 24 * S;
    const inside =
      screenX > -4 * S &&
      screenX < cam.width + 4 * S &&
      screenY > -4 * S &&
      screenY < cam.height + 4 * S;
    if (inside) {
      this.bossTracker.setVisible(false);
      return;
    }

    const x = Phaser.Math.Clamp(screenX, marginX, cam.width - marginX);
    const y = Phaser.Math.Clamp(
      screenY,
      marginTop,
      cam.height - marginBottom,
    );
    const angle = Math.atan2(
      boss.y - view.centerY,
      boss.x - view.centerX,
    );
    const atCasa = this.levelData.bossSpawnX != null;
    this.bossTrackerLabel.setText(
      atCasa ? `${t('hud.boss')} · ${t('porch.sign')}` : t('hud.boss'),
    );
    this.bossArrow.setRotation(angle);
    this.bossTrackerLabel
      .setOrigin(x < cam.width / 2 ? 0 : 1, 0.5)
      .setPosition(x < cam.width / 2 ? 11 * S : -11 * S, 0);
    this.bossTracker.setPosition(x, y).setVisible(true);
  }

  updateHud(delta) {
    // flap pips, top-left
    this.pips.clear();
    const maxFlaps = this.dog?.maxFlaps ?? tuning.maxFlaps;
    const pipStartX = this.compactLayout ? 8 : 36;
    const pipGap = this.compactLayout ? 9 : 10;
    for (let i = 0; i < maxFlaps; i++) {
      const x = (pipStartX + i * pipGap) * S;
      if (i < this.dog.flaps) {
        this.pips.fillStyle(0xffd166, 1);
        this.pips.fillCircle(x, 10 * S, (this.compactLayout ? 4.8 : 3.8) * S);
        this.pips.lineStyle(1 * S, 0x2b1b3d, 0.5);
        this.pips.strokeCircle(x, 10 * S, (this.compactLayout ? 4.8 : 3.8) * S);
      } else {
        this.pips.lineStyle(1 * S, 0xfff4e0, 0.45);
        this.pips.strokeCircle(x, 10 * S, (this.compactLayout ? 4.8 : 3.8) * S);
      }
    }

    const stamina = this.dog?.stamina ?? 0;
    this.staminaIcons.forEach((icon, i) => {
      icon.setTexture('conchaIcon');
      icon.setAlpha(i < stamina ? 0.95 : 0.22);
    });

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
      .setColor(this.health <= 1 ? FOLK_CSS.danger : FOLK_CSS.cream);
    this.statusHealthLabel?.setColor(this.health <= 1 ? FOLK_CSS.danger : FOLK_CSS.gold);
    this.statusHungerLabel?.setColor(this.hunger < 25 ? FOLK_CSS.danger : FOLK_CSS.gold);

    this.hungerBar.clear();
    this.hungerBar.fillStyle(0x2b1b3d, 0.8);
    const hungerX = this.compactLayout ? 84 * S : 30 * S;
    const hungerY = this.compactLayout ? 7 * S : 31 * S;
    this.hungerBar.fillRect(hungerX, hungerY, 44 * S, 6 * S);
    this.hungerBar.lineStyle(1 * S, 0xfff4e0, 0.55);
    this.hungerBar.strokeRect(hungerX, hungerY, 44 * S, 6 * S);

    const width = Math.max(0, (this.hunger / this.maxHunger) * 42 * S);
    this.hungerBar.fillStyle(this.hunger < 25 ? 0xf26b5e : 0xf0a03c, 1);
    this.hungerBar.fillRect(hungerX + 1 * S, hungerY + 1 * S, width, 4 * S);

    const label = this.phase === 'day' ? t('hud.day') : t('hud.night');
    const number = this.phase === 'day' ? this.dayNumber : this.nightsSurvived + 1;
    const phaseLabel = `${label} ${number}`;
    if (this.gateText) {
      const gateLabel = this.gateBroken
        ? `${t('hud.gate')} 0/${this.gateMaxHealth}`
        : `${t('hud.gate')} ${this.gateHealth}/${this.gateMaxHealth}`;
      const showGate =
        this.phase === 'night' ||
        this.gateBroken ||
        this.gateHealth < this.gateMaxHealth;
      const critical = this.gateBroken || this.gateHealth <= 1 || this.gateAlert;
      const warning = this.gateAlert || this.gateHealth < this.gateMaxHealth;
      this.gateText
        .setText(gateLabel)
        .setVisible(showGate)
        .setColor(critical ? FOLK_CSS.danger : warning ? FOLK_CSS.gold : FOLK_CSS.mint)
        .setAlpha(
          this.gateAlert
            ? 0.62 + 0.38 * Math.abs(Math.sin(this.time.now / 150))
            : 1,
        );
    }
    this.phaseText.setText(phaseLabel);
    this.phaseText.setColor(this.phase === 'night' ? FOLK_CSS.gold : FOLK_CSS.cream);
    this.updateClockHud();
    this.setLowHealthWarning(this.health <= 1 && !this.won && !this.gameOverFlag);

    this.updateGoalHud();
  }

  queueClockHint(delay) {
    this.time.delayedCall(delay, () => {
      if (this.won || this.gameOverFlag) return;
      this.showPhaseBanner(
        t(this.phase === 'day' ? 'hint.timeDay' : 'hint.timeNight'),
        this.phase === 'day' ? FOLK_CSS.gold : FOLK_CSS.night,
        { duration: 300, hold: 1600 },
      );
    });
  }

  updateGoalHud() {
    if (this.won || this.gameOverFlag) return;
    this.updateObjectivesPanel();
  }

  // --- survival loop -------------------------------------------------------

  updateSurvival(dt) {
    if (this.won || this.gameOverFlag) return;

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
    this.createTimeShards();
    this.gateAlert = false;
    this.gateCallUsed = false;
    this.gateCallAchievementPending = false;
    this.setGateCallVisible(false);
    this.closeDialog();
    this.setNightCreatures(true);
    this.setStreetLights(true);

    if (
      this.nightsSurvived === this.nightsToSurvive - 1 &&
      !this.finalNightLivesSpawned
    ) {
      this.finalNightLivesSpawned = true;
      for (const [x, y] of FINAL_NIGHT_LIVES) {
        this.spawnLifeAt(x * S, y * S);
      }
    }

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
      // WebGL moves the ambient darkness into the shader so the lamps can
      // carve real pools out of it. Canvas keeps the original flat wash.
      alpha: this.lampLightFX ? 0.08 : 0.62,
      duration: 900,
    });
    this.tweens.add({
      targets: this.skyNight,
      alpha: 0.82,
      duration: 900,
    });
    this.tweens.add({
      targets: this.cloudsFar,
      alpha: 0.2,
      duration: 900,
    });
    this.tweens.add({
      targets: this.cloudsNear,
      alpha: 0.32,
      duration: 900,
    });

    this.showPhaseBanner(`${t('hud.night')} ${this.nightsSurvived + 1}`, FOLK_CSS.gold);
    this.queueClockHint(1400);
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
    const gateWasBroken = this.gateBroken;
    this.phase = 'day';
    this.dayNumber += 1;
    this.phaseTime = this.levelData.timings.day2;
    this.createTimeShards();
    this.waveSpawned = 0;
    this.waveTotal = 0;
    this.gateRusherSpawned = false;
    this.gateAlert = false;
    this.gateCallUsed = false;
    this.gateCallAchievementPending = false;
    this.setGateCallVisible(false);
    this.closeDialog();
    this.setNightCreatures(false);
    this.setStreetLights(false);

    // A broken gate takes the morning to repair: no dawn heal or dawn concha.
    if (!gateWasBroken) this.healHealth(2);
    this.hunger = Math.min(this.maxHunger, this.hunger + 10);

    this.gateHealth = this.gateMaxHealth;
    this.gateBroken = false;
    this.porchGate?.clearTint().setAlpha(1);
    this.gateSign?.setVisible(true);

    this.poloIcon?.setVisible(this.poloGift);
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

    this.showPhaseBanner(`${t('hud.day')} ${this.dayNumber}`, FOLK_CSS.mint);
    this.queueClockHint(gateWasBroken ? 3000 : 1400);
    sfx.bell();
    sfx.day();
    this.time.delayedCall(420, () => {
      if (!this.won && !this.gameOverFlag) sfx.rooster();
    });

    if (!gateWasBroken) {
      const dawnFood = this.levelData.dawnFood || [70, 590];
      this.spawnFoodAt(dawnFood[0] * S, dawnFood[1] * S);
    } else {
      this.time.delayedCall(1050, () => {
        if (!this.won && !this.gameOverFlag) {
          this.showPhaseBanner(t('gate.repair'), FOLK_CSS.danger);
        }
      });
    }
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
          health: 3,
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
    this.floatText(sx * S, 558 * S, t('bark'), FOLK_CSS.gold);
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
    this.floatText(500 * S, 558 * S, t('bark'), FOLK_CSS.gold);
    this.gateAlert = true;
    this.setGateCallVisible(true);
    this.showPhaseBanner(t('gate.alert'), FOLK_CSS.danger);
    this.alertChihuahua();
  }

  spawnAlpha() {
    if (this.alphaSpawned || this.won || this.gameOverFlag) return;
    this.alphaSpawned = true;
    this.alphaActive = true;
    this.waveSpawned = this.waveTotal;

    // The boss is the finale. Clear the remaining shards so the fight, not
    // shard collection, decides the night.
    this.timeShardGroup?.clear(true, true);

    let platform;
    let sx;
    if (this.levelData.bossSpawnX != null) {
      // The first-level top dog waits on the lawn in front of Casa instead of
      // teleporting to wherever Bonjo happens to be.
      sx = this.levelData.bossSpawnX;
      platform = PLATFORMS.find(
        (p) => sx >= p.x && sx <= p.x + p.w,
      );
      if (!platform) platform = PLATFORMS[0];
    } else {
      const designX = this.dog.x / S;
      platform = PLATFORMS.find(
        (p) => designX >= p.x && designX <= p.x + p.w,
      );
      if (!platform) platform = PLATFORMS[PLATFORMS.length - 1];

      const mid = platform.x + platform.w / 2;
      sx = this.dog.x / S + (this.dog.facing >= 0 ? 95 : -95);
      sx = Phaser.Math.Clamp(
        sx,
        platform.x + 22,
        platform.x + platform.w - 22,
      );
      if (Math.abs(sx - this.dog.x / S) < 40) {
        sx = this.dog.x / S < mid
          ? platform.x + platform.w - 22
          : platform.x + 22;
      }
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
      health: boss.health ?? 5,
      baseSpeed: boss.baseSpeed ?? 62,
      chaseSpeed: boss.chaseSpeed ?? 142,
    });
    this.rivalGroup.add(this.alpha);
    // Keep the finale boss anchored to the pavement even if its group collider
    // is temporarily bypassed during stun/knockback.
    this.physics.add.collider(this.alpha, this.platforms);

    if (boss.crown !== false) {
      this.alphaCrown = this.add
        .image(this.alpha.x, this.alpha.y - 24 * S, 'crown')
        .setDepth(10.5);
    } else {
      this.alphaCrown = null;
    }

    this.showPhaseBanner(t(boss.titleKey || 'alpha.title'), FOLK_CSS.gold);
    this.spawnPuff(this.alpha.x, 580 * S, 1.5);
    this.floatText(this.alpha.x, 558 * S, t('bark'), FOLK_CSS.gold);
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
      FOLK_CSS.danger,
    );
    sfx.stomp();
    this.alertChihuahua();
    this.updateSurvivalHud();

    if (this.gateHealth <= 0) {
      this.gateBroken = true;
      this.setGateCallVisible(false);
      this.gateCallAchievementPending = false;
      this.porchGate?.setTint(0x6a5a76).setAlpha(0.55);
      this.gateSign?.setVisible(false);
      this.showPhaseBanner(t('gate.broken'), FOLK_CSS.danger);
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
      FOLK_CSS.gold,
    );
    sfx.burst();
    this.alertChihuahua();

    this.time.delayedCall(850, () => {
      this.alphaEnding = false;
      if (!this.won && !this.gameOverFlag) this.endNight();
    });
  }

  showPhaseBanner(text, color, { duration = 250, hold = 700 } = {}) {
    if (this.phaseBanner?.active) {
      this.tweens.killTweensOf(this.phaseBanner);
      this.phaseBanner.destroy();
    }

    const fontSize = GAME_TEXT.heading;

    this.phaseBanner = this.add
      .text(this.scale.width / 2, 72 * S, text, {
        fontFamily: FONT,
        fontStyle: 'bold',
        fontSize,
        color,
        stroke: FOLK_CSS.ink,
        strokeThickness: Math.max(2, fontSize * 0.16),
        align: 'center',
        wordWrap: { width: this.scale.width - 40 * U },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0);

    this.tweens.add({
      targets: this.phaseBanner,
      alpha: 1,
      duration,
      hold,
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

  spawnImpactBurst(
    x,
    y,
    { color = 0xffd166, radius = 13 * S, width = 2.5 * S, duration = 220, puffs = 3 } = {},
  ) {
    const start = 3 * S;
    const ring = this.add
      .circle(x, y, start, 0x000000, 0)
      .setStrokeStyle(width, color, 0.95)
      .setDepth(21);
    this.tweens.add({
      targets: ring,
      scale: radius / start,
      alpha: 0,
      duration,
      ease: 'Quad.out',
      onComplete: () => ring.destroy(),
    });

    for (let i = 0; i < puffs; i++) {
      this.spawnPuff(
        x + Phaser.Math.Between(-5 * S, 5 * S),
        y + Phaser.Math.Between(-5 * S, 3 * S),
        0.45,
      );
    }
  }

  onAttackHit(target, kind) {
    const config = {
      spin: {
        color: 0xffd166,
        radius: 13 * S,
        width: 2.5 * S,
        duration: 200,
        puffs: 3,
        shakeDuration: 60,
        shakeIntensity: 0.0018,
      },
      slide: {
        color: 0xfff4e0,
        radius: 20 * S,
        width: 3.5 * S,
        duration: 260,
        puffs: 5,
        shakeDuration: 150,
        shakeIntensity: 0.006,
      },
    }[kind];
    if (!config) return;

    this.spawnImpactBurst(target.x, target.y, config);
    this.cameras.main.shake(config.shakeDuration, config.shakeIntensity);
    sfx.impact();
  }

  floatText(x, y, message, color = FOLK_CSS.gold, duration = null) {
    const life = duration ?? (ANIMAL_WORDS.has(message) ? 1500 : 700);
    const label = this.add
      .text(x, y, message, {
        fontFamily: FONT,
        fontStyle: 'bold',
        fontSize: GAME_TEXT.heading,
        color,
        stroke: FOLK_CSS.ink,
        strokeThickness: 2 * S,
      })
      .setOrigin(0.5)
      .setDepth(50);

    this.tweens.add({
      targets: label,
      y: y - 12 * S,
      alpha: 0,
      duration: life,
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

  onSlideBlocked() {
    this.floatText(this.dog.x, this.dog.y - 16 * S, t('float.tired'), FOLK_CSS.danger);
  }

  spawnSlideAfterimage(dog) {
    if (!dog?.active) return;

    // The bright body is the meteor head; these tinted echoes become its tail.
    const ghost = this.add
      .image(dog.x, dog.y, dog.texture.key)
      .setFlipX(dog.flipX)
      .setRotation(dog.rotation)
      .setScale(dog.scaleX, dog.scaleY)
      .setTint(0xffb347)
      .setAlpha(0.42)
      .setDepth(dog.depth - 1);

    this.tweens.add({
      targets: ghost,
      x: ghost.x - dog.facing * 10 * S,
      scaleX: ghost.scaleX * 0.55,
      scaleY: ghost.scaleY * 0.55,
      alpha: 0,
      duration: 240,
      ease: 'Quad.out',
      onComplete: () => ghost.destroy(),
    });
  }

  spawnSlideEmber(dog) {
    const ember = this.add
      .circle(
        dog.x - dog.facing * Phaser.Math.Between(4 * S, 10 * S),
        dog.y + Phaser.Math.Between(-4 * S, 7 * S),
        Phaser.Math.Between(1 * S, 2 * S),
        Math.random() < 0.5 ? 0xffd166 : 0xf0a03c,
        0.9,
      )
      .setDepth(8);

    this.tweens.add({
      targets: ember,
      x: ember.x - dog.facing * Phaser.Math.Between(10 * S, 22 * S),
      y: ember.y - Phaser.Math.Between(1 * S, 7 * S),
      alpha: 0,
      scale: 0.2,
      duration: 280,
      ease: 'Quad.out',
      onComplete: () => ember.destroy(),
    });
  }

  updateSlideTrail() {
    if (!this.slideAura) return;
    if (this.dog.slideUntil > this.time.now) {
      this.slideAura.setPosition(this.dog.x, this.dog.y);
    } else {
      const aura = this.slideAura;
      this.slideAura = null;
      this.tweens.add({
        targets: aura,
        alpha: 0,
        duration: 120,
        onComplete: () => aura.destroy(),
      });
    }
  }

  onSlideStart() {
    this.slideHitTargets = new Set();
    sfx.slide();

    // A stretched meteor head that follows the whole dash.
    this.slideAura?.destroy();
    this.slideAura = this.add
      .ellipse(this.dog.x, this.dog.y, 34 * S, 20 * S, 0xffd166, 0.08)
      .setStrokeStyle(2 * S, 0xffd166, 0.72)
      .setDepth(9);

    const ring = this.add
      .circle(this.dog.x, this.dog.y + 6 * S, 3 * S, 0x000000, 0)
      .setStrokeStyle(2 * S, 0xffd166, 0.7)
      .setDepth(9);
    this.tweens.add({
      targets: ring,
      scale: 3.2,
      alpha: 0,
      duration: 200,
      ease: 'Quad.out',
      onComplete: () => ring.destroy(),
    });

    this.spawnSlideAfterimage(this.dog);
    for (let i = 0; i < 3; i++) {
      this.spawnPuff(
        this.dog.x - this.dog.facing * Phaser.Math.Between(2 * S, 9 * S),
        this.dog.y + Phaser.Math.Between(4 * S, 9 * S),
        0.55,
      );
      this.spawnSlideEmber(this.dog);
    }
  }

  onSlide(dog) {
    this.spawnPuff(dog.x - dog.facing * 7 * S, dog.y + 8 * S, 0.5);
    this.spawnSlideAfterimage(dog);
    this.spawnSlideEmber(dog);
    this.spawnSlideEmber(dog);
  }

  // --- game events ---------------------------------------------------------

  grantStamina(amount = 1) {
    if (!this.dog) return;
    this.dog.stamina = Math.min(
      this.dog.maxStamina,
      this.dog.stamina + amount,
    );
  }

  maybeDropConcha(x, y, chance = 0.4) {
    if (Math.random() >= chance) return null;
    return this.spawnFoodAt(x, y);
  }

  collectBone(dog, bone) {
    if (!bone.active) return;
    bone.disableBody(true, true);
    this.hunger = Math.min(this.maxHunger, this.hunger + 12);
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

  touchCheckpoint() {
    if (this.checkpointActive) return;
    this.checkpointActive = true;

    this.checkpoint.clearTint();
    this.spawnPoint = { x: CHECKPOINT_X * S, y: 580 * S };
    this.checkpointRespawnReady = true;

    sfx.checkpoint();
    this.spawnPuff(this.checkpoint.x, this.checkpoint.y, 1.3);
    this.floatText(this.checkpoint.x, this.checkpoint.y - 16 * S, t('float.checkpoint'));
    if (this.healHealth(1)) {
      this.floatText(this.checkpoint.x, this.checkpoint.y - 26 * S, t('float.life'), FOLK_CSS.danger);
    }
  }

  touchCheckpoint2() {
    if (this.checkpoint2Active) return;
    this.checkpoint2Active = true;

    this.checkpoint2.clearTint();
    this.spawnPoint = { x: CHECKPOINT2_X * S, y: 580 * S };
    this.checkpointRespawnReady = true;

    sfx.checkpoint();
    this.spawnPuff(this.checkpoint2.x, this.checkpoint2.y, 1.3);
    this.floatText(
      this.checkpoint2.x,
      this.checkpoint2.y - 16 * S,
      t('float.checkpoint'),
    );
    if (this.healHealth(1)) {
      this.floatText(
        this.checkpoint2.x,
        this.checkpoint2.y - 26 * S,
        t('float.life'),
        FOLK_CSS.danger,
      );
    }
  }

  isStomping(target) {
    if (!target.body) return false;
    if (this.dog.stompGraceUntil > this.time.now) return false;
    // Require Bonjo's feet to be above the target and to have crossed the
    // target's top from above. A centre comparison counted side contact as a
    // stomp because Bonjo's body is taller than a rival's, which turned enemy
    // charges into repeated bounces.
    const feet = this.dog.body.bottom;
    const previousFeet = this.dog.body.prev.y + this.dog.body.height;
    const targetTop = target.body.top;
    return (
      this.dog.body.velocity.y > 10 * S &&
      feet <= targetTop + 10 * S &&
      previousFeet <= targetTop + 10 * S
    );
  }

  isAboveEnemy(target) {
    if (!target.body) return false;
    return this.dog.body.bottom <= target.body.top + 10 * S;
  }

  bounceOffEnemy() {
    // Landing on an enemy is a safe bounce, not an attack.
    this.dog.stompGraceUntil = this.time.now + 320;
    this.dog.body.velocity.y = -tuning.flapImpulse * 1.15 * S;
    sfx.stomp();
    this.spawnPuff(this.dog.x, this.dog.y + 4 * S, 0.55);
  }

  subdueCrow(crow) {
    crow.defeated = true;
    crow.body.enable = false;
    this.bonesCount += 1;
    this.maybeDropConcha(crow.x, crow.y);
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
  }

  spinHitCrow(crow) {
    if (crow.defeated || !crow.active) return;
    const above = this.isAboveEnemy(crow);
    this.subdueCrow(crow);
    this.onAttackHit(crow, 'spin');
    if (above) this.bounceOffEnemy();
  }

  slideHitCrow(crow) {
    if (
      crow.defeated ||
      !crow.active ||
      this.slideHitTargets?.has(crow)
    ) {
      return;
    }
    this.slideHitTargets?.add(crow);
    this.subdueCrow(crow);
    this.onAttackHit(crow, 'slide');
  }

  hitCrow(dog, crow) {
    if (crow.defeated || !crow.active) return;

    if (this.dog.slideUntil > this.time.now) {
      this.slideHitCrow(crow);
      return;
    }

    if (this.isStomping(crow)) {
      this.bounceOffEnemy();
      return;
    }

    this.hurt(crow);
  }

  critterVoice(critter) {
    if (critter.voice && typeof sfx[critter.voice] === 'function') {
      sfx[critter.voice]();
    }
  }

  subdueSquirrel(squirrel) {
    if (squirrel.defeated || !squirrel.active) return;

    squirrel.defeated = true;
    squirrel.body.enable = false;
    this.dropSquirrelBone(squirrel);
    this.maybeDropConcha(squirrel.x + 8 * S, squirrel.y - 8 * S);
    this.critterVoice(squirrel);
    this.spawnPuff(squirrel.x, squirrel.y, 1);
    this.tweens.add({
      targets: squirrel,
      y: squirrel.y - 14 * S,
      alpha: 0,
      angle: 90,
      duration: 250,
      onComplete: () => squirrel.destroy(),
    });
  }

  spinHitSquirrel(squirrel) {
    if (squirrel.defeated || !squirrel.active) return;
    const above = this.isAboveEnemy(squirrel);
    this.subdueSquirrel(squirrel);
    this.onAttackHit(squirrel, 'spin');
    if (above) this.bounceOffEnemy();
  }

  slideHitSquirrel(squirrel) {
    if (
      squirrel.defeated ||
      !squirrel.active ||
      this.slideHitTargets?.has(squirrel)
    ) {
      return;
    }
    this.slideHitTargets?.add(squirrel);
    this.subdueSquirrel(squirrel);
    this.onAttackHit(squirrel, 'slide');
  }

  hitSquirrel(dog, squirrel) {
    if (squirrel.defeated || !squirrel.active) return;

    // Spin and slide are attack windows for small bone thieves too.
    if (this.dog.slideUntil > this.time.now) {
      this.slideHitSquirrel(squirrel);
      return;
    }
    if (this.dog.spinUntil > this.time.now) {
      this.spinHitSquirrel(squirrel);
      return;
    }

    // Landing on it is a safe bounce; attacks subdue it.
    if (this.isStomping(squirrel)) {
      this.bounceOffEnemy();
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
    this.critterVoice(squirrel);
    this.floatText(squirrel.x, squirrel.y - 22 * S, t('float.hey'), FOLK_CSS.gold);
  }

  dropSquirrelBone(squirrel) {
    const bone = squirrel.carried;
    if (!bone) return;

    squirrel.carried = null;
    squirrel.carrying = false;
    squirrel.boneIcon.setVisible(false);

    bone.enableBody(true, squirrel.x, squirrel.y - 6 * S, true, true);
    bone.body.setSize(8 * S, 6 * S);
    this.floatText(squirrel.x, squirrel.y - 20 * S, t('float.bone'), FOLK_CSS.cream);
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
      this.floatText(squirrel.x, squirrel.y - 20 * S, t('float.gone'), FOLK_CSS.danger);
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

  slideHitRival(rival) {
    if (
      rival.defeated ||
      !rival.active ||
      this.slideHitTargets?.has(rival)
    ) {
      return;
    }
    this.slideHitTargets?.add(rival);

    const dir = Math.sign(rival.x - this.dog.x) || this.dog.facing || 1;
    const defeated = this.damageRival(rival, 2, {
      source: 'slide',
      bounce: false,
    });
    if (!defeated && rival.active) {
      rival.stun(500);
      rival.stunSlideUntil = this.time.now + 240;
      rival.body.setVelocityX(dir * 300 * S);
      rival.body.setVelocityY(-110 * S);
    }
    this.onAttackHit(rival, 'slide');
  }

  hitRival(dog, rival) {
    if (rival.defeated || !rival.active) return;
    // Spin and slide are attack windows; neither is a vulnerability window.
    if (this.dog.spinUntil > this.time.now) return;
    if (this.dog.slideUntil > this.time.now) {
      this.slideHitRival(rival);
      return;
    }

    // Landing on a rival is a safe bounce, not an attack; the spin and slide
    // are the damage windows.
    if (this.isStomping(rival)) {
      this.bounceOffEnemy();
      return;
    }

    // A dazed rival is not a hazard. Without this, Bonjo could hit with the
    // tail sweep, stay in contact, then take a hit the moment the sweep ended.
    if (rival.stunUntil > this.time.now) return;
    if (rival.contactGraceUntil > this.time.now) return;

    this.hurt(rival);
  }

  // Spin is the everyday attack: one point per spin, plus a short daze and
  // knockback. Slide is the committed ground finisher: two points, strong
  // knockback and heavy impact.
  applySpinHit(rival) {
    if (rival.defeated || !rival.active) return;

    const wasReady =
      rival.maxHealth <= 1 || this.time.now >= (rival.nextHit || 0);
    const dir = Math.sign(rival.x - this.dog.x) || this.dog.facing || 1;
    rival.stun(550);
    rival.stunSlideUntil = this.time.now + 140;
    rival.body.setVelocityX(dir * 80 * S);
    rival.body.setVelocityY(0);
    this.damageRival(rival, 1, { source: 'spin', bounce: false });
    if (wasReady) this.onAttackHit(rival, 'spin');
    if (this.isAboveEnemy(rival)) this.bounceOffEnemy();
  }

  damageRival(rival, amount = 1, opts = {}) {
    if (rival.defeated || !rival.active) return false;

    // A successful hit buys Bonjo a beat to reposition. This also prevents a
    // rival pinned against a turf edge from counter-hitting at stun expiry.
    rival.contactGraceUntil = Math.max(
      rival.contactGraceUntil,
      this.time.now + 900,
    );

    if (rival.maxHealth > 1) {
      const now = this.time.now;
      if (now < (rival.nextHit || 0)) return false;
      rival.nextHit = now + (opts.source === 'spin' ? 350 : 520);
      rival.health = Math.max(0, rival.health - amount);
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
          FOLK_CSS.gold,
        );
        return false;
      }
    }

    rival.defeated = true;
    rival.body.enable = false;

    let reward = 1;
    if (rival.role === 'alpha') {
      reward = 3;
      this.onAlphaDefeated();
    } else if (rival.role === 'rusher') {
      this.gateAlert = false;
      this.setGateCallVisible(false);
      if (this.gateCallAchievementPending && !this.gateBroken) {
        this.unlockGateAchievement();
      }
      this.gateCallAchievementPending = false;
    } else if (rival.role === 'brute') {
      reward = 2;
    }

    if (rival.stolenBones) {
      this.bonesCount += rival.stolenBones;
      rival.stolenBones = 0;
    }

    this.bonesCount += reward;
    this.rivalsSubdued += 1;
    if (
      this.phase === 'night' &&
      this.features?.errands !== false &&
      this.nightRivalsSubdued < 2
    ) {
      this.nightRivalsSubdued += 1;
      if (this.nightRivalsSubdued === 2) {
        this.floatText(rival.x, rival.y - 28 * S, t('errands.rivalsDone'), FOLK_CSS.mint);
        this.updateGoalHud();
      }
    }
    this.maybeDropConcha(rival.x, rival.y - 8 * S);
    sfx.yelp();
    this.spawnPuff(rival.x, rival.y, rival.role === 'alpha' ? 1.5 : 1);
    this.floatText(rival.x, rival.y - 12 * S, `+${reward}`, FOLK_CSS.gold);

    this.tweens.add({
      targets: rival,
      y: rival.y - 16 * S,
      alpha: 0,
      scaleX: 0.7,
      scaleY: 0.7,
      duration: 260,
      onComplete: () => rival.destroy(),
    });

    return true;
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

    const drop = { groundY: pinata.groundY };
    this.spawnBoneAt(pinata.x, pinata.y + 12 * S, drop);
    this.floatText(
      pinata.x,
      pinata.y - 22 * S,
      pinata.hits >= 3 ? t('float.orale') : t('float.echale'),
      FOLK_CSS.gold,
    );

    if (pinata.hits >= 3) {
      for (let i = 0; i < 3; i++) {
        this.spawnBoneAt(
          pinata.x + (i - 1) * 16 * S,
          pinata.y + (i % 2 ? 8 : 18) * S,
          drop,
        );
      }
      this.spawnPuff(pinata.x, pinata.y, 1.5);
      sfx.burst();
      if (pinata.hasLife) {
        this.spawnLifeAt(pinata.x, pinata.y + 20 * S, drop);
      } else {
        this.spawnFoodAt(pinata.x, pinata.y + 20 * S, drop);
      }
      pinata.destroy();
    }
  }

  dropPickupToGround(pickup, groundY, spread = 18) {
    pickup.setData('falling', true);
    this.tweens.add({
      targets: pickup,
      x: pickup.x + Phaser.Math.Between(-spread * S, spread * S),
      y: groundY - 7 * S,
      duration: Phaser.Math.Between(420, 610),
      delay: Phaser.Math.Between(0, 90),
      ease: 'Bounce.out',
      onComplete: () => {
        if (pickup.active) pickup.setData('falling', false);
      },
    });
  }

  spawnBoneAt(x, y, opts = {}) {
    const bone = this.boneGroup.create(x, y, 'boneIcon');
    bone.setDepth(ENTITY_DEPTH);
    bone.setScale(0.7);
    bone.body.setSize(8 * S, 6 * S);

    this.tweens.add({
      targets: bone,
      alpha: 0.5,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    if (opts.groundY != null) this.dropPickupToGround(bone, opts.groundY);
    this.spawnPuff(x, y, 0.6);
  }

  canLandOnAwning(dog) {
    return dog.body.velocity.y > 0;
  }

  bounceAwning(dog, awning) {
    dog.body.velocity.y = -620 * S;
    dog.jumpCutReady = false;
    dog.grounded = false;

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
    if (this.dog.dodgeUntil > this.time.now) return;
    if (this.dog.stompGraceUntil > this.time.now) return;

    this.resetCombo();
    this.health -= 1;
    this.runStats.damage += 1;
    this.updateSurvivalHud();

    if (this.health <= 0) {
      if (this.tryCheckpointRetry()) return;
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
      this.floatText(source.x, source.y - 24 * S, t('float.stolen'), FOLK_CSS.danger);
    }

    sfx.hurt();
    this.dog.invuln = 1.7;
    this.dog.setTint(0xff6b6b);
    this.time.delayedCall(180, () => this.dog.clearTint());

    const dir = source
      ? Math.sign(this.dog.x - source.x) || 1
      : -this.dog.facing;

    // Keep any upward momentum from a jump or flap, but never turn a grounded
    // hit into a launch. The old upward nudge made repeated enemy contact look
    // like Bonjo was jumping on his own.
    const risingVelocity = this.dog.body.velocity.y;
    this.dog.body.velocity.x = dir * 360 * S;
    this.dog.body.velocity.y = Math.min(risingVelocity, 0);
    this.dog.stompGraceUntil = Math.max(
      this.dog.stompGraceUntil,
      this.time.now + 320,
    );

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
      if (this.tryCheckpointRetry()) return;
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

    if (this.health <= 0 && !this.tryCheckpointRetry()) {
      this.gameOver();
      return;
    }
  }

  hideEndHud() {
    this.setLowHealthWarning(false);
    this.closeObjectives();
    for (const wasp of this.waspNests || []) {
      if (wasp.nest?.body) wasp.nest.body.enable = false;
    }
    this.timeShardGroup?.clear(true, true);
    this.bossTracker?.setVisible(false);
    this.slideAura?.destroy();
    this.slideAura = null;
    this.spinTail?.destroy();
    this.spinTail = null;
    this.pips.setVisible(false);
    this.staminaIcons?.forEach((icon) => icon.setVisible(false));
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
    this.objectivesTabButtons?.objectives.setVisible(false);
    this.objectivesTabButtons?.instructions.setVisible(false);
    this.objectivesMenuButton?.setVisible(false);
    this.objectivesClose?.setVisible(false);
    this.interactBubble?.setVisible(false);
    this.hearts.forEach((heart) => heart.setVisible(false));
    this.hungerIcon.setVisible(false);
    this.hungerBar.setVisible(false);
    this.phaseText.setVisible(false);
    this.gateText?.setVisible(false);
    this.clockGraphics?.setVisible(false);
    this.clockText?.setVisible(false);
    this.clockGlow?.setVisible(false);
    this.setLowHealthWarning(false);
    if (this.respawnNotice) {
      this.tweens.killTweensOf(this.respawnNotice);
      this.respawnNotice.destroy();
      this.respawnNotice = null;
    }
    this.poloIcon?.setVisible(false);
    this.bellIcon?.setVisible(false);
    this.alphaCrown?.setVisible(false);
    this.gui?.hide();
    this.closeDialog();
    this.touchWasVisible = !!this.touch?.visible;
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
    const gatekeeperBonus = this.gateDefenseAchievement ? 150 : 0;

    return (
      this.bonesCount * 10 +
      this.maxCombo * 20 +
      this.rivalsSubdued * 30 +
      this.health * 50 +
      this.powerUps * 100 +
      timeBonus +
      noHit +
      alphaBonus +
      gatekeeperBonus
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
      gatekeeper: this.gateDefenseAchievement,
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

  tryCheckpointRetry() {
    if (!this.checkpointRespawnReady) return false;
    this.checkpointRespawnReady = false;

    this.health = this.maxHealth;
    this.hunger = Math.max(this.hunger, 50);
    this.dog.dead = false;
    this.dog.body.reset(this.spawnPoint.x, this.spawnPoint.y);
    this.dog.setVelocity(0, 0);
    this.dog.setRotation(0);
    this.dog.setAlpha(1);
    this.dog.clearTint();
    this.dog.invuln = 2.4;
    this.dog.flaps = this.dog.maxFlaps;
    this.dog.stamina = this.dog.maxStamina;
    this.touch?.reset();
    this.resetCombo();
    this.updateSurvivalHud();
    this.cameras.main.flash(180, 110, 198, 168);
    this.spawnImpactBurst(this.dog.x, this.dog.y, {
      color: FOLK.mint,
      radius: 22 * S,
      width: 2.5 * S,
      duration: 320,
      puffs: 4,
    });
    this.showRespawnNotice();
    sfx.checkpoint();
    return true;
  }

  showRespawnNotice() {
    if (this.respawnNotice) {
      this.tweens.killTweensOf(this.respawnNotice);
      this.respawnNotice.destroy();
    }

    const W = this.scale.width;
    const w = Math.min(W - 32 * U, 360 * U);
    const h = 54 * U;
    const root = this.add
      .container(W / 2, 52 * S)
      .setScrollFactor(0)
      .setDepth(220)
      .setAlpha(0);

    const panel = this.add.graphics();
    panel.fillStyle(FOLK.ink, 0.9);
    panel.fillRoundedRect(-w / 2, -h / 2, w, h, 8 * U);
    panel.lineStyle(1 * U, FOLK.mint, 0.95);
    panel.strokeRoundedRect(-w / 2, -h / 2, w, h, 8 * U);
    const title = this.add
      .text(0, -10 * U, t('respawn.title'), {
        fontFamily: FONT,
        fontStyle: 'bold',
        fontSize: MENU_TEXT.heading,
        color: FOLK_CSS.mint,
        stroke: FOLK_CSS.ink,
        strokeThickness: 2 * S,
        align: 'center',
      })
      .setOrigin(0.5);
    const body = this.add
      .text(0, 12 * U, t('respawn.body'), {
        fontFamily: FONT,
        fontSize: MENU_TEXT.body,
        color: FOLK_CSS.cream,
        align: 'center',
        wordWrap: { width: w - 24 * U },
      })
      .setOrigin(0.5);

    root.add([panel, title, body]);
    this.respawnNotice = root;
    this.tweens.add({
      targets: root,
      alpha: 1,
      duration: 180,
      hold: 1500,
      yoyo: true,
      onComplete: () => {
        root.destroy();
        if (this.respawnNotice === root) this.respawnNotice = null;
      },
    });
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
    const elapsed = ((this.time.now - this.startedAt) / 1000).toFixed(1);
    this.showEndOverlay({
      titleText: t('gameover.title'),
      titleColor: FOLK_CSS.coral,
      statsText: t('gameover.stats', {
        bones: this.bonesCount,
        nights: this.nightsSurvived,
        time: elapsed,
      }),
      rankText: t('run.score', { score: this.score, rank: this.rank }),
      promptText: t(
        this.touchWasVisible ? 'gameover.againTouch' : 'gameover.again',
      ),
      onActivate: () => this.scene.restart(),
    });
  }

  showEndOverlay({
    titleText,
    titleColor,
    epilogueText = null,
    statsText,
    rankText,
    promptText,
    onActivate,
  }) {
    const W = this.scale.width;
    const cardW = Math.min(W - 64 * U, 440 * U);

    const overlay = this.add
      .rectangle(W / 2, 72 * S, W, 144 * S, FOLK.ink, 0.82)
      .setScrollFactor(0)
      .setDepth(200);

    this.enableReplay(overlay, onActivate);

    const card = this.add.graphics().setScrollFactor(0).setDepth(201);
    drawFolkCard(card, W / 2, 144 * U, cardW, 220 * U);

    const title = this.add
      .text(W / 2, 40 * S, titleText, {
        fontFamily: FONT,
        fontStyle: 'bold',
        fontSize: MENU_TEXT.display,
        color: titleColor,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(202);

    let epilogue = null;
    if (epilogueText) {
      epilogue = this.add
        .text(W / 2, 53 * S, epilogueText, {
          fontFamily: FONT,
          fontSize: MENU_TEXT.body,
          color: FOLK_CSS.ink,
          align: 'center',
          wordWrap: { width: cardW - 24 * U },
        })
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(202);
    }

    const stats = this.add
      .text(W / 2, epilogueText ? 72 * S : 64 * S, statsText, {
        fontFamily: FONT,
        fontSize: MENU_TEXT.body,
        color: FOLK_CSS.ink,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(202);

    const rankLabel = this.gateDefenseAchievement
      ? `${rankText} · ${t('achievement.gatekeeperShort')}`
      : rankText;
    const rank = this.add
      .text(W / 2, epilogueText ? 86 * S : 82 * S, rankLabel, {
        fontFamily: FONT,
        fontStyle: 'bold',
        fontSize: MENU_TEXT.heading,
        color: FOLK_CSS.teal,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(202);

    const promptY = epilogueText
      ? 100 * S
      : this.compactLayout
        ? 96 * S
        : 100 * S;
    const promptButton = addMenuButton(this, {
      x: W / 2,
      y: promptY,
      label: promptText,
      variant: 'primary',
      fontSize: MENU_TEXT.body,
      minWidth: 160 * S,
      height: 18 * S,
      depth: 202,
      scrollFactor: 0,
    });

    const mapButton = this.addEndMapButton();
    this.endLayout = {
      overlay,
      card,
      title,
      epilogue,
      stats,
      rank,
      promptButton,
      promptY,
      cardW,
      mapButton,
    };
    this.layoutEndScreen(W);
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
    const nextLevel = getNextLevel(this.levelId);
    this.showEndOverlay({
      titleText: t(this.levelData.winTitleKey || 'win.title'),
      titleColor: FOLK_CSS.teal,
      epilogueText: t(
        this.levelData.winEpilogueKey || 'win.casaEpilogue',
      ),
      statsText: t('win.stats', {
        bones: this.bonesCount,
        nights: this.nightsSurvived,
        time: elapsed,
      }),
      rankText: t('run.score', { score: this.score, rank: this.rank }),
      promptText: nextLevel
        ? t('win.next', { level: t(nextLevel.nameKey) })
        : t('win.returnMap'),
      onActivate: () => this.advanceAfterWin(),
    });
  }

  addEndMapButton() {
    const touch = this.touchWasVisible;
    const mapButton = addMenuButton(this, {
      label: t(touch ? 'map.shortcutTouch' : 'map.shortcut'),
      variant: 'secondary',
      fontSize: MENU_TEXT.body,
      paddingX: touch ? 8 * U : 3 * U,
      paddingY: touch ? 6 * U : 2 * U,
      depth: 204,
      scrollFactor: 0,
      onClick: () => this.scene.start('Map'),
    });
    return mapButton;
  }

  advanceAfterWin() {
    if (this.endTransition) return;
    this.endTransition = true;
    const next = getNextLevel(this.levelId);
    if (!next) {
      this.scene.start('Map');
      return;
    }
    this.cameras.main.fadeOut(180, 27, 16, 41);
    this.uiCamera?.fadeOut(180, 27, 16, 41);
    this.time.delayedCall(190, () => {
      this.scene.start(next.scene, { levelId: next.id });
    });
  }

  enableReplay(overlay, onActivate = () => this.scene.restart()) {
    // Give the end screen a beat before accepting a tap, so a stray touch
    // during the death/win transition doesn't instantly restart.
    this.time.delayedCall(500, () => {
      if (!overlay.active) return;
      overlay.setInteractive({ useHandCursor: true });
      overlay.once('pointerdown', onActivate);
    });
  }
}
