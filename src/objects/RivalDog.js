import Phaser from 'phaser';
import { SCALE } from '../scale.js';
import { tuning } from '../tuning.js';
import { sfx } from '../sfx.js';
import { t } from '../i18n.js';

const S = SCALE;

// ---------------------------------------------------------------------------
// A dog from another house. Patrols its turf, barks and chases Bonjo when he
// gets close, and flees when Bonjo slides into it or lands on it. This is the block rivalry.
// ---------------------------------------------------------------------------
export default class RivalDog extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, minX, maxX, opts = {}) {
    super(scene, x, y, opts.texture || 'rival');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.idleTexture = opts.texture || 'rival';
    this.runTexture = opts.runTexture || 'rivalRun';
    this.role = opts.role || 'normal';
    this.health = opts.health ?? (this.role === 'alpha' ? 5 : this.role === 'brute' ? 3 : 2);
    this.maxHealth = this.health;
    this.baseTint = opts.tint ?? null;

    const scale = opts.scale ?? 1;
    if (scale !== 1) this.setScale(scale);
    if (this.baseTint !== null) this.setTint(this.baseTint);

    this.setDepth(this.role === 'alpha' ? 10 : 9);
    this.body.setSize(10 * S, 11 * S).setOffset(3 * S, 3 * S);
    this.body.setGravityY(1600 * S);
    this.body.setMaxVelocity(300 * S, 450 * S);

    this.minX = minX;
    this.maxX = maxX;
    this.dir = -1;
    this.baseScale = opts.scale ?? 1;
    this.baseSpeed = (opts.baseSpeed ?? 55) * S;
    this.chaseSpeed = (opts.chaseSpeed ?? 120) * S;
    this.lungeSpeed = (opts.lungeSpeed ?? 190) * S;
    this.attackCooldown = opts.attackCooldown ?? (this.role === 'alpha' ? 3400 : 3200);
    this.attackState = null;
    this.attackUntil = 0;
    this.nextLunge = this.scene.time.now + 900 + Math.random() * 1400;
    this.nextTrail = 0;
    this.chasing = false;
    this.defeated = false;
    this.animT = Math.random();
    this.nextBark = 1200 + Math.random() * 1800;
    this.nextHit = 0;
    this.nextAttack = 0;
    this.stunUntil = 0;
    this.stunSlideUntil = 0;
    this.stolenBones = 0;

