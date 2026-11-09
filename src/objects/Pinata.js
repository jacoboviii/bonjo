import Phaser from 'phaser';
import { SCALE } from '../scale.js';

const S = SCALE;

// ---------------------------------------------------------------------------
// A hanging piñata. Bonjo can jump/flap/dive into it; each hit showers a bone,
// and the third hit bursts it. Purely a reward, never a hazard.
// ---------------------------------------------------------------------------
export default class Pinata extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'pinata');

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.body.setSize(24 * S, 24 * S);
    this.setDepth(8);

    this.hits = 0;
    this.lastHit = -9999;

    this.rope = scene.add
      .tileSprite(x, y - 15 * S - 50 * S, 2 * S, 50 * S, 'rope')
      .setOrigin(0.5, 0)
      .setDepth(5);

    this.once('destroy', () => this.rope.destroy());
  }
}
