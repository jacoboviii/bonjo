# Bonjo 🐕

**Bonjo is the only chow on the block.** A proud, fluffy black chow who likes
his walks through a small Mexican city — and does not appreciate the neighbor
dogs from other houses trying to take his turf.

A 2D platformer prototype about walking the barrio: jump, flap, glide and dive;
subdue rival dogs; bounce off market awnings; knock a piñata for bones; and get
home before the streetlights come on.

This is a **playable prototype**, not a finished game. The current build is for
tuning the feel and testing the interaction toys.

![Bonjo contact sheet](screenshots/contact-sheet.png)

Individual 1280×720 screenshots are in [`screenshots/`](screenshots/).
The contact sheet shows the English UI; the game itself now starts in Spanish.

---

## The world

- **Setting:** a small city in México. Level 1, **La Cuadra**, is the urban
  core: flat-roofed houses, a parish church, papel picado, adobe walls and
  terracotta roofs. The fields and agave at the horizon are the agricultural
  edges — **Las Orillas** — where the next level will go.
- **Bonjo:** the only chow on the block. Not a killer — he **subdues** his
  rivals by out-jumping them. When beaten, a rival yelps and runs home.
- **Rivals:** dogs from other houses guard their turf, bark (`¡GUAU!`) and
  chase. Dive on one to send it packing and earn a bone.
- **Squirrels:** smaller nuisances with a big tail. They steal bones and bolt
  for the edge of the platform.
- **Crows:** one rare aerial pest.
- **Piñatas:** hanging from ropes. Jump, flap or dive into one; each hit drops a
  bone, and the third hit bursts it into a shower of bones.
- **Market awnings:** land on the striped canvas to bounce high and refill your
  flaps. Chain them with the gold rings.

Tone: cozy, mischievous, non-lethal. The dog wins the block; nobody gets hurt.

---

## Play it