    this.body.setVelocityX(-this.baseSpeed * tuning.enemySpeed);
  }

  stun(ms = 1800) {
    if (this.defeated) return;
    this.cancelAttack();
    this.stunUntil = this.scene.time.now + ms;
    this.stunSlideUntil = 0;
    this.body.setVelocityX(0);
    this.setTint(0xfff4e0);
    this.scene.floatText(this.x, this.y - 22 * S, '!', '#ffd166');
  }

  restoreBaseTint() {
    if (this.baseTint !== null) this.setTint(this.baseTint);
    else this.clearTint();
  }

  cancelAttack() {
    this.attackState = null;
    this.setScale(this.baseScale);
    this.restoreBaseTint();
  }

  beginWindup(dog) {
    this.attackState = 'windup';
    this.attackUntil =
      this.scene.time.now + (this.role === 'alpha' ? 650 : 600);
    this.dir = dog.x < this.x ? -1 : 1;
    this.body.setVelocityX(0);
    this.setTexture(this.idleTexture);
    this.setFlipX(this.dir < 0);
    this.setScale(this.baseScale * 1.07, this.baseScale * 0.84);
    this.setTint(0xfff4e0);
    this.scene.floatText(this.x, this.y - 24 * S, '!', '#ffd166');
    sfx.growl();
  }

  beginLunge() {
    this.attackState = 'lunge';
    this.attackUntil =
      this.scene.time.now +
      (this.role === 'alpha'
        ? 480
        : this.role === 'fast'
          ? 340
          : this.role === 'brute'
            ? 440
            : 420);
    this.setScale(this.baseScale);
    this.restoreBaseTint();
    this.setTexture(this.runTexture);
    this.nextTrail = 0;
  }

  beginRecover() {
    this.attackState = 'recover';
    this.attackUntil =
      this.scene.time.now + (this.role === 'alpha' ? 620 : 460);
    this.body.setVelocityX(0);
    this.setScale(this.baseScale * 1.04, this.baseScale * 0.92);
    this.setTexture(this.idleTexture);
  }

  updateAttack() {
    const now = this.scene.time.now;

    if (this.attackState === 'windup') {
      this.body.setVelocityX(0);
      this.setFlipX(this.dir < 0);
      if (now >= this.attackUntil) this.beginLunge();
      return;
    }

    if (this.attackState === 'lunge') {
      const atEdge =
        (this.dir < 0 && this.x <= this.minX) ||
        (this.dir > 0 && this.x >= this.maxX);
      this.body.setVelocityX(
        atEdge ? 0 : this.dir * this.lungeSpeed * tuning.enemySpeed,
      );
      this.setFlipX(this.dir < 0);
      this.playPose(20);
      if (this.body.blocked.down && now > this.nextTrail) {
        this.nextTrail = now + 90;
        this.scene.spawnPuff(
          this.x - this.dir * 8 * S,
          this.y + 10 * S,
          0.4,
        );
      }
      const close = Math.abs(this.scene.dog.x - this.x) < 14 * S;
      if (now >= this.attackUntil || atEdge || close) this.beginRecover();
      return;
    }

    this.body.setVelocityX(0);
    if (now >= this.attackUntil) {
      this.cancelAttack();
      this.nextLunge = now + this.attackCooldown;
    }
  }

  update(dt) {
    if (this.defeated || !this.active) return;

    this.animT += dt;

    if (this.stunUntil) {
      if (this.scene.time.now < this.stunUntil) {
        // Let a short knockback slide finish before pinning the rival in place.
        if (this.scene.time.now >= (this.stunSlideUntil || 0)) {
          this.body.setVelocityX(0);
        }
        return;
      }
      this.stunUntil = 0;
      this.stunSlideUntil = 0;
      this.restoreBaseTint();
    }

    const dog = this.scene.dog;

    // A thief that got a bone runs for the far edge; slide it to recover it.
    if (this.role === 'thief' && this.stolenBones) {
      this.dir = this.x < dog.x ? -1 : 1;
      if (this.x <= this.minX) this.dir = 1;
      else if (this.x >= this.maxX) this.dir = -1;
      this.body.setVelocityX(this.dir * this.chaseSpeed * tuning.enemySpeed);
      this.setFlipX(this.dir < 0);
      this.playPose(14);
      return;
    }

    if (this.attackState) {
      this.updateAttack();
      return;
    }

    // Gate rushers ignore Bonjo and go straight for the porch gate.
    if (this.role === 'rusher') {
      const gateX = 160 * S;
      const dg = gateX - this.x;
      if (Math.abs(dg) > 8 * S) {
        this.dir = dg < 0 ? -1 : 1;
        this.body.setVelocityX(this.dir * this.chaseSpeed * tuning.enemySpeed);
        this.setFlipX(this.dir < 0);
        this.playPose(14);
      } else {
        this.body.setVelocityX(0);
        this.setFlipX(false);
        this.setTexture(this.idleTexture);
        if (this.scene.time.now > this.nextAttack) {
          this.nextAttack = this.scene.time.now + 1500;
          this.bark();
          this.scene.damageGate?.(this);
        }
      }
      return;
    }

    const dx = dog.x - this.x;
    const dy = Math.abs(dog.y - this.y);
    const near = !dog.dead && Math.abs(dx) < 220 * S && dy < 110 * S;
    const ambient = !dog.dead && Math.abs(dx) < 300 * S && dy < 130 * S;

    if ((near || ambient) && this.scene.time.now > this.nextBark) {
      this.nextBark =
        this.scene.time.now + (near ? 1800 : 4200 + Math.random() * 2600);
      this.bark();
      if (near && this.body.blocked.down) this.body.setVelocityY(-180 * S);
    }

    this.chasing = near;

    const canLunge =
      near &&
      this.role !== 'thief' &&
      this.role !== 'rusher' &&
      this.body.blocked.down &&
      Math.abs(dx) > 25 * S &&
      Math.abs(dx) < 110 * S &&
      this.scene.time.now > this.nextLunge;
    if (canLunge) {
      this.beginWindup(dog);
      return;
    }

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

    this.body.setVelocityX(vx * tuning.enemySpeed);
    this.setFlipX(this.dir < 0);

    this.playPose(near ? 14 : 9);
  }

  bark() {
    sfx.bark();
    this.scene.floatText(this.x, this.y - 20 * S, t('bark'), '#ffd166');
  }

  playPose(rate) {
    const pose =
      Math.floor(this.animT * rate) % 2 === 0
        ? this.idleTexture
        : this.runTexture;
    if (this.texture.key !== pose) this.setTexture(pose);
  }
}
