// ---------------------------------------------------------------------------
// On-screen controls for phones/tablets. Buttons live in screen space at the
// game's render resolution (288px tall, width varies with the landscape aspect),
// so they scale with the game.
//
// Left/right are held and support dragging from one to the other without
// lifting your finger. Jump is a tap for flap and a hold for glide. Dive is
// held. Multi-touch is enabled, so you can run and flap at the same time.
// ---------------------------------------------------------------------------
export default class TouchControls {
  constructor(scene) {
    this.scene = scene;
    this.state = { left: false, right: false, down: false, jumpHeld: false };
    this.jumpQueued = false;
    this.visible = false;
    this.buttons = {};
    this.baseScale = {};
    this.baseAlpha = 0.5;

    // which pointer is dragging the left/right pair, and which pointer holds
    // the jump/dive buttons
    this.dirPointer = null;
    this.pointerHandlers = new Map();

    // mouse + up to 3 more fingers
    scene.input.addPointer(3);

    const W = scene.scale.width;
    this.addButton('left', 56, 240, 'btn-left', 0.9);
    this.addButton('right', 128, 240, 'btn-right', 0.9);
    this.addButton('jump', W - 60, 228, 'btn-jump', 1.05);
    this.addButton('dive', W - 128, 254, 'btn-dive', 0.8);

    scene.input.on('pointermove', (pointer) => this.onMove(pointer));
    scene.input.on('pointerup', (pointer) => this.onUp(pointer));
    scene.input.on('gameout', () => this.reset());

    this.show(scene.sys.game.device.input.touch || navigator.maxTouchPoints > 0);
  }

  relayout(width = this.scene.scale.width) {
    if (this.buttons.jump) this.buttons.jump.x = width - 60;
    if (this.buttons.dive) this.buttons.dive.x = width - 128;
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
      const half = 32 * this.baseScale[name];
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
    } else {
      this.state[name] = true;
    }

    const img = this.buttons[name];
    img.setAlpha(0.92).setScale(this.baseScale[name] * 0.92);
  }

  release(name) {
    if (name === 'jump') this.state.jumpHeld = false;
    else this.state[name] = false;

    const img = this.buttons[name];
    img.setAlpha(this.baseAlpha).setScale(this.baseScale[name]);
  }

  // One-shot jump press for the Dog (like JustDown, but buffered until read).
  consumeJump() {
    if (!this.jumpQueued) return false;
    this.jumpQueued = false;
    return true;
  }

  reset() {
    this.state.left = false;
    this.state.right = false;
    this.state.down = false;
    this.state.jumpHeld = false;
    this.jumpQueued = false;
    this.dirPointer = null;
    this.pointerHandlers.clear();

    for (const name of Object.keys(this.buttons)) {
      this.buttons[name].setAlpha(this.baseAlpha).setScale(this.baseScale[name]);
    }
  }

  show(visible = true) {
    this.visible = visible;
    for (const img of Object.values(this.buttons)) img.setVisible(visible);
    if (!visible) this.reset();
  }

  toggle() {
    this.show(!this.visible);
  }
}
