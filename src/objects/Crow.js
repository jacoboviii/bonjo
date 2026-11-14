import Phaser from 'phaser';
import { SCALE } from '../scale.js';
import { tuning } from '../tuning.js';
import { sfx } from '../sfx.js';
import { t } from '../i18n.js';

const S = SCALE;

// ---------------------------------------------------------------------------
// A crow patrols a horizontal stretch, bobbing on a sine wave.
// Land on it from a fall to pop it. Touch it any other way and you're
// knocked back to the last checkpoint. At night the same aerial slot becomes
// a hunting owl.
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
    this.nightMode = false;
    this.dayIdleTexture = 'crow';
    this.dayFlapTexture = 'crowFlap';
    this.nightIdleTexture = 'owl';
    this.nightFlapTexture = 'owlFlap';
    this.idleTexture = this.dayIdleTexture;
    this.flapTexture = this.dayFlapTexture;
    this.animT = Math.random();
    this.nextCaw = 600 + Math.random() * 1800;

    this.body.setVelocity(42 * S * tuning.enemySpeed, 0);
  }

  setNightMode(night) {
    this.nightMode = night;
    this.idleTexture = night ? this.nightIdleTexture : this.dayIdleTexture;
    this.flapTexture = night ? this.nightFlapTexture : this.dayFlapTexture;
    if (this.active) this.setTexture(this.idleTexture);
  }

  update(dt) {
    if (this.defeated || !this.active) return;

    this.t += dt * 3;
    this.animT += dt;
    const pose =
      Math.floor(this.animT * 7) % 2 === 0 ? this.idleTexture : this.flapTexture;
    if (this.texture.key !== pose) this.setTexture(pose);

    if (this.x >= this.maxX) this.dir = -1;
    if (this.x <= this.minX) this.dir = 1;

    const dog = this.scene.dog;
    if (
      dog &&
      !dog.dead &&
      Phaser.Math.Distance.Between(this.x, this.y, dog.x, dog.y) < 190 * S &&
      this.scene.time.now > this.nextCaw
    ) {
      this.nextCaw = this.scene.time.now + 2600 + Math.random() * 1800;
      if (this.nightMode) {
        sfx.owl();
        this.scene.floatText(this.x, this.y - 12 * S, t('float.hoot'), '#ffd166');
      } else {
        sfx.caw();
        this.scene.floatText(this.x, this.y - 12 * S, t('float.caw'), '#ffd166');
      }
    }

    this.body.setVelocity(
      this.dir * 42 * S * tuning.enemySpeed,
      Math.cos(this.t) * 8 * S,
    );
    this.setFlipX(this.dir < 0);
  }
}
