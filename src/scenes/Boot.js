import Phaser from 'phaser';
import { buildTextures } from '../art.js';

// Generates every texture once, then hands off to the title screen.
export default class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    buildTextures(this);
    this.scene.start('Title');
  }
}
