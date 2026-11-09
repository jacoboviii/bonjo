import Phaser from 'phaser';
import Boot from './scenes/Boot.js';
import Title from './scenes/Title.js';
import Level1 from './scenes/Level1.js';
import { GAME_W, GAME_H } from './scale.js';

// The game renders at 512x288 (SCALE=2 of the 256x144 design view) and is
// scaled up to fit the window. Everything is drawn at 2x density, so text and
// sprites stay the same physical size but have twice the detail.
export const GAME_WIDTH = GAME_W;
export const GAME_HEIGHT = GAME_H;

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
  scene: [Boot, Title, Level1],
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

const onViewportChange = () => setTimeout(syncRotateHint, 120);
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
