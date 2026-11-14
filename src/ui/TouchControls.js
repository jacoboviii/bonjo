// ---------------------------------------------------------------------------
// On-screen controls for phones/tablets. Buttons live in screen space at the
// game's render resolution (432px tall, width varies with the landscape aspect),
// so they scale with the game.
//
// Left/right are held and support dragging from one to the other without
// lifting your finger. Jump is a tap for flap and a hold for glide. The down
// button starts the slide on the ground or in the air. Multi-touch is enabled, so you can run
// and flap at the same time.
import { SCALE } from '../scale.js';

const U = SCALE / 2;

// ---------------------------------------------------------------------------
export default class TouchControls {
  constructor(scene) {
    this.scene = scene;
    this.state = { left: false, right: false, down: false, jumpHeld: false };
    this.jumpQueued = false;
    this.interactQueued = false;
    this.actionQueued = false;
    this.interactAvailable = false;
    this.dialogMode = false;
    this.visible = false;
    this.buttons = {};
    this.baseScale = {};
    this.baseAlpha = 0.5;

    // which pointer is dragging the left/right pair, and which pointer holds
    // the jump/down buttons
    this.dirPointer = null;
    this.pointerHandlers = new Map();

    // mouse + up to 3 more fingers
    scene.input.addPointer(3);

    const W = scene.scale.width;
    // All touch buttons share one size and sit on the same line. The three
    // action buttons form a single right-hand cluster, with spin beside jump.
    const buttonScale = 0.9;
    this.addButton('left', 56 * U, 240 * U, 'btn-left', buttonScale);
    this.addButton('right', 128 * U, 240 * U, 'btn-right', buttonScale);
    this.addButton('jump', W - 60 * U, 240 * U, 'btn-jump', buttonScale);
    this.addButton('interact', W - 124 * U, 240 * U, 'btn-spin', buttonScale);
    this.addButton('slide', W - 188 * U, 240 * U, 'btn-dive', buttonScale);
    this.addButton('talk', W - 124 * U, 174 * U, 'btn-interact', buttonScale);

    scene.input.on('pointermove', (pointer) => this.onMove(pointer));
    scene.input.on('pointerup', (pointer) => this.onUp(pointer));
    scene.input.on('gameout', () => this.reset());

    this.show(scene.sys.game.device.input.touch || navigator.maxTouchPoints > 0);
  }

  relayout(width = this.scene.scale.width) {
    if (this.buttons.jump) this.buttons.jump.x = width - 60 * U;
    if (this.buttons.interact) this.buttons.interact.x = width - 124 * U;
    if (this.buttons.slide) this.buttons.slide.x = width - 188 * U;
    if (this.buttons.talk) this.buttons.talk.x = width - 124 * U;
  }

  addButton(name, x, y, texture, scale) {
    const img = this.scene.add
      .image(x, y, texture)
      .setScrollFactor(0)
      .setDepth(150)
      .setScale(scale)
      .setAlpha(this.baseAlpha)
      .setInteractive({ useHandCursor: true });

    img.on('pointerdown', (pointer) => this.onDown(pointer, name));

    this.buttons[name] = img;
    this.baseScale[name] = scale;
    return img;
  }

  onDown(pointer, name) {
    if (name === 'left' || name === 'right') {
      // one finger owns the direction pad and can slide between the arrows
      this.dirPointer = pointer.id;
      this.setDirection(name);
      return;
    }

    // Separate one-shot buttons: talk is contextual, action is always spin.
    if (name === 'talk') {
      if (!this.interactAvailable || this.dialogMode) return;
      this.interactQueued = true;
      this.flash(name);
      return;
    }
    if (name === 'interact') {
      if (this.dialogMode) return;
      this.actionQueued = true;
      this.flash(name);
      return;
    }

    this.pointerHandlers.set(pointer.id, name);
    if (!this.state[name]) this.press(name);
  }

  onMove(pointer) {
    if (pointer.id !== this.dirPointer || !pointer.isDown) return;
    this.setDirection(this.directionAt(pointer.x, pointer.y));
  }

  onUp(pointer) {
    if (pointer.id === this.dirPointer) {
      this.dirPointer = null;
      this.setDirection(null);
    }

    const held = this.pointerHandlers.get(pointer.id);
    if (held) {
      this.pointerHandlers.delete(pointer.id);
      this.release(held);
    }
  }

  setDirection(name) {
    if (name !== 'left' && this.state.left) this.release('left');
    if (name !== 'right' && this.state.right) this.release('right');
    if (name && !this.state[name]) this.press(name);
  }

  // pointer coordinates are already in game space (see scale.js)
  directionAt(x, y) {
    for (const name of ['left', 'right']) {
      const img = this.buttons[name];
      const half = 32 * U * this.baseScale[name];
      if (Math.abs(x - img.x) <= half && Math.abs(y - img.y) <= half) {
        return name;
      }
    }
    return null;
  }

  press(name) {
    if (name === 'jump') {
      if (!this.state.jumpHeld) this.jumpQueued = true;
      this.state.jumpHeld = true;
    } else if (name === 'slide') {
      // Dog reads this as its held down input; a fresh press starts a slide.
      this.state.down = true;
    } else {
      this.state[name] = true;
    }

    const img = this.buttons[name];
    img.setAlpha(0.92).setScale(this.baseScale[name] * 0.92);
  }

  release(name) {
    if (name === 'jump') this.state.jumpHeld = false;
    else if (name === 'slide') this.state.down = false;
    else this.state[name] = false;

    const img = this.buttons[name];
    img.setAlpha(this.baseAlpha).setScale(this.baseScale[name]);
  }

  flash(name) {
    const img = this.buttons[name];
    if (!img) return;
    img.setAlpha(0.92).setScale(this.baseScale[name] * 0.92);
    this.scene.time.delayedCall(90, () => {
      if (!img.active) return;
      img.setAlpha(this.baseAlpha).setScale(this.baseScale[name]);
    });
  }

  // One-shot jump press for the Dog (like JustDown, but buffered until read).
  consumeJump() {
    if (!this.jumpQueued) return false;
    this.jumpQueued = false;
    return true;
  }

  consumeInteract() {
    if (!this.interactQueued) return false;
    this.interactQueued = false;
    return true;
  }

  consumeAction() {
    if (!this.actionQueued) return false;
    this.actionQueued = false;
    return true;
  }

  setInteractAvailable(available) {
    this.interactAvailable = available;
    this.syncButtonVisibility();
  }

  setDialogMode(active) {
    this.dialogMode = active;
    this.reset();
    this.syncButtonVisibility();
  }

  syncButtonVisibility() {
    for (const [name, img] of Object.entries(this.buttons)) {
      const show =
        this.visible &&
        !this.dialogMode &&
        (name !== 'talk' || this.interactAvailable);
      img.setVisible(show);
      if (img.input) img.input.enabled = show;
    }
  }

  reset() {
    this.state.left = false;
    this.state.right = false;
    this.state.down = false;
    this.state.jumpHeld = false;
    this.jumpQueued = false;
    this.interactQueued = false;
    this.actionQueued = false;
    this.dirPointer = null;
    this.pointerHandlers.clear();

    for (const name of Object.keys(this.buttons)) {
      this.buttons[name].setAlpha(this.baseAlpha).setScale(this.baseScale[name]);
    }
  }

  show(visible = true) {
    this.visible = visible;
    if (!visible) this.reset();
    this.syncButtonVisibility();
  }

  toggle() {
    this.show(!this.visible);
  }
}
