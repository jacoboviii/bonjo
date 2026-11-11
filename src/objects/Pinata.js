import Phaser from 'phaser';
import { SCALE } from '../scale.js';

const S = SCALE;

// ---------------------------------------------------------------------------
// A hanging piñata. Bonjo can jump/flap/dive into it; each hit showers a bone,
// and the third hit bursts it. Marked piñatas release a life heart instead of
// a concha. Purely a reward, never a hazard.
// ---------------------------------------------------------------------------
export default class Pinata extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, opts = {}) {
    super(scene, x, y, 'pinata');

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.body.setSize(24 * S, 24 * S);
    this.setDepth(8);

    this.hits = 0;
    this.lastHit = -9999;
    this.hasLife = opts.life === true;

    this.rope = scene.add
      .tileSprite(x, y - 15 * S - 50 * S, 2 * S, 50 * S, 'rope')
      .setOrigin(0.5, 0)
      .setDepth(5);

    this.lifeBadge = null;
    if (this.hasLife) {
      this.lifeBadge = scene.add
        .image(x, y - 21 * S, 'lifeHeart')
        .setDepth(9)
        .setScale(0.8);
      scene.tweens.add({
        targets: this.lifeBadge,
        y: y - 25 * S,
        alpha: 0.62,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
      });
    }

    this.once('destroy', () => {
      this.rope.destroy();
      this.lifeBadge?.destroy();
    });
  }
}
