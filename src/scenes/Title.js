import Phaser from 'phaser';
import { SCALE } from '../scale.js';
import { t, getLang, setLang, toggleLang } from '../i18n.js';
import { drawFolkCard } from '../ui/FolkCard.js';

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

    this.nearTown = this.add
      .tileSprite(0, 30 * S, W, 100 * S, 'nearTown')
      .setOrigin(0, 0);

    // street-level dressing framing the sitting dog
    const groundY = 130 * S;
    this.add.image(W * 0.15, groundY, 'carB').setOrigin(0.5, 1);
    this.add.image(W * 0.85, groundY, 'carC').setOrigin(0.5, 1).setFlipX(true);
    this.add.image(W * 0.3, groundY, 'bikeMint').setOrigin(0.5, 1);
    this.add.image(W * 0.7, groundY, 'bikeCoral').setOrigin(0.5, 1).setFlipX(true);
    this.add.image(W * 0.05, groundY, 'streetlamp').setOrigin(0.5, 1);
    this.add.image(W * 0.95, groundY, 'streetlamp').setOrigin(0.5, 1);

    this.add
      .image(W * 0.07, groundY, 'agave')
      .setOrigin(0.5, 1)
      .setScale(0.9)
      .setFlipX(true);
    this.add
      .image(W * 0.93, groundY, 'agaveBloom')
      .setOrigin(0.5, 1)
      .setScale(0.85);

    // atmosphere: city recedes, sitting dog and title copy stay clear
    this.add.rectangle(W / 2, H / 2, W, H, 0x2b5a86, 0.14);

    // Lotería-style paper card framing the hero
    this.titleCard = this.add.graphics();
    drawFolkCard(
      this.titleCard,
      W / 2,
      135,
      Math.min(W - 64, 340),
      230,
    );

    // a very good dog, sitting and panting
    this.dogGroup = this.add.container(W / 2, 92 * S).setDepth(3);
    const dog = this.add.sprite(0, 0, 'dogSit').setScale(1.5);
    const tongue = this.add
      .image(14 * 1.5, 2 * 1.5, 'tongue')
      .setOrigin(0.5, 0)
      .setScale(1.5);
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
        color: '#c94f3d',
        stroke: '#1d1326',
        strokeThickness: 12,
      })
      .setOrigin(0.5);

    this.add
      .text(W / 2, 48 * S, t('title.subtitle'), {
        fontFamily: 'monospace',
        fontSize: 16,
        color: '#1d1326',
        stroke: '#f4dfb0',
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    this.add
      .text(W / 2, 64 * S, t('title.place'), {
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#2f7f78',
        stroke: '#f4dfb0',
        strokeThickness: 2,
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
          color: '#c94f3d',
          stroke: '#1d1326',
          strokeThickness: 5,
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
        .text(x, 13 * S, code.toUpperCase(), {
          fontFamily: 'monospace',
          fontSize: 14,
          color: active ? '#c94f3d' : '#2f7f78',
          stroke: '#f4dfb0',
          strokeThickness: 1,
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

    makeLangButton(W / 2 + Math.min(W - 64, 340) / 2 - 54, 'en');
    makeLangButton(W / 2 + Math.min(W - 64, 340) / 2 - 24, 'es');

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

    this.layoutWidth = W;
    this.scale.on('resize', this.onResize, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.onResize, this);
    });
  }

  onResize(gameSize) {
    const width = gameSize?.width ?? this.scale.width;
    if (Math.abs(width - this.layoutWidth) <= 1) return;
    // Title has no run state; rebuild it against the new viewport width.
    this.scene.restart();
  }

  update(time, delta) {
    this.far.tilePositionX += delta * 0.006;
    this.near.tilePositionX += delta * 0.014;
  }
}
