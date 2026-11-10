import Phaser from 'phaser';
import Boot from './scenes/Boot.js';
import Title from './scenes/Title.js';
import Map from './scenes/Map.js';
import Level1 from './scenes/Level1.js';
import { GAME_W, GAME_H } from './scale.js';

// The height is fixed at 432 (3x the 144 design height). The width follows the
// device's landscape aspect ratio, clamped to 768..1280, so a 19.5:9 phone gets
// a wider internal canvas that still fills the screen with no side bars.
export const GAME_WIDTH = calculateWidth();
export const GAME_HEIGHT = GAME_H;

function viewportSize() {
  const host = document.getElementById('game');
  return {
    w: host?.clientWidth || window.innerWidth || GAME_W,
    h: host?.clientHeight || window.innerHeight || GAME_H,
  };
}

function calculateWidth() {
  const { w: vw, h: vh } = viewportSize();
  const long = Math.max(vw, vh);
  const short = Math.max(1, Math.min(vw, vh));
  const aspect = long / short;
  return Math.max(GAME_W, Math.min(1280, Math.round(GAME_H * aspect)));
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1b1029',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // gravity is applied by the dog, so it can change
      debug: false,
    },
  },
  scene: [Boot, Title, Map, Level1],
});

if (import.meta.env.DEV) window.__game = game;

// ---------------------------------------------------------------------------
// Portrait hint for phones. Sleep the game loop while the overlay is up so a
// mid-run rotation can't drop you into a pit.
// ---------------------------------------------------------------------------
const rotateHint = document.getElementById('rotate-hint');
const rotateDismiss = document.getElementById('rotate-dismiss');
let rotateDismissed = false;
let loopAsleep = false;

const isTouchDevice = () =>
  navigator.maxTouchPoints > 0 || 'ontouchstart' in window;

const isPortrait = () => window.innerHeight > window.innerWidth;

function syncRotateHint() {
  if (!rotateHint) return;

  const show = isTouchDevice() && isPortrait() && !rotateDismissed;
  rotateHint.classList.toggle('show', show);

  if (show) {
    // Call sleep every time: the game may have booted and started its loop
    // after our first call, and sleep() is idempotent.
    if (game.loop.running) game.loop.sleep();
    loopAsleep = true;
  } else if (loopAsleep) {
    game.loop.wake();
    loopAsleep = false;
  }
}

rotateDismiss?.addEventListener('click', () => {
  rotateDismissed = true;
  syncRotateHint();
});

let viewportTimer = null;
const onViewportChange = () => {
  clearTimeout(viewportTimer);
  viewportTimer = setTimeout(() => {
    syncRotateHint();

    // Browser chrome and rotation can change the usable aspect after boot.
    // Resize the internal canvas so FIT fills the new viewport, then let the
    // active scene re-anchor anything that depends on this.scale.width.
    const width = calculateWidth();
    if (Math.abs(width - game.scale.width) > 1) {
      // ScaleManager caches the FIT aspect ratio from boot. Update it before
      // resizing, otherwise the canvas keeps the old aspect and letterboxes.
      game.scale.displaySize.setAspectRatio(width / GAME_HEIGHT);
      game.scale.resize(width, GAME_HEIGHT);
    }
  }, 180);
};
window.addEventListener('resize', onViewportChange);
window.addEventListener('orientationchange', onViewportChange);
game.events.once('ready', syncRotateHint);
syncRotateHint();

// The game boots asynchronously. If this script runs before the loop starts,
// the first sleep() is a no-op - keep checking until the loop is up so a
// portrait phone really is paused behind the hint.
const portraitGuard = setInterval(() => {
  if (game.loop.running) {
    syncRotateHint();
    clearInterval(portraitGuard);
  }
}, 150);
setTimeout(() => clearInterval(portraitGuard), 6000);

