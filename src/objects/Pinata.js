import Phaser from 'phaser';
import { SCALE } from '../scale.js';

const S = SCALE;

// ---------------------------------------------------------------------------
// A hanging piñata. Bonjo can jump/flap into it; each hit showers a bone,
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

    const ropeTop = y - 15 * S - 50 * S;
    this.rope = scene.add
      .tileSprite(x, ropeTop, 2 * S, 50 * S, 'rope')
      .setOrigin(0.5, 0)
      .setDepth(5);

    // A utility pole and cross-street cable anchor the piñata instead of
    // letting the rope end in mid-air.
    const groundY = (opts.groundY ?? scene.levelData?.platforms?.[0]?.y ?? 600) * S;
    const postX = x - 54 * S;
    const post = scene.add.graphics().setDepth(3);
    post.fillStyle(0x2b1b3d, 1);
    post.fillRect(postX - 3 * S, ropeTop - 6 * S, 6 * S, groundY - ropeTop + 6 * S);
    post.fillStyle(0x7a4a2e, 1);
    post.fillRect(postX - 2 * S, ropeTop - 4 * S, 4 * S, groundY - ropeTop + 4 * S);
    post.fillStyle(0xd9b26a, 1);
    post.fillRect(postX - 1 * S, ropeTop - 2 * S, 1 * S, groundY - ropeTop - 2 * S);
    // crossarm, insulator and the short cable to the piñata rope
    post.fillStyle(0x2b1b3d, 1);
    post.fillRect(postX - 16 * S, ropeTop - 5 * S, 32 * S, 4 * S);
    post.fillStyle(0xd9b26a, 1);
    post.fillRect(postX - 14 * S, ropeTop - 3 * S, 28 * S, 1 * S);
    post.fillStyle(0x6ec6a8, 1);
    post.fillRect(postX + 13 * S, ropeTop - 8 * S, 2 * S, 4 * S);
    post.lineStyle(Math.max(1, S * 0.7), 0x2b1b3d, 0.9);
    post.lineBetween(postX + 15 * S, ropeTop - 2 * S, x, ropeTop);
    this.post = post;

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
      this.post?.destroy();
      this.post = null;
      this.lifeBadge?.destroy();
    });
  }
}
