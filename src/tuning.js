// ---------------------------------------------------------------------------
// EVERYTHING THAT CONTROLS HOW THE DOG FEELS LIVES HERE.
//
// These are the only numbers you need to touch to change the game feel.
// While playing, press T or use the panel in the top-right to drag them live.
// Numbers are in pixels and seconds unless noted.
// ---------------------------------------------------------------------------

export const DEFAULTS = Object.freeze({
  // --- vertical movement -------------------------------------------------
  gravity: 1600, // normal fall acceleration
  maxFall: 700, // normal terminal velocity

  // --- glide -------------------------------------------------------------
  glideGravity: 400, // much gentler fall while gliding
  glideMaxFall: 120, // slow, floaty descent


  // --- enemies -----------------------------------------------------------
  enemySpeed: 0.8, // global multiplier for patrol, chase, lunge, critters and crows

  // --- running -----------------------------------------------------------
  runSpeed: 200, // top horizontal speed
  groundAccel: 2400, // how fast you reach top speed on the ground
  airAccel: 1500, // how fast you steer in the air
  groundFriction: 2600, // how fast you stop on the ground
  airFriction: 500, // how fast you stop in the air

  // --- jumping / flapping ------------------------------------------------
  jumpImpulse: 420, // ground jump strength
  flapImpulse: 380, // one flap of the wings
  maxFlaps: 2, // flaps before you must land (or hit a wind ring)
  jumpCut: 0.45, // releasing SPACE early shortens a ground jump
  minJumpMs: 90, // SPACE is held at least this long before a jump can be cut

  // --- forgiveness (this is what makes platformers feel good) -------------
  coyoteMs: 100, // you can still jump just after leaving a ledge
  jumpBufferMs: 120, // a jump pressed just before landing still counts

  // --- camera ------------------------------------------------------------
  lookAhead: 34, // camera leads in the direction you're facing
  cameraLerp: 0.1, // 0 = stiff, 1 = glued
});

// The live, editable copy. The tuning panel mutates this object.
export const tuning = { ...DEFAULTS };
