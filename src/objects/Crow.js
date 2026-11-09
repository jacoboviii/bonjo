import Phaser from 'phaser';
import { SCALE } from '../scale.js';

const S = SCALE;

// ---------------------------------------------------------------------------
// A crow patrols a horizontal stretch, bobbing on a sine wave.
// Dive into it (or land on it) to pop it. Touch it any other way and you're
// knocked back to the last checkpoint.
// ---------------------------------------------------------------------------
export default class Crow extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, minX, maxX) {
    super(scene, x, y, 'crow');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(9);
    this.body.setAllowGravity(false);
    this.body.setSize(10 * S, 7 * S).setOffset(2 * S, 1 * S);
    this.body.setMaxVelocity(120 * S, 60 * S);

    this.minX = minX;
    this.maxX = maxX;
    this.dir = 1;
    this.baseY = y;
    this.t = Math.random() * Math.PI * 2;
    this.defeated = false;

    this.body.setVelocity(42 * S, 0);
  }

  update(dt) {
    if (this.defeated || !this.active) return;

    this.t += dt * 3;

    if (this.x >= this.maxX) this.dir = -1;
    if (this.x <= this.minX) this.dir = 1;

    this.body.setVelocity(this.dir * 42 * S, Math.cos(this.t) * 8 * S);
    this.setFlipX(this.dir < 0);
  }
}
