import Phaser from 'phaser';
import { tuning } from '../tuning.js';
import { SCALE } from '../scale.js';

const S = SCALE;
const SIT_DELAY = 0.45; // seconds of standing still before Bonjo folds into a sit

// Move a value toward a target by at most maxDelta (used for smooth accel).
function moveTowards(current, target, maxDelta) {
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}

// ---------------------------------------------------------------------------
// The dog. A small state machine on top of Arcade Physics:
//
//   ground jump  ->  flap (2 charges)  ->  glide (hold, while falling)
//                                    \->  dive (hold S)
//
// All the numbers come from tuning.js so they can be changed live.
// ---------------------------------------------------------------------------
export default class Dog extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'dog');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(10);
    this.body.setSize(10 * S, 13 * S).setOffset(3 * S, 2 * S);
    this.body.setMaxVelocity(430 * S, 1200 * S);

    this.controls = { cursors: null, wasd: null };

    this.facing = 1;
    this.grounded = false;
    this.coyote = 0;
    this.buffer = 0;
    this.flaps = tuning.maxFlaps;
    this.gliding = false;
    this.diving = false;
    this.dead = false;
    this.invuln = 0;
    this.jumpCutReady = false;
    this.jumpHold = 0;
    this.trailTimer = 0;
    this.animT = 0;
    this.standT = 0;

    // Purple chow tongue, rendered as its own sprite so it can wiggle.
    this.tongue = scene.add
      .image(x, y, 'tongue')
      .setDepth(11)
      .setOrigin(0.5, 0)
      .setVisible(false);
    this.tongueAlpha = 0;
    this.tonguePhase = 0;
    this.idleT = 0;
  }

  get leftHeld() {
    return (
      this.controls.cursors.left.isDown ||
      this.controls.wasd.A.isDown ||
      !!this.controls.touch?.left
    );
  }

  get rightHeld() {
    return (
      this.controls.cursors.right.isDown ||
      this.controls.wasd.D.isDown ||
      !!this.controls.touch?.right
    );
  }

  get downHeld() {
    return (
      this.controls.cursors.down.isDown ||
      this.controls.wasd.S.isDown ||
      !!this.controls.touch?.down
    );
  }

  get jumpHeld() {
    return (
      this.controls.cursors.space.isDown ||
      this.controls.wasd.W.isDown ||
      !!this.controls.touch?.jumpHeld
    );
  }

  get jumpPressed() {
    // JustDown must be read exactly once per frame.
    const keyJump =
      Phaser.Input.Keyboard.JustDown(this.controls.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.controls.wasd.W);

    // Consume the buffered touch press every frame, even if a key was used,
    // so a queued touch can never fire twice.
    const touchJump = this.controls.consumeTouchJump
      ? this.controls.consumeTouchJump()
      : false;

    return keyJump || touchJump;
  }

  update(dtMs) {
    if (this.dead) {
      this.tongue.setVisible(false);
      return;
    }

    const dt = Math.min(dtMs, 50) / 1000;
    const onGround = this.body.blocked.down || this.body.touching.down;
    const wasDiving = this.diving;
    const jumpPressed = this.jumpPressed;

    // --- timers and landing ------------------------------------------------
    if (this.invuln > 0) {
      this.invuln -= dt;
      this.setAlpha(Math.floor(this.animT * 24) % 2 === 0 ? 1 : 0.35);
    } else {
      this.setAlpha(1);
    }

    if (onGround) {
      this.coyote = tuning.coyoteMs / 1000;
      this.flaps = tuning.maxFlaps; // landing refills your flaps
      this.diving = false;
      this.gliding = false;
      this.jumpCutReady = false;
    } else {
      this.coyote = Math.max(0, this.coyote - dt);
    }

    if (wasDiving && onGround && !this.grounded) {
      this.scene.onDiveLand(this);
    }

    // --- jump buffering ----------------------------------------------------
    if (jumpPressed) this.buffer = tuning.jumpBufferMs / 1000;
    else this.buffer = Math.max(0, this.buffer - dt);

    // --- jump or flap ------------------------------------------------------
    if (this.buffer > 0 && (onGround || this.coyote > 0)) {
      this.body.velocity.y = -tuning.jumpImpulse * S;
      this.buffer = 0;
      this.coyote = 0;
      this.jumpCutReady = true;
      this.jumpHold = 0;
      this.scene.onJump(this);
    } else if (jumpPressed && !onGround && this.flaps > 0) {
      this.flaps -= 1;
      this.body.velocity.y = -tuning.flapImpulse * S;
      this.jumpCutReady = false;
      this.scene.onFlap(this);
    }

    // Releasing SPACE shortens a *ground* jump, but only after a short
    // minimum hold so quick taps still give a real hop instead of a twitch.
    if (this.jumpCutReady) {
      this.jumpHold += dt;
      if (
        !this.jumpHeld &&
        this.jumpHold >= tuning.minJumpMs / 1000 &&
        this.body.velocity.y < -120 * S
      ) {
        this.body.velocity.y *= tuning.jumpCut;
        this.jumpCutReady = false;
      }
    }
    if (this.body.velocity.y >= 0) this.jumpCutReady = false;

    // --- glide & dive ------------------------------------------------------
    const falling = this.body.velocity.y > 0;
    this.diving = !onGround && this.downHeld;
    this.gliding = !onGround && !this.diving && this.jumpHeld && falling;

    let gravity = tuning.gravity * S;
    let maxFall = tuning.maxFall * S;
    if (this.diving) {
      gravity = tuning.diveGravity * S;
      maxFall = tuning.diveMaxFall * S;
    } else if (this.gliding) {
      gravity = tuning.glideGravity * S;
      maxFall = tuning.glideMaxFall * S;
    }

    this.body.velocity.y += gravity * dt;
    this.body.velocity.y = Math.min(this.body.velocity.y, maxFall);

    // --- horizontal --------------------------------------------------------
    let targetSpeed = 0;
    if (this.leftHeld) targetSpeed -= tuning.runSpeed * S;
    if (this.rightHeld) targetSpeed += tuning.runSpeed * S;

    if (targetSpeed !== 0) {
      const accel = (onGround ? tuning.groundAccel : tuning.airAccel) * S;
      this.body.velocity.x = moveTowards(this.body.velocity.x, targetSpeed, accel * dt);
    } else {
      const friction = (onGround ? tuning.groundFriction : tuning.airFriction) * S;
      this.body.velocity.x = moveTowards(this.body.velocity.x, 0, friction * dt);
    }

    if (Math.abs(this.body.velocity.x) > 8 * S) {
      this.facing = this.body.velocity.x > 0 ? 1 : -1;
    }
    this.setFlipX(this.facing < 0);

    // --- visuals -----------------------------------------------------------
    this.animT += dt;
    this.trailTimer -= dt;

    let pose;
    if (this.diving) {
      pose = 'dogDive';
      this.standT = 0;
    } else if (this.gliding) {
      pose = 'dogGlide';
      this.standT = 0;
    } else if (onGround) {
      if (Math.abs(this.body.velocity.x) > 20 * S) {
        this.standT = 0;
        pose = Math.floor(this.animT * 12) % 2 === 0 ? 'dogWalkA' : 'dogWalkB';
      } else {
        this.standT += dt;
        pose = this.standT >= SIT_DELAY ? 'dogSit' : 'dog';
      }
    } else {
      this.standT = 0;
      pose = 'dog';
    }
    if (this.texture.key !== pose) this.setTexture(pose);

    if (this.diving) {
      this.setRotation(Phaser.Math.DegToRad(14 * this.facing));
      if (this.trailTimer <= 0) {
        this.trailTimer = 0.06;
        this.scene.spawnPuff(this.x, this.y + 3 * S, 0.55);
      }
    } else if (this.gliding) {
      this.setRotation(Phaser.Math.DegToRad(-6 * this.facing));
    } else {
      this.setRotation(0);
    }

    this.updateTongue(dt, onGround);

    this.grounded = onGround;
  }

  // The tongue only comes out when the dog is standing still - it's a pant,
  // not a running flag. Stops moving, waits a beat, then starts panting.
  updateTongue(dt, onGround) {
    const panting =
      onGround &&
      this.texture.key === 'dogSit' &&
      Math.abs(this.body.velocity.x) < 20 * S;
    if (panting) this.idleT += dt;
    else this.idleT = 0;

    this.tonguePhase += dt * 9;
    const targetAlpha = panting && this.idleT > 0.3 ? 1 : 0;
    this.tongueAlpha = Phaser.Math.Linear(
      this.tongueAlpha,
      targetAlpha,
      1 - Math.pow(0.001, dt),
    );

    if (this.tongueAlpha < 0.03) {
      this.tongue.setVisible(false);
      return;
    }

    this.tongue.setVisible(true);
    this.tongue.setAlpha(this.tongueAlpha * 0.95);

    const stretch = 0.8 + Math.sin(this.tonguePhase * 1.4) * 0.2;
    const wobble = Math.sin(this.tonguePhase) * 0.2;

    // mouth position in sprite space (texture is 32x32, facing right)
    const ox = 14 * this.facing;
    const oy = 2;
    const rot = this.rotation;
    const rx = ox * Math.cos(rot) - oy * Math.sin(rot);
    const ry = ox * Math.sin(rot) + oy * Math.cos(rot);

    this.tongue.setPosition(this.x + rx, this.y + ry);
    this.tongue.setRotation(rot + wobble * this.facing);
    this.tongue.setFlipX(this.facing < 0);
    this.tongue.setScale(1, stretch);
  }
}
