import Phaser from 'phaser';
import { SCALE } from '../scale.js';

const S = SCALE;

export default class Title extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    this.add.image(128 * S, 72 * S, 'sky');
    this.add.image(205 * S, 52 * S, 'sun').setScale(1.4).setAlpha(0.95);

    this.far = this.add
      .tileSprite(0, 8 * S, 320 * S, 64 * S, 'cloudsFar')
      .setOrigin(0, 0)
      .setAlpha(0.5);
    this.near = this.add
      .tileSprite(0, 38 * S, 320 * S, 64 * S, 'cloudsNear')
      .setOrigin(0, 0)
      .setAlpha(0.75);
    this.add
      .tileSprite(0, 30 * S, 320 * S, 100 * S, 'town')
      .setOrigin(0, 0);

    // a very good dog, hovering (with a panting purple tongue)
    this.dogGroup = this.add.container(128 * S, 92 * S).setDepth(3);
    const dog = this.add.sprite(0, 0, 'dogSit').setScale(2);
    const tongue = this.add
      .image(14 * 2, 2 * 2, 'tongue')
      .setOrigin(0.5, 0)
      .setScale(2);
    this.dogGroup.add([dog, tongue]);

    this.tweens.add({
      targets: this.dogGroup,
      y: 84 * S,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
    this.tweens.add({
      targets: tongue,
      scaleY: 2.1,
      duration: 180,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
    this.tweens.add({
      targets: tongue,
      angle: 5,
      duration: 380,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    this.add
      .text(128 * S, 28 * S, 'BONJO', {
        fontFamily: 'monospace',
        fontSize: 64,
        color: '#ffd166',
        stroke: '#2b1b3d',
        strokeThickness: 12,
      })
      .setOrigin(0.5);

    this.add
      .text(128 * S, 48 * S, 'the only chow on the block', {
        fontFamily: 'monospace',
        fontSize: 16,
        color: '#fff4e0',
        stroke: '#2b1b3d',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(128 * S, 64 * S, 'LA CUADRA  ·  MÉXICO', {
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#6ec6a8',
        stroke: '#2b1b3d',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    const prompt = this.add
      .text(128 * S, 114 * S, 'PRESS SPACE TO FLY', {
        fontFamily: 'monospace',
        fontSize: 20,
        color: '#fff4e0',
        stroke: '#2b1b3d',
        strokeThickness: 6,
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: prompt,
      alpha: 0.35,
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    this.add
      .text(128 * S, 133 * S, 'A/D move  ·  SPACE flap/glide  ·  S dive  ·  T tuning', {
        fontFamily: 'monospace',
        fontSize: 14,
        color: '#fff4e0',
        stroke: '#2b1b3d',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setAlpha(0.9);

    this.add
      .text(6 * S, 6 * S, 'PLAYTEST v0.3', {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#fff4e0',
      })
      .setAlpha(0.45);

    this.started = false;
    const start = () => {
      if (this.started) return;
      this.started = true;
      this.scene.start('Level1');
    };

    this.input.keyboard.once('keydown-SPACE', start);
    this.input.once('pointerdown', start);
  }

  update(time, delta) {
    this.far.tilePositionX += delta * 0.006;
    this.near.tilePositionX += delta * 0.014;
  }
}
