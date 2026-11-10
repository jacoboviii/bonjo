import Phaser from 'phaser';
import { SCALE } from '../scale.js';

const S = SCALE;

// ---------------------------------------------------------------------------
// A squirrel patrols a platform, hops, and runs off with any bone it can grab
// while the dog is nearby. Dive/stomp it to make it drop the bone. If it
// reaches the end of its patrol while carrying, it escapes with the loot.
// At night the same bone-thief slot becomes a nocturnal skunk.
// ---------------------------------------------------------------------------
export default class Squirrel extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, minX, maxX) {
    super(scene, x, y, 'squirrel');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(9);
    this.body.setSize(10 * S, 10 * S).setOffset(3 * S, 3 * S);
    this.body.setGravityY(1600 * S);
    this.body.setMaxVelocity(110 * S, 450 * S);

    this.minX = minX;
    this.maxX = maxX;
    this.dir = -1;
    this.baseSpeed = 55 * S;
    this.fleeSpeed = 80 * S;
    this.idleTexture = 'squirrel';
    this.runTexture = 'squirrelRun';

    this.carrying = false;
    this.carried = null;
    this.defeated = false;
    this.startled = 0;

    this.animT = Math.random();
    this.hopTimer = 1.2 + Math.random() * 2;

    this.boneIcon = scene.add
      .image(x, y, 'bone')
      .setScale(0.45)
      .setDepth(11)
      .setVisible(false);

    this.once('destroy', () => this.boneIcon?.destroy());

    this.body.setVelocityX(-this.baseSpeed);
  }

  setNightMode(night) {
    this.idleTexture = night ? 'skunk' : 'squirrel';
    this.runTexture = night ? 'skunkRun' : 'squirrelRun';
    if (this.active) this.setTexture(this.idleTexture);
  }

  update(dt) {
    if (this.defeated || !this.active) return;

    this.animT += dt;

    // brief "I've got it!" pause before bolting, so the player can react
    if (this.startled > 0) {
      this.startled -= dt;
      this.body.setVelocityX(0);
      this.setFlipX(this.dir < 0);
      const startledPose =
        Math.floor(this.animT * 10) % 2 === 0
          ? this.idleTexture
          : this.runTexture;
      if (this.texture.key !== startledPose) this.setTexture(startledPose);
      if (this.boneIcon.visible) {
        this.boneIcon.setPosition(this.x, this.y - 12 * S);
      }
      return;
    }

    const onGround = this.body.blocked.down;
    const speed = this.carrying ? this.fleeSpeed : this.baseSpeed;

    if (this.carrying) {
      // sprint to the patrol edge and get away with the bone
      if (
        (this.dir < 0 && this.x <= this.minX + 2 * S) ||
        (this.dir > 0 && this.x >= this.maxX - 2 * S)
      ) {
        this.scene.squirrelEscapes(this);
        return;
      }
    } else {
      if (this.x <= this.minX) this.dir = 1;
      if (this.x >= this.maxX) this.dir = -1;
    }

    this.body.setVelocityX(this.dir * speed);

    if (onGround) {
      this.hopTimer -= dt;
      if (this.hopTimer <= 0) {
        this.hopTimer = (this.carrying ? 0.7 : 1.6) + Math.random() * 1.6;
        this.body.setVelocityY(-260 * S);
      }
    }

    this.setFlipX(this.dir < 0);

    const pose =
      Math.floor(this.animT * 10) % 2 === 0
        ? this.idleTexture
        : this.runTexture;
    if (this.texture.key !== pose) this.setTexture(pose);

    if (this.boneIcon.visible) {
      this.boneIcon.setPosition(this.x, this.y - 12 * S);
    }
  }
}
