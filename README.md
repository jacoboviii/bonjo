# Bonjo 🐕

**Bonjo is the only chow on the block.** A proud, fluffy black chow who likes
his walks through a small Mexican city — and does not appreciate the neighbor
dogs from other houses trying to take his turf.

A **turf-defense survival platformer**: by day, scavenge the barrio for bones
and conchas; by night, hold the block against waves of rival dogs. Jump, flap,
glide and dive; subdue rivals; bounce off market awnings; knock a piñata for
supplies; survive two nights.

This is a **playable prototype**, not a finished game. The current build is for
tuning the movement feel and testing the survival loop.

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
- **Survival:** Bonjo has **3 hearts** and a **hunger bar**. Conchas restore
  hunger; an empty bar starts costing health. Day 1 is for scavenging. Night 1
  sends rival dogs at you. Survive both nights to take the block.
- **The porch:** Bonjo's house at the start of the street is a safe zone.
  Rivals won't enter it, and dawn restores a heart.

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
- On the end screen, **tap anywhere** to replay (no R key needed).
- Multi-touch works, so you can run and flap at the same time.
- In portrait, the game pauses behind a **rotate your phone** screen with a
  "play anyway" escape.
- Landscape orientation is strongly recommended.
- **EN / ES** language buttons are in the top-right of the title screen.
- The game starts in **Spanish** by default; choose **EN** for English.

On a desktop you can press **V** to show the touch buttons for testing.

### Interactions in one sentence

Land on a rainbow-striped **awning** to bounce; hit a **piñata** three times to
burst it; **dive** a **rival dog** to make it drop a bone and flee. Eat
**conchas** to keep the hunger bar up, and survive two nights. Bones are score;
hearts are your life. Gold rings refill your flaps in mid-air.

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

### Dev playtest helpers (local server only)

- Press **N** to skip to the next day/night phase.
- At the end of a run, copy the `BONJO RUN {...}` line from the browser console
  (or read `localStorage["bonjo.lastRun"]`): time, hearts, hunger, conchas,
  damage taken, falls, waves, nights and bones.
- These helpers are stripped from the production build.

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
- **Health (3 hearts) + hunger bar**, concha pickups, dawn healing
- **Day/night cycle**: scavenge by day, survive waves of rival dogs at night
- **Rival neighborhood dogs** that patrol, bark, chase and can be subdued
- **Squirrels** that steal bones; one rare **crow**
- **Piñatas** (3 hits → bones + a concha) and **bouncing market awnings**
- Wind rings that refill flaps mid-air
- Bones, concha food, checkpoint balloon, a safe **porch**
- La Cuadra: adobe/terracotta town, church, closer storefronts, parked cars, bicycles, papel picado, fields and agave
- Atmospheric haze pushes the city back while keeping Bonjo and the hazards readable
- Pits cost a heart and respawn; 0 hearts ends the run
- Camera look-ahead; synthesized SFX
- All art generated in code (no image/audio files)
- Keyboard + on-screen touch controls, portrait guard
- **Spanish by default** (La Cuadra, México); toggle **EN / ES** on the title, or press **L**. The choice is remembered.
- Title, win and game-over screens

**Not in this build:** menus, pause, save files, gamepad, bosses, base
upgrades, crafting, more than one level, real music.

---

## Project map

```
bonjo/
├── index.html              page shell + canvas styling + portrait guard
├── vite.config.js
├── package.json
├── src/
│   ├── main.js             Phaser config (288px tall, width follows aspect)
│   ├── scale.js            SCALE=2 (288px render of a 256×144 design view)
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
│       └── Level1.js       La Cuadra, survival loop, waves, HUD, tuning
└── dist/                   production build (after `npm run build`)
```

The game renders at a fixed **288px height** (2× the 256×144 design view), with a
width derived from the device's landscape aspect ratio: **512px at 16:9**, up to
**960px on tall phones** (e.g. 623×288 on a 19.5:9 phone). It re-measures on
rotation or viewport changes, and scenes center and anchor UI from
`this.scale.width`, so the canvas keeps filling the screen instead of
letterboxing with side bars. `pixelArt: true` keeps it crisp.

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
| `concha` | 24×16 | hunger pickup |
| `heart` | 20×20 | health HUD |
| `porch` | 112×88 | home safe zone |
| `ring` | 32×32 | |
| `balloon` | 24×40 | checkpoint |
| `puff` | 16×16 | dust particle |
| `nearTown` | 320×100 | tiling foreground storefronts |
| `carA`, `carB`, `carC` | 44×22 | parked sedan / hatchback / pickup |
| `bikeMint`, `bikeCoral` | 20×18 | leaning bicycles |
| `hydrant` / `trashcan` / `planter` / `streetlamp` | 9×13 – 12×58 | street dressing |

---

## Suggested next steps

1. **Tune the survival pressure.** Play a full two-night run. Adjust hunger
   drain, wave counts, dawn healing and i-frames until it's tense but fair.
2. Add **wave telegraphs**: a gate/door animation, a bark off-screen, a short
   pause before the first dog.
3. More day scavenging: breakable clay pots, doorbells that summon a rival,
   chickens/goats that scatter, laundry lines as one-way platforms.
4. Build **Las Orillas** — the agricultural edge: irrigation canals, agave
   fields, crop rows, farm dogs.
5. Camera look-down while diving; landing squash; a proper bark on flap.

Only after the two-night loop feels right: dog variants, upgrades, saves,
more blocks.

---

## Troubleshooting

- **Blank screen** — open the browser console; usually a syntax error or a
  failed module load.
- **No sound** — browsers block audio until the first keypress or click. That's
  expected; the first flap enables it.
- **Game looks blurry** — make sure the browser isn't zoomed; the canvas is
  deliberately low-resolution pixel art and scales up.
- **Remote machine** — use the SSH port forward above; `localhost:5173` on the
  server itself won't show you anything.

---

## Design doc

For the concept, level beat sheet, and roadmap, see [`DESIGN.md`](DESIGN.md).
For the Day 1 working one-pager (pillars, loop, first-minute test), see
[`PILLARS.md`](PILLARS.md).
