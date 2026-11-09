import Phaser from 'phaser';
import { SCALE } from '../scale.js';
import { sfx } from '../sfx.js';
import { t } from '../i18n.js';

const S = SCALE;

// ---------------------------------------------------------------------------
// A dog from another house. Patrols its turf, barks and chases Bonjo when he
// gets close, and flees when Bonjo dives on it. This is the block rivalry.
// ---------------------------------------------------------------------------
export default class RivalDog extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, minX, maxX) {
    super(scene, x, y, 'rival');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(9);
    this.body.setSize(20, 22).setOffset(6, 6);
    this.body.setGravityY(1600 * S);
    this.body.setMaxVelocity(260, 900);

    this.minX = minX;
    this.maxX = maxX;
    this.dir = -1;
    this.baseSpeed = 55 * S;
    this.chaseSpeed = 120 * S;
    this.chasing = false;
    this.defeated = false;
    this.animT = Math.random();
    this.nextBark = 0;

    this.body.setVelocityX(-this.baseSpeed);
  }

  update(dt) {
    if (this.defeated || !this.active) return;

    this.animT += dt;

    const dog = this.scene.dog;
    const dx = dog.x - this.x;
    const dy = Math.abs(dog.y - this.y);
    const near = !dog.dead && Math.abs(dx) < 220 * S && dy < 110 * S;

    if (near && !this.chasing && this.scene.time.now > this.nextBark) {
      this.nextBark = this.scene.time.now + 1600;
      sfx.bark();
      this.scene.floatText(this.x, this.y - 20 * S, t('bark'), '#ffd166');
      if (this.body.blocked.down) this.body.setVelocityY(-180 * S);
    }

    this.chasing = near;

    let vx = 0;
    if (near) {
      if (dx < -8 * S && this.x > this.minX + 2 * S) vx = -this.chaseSpeed;
      else if (dx > 8 * S && this.x < this.maxX - 2 * S) vx = this.chaseSpeed;
      this.dir = dx < 0 ? -1 : 1;
    } else {
      if (this.x <= this.minX) this.dir = 1;
      if (this.x >= this.maxX) this.dir = -1;
      vx = this.dir * this.baseSpeed;
    }

    this.body.setVelocityX(vx);
    this.setFlipX(this.dir < 0);

    const rate = near ? 14 : 9;
    const pose = Math.floor(this.animT * rate) % 2 === 0 ? 'rival' : 'rivalRun';
    if (this.texture.key !== pose) this.setTexture(pose);
  }
}
