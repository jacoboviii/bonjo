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
  constructor(scene, x, y, minX, maxX, opts = {}) {
    super(scene, x, y, 'rival');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.role = opts.role || 'normal';
    this.health = opts.health || (this.role === 'brute' ? 2 : 1);
    this.maxHealth = this.health;
    this.baseTint = opts.tint ?? null;

    const scale = opts.scale ?? 1;
    if (scale !== 1) this.setScale(scale);
    if (this.baseTint !== null) this.setTint(this.baseTint);

    this.setDepth(this.role === 'alpha' ? 10 : 9);
    this.body.setSize(20, 22).setOffset(6, 6);
    this.body.setGravityY(1600 * S);
    this.body.setMaxVelocity(260, 900);

    this.minX = minX;
    this.maxX = maxX;
    this.dir = -1;
    this.baseSpeed = (opts.baseSpeed ?? 55) * S;
    this.chaseSpeed = (opts.chaseSpeed ?? 120) * S;
    this.chasing = false;
    this.defeated = false;
    this.animT = Math.random();
    this.nextBark = 0;
    this.nextHit = 0;
    this.nextAttack = 0;
    this.stunUntil = 0;
    this.stolenBones = 0;

    this.body.setVelocityX(-this.baseSpeed);
  }

  stun(ms = 1800) {
    if (this.defeated) return;
    this.stunUntil = this.scene.time.now + ms;
    this.body.setVelocityX(0);
    this.setTint(0xfff4e0);
    this.scene.floatText(this.x, this.y - 22 * S, '!', '#ffd166');
  }

  update(dt) {
    if (this.defeated || !this.active) return;

    this.animT += dt;

    if (this.stunUntil) {
      if (this.scene.time.now < this.stunUntil) {
        this.body.setVelocityX(0);
        return;
      }
      this.stunUntil = 0;
      if (this.baseTint !== null) this.setTint(this.baseTint);
      else this.clearTint();
    }

    const dog = this.scene.dog;

    // A thief that got a bone runs for the far edge; dive it to recover it.
    if (this.role === 'thief' && this.stolenBones) {
      this.dir = this.x < dog.x ? -1 : 1;
      if (this.x <= this.minX) this.dir = 1;
      else if (this.x >= this.maxX) this.dir = -1;
      this.body.setVelocityX(this.dir * this.chaseSpeed);
      this.setFlipX(this.dir < 0);
      this.playPose(14);
      return;
    }

    // Gate rushers ignore Bonjo and go straight for the porch gate.
    if (this.role === 'rusher') {
      const gateX = 160 * S;
      const dg = gateX - this.x;
      if (Math.abs(dg) > 8 * S) {
        this.dir = dg < 0 ? -1 : 1;
        this.body.setVelocityX(this.dir * this.chaseSpeed);
        this.setFlipX(this.dir < 0);
        this.playPose(14);
      } else {
        this.body.setVelocityX(0);
        this.setFlipX(false);
        this.setTexture('rival');
        if (this.scene.time.now > this.nextAttack) {
          this.nextAttack = this.scene.time.now + 1500;
          this.scene.damageGate?.(this);
        }
      }
      return;
    }

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

    this.playPose(near ? 14 : 9);
  }

  playPose(rate) {
    const pose = Math.floor(this.animT * rate) % 2 === 0 ? 'rival' : 'rivalRun';
    if (this.texture.key !== pose) this.setTexture(pose);
  }
}