Requires [Node.js](https://nodejs.org/) 18 or newer.

```bash
cd ~/Projects/bonjo
npm install
npm run dev
```

Then open **http://localhost:5173**.

If this project lives on a remote machine (no display), forward the port:

```bash
ssh -L 5173:127.0.0.1:5173 you@your-server
```

…and open `http://localhost:5173` on your own computer.

### Controls

| Key | Ground | Air |
| --- | --- | --- |
| **A / D** or arrows | Run | Steer |
| **SPACE** / **W** | Jump (hold for height) | Flap (2 charges) |
| **Hold SPACE** | — | Glide (slow fall) |
| **S** / **↓** | — | Dive (subdue rivals, pop crows) |
| **T** | Show/hide the tuning panel | |
| **R** | Restart the level | |
| **V** | Toggle the touch buttons | |
| **L** | Switch English / Spanish (title screen) | |

### Phones and tablets

On a touch device the on-screen controls appear automatically:

- **bottom-left:** ◀ ▶ run (slide between them without lifting)
- **bottom-right:** ▲ flap (hold to glide), ▼ dive
- Multi-touch works, so you can run and flap at the same time.
- In portrait, the game pauses behind a **rotate your phone** screen with a
  "play anyway" escape.
- Landscape orientation is strongly recommended.
- **EN / ES** language buttons are in the top-right of the title screen.
- The game starts in **Spanish** by default; choose **EN** for English.

On a desktop you can press **V** to show the touch buttons for testing.

### Interactions in one sentence

Land on a rainbow-striped **awning** to bounce; hit a **piñata** three times to
burst it; **dive** a **rival dog** to make it drop a bone and flee. Bones are
score. Gold rings refill your flaps in mid-air.

---

## The tuning panel (the important part)

Press **T**, or click the `BONJO · feel tuning` bar in the top-right.

While playing, drag any slider and *feel* the difference immediately. This is
how platformer game feel is actually designed: change one number, play for ten
seconds, keep or revert.

| Folder | Slider | What it changes |
| --- | --- | --- |
| Movement | run speed | top running speed |
| | ground / air accel | how quickly you reach top speed |
| | ground friction | how quickly you stop |
| Air | gravity | normal falling weight |
| | glide gravity / fall speed | how floaty the glide is |
| | dive gravity / fall speed | how violent the dive is |
| | jump / flap power | height gained per jump / flap |
| | flaps | how many flaps before landing |
| | jump cut | how much a released jump is shortened |
| | min jump hold | minimum time before a jump can be cut |
| | coyote (ms) | grace period to jump after leaving a ledge |
| | jump buffer (ms) | grace period for pressing jump just before landing |
| Camera | look ahead | how far the camera leads your facing direction |
| | camera smoothing | stiff vs. lazy follow |

**Reset defaults** restores everything. The same numbers live in
[`src/tuning.js`](src/tuning.js), heavily commented — copy your favourite values
there to make them permanent.

### Starter experiments

- `gravity 1200` → moon dog, much more hang time
- `flap power 500`, `flaps 3` → generous, floaty explorer
- `dive gravity 5000` → aggressive slam, good for stomping rivals and crows
- `jump cut 1.0` → no variable jump height (hold/release stops mattering)
- `coyote 0` and `jump buffer 0` → feel how much those two invisible helpers do

---

## What's in this build

- Run, variable-height jump, coyote time, jump buffering
- Two flaps, glide, dive — each with its own animation pose
- Walk cycle; sits and pants (purple tongue) when idle; tongue hidden in motion
- **Rival neighborhood dogs** that patrol, bark, chase and can be subdued
- **Squirrels** that steal bones; one rare **crow**
- **Piñatas** (3 hits → bone shower) and **bouncing market awnings**
- Wind rings that refill flaps mid-air
- Bones, checkpoint balloon, goal balloon
- La Cuadra: adobe/terracotta town, church, papel picado, fields and agave
- Death → quick respawn; camera look-ahead; synthesized SFX
- All art generated in code (no image/audio files)
- Keyboard + on-screen touch controls, portrait guard
- **Spanish by default** (La Cuadra, México); toggle **EN / ES** on the title, or press **L**. The choice is remembered.
- Title and win screens with bones + time

**Not in this build:** menus, pause, save files, gamepad, bosses, more than one
level, real music.

---

## Project map

```
bonjo/
├── index.html              page shell + canvas styling + portrait guard
├── vite.config.js
├── package.json
├── src/
│   ├── main.js             Phaser config (512×288, pixel art, Arcade physics)
│   ├── scale.js            SCALE=2 (512×288 render of a 256×144 design view)
│   ├── tuning.js           EVERY feel number, commented  ← start here
│   ├── art.js              all pixel textures, town, characters, props
│   ├── sfx.js              tiny WebAudio sound effects
│   ├── objects/
│   │   ├── Dog.js          Bonjo's movement + sit/pant + walk cycle
│   │   ├── RivalDog.js     patrol / bark / chase / subdue
│   │   ├── Squirrel.js     patrol, hops, bone thief
│   │   ├── Crow.js         rare aerial hazard
│   │   └── Pinata.js       hanging piñata state + rope
│   ├── ui/
│   │   └── TouchControls.js  on-screen phone buttons + multi-touch + drag
│   └── scenes/
│       ├── Boot.js         builds textures, starts title
│       ├── Title.js        BONJO title screen
│       └── Level1.js       La Cuadra layout, enemies, props, HUD, tuning
└── dist/                   production build (after `npm run build`)
```

The game renders at **512×288**, which is 2× the 256×144 design view (16px
tiles, 16 tiles wide at design scale) and scales up. That's why it looks like a
tiny TV. `pixelArt: true` keeps it crisp.

---

## Build and share

```bash
npm run build
```

This writes static files to `dist/`. You can:

- **itch.io:** zip the *contents* of `dist/`, upload as an HTML5 game, set
  `index.html` as the entry point.
- **Netlify / GitHub Pages / any static host:** upload `dist/`.
- **Locally:** `npm run preview` and open the printed URL.

No special server headers are required (no threads/SharedArrayBuffer).

---

## Swapping the placeholder art

All placeholder art is generated in `src/art.js` so the prototype needs zero
assets. To use real sprites:

1. Put PNGs in `public/assets/`.
2. Load them in `Boot.preload()` with `this.load.image('dog', 'assets/dog.png')`
   (and the other keys).
3. Keep the same keys and sizes and the rest of the game works unchanged.

Current texture sizes (feel free to scale up and adjust bodies in the object
files):

| Key | Size | Notes |
| --- | --- | --- |
| `dog`, `dogSit`, `dogWalkA`, `dogWalkB`, `dogGlide`, `dogDive` | 32×32 | black chow, facing right; flipped in code |
| `tongue` | 6×8 | panting overlay |
| `rival`, `rivalRun` | 32×30 | tan neighborhood dog, red bandana |
| `crow` | 28×18 | facing right |
| `squirrel`, `squirrelRun` | 32×28 | 2-frame run cycle |
| `pinata` | 24×30 | star piñata + streamers |
| `rope` | 2×8 | tiling piñata rope |
| `awning` | 40×12 | striped bounce canopy |
| `bone` | 20×16 | |
| `ring` | 32×32 | |
| `balloon` | 24×40 | checkpoint |
| `goalBalloon` | 40×60 | goal |
| `puff` | 16×16 | dust particle |

---

## Suggested next steps

1. **Tune the feel** (this is the real work). Play the first 15 seconds over and
   over. Adjust gravity, flap power, and glide until it feels like *your* dog.
2. More interactions: breakable clay pots (dive), doorbells that summon a rival,
   chickens/goats that scatter, laundry lines as one-way platforms.
3. Build **Las Orillas** — the agricultural edge: irrigation canals, agave
   fields, crop rows, farm dogs.
4. Camera look-down while diving; landing squash; a proper bark on flap.
5. Only then think about dog variants / unlocks.

---

## Troubleshooting

- **Blank screen** — open the browser console; usually a syntax error or a
  failed module load.
- **No sound** — browsers block audio until the first keypress or click. That's
  expected; the first flap enables it.
- **Game looks blurry** — make sure the browser isn't zoomed; the canvas is
  intentionally 512×288 and scaled.
- **Remote machine** — use the SSH port forward above; `localhost:5173` on the
  server itself won't show you anything.

---

## Design doc

For the concept, level beat sheet, and roadmap, see [`DESIGN.md`](DESIGN.md).
For the Day 1 working one-pager (pillars, loop, first-minute test), see
[`PILLARS.md`](PILLARS.md).
