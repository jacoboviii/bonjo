import Phaser from 'phaser';
import { SCALE } from '../scale.js';
import { t, getLang, setLang, toggleLang } from '../i18n.js';

const S = SCALE;

export default class Title extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    this.input.topOnly = true;

    const W = this.scale.width;
    const H = this.scale.height;

    this.add.image(W / 2, H / 2, 'sky').setDisplaySize(W, H);
    this.add.image(W - 102, 52 * S, 'sun').setScale(1.4).setAlpha(0.95);

    this.far = this.add
      .tileSprite(0, 8 * S, W, 64 * S, 'cloudsFar')
      .setOrigin(0, 0)
      .setAlpha(0.5);
    this.near = this.add
      .tileSprite(0, 38 * S, W, 64 * S, 'cloudsNear')
      .setOrigin(0, 0)
      .setAlpha(0.75);
    this.add
      .tileSprite(0, 30 * S, W, 100 * S, 'town')
      .setOrigin(0, 0);

    // a very good dog, sitting and panting
    this.dogGroup = this.add.container(W / 2, 92 * S).setDepth(3);
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
      .text(W / 2, 28 * S, 'BONJO', {
        fontFamily: 'monospace',
        fontSize: 64,
        color: '#ffd166',
        stroke: '#2b1b3d',
        strokeThickness: 12,
      })
      .setOrigin(0.5);

    this.add
      .text(W / 2, 48 * S, t('title.subtitle'), {
        fontFamily: 'monospace',
        fontSize: 16,
        color: '#fff4e0',
        stroke: '#2b1b3d',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(W / 2, 64 * S, t('title.place'), {
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#6ec6a8',
        stroke: '#2b1b3d',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    const isTouch =
      this.sys.game.device.input.touch || navigator.maxTouchPoints > 0;

    const prompt = this.add
      .text(
        W / 2,
        114 * S,
        t(isTouch ? 'title.startTouch' : 'title.startKeyboard'),
        {
          fontFamily: 'monospace',
          fontSize: 20,
          color: '#fff4e0',
          stroke: '#2b1b3d',
          strokeThickness: 6,
        },
      )
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
      .text(W / 2, 133 * S, t('title.controls'), {
        fontFamily: 'monospace',
        fontSize: 14,
        color: '#fff4e0',
        stroke: '#2b1b3d',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setAlpha(0.9);

    this.add
      .text(6 * S, 6 * S, t('title.version'), {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#fff4e0',
      })
      .setAlpha(0.45);

    // --- EN / ES selector ------------------------------------------------
    const lang = getLang();

    const makeLangButton = (x, code) => {
      const active = lang === code;
      const button = this.add
        .text(x, 8 * S, code.toUpperCase(), {
          fontFamily: 'monospace',
          fontSize: 14,
          color: active ? '#ffd166' : '#8f7f97',
          stroke: '#2b1b3d',
          strokeThickness: 3,
        })
        .setOrigin(0.5, 0)
        .setDepth(20)
        .setAlpha(active ? 1 : 0.75)
        .setInteractive({ useHandCursor: true });

      button.on('pointerdown', (pointer, localX, localY, event) => {
        event?.stopPropagation?.();
        if (getLang() === code) return;
        setLang(code);
        this.scene.restart();
      });

      return button;
    };

    makeLangButton(W - 82, 'en');
    makeLangButton(W - 44, 'es');

    this.input.keyboard.on('keydown-L', () => {
      toggleLang();
      this.scene.restart();
    });

    // A full-screen start zone behind the language buttons. topOnly means
    // tapping EN/ES does not also start the game.
    const start = () => {
      if (this.started) return;
      this.started = true;
      this.scene.start('Level1');
    };

    const startZone = this.add
      .zone(0, 0, W, H)
      .setOrigin(0)
      .setDepth(-10)
      .setInteractive();
    startZone.once('pointerdown', start);

    this.input.keyboard.once('keydown-SPACE', start);
  }

  update(time, delta) {
    this.far.tilePositionX += delta * 0.006;
    this.near.tilePositionX += delta * 0.014;
  }
}
