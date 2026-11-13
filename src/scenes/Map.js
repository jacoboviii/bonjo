import Phaser from 'phaser';
import { SCALE } from '../scale.js';
import { LEVELS } from '../levels/index.js';
import { readProgress, levelProgress } from '../progress.js';
import { t } from '../i18n.js';
import { drawFolkCard, FOLK } from '../ui/FolkCard.js';
import { sfx } from '../sfx.js';

const S = SCALE;
const U = S / 2;

/**
 * Stylized lotería-paper map of La Cuadra. It doubles as the level-select hub:
 * CASA is playable now, the other landmarks are visible future destinations.
 */
export default class Map extends Phaser.Scene {
  constructor() {
    super('Map');
  }

  create() {
    this.input.topOnly = true;
    this.isTouch =
      this.sys.game.device.input.touch || navigator.maxTouchPoints > 0;
    this.progress = readProgress();
    this.selectedId = 'laCuadra';
    this.nodeViews = [];

    const W = this.scale.width;
    const H = this.scale.height;
    this.mapW = W;
    this.mapH = H;

    this.add.image(W / 2, H / 2, 'sky').setDisplaySize(W, H).setAlpha(0.8);
    this.add.rectangle(W / 2, H / 2, W, H, 0x140c1c, 0.5);

    this.createBoard(W, H);
    this.createHeader(W, H);
    this.createMapPaper(W, H);
    this.createLandmarks(W, H);
    this.createDetails(W, H);
    this.createInput();
    this.selectLevel(this.selectedId);

    this.cameras.main.fadeIn(220, 27, 16, 41);

    const onResize = () => this.scene.restart();
    this.scale.on('resize', onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', onResize);
    });
  }

  createBoard(W, H) {
    this.boardW = Math.min(W - 30 * U, 660 * U);
    this.boardH = 250 * U;
    this.boardX = W / 2;
    this.boardY = H / 2;
    this.boardLeft = this.boardX - this.boardW / 2;
    this.boardTop = this.boardY - this.boardH / 2;
    this.boardRight = this.boardX + this.boardW / 2;
    this.boardBottom = this.boardY + this.boardH / 2;

    this.boardG = this.add.graphics().setDepth(1);
    drawFolkCard(this.boardG, this.boardX, this.boardY, this.boardW, this.boardH);
  }

  createHeader(W, H) {
    this.add
      .text(W / 2, this.boardTop + 12 * U, t('map.title'), {
        fontFamily: 'monospace',
        fontSize: 8 * S,
        color: '#c94f3d',
        stroke: '#1d1326',
        strokeThickness: 1.5 * S,
      })
      .setOrigin(0.5, 0)
      .setDepth(4);

    this.add
      .text(W / 2, this.boardTop + 34 * U, t('map.subtitle'), {
        fontFamily: 'monospace',
        fontSize: this.isTouch ? 5.5 * S : 4.5 * S,
        color: '#2f7f78',
      })
      .setOrigin(0.5, 0)
      .setDepth(4);

    this.backButton = this.add
      .text(8 * S, 7 * S, t('map.back'), {
        fontFamily: 'monospace',
        fontSize: this.isTouch ? 5.5 * S : 4.5 * S,
        color: '#1d1326',
        backgroundColor: '#f4dfb0',
      })
      .setPadding(
        this.isTouch ? 7 * U : 4 * U,
        this.isTouch ? 7 * U : 2 * U,
        this.isTouch ? 7 * U : 4 * U,
        this.isTouch ? 7 * U : 2 * U,
      )
      .setDepth(20)
      .setInteractive({ useHandCursor: true });
    this.backButton.on('pointerdown', () => this.goBack());
  }

  createMapPaper(W, H) {
    this.mapX = this.boardLeft + 18 * U;
    this.mapY = this.boardTop + 48 * U;
    this.mapWidth = this.boardW * 0.58;
    this.mapHeight = this.boardH - 68 * U;
    this.mapRight = this.mapX + this.mapWidth;
    this.mapBottom = this.mapY + this.mapHeight;

    this.paper = this.add.graphics().setDepth(2);
    this.paper.fillStyle(0xf3dfb8, 1);
    this.paper.fillRect(this.mapX, this.mapY, this.mapWidth, this.mapHeight);
    this.paper.lineStyle(2 * U, FOLK.ink, 0.75);
    this.paper.strokeRect(this.mapX, this.mapY, this.mapWidth, this.mapHeight);

    const g = this.paper;
    const xAt = (v) => this.mapX + v * this.mapWidth;
    const yAt = (v) => this.mapY + v * this.mapHeight;

    // City blocks behind the road grid.
    const blocks = [
      [0.04, 0.08, 0.22, 0.16, FOLK.teal],
      [0.32, 0.06, 0.2, 0.17, FOLK.coral],
      [0.58, 0.08, 0.17, 0.15, FOLK.marigold],
      [0.05, 0.32, 0.2, 0.16, FOLK.coral],
      [0.33, 0.32, 0.18, 0.17, FOLK.teal],
      [0.58, 0.32, 0.18, 0.16, FOLK.marigold],
      [0.07, 0.58, 0.18, 0.15, FOLK.marigold],
      [0.32, 0.58, 0.2, 0.15, FOLK.teal],
      [0.6, 0.56, 0.16, 0.14, FOLK.coral],
      [0.58, 0.76, 0.2, 0.14, FOLK.mint],
      [0.3, 0.78, 0.18, 0.12, FOLK.marigold],
    ];
    for (const [x, y, w, h, color] of blocks) {
      g.fillStyle(color, 0.55);
      g.fillRect(xAt(x), yAt(y), w * this.mapWidth, h * this.mapHeight);
      g.lineStyle(1 * U, FOLK.ink, 0.22);
      g.strokeRect(xAt(x), yAt(y), w * this.mapWidth, h * this.mapHeight);
    }

    // A simple road grid.
    const road = (x1, y1, x2, y2) => {
      g.lineStyle(9 * U, FOLK.ink, 0.22);
      g.lineBetween(x1, y1, x2, y2);
      g.lineStyle(6 * U, 0xf8e9c6, 1);
      g.lineBetween(x1, y1, x2, y2);
    };
    road(xAt(0.01), yAt(0.28), xAt(0.99), yAt(0.28));
    road(xAt(0.01), yAt(0.52), xAt(0.99), yAt(0.52));
    road(xAt(0.01), yAt(0.74), xAt(0.99), yAt(0.74));
    road(xAt(0.29), yAt(0.02), xAt(0.29), yAt(0.98));
    road(xAt(0.55), yAt(0.02), xAt(0.55), yAt(0.98));
    road(xAt(0.82), yAt(0.02), xAt(0.82), yAt(0.98));

    // Field rows at the edge of town.
    g.fillStyle(0x6a8f5d, 0.45);
    g.fillRect(xAt(0.64), yAt(0.66), this.mapWidth * 0.33, this.mapHeight * 0.3);
    for (let i = 0; i < 5; i++) {
      g.lineStyle(1 * U, FOLK.mint, 0.6);
      g.lineBetween(
        xAt(0.66),
        yAt(0.69 + i * 0.05),
        xAt(0.94),
        yAt(0.69 + i * 0.05),
      );
    }

  }

  createLandmarks(W, H) {
    this.routeG = this.add.graphics().setDepth(5);
    // A hand-drawn dotted route from CASA to the future landmarks.
    const casa = LEVELS[0];
    const fromX = this.mapX + casa.x * this.mapWidth;
    const fromY = this.mapY + casa.y * this.mapHeight;
    for (const level of LEVELS.slice(1)) {
      const toX = this.mapX + level.x * this.mapWidth;
      const toY = this.mapY + level.y * this.mapHeight;
      this.drawDottedRoute(fromX, fromY, toX, toY);
    }

    this.selectionRing = this.add
      .circle(0, 0, 15 * U, 0x000000, 0)
      .setStrokeStyle(3 * U, FOLK.coral, 1)
      .setDepth(18)
      .setVisible(false);

    for (const level of LEVELS) {
      const x = this.mapX + level.x * this.mapWidth;
      const y = this.mapY + level.y * this.mapHeight;
      const progress = levelProgress(level.id, this.progress);
      const locked = !level.unlocked || !level.scene;
      const color = locked ? 0xc7b49c : FOLK.marigold;

      const pin = this.add
        .circle(x, y, 12 * U, color, 1)
        .setStrokeStyle(2 * U, FOLK.ink, 1)
        .setDepth(10)
        .setAlpha(locked ? 0.58 : 1);
      const icon = this.drawLandmarkIcon(level.icon, x, y, locked ? 0.5 : 1);
      const label = this.add
        .text(x, y + 16 * U, t(level.nameKey), {
          fontFamily: 'monospace',
          fontSize: this.isTouch ? 5.2 * S : 4.5 * S,
          color: locked ? '#6a5a70' : '#2b1b3d',
          stroke: '#f4dfb0',
          strokeThickness: 1.5 * S,
        })
        .setOrigin(0.5, 0)
        .setDepth(12)
        .setAlpha(locked ? 0.75 : 1);

      let stamp = null;
      if (progress.cleared) {
        stamp = this.add
          .text(x + 12 * U, y - 15 * U, '✓', {
            fontFamily: 'monospace',
            fontSize: 5 * S,
            color: '#2f7f78',
            stroke: '#f4dfb0',
            strokeThickness: 1 * S,
          })
          .setOrigin(0.5)
          .setDepth(13);
      }

      const zone = this.add
        .zone(
          x,
          y,
          this.isTouch ? 52 * U : 40 * U,
          this.isTouch ? 56 * U : 48 * U,
        )
        .setDepth(20)
        .setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => this.selectLevel(level.id));

      if (level.id === 'laCuadra') {
        this.add
          .image(x - 15 * U, y + 10 * U, 'dogSit')
          .setScale(0.24)
          .setDepth(13);
      }

      this.nodeViews.push({
        level,
        x,
        y,
        pin,
        icon,
        label,
        stamp,
        zone,
      });
    }

    // Keep the selected landmark highlighted.
    this.updateSelectionVisuals();
  }

  drawDottedRoute(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const step = 8 * U;
    const g = this.routeG;
    g.lineStyle(1.5 * U, FOLK.teal, 0.5);
    for (let d = 8 * U; d < len - 4 * U; d += step) {
      const t0 = d / len;
      const t1 = Math.min((d + 3 * U) / len, 1);
      g.lineBetween(
        x1 + dx * t0,
        y1 + dy * t0,
        x1 + dx * t1,
        y1 + dy * t1,
      );
    }
  }

  drawLandmarkIcon(type, x, y, alpha = 1) {
    const g = this.add.graphics().setDepth(11).setAlpha(alpha);
    const ink = FOLK.ink;
    const cream = FOLK.cream;
    const s = U;

    if (type === 'house') {
      g.fillStyle(FOLK.coral, 1);
      g.fillRect(x - 8 * s, y - 1 * s, 16 * s, 10 * s);
      g.fillStyle(FOLK.ink, 1);
      g.fillTriangle(x - 10 * s, y - 1 * s, x + 10 * s, y - 1 * s, x, y - 9 * s);
      g.fillStyle(FOLK.marigold, 1);
      g.fillRect(x - 2 * s, y + 2 * s, 4 * s, 7 * s);
      g.fillStyle(cream, 1);
      g.fillRect(x + 3 * s, y + 2 * s, 3 * s, 3 * s);
    } else if (type === 'church') {
      g.fillStyle(FOLK.cream, 1);
      g.fillRect(x - 7 * s, y - 2 * s, 14 * s, 11 * s);
      g.fillStyle(FOLK.terracotta, 1);
      g.fillRect(x - 4 * s, y - 12 * s, 8 * s, 10 * s);
      g.fillStyle(FOLK.ink, 1);
      g.fillRect(x - 1 * s, y - 17 * s, 2 * s, 7 * s);
      g.fillRect(x - 4 * s, y - 14 * s, 8 * s, 2 * s);
      g.fillStyle(FOLK.ink, 1);
      g.fillRect(x - 3 * s, y + 1 * s, 2 * s, 8 * s);
      g.fillRect(x + 2 * s, y + 1 * s, 2 * s, 8 * s);
    } else if (type === 'market') {
      g.fillStyle(FOLK.teal, 1);
      g.fillRect(x - 8 * s, y, 16 * s, 8 * s);
      g.fillStyle(FOLK.coral, 1);
      g.fillRect(x - 10 * s, y - 7 * s, 20 * s, 3 * s);
      g.fillStyle(FOLK.cream, 1);
      for (let i = 0; i < 4; i++) g.fillRect(x - 9 * s + i * 5 * s, y - 4 * s, 3 * s, 4 * s);
      g.fillStyle(FOLK.ink, 1);
      g.fillRect(x - 1 * s, y + 2 * s, 2 * s, 6 * s);
    } else if (type === 'park') {
      g.fillStyle(FOLK.ink, 1);
      g.fillRect(x - 1 * s, y + 2 * s, 2 * s, 7 * s);
      g.fillStyle(FOLK.teal, 1);
      g.fillCircle(x, y - 4 * s, 7 * s);
      g.fillStyle(FOLK.mint, 1);
      g.fillCircle(x - 3 * s, y - 6 * s, 3 * s);
      g.fillCircle(x + 3 * s, y - 1 * s, 2 * s);
    } else {
      // agave fields
      g.fillStyle(0x6a8f5d, 0.8);
      g.fillRect(x - 10 * s, y + 1 * s, 20 * s, 9 * s);
      g.fillStyle(FOLK.mint, 1);
      for (let i = 0; i < 4; i++) {
        g.fillTriangle(
          x - 8 * s + i * 5 * s,
          y + 1 * s,
          x - 5 * s + i * 5 * s,
          y - 7 * s,
          x - 2 * s + i * 5 * s,
          y + 1 * s,
        );
      }
      g.lineStyle(1 * s, FOLK.cream, 0.5);
      g.lineBetween(x - 9 * s, y + 5 * s, x + 9 * s, y + 5 * s);
    }

    return g;
  }

  createDetails(W, H) {
    this.detailX = this.mapX + this.mapWidth + 20 * U;
    this.detailY = this.mapY;
    this.detailW = this.boardRight - 18 * U - this.detailX;
    this.detailH = this.mapHeight;

    this.add
      .rectangle(
        this.detailX + this.detailW / 2,
        this.detailY + this.detailH / 2,
        this.detailW,
        this.detailH,
        0xf8e9c6,
        0.5,
      )
      .setStrokeStyle(1.5 * U, FOLK.ink, 0.35)
      .setDepth(3);

    this.detailKicker = this.add
      .text(this.detailX + 8 * U, this.detailY + 9 * U, t('map.landmark'), {
        fontFamily: 'monospace',
        fontSize: this.isTouch ? 4.2 * S : 3.8 * S,
        color: '#2f7f78',
      })
      .setDepth(6);

    this.detailTitle = this.add
      .text(this.detailX + 8 * U, this.detailY + 22 * U, '', {
        fontFamily: 'monospace',
        fontSize: this.isTouch ? 7.5 * S : 7 * S,
        color: '#c94f3d',
        stroke: '#1d1326',
        strokeThickness: 1.2 * S,
      })
      .setDepth(6);

    this.detailStatus = this.add
      .text(this.detailX + 8 * U, this.detailY + 40 * U, '', {
        fontFamily: 'monospace',
        fontSize: this.isTouch ? 4.8 * S : 4.2 * S,
        color: '#2f7f78',
      })
      .setDepth(6);

    this.detailDesc = this.add
      .text(this.detailX + 8 * U, this.detailY + 54 * U, '', {
        fontFamily: 'monospace',
        fontSize: this.isTouch ? 4.8 * S : 4.2 * S,
        color: '#2b1b3d',
        lineSpacing: this.isTouch ? 3 * U : 2 * U,
        wordWrap: { width: this.detailW - 16 * U },
      })
      .setDepth(6);

    this.detailBest = this.add
      .text(
        this.detailX + 8 * U,
        this.detailY + this.detailH - (this.isTouch ? 62 * U : 52 * U),
        '',
        {
          fontFamily: 'monospace',
          fontSize: this.isTouch ? 4.2 * S : 3.8 * S,
          color: '#5b4a52',
        },
      )
      .setDepth(6);

    const playHeight = this.isTouch ? 34 * U : 16 * U;
    const playCenterY =
      this.detailY + this.detailH - (this.isTouch ? 30 * U : 25 * U);
    this.playBg = this.add
      .rectangle(
        this.detailX + this.detailW / 2,
        playCenterY,
        this.detailW - 16 * U,
        playHeight,
        FOLK.coral,
        1,
      )
      .setStrokeStyle(1.5 * U, FOLK.ink, 1)
      .setDepth(6)
      .setInteractive({ useHandCursor: true });
    this.playBg.on('pointerdown', () => this.playSelected());

    this.playText = this.add
      .text(
        this.playBg.x,
        this.playBg.y,
        t('map.play'),
        {
          fontFamily: 'monospace',
          fontSize: this.isTouch ? 6 * S : 4.5 * S,
          color: FOLK.cream,
        },
      )
      .setOrigin(0.5)
      .setDepth(7);
  }

  selectLevel(id) {
    const level = LEVELS.find((l) => l.id === id);
    if (!level) return;

    this.selectedId = id;
    const progress = levelProgress(id, this.progress);
    const locked = !level.unlocked || !level.scene;

    this.updateSelectionVisuals();
    this.detailTitle.setText(t(level.nameKey));
    this.detailStatus
      .setText(
        locked
          ? t('map.comingSoon')
          : progress.cleared
            ? t('map.cleared')
            : t('map.current'),
      )
      .setColor(locked ? '#6a5a70' : progress.cleared ? '#2f7f78' : '#ffa94d');
    this.detailDesc.setText(
      t(progress.cleared && level.peaceKey ? level.peaceKey : level.descKey),
    );
    this.detailBest.setText(
      progress.best ? t('map.best', { score: progress.best }) : '',
    );

    this.playBg.setFillStyle(locked ? 0x8a7a8f : FOLK.coral, 1);
    this.playBg.input.enabled = !locked;
    this.playText.setText(locked ? t('map.comingSoon') : t('map.play'));
    this.playText.setAlpha(locked ? 0.8 : 1);

    sfx.click?.();
  }

  updateSelectionVisuals() {
    if (!this.selectionRing) return;
    const selected = this.nodeViews.find((n) => n.level.id === this.selectedId);
    if (!selected) return;
    this.selectionRing.setPosition(selected.x, selected.y).setVisible(true);
    for (const node of this.nodeViews) {
      const active = node.level.id === this.selectedId;
      node.pin.setStrokeStyle(
        active ? 3 * U : 2 * U,
        active ? FOLK.ink : FOLK.ink,
        1,
      );
      node.label.setAlpha(active ? 1 : node.level.unlocked ? 0.85 : 0.65);
    }
  }

  createInput() {
    this.input.keyboard.on('keydown-SPACE', () => this.playSelected());
    this.input.keyboard.on('keydown-ENTER', () => this.playSelected());
    this.input.keyboard.on('keydown-ESC', () => this.goBack());
    this.input.keyboard.on('keydown-B', () => this.goBack());
  }

  playSelected() {
    const level = LEVELS.find((l) => l.id === this.selectedId);
    if (!level?.scene || !level.unlocked) return;

    this.cameras.main.fadeOut(220, 27, 16, 41);
    this.time.delayedCall(230, () =>
      this.scene.start(level.scene, { levelId: level.id }),
    );
  }

  goBack() {
    this.cameras.main.fadeOut(180, 27, 16, 41);
    this.time.delayedCall(190, () => this.scene.start('Title'));
  }
}
