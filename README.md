# Bonjo 🐕

**Bonjo is the only chow on the block.** A proud, fluffy black chow who likes
his walks through a small Mexican city — and does not appreciate the neighbor
dogs from other houses trying to take his turf.

A **turf-defense survival platformer**: by day, scavenge the barrio for bones
and conchas; by night, hold the block against waves of rival dogs. Jump, flap,
glide and slide; subdue rivals; bounce off market awnings; knock a piñata for
supplies. Hold CASA for two nights and repel the **top dog**, or survive three
nights in Las Orillas and drive off the **Chihuahua boss**.

> **The strongest dog keeps the peace.**

Bonjo is the heaviest dog on the block, but his strength is for protection:
holding gates, clearing roads, carrying what others cannot and ending fights
without hurting anyone. Each level asks him to save a place, not conquer it.

This is a **playable prototype**, not a finished game. The map hub already has
La Cuadra and Las Orillas playable, with future landmarks plotted for expansion.

![Bonjo contact sheet](screenshots/contact-sheet.png)

Individual 1280×720 screenshots are in [`screenshots/`](screenshots/).
The contact sheet shows the English UI; the game itself now starts in Spanish.

![La Cuadra landmark map](screenshots/00-map.png)

![Las Orillas fields](screenshots/24-orillas.png)

![The Chihuahua boss on Night 3](screenshots/25-orillas-boss.png)

---

## The world

- **Setting:** a small city in México. Level 1, **La Cuadra**, is the urban
  core: flat-roofed houses, a parish church, papel picado, adobe walls and
  terracotta roofs under a clear blue day sky. The fields and blue-green agave
  at the horizon and along the lots are the agricultural edges — **Las
  Orillas** — now playable from the map as a second, field-focused level.
- **Bonjo:** the only chow on the block. Not a killer — he **subdues** his
  rivals by out-jumping them. When beaten, a rival yelps and runs home.
- **Bonjo's strength:** weight, momentum and grip are his gifts. He holds gates,
  clears paths and carries heavy things; strength is how he protects a place,
  not how he rules it.
- **Rivals:** dogs from other houses guard their turf, bark (`¡GUAU!`) and
  chase. When they close in, they crouch, flash and bark a warning before a
  lunging charge — jump over it or slide into it to subdue it. Night waves include
  **fast** dogs, masked **bone thieves**, spiked-collar **brutes**, and on the
  final night the **top dog** in La Cuadra or the **Chihuahua boss** in Las
  Orillas.
- **Squirrels, skunks & geese:** small bone thieves. La Cuadra's bushy-tailed
  squirrels become skunks at night; Las Orillas uses geese day and night.
- **Crows:** one rare aerial pest, plus a far-block crow; their wings flap as they patrol and they caw when Bonjo gets close. At night the same slot becomes a hunting owl.
- **Alley life:** by day, small birds scatter and a rooster crows; in La Cuadra the squirrels and crows give way to skunks and owls at night, while Las Orillas keeps its geese. Bats cross the dark and the cats keep their watch.
- **Piñatas:** hanging by ropes from street utility poles. Jump, flap or spin into one; each hit drops a
  bone, and the third hit bursts it into a shower of bones. Most leave a concha;
  piñatas with a small heart marker leave a **life heart** instead.
- **Market awnings:** land on the striped canvas to bounce high and restore one
  IMPULSE pip. Gold rings give a stronger mid-air upward kick and also restore
  one IMPULSE pip, keeping vertical routes viable.
- **High routes:** one-way fire escapes, laundry lines and terracotta rooftops
  climb above the street. Higher tiers carry rings, bones and conchas; practice
  the flap-and-glide chain to reach them.
- **Foreground houses:** three foreground homes sit on the sidewalk; their
  facades do not block movement, and their rooftops are one-way platforms.
- **Bonjo's roof:** the house roof is a standable one-way platform above the porch.
- **Street life:** taco carts restore hunger, trash cans burst into bones,
  bicycles can be knocked over, and one parked car has an alarm that stuns
  nearby rivals.
- **The porch:** Bonjo's house at the start of the street is a safe zone.
  An open **CASA gateway** and painted threshold mark the line. Normal rivals
  stop there; gate rushers try to chew the gate down. If it breaks, the porch is
  open until dawn. Polo tosses a concha each day, the bell grants another,
  and the chihuahua barks warnings.
- **Survival:** Bonjo has **3 hearts** and a **hunger bar**. Bones restore
  hunger; an empty bar starts costing health. Conchas charge the IMPULSE stamina
  used for air jumps and slides. Each level hides one **life heart**
  and at least one marked piñata hides another. The first raises max health to
  four; later hearts heal, and a full-health heart waits for you. In La Cuadra,
  hold CASA for two nights and drive off the top dog; in Las Orillas, survive
  three nights and drive the Chihuahua off the fields. Bones, combo, subdued
  rivals and no-hit play feed your final score and rank.

Tone: cozy, mischievous, non-lethal. The strongest dog makes the block safe;
nobody gets hurt.

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
| **SPACE** / **W** | Jump (hold for height) | Flap (spends 1 IMPULSE pip) |
| **Hold SPACE** | — | Glide (slow fall) |
| **S** / **↓** | Slide attack (spends 1 IMPULSE pip, heavy damage) | Air slide attack (spends 1 IMPULSE pip) |
| **E** / touch spin | Tail-sweep attack nearby rivals | — |
| **F** / touch talk | Talk to friendly NPCs, ring the bell | — |
| **O** | Open/close objectives | Open/close objectives |
| **T** | Show/hide the tuning panel | |
| **R** | Restart the level | |
| **V** | Toggle the touch buttons | |
| **L** | Switch English / Spanish (title screen) | |
| **Map:** SPACE / ENTER | Play the selected landmark | |
| **Map:** ESC / B | Back to title | |

### Phones and tablets

On a touch device the on-screen controls appear automatically:

- **bottom-left:** ◀ ▶ run (slide between them without lifting)
- **bottom-right:** action cluster — ▲ flap, ✦ spin and ▼ slide, with spin beside jump
- **above the action cluster:** a talk button appears when an NPC or bell prompt is in range
- **top bar:** IMPULSE stamina, health, hunger, bones and the day/gate readout live in one compact strip
- **top-right:** the **pause** button opens the objectives panel and pauses play
- The title and map switch to larger touch targets: a tappable play button, bigger EN/ES language pills, a larger map play button and a roomier back button.
- On the **map**, tap a landmark to inspect it, then tap **JUGAR / PLAY**.
- On the end screen, **tap anywhere** to replay; the **MAPA / MAP** button returns to the hub.
- Multi-touch works, so you can run and flap at the same time.
- In portrait, the game pauses behind a **rotate your phone** screen with a
  "play anyway" escape.
- Landscape orientation is strongly recommended.
- **EN / ES** language buttons are in the top-right of the title screen.
- The game starts in **Spanish** by default; choose **EN** for English.

On a desktop you can press **V** to show the touch buttons for testing.

### Interactions in one sentence

Land on a rainbow-striped **awning** to bounce; hit a **piñata** three times to
burst it; **slide** a **rival dog** to make it drop a bone and flee. Landing on
an enemy bounces Bonjo safely without damaging either of them. Eat **bones** to keep hunger up; grab **conchas** to recharge IMPULSE. Use taco carts, loot trash cans, knock
over bikes and trip the marked car alarm. Press **F** (or tap the talk button)
near Polo, the chihuahua, a cat or the daytime rooster to talk; use it at the
bell to ring it. Dialog cards pause the game until you close them. Press **E** (or tap the spin button) to make Bonjo plant his
paws and whip his fluffy tail in a quick sweep that dazes, nudges back and
damages nearby rivals, bone thieves and crows. The tail arc and its damage
travel with Bonjo, even while moving or jumping; a sweep that connects from
above also bounces Bonjo off the target.
Press down on the ground or in midair for the heavy slide finisher; it spends one IMPULSE pip,
deals two points with strong knockback and leaves a meteor-like trail of warm
afterimages and embers. Every connecting tail sweep or slide adds a small impact ring,
dust burst and camera kick.
Polo's dialog hands over
the daily concha. Survive the level's nights and final boss; bones, combo and a
clean run feed your score and rank.

---

## The tuning panel (the important part)

Press **T**, or click the `BONJO · feel tuning` bar in the bottom-right.

While playing, drag any slider and *feel* the difference immediately. This is
how platformer game feel is actually designed: change one number, play for ten
seconds, keep or revert.

| Folder | Slider | What it changes |
| --- | --- | --- |
| Movement | run speed | top running speed |
| | enemy speed | global multiplier for rival, critter and crow movement |
| | ground / air accel | how quickly you reach top speed |
| | ground friction | how quickly you stop |
| Air | gravity | normal falling weight |
| | glide gravity / fall speed | how floaty the glide is |
| | jump / flap power | height gained per jump / flap |
| | IMPULSE pips | maximum stamina charges |
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
- `jump cut 1.0` → no variable jump height (hold/release stops mattering)
- `coyote 0` and `jump buffer 0` → feel how much those two invisible helpers do

---

## What's in this build

- Run, variable-height jump, coyote time, jump buffering
- Two flaps, glide and slide — each with its own animation pose
- **IMPULSE stamina** pays for air flaps and slide attacks; refill it with conchas dropped by enemies, or with gold rings and awnings
- Walk cycle (4-frame), denser 40×40 hero sprite; sits and pants after a short standing beat when idle
- **Health (3 hearts, up to 4 with life hearts) + hunger bar**, bone food, concha stamina charges, dawn healing
- **Life hearts** placed in every level and hidden in marked piñatas; the first raises max health, later hearts heal
- **Map hub**: a papel-lotería map of La Cuadra with CASA and Las Orillas playable, and Iglesia, Mercado and Parque marked as future routes
- **Las Orillas**: a three-night field level with a continuous floor, farmhouse roofs, agave rows, geese and an aggressive Chihuahua boss
- **Saved progress**: completed levels and best scores persist in localStorage and show on the map
- **Day/night cycle**: scavenge under the sun, survive waves of rival dogs under the moon
- **Blue-Hour La Cuadra art direction**: limited folk-print palette, lotería-style title/end cards and papel picado trim
- **Ambient wildlife**: day birds, a dawn rooster, alley cats, hooting owls, bats, and a night shift of skunks in La Cuadra or geese in Las Orillas
- **Objectives panel (O)** for the current goal, Polo/bell errands and a description of each HUD meter
- **Compact labeled status HUD** for health, IMPULSE stamina and hunger; phase, countdown and gate remain on-screen
- **Rival roles** — distinct fast, thief and brute dog art, telegraphed lunge attacks, gate rushers, the La Cuadra **top dog** arriving at Casa, and the Las Orillas **Chihuahua boss**
- **Context actions** — a separate talk button near NPCs and bells; the always-available tail-sweep button dazes, nudges back and damages nearby rivals, bone thieves and crows; down-input slides work on the ground and in the air, deal two points and spend one IMPULSE pip each, sharing stamina with air flaps
- **Vertical rooftop routes** in both levels: layered fire escapes, laundry lines and roof ledges with high rings, bones, conchas and aerial hazards
- **End-of-level Golden Wing**: reach the far end of either level for a run-long extra IMPULSE pip (and a third HUD pip)
- **Story beats**: each level opens with a one-line tension beat and ends with a peaceful epilogue; completed landmarks show their restored description on the map
- **Interactive street props** — taco carts, lootable trash, knockable bikes, car alarm stuns
- **Porch gate defense** with gate health and a compromised safe zone if it breaks
- **Named NPC dialog cards** that pause the action, Polo's daily concha, bell blessing, and chihuahua warnings
- **Scoring**: bone combo, subdued rivals, no-hit and time bonuses; S–D rank on the end screen
- **Squirrels/skunks** in La Cuadra and **geese** in Las Orillas that steal bones; two crows
- **Piñatas** (3 hits → bones, plus a concha or life heart) and **bouncing market awnings**
- Wind rings that give a mid-air upward kick
- Bones for hunger and conchas for stamina, each scattered at randomized x/heights every run; two checkpoint balloons, a safe **porch**
- La Cuadra: adobe/terracotta town, church, closer storefronts, parked cars, bicycles, papel picado, fields and agave
- Atmospheric haze pushes the city back while keeping Bonjo and the hazards readable
- Extended east blocks and field edges with extra bones, props, enemy turf and a second checkpoint
- Fenced level boundaries so Bonjo cannot run off the last platform
- Pits cost a heart and respawn; 0 hearts ends the run
- Camera look-ahead; layered, filtered synthesized SFX with footsteps, landings and animal calls
- **3× internal render resolution** for crisper pixel art without changing the screen layout
- All art generated in code (no image/audio files)
- Keyboard + on-screen touch controls, portrait guard
- **Spanish by default** (La Cuadra, México); toggle **EN / ES** on the title, or press **L**. The choice is remembered.
- Title, top-dog finale, win and game-over screens

**Not in this build:** full menu systems, save slots, gamepad, base upgrades,
crafting, more than two playable levels, real music. (The map hub already lists
future landmarks; the objectives panel pauses play.)

---

## Project map

```
bonjo/
├── index.html              page shell + canvas styling + portrait guard
├── vite.config.js
├── package.json
├── src/
│   ├── main.js             Phaser config (432px tall, width follows aspect)
│   ├── scale.js            SCALE=3 (432px render of a 256×144 design view)
│   ├── tuning.js           EVERY feel number, commented  ← start here
│   ├── art.js              all pixel textures, town, characters, props
│   ├── sfx.js              layered WebAudio sound effects
│   ├── progress.js         saved level completion and best scores
│   ├── levels/
│   │   ├── index.js        ordered landmark/level registry for the map
│   │   ├── laCuadra.js     geometry, spawn, enemies, props and timings
│   │   └── lasOrillas.js   field level config and agricultural theme
│   ├── objects/
│   │   ├── Dog.js          Bonjo's movement + sit/pant + walk cycle
│   │   ├── RivalDog.js     patrol / bark / telegraph / lunge / subdue
│   │   ├── Squirrel.js     patrol, hops, bone thief
│   │   ├── Crow.js         rare aerial hazard
│   │   └── Pinata.js       hanging piñata state + rope
│   ├── ui/
│   │   └── TouchControls.js  on-screen phone buttons + multi-touch + drag
│   └── scenes/
│       ├── Boot.js         builds textures, starts title
│       ├── Title.js        BONJO title screen
│       ├── Map.js          illustrated La Cuadra landmark/level-select hub
│       └── Level1.js       shared level runtime; reads La Cuadra's config
└── dist/                   production build (after `npm run build`)
```

The game renders at a fixed **432px height** (3× the 256×144 design view), with a
width derived from the device's landscape aspect ratio: **768px at 16:9**, up to
**1280px on wide screens** (e.g. 933×432 on a 19.5:9 phone). It re-measures on
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
| `dog`, `dogSit`, `dogWalkA–D` | 60×60 | denser black chow with 4-frame walk; flipped in code |
| `dogGlide` | 60×60 | front paws stretched forward, hind paws trailing |
| `tongue` | 9×12 | panting overlay |
| `rival`, `rivalRun` | 48×45 | tan neighborhood dog, red bandana |
| `rivalFast`, `rivalFastRun` | 48×45 | blue-grey fast dog, teal bandana |
| `rivalThief`, `rivalThiefRun` | 48×45 | masked purple thief dog |
| `rivalBrute`, `rivalBruteRun` | 48×45 | scarred brute, spiked collar |
| `crow`, `crowFlap` | 42×27 | two-frame wingbeat, facing right |
| `squirrel`, `squirrelRun` | 48×42 | 2-frame run cycle |
| `goose`, `gooseRun` | 48×42 | Las Orillas bone thief; honks when startled |
| `chihuahuaBoss`, `chihuahuaBossRun` | 60×60 | aggressive Las Orillas boss |
| `pinata` | 36×45 | star piñata + streamers |
| `rope` | 3×12 | tiling piñata rope |
| `awning` | 120×36 | striped bounce canopy |
| `boneIcon`, `conchaIcon` | 42×30 / 48×30 | course pickups + HUD icons |
| `sun` / `moon` | 144×144 | day sun and night moon |
| `speechBubble` | 42×36 | floating touch interaction prompt |
| `btn-slide`, `pauseIcon` | 96×96 / 42×42 | charge-action and pause button icons |
| `heart` | 15×15 | health HUD |
| `lifeHeart` | 24×24 | world life pickup and piñata life marker |
| `wingToken` | 24×24 | end-of-level extra-flap power-up |
| `bonjoHouse` | 390×240 | two-storey home behind the CASA gateway |
| `ring` | 48×48 | |
| `balloon` | 36×60 | checkpoint |
| `puff` | 24×24 | dust particle |
| `nearTown` | 960×300 | tiling foreground storefronts |
| `carA`, `carB`, `carC` | 132×66 | parked sedan / hatchback / pickup |
| `bikeMint`, `bikeCoral` | 60×54 | leaning bicycles |
| `hydrant` / `trashcan` / `planter` / `streetlamp` | 27×39 – 36×174 | street dressing |
| `gate` | 108×90 | porch gate |
| `tacocart` | 132×90 | hunger refill |
| `polo` / `chihuahua` | 48×84 / 42×42 | day NPC / warning ally |
| `bell`, `bellpost` | 42×42, 54×126 | day blessing |
| `crown` | 42×27 | top-dog marker |
| `agave`, `agaveBloom` | 78×78, 78×114 | blue-green street/field plants |
| `agaveField` | 270×78 | tilled field patch |
| `cat`, `catGray` / `bird` / `rooster` | 54×48 / 36×30 / 60×72 | ambient wildlife |
| `skunk`, `skunkRun` / `owl`, `owlFlap` / `bat` | 48×42 / 48×30 / 36×21 | night-shift wildlife |
| `fence` | 84×96 | level-edge boundary |
| `foregroundHouseA/B/C` | 210×240 | standable foreground houses |
| `ledge_*` | 270–330×36 | one-way fire escape / laundry line / terracotta roof |

---

## Suggested next steps

1. **Tune the new finale.** Play a full two-night run with the gate rusher,
   thief waves and top dog. Adjust alpha health, gate timing and day gifts until
   it's tense but fair.
2. Add **wave telegraphs** at the porch: door slams, gate lanterns, a longer
   bravo bark before the first dog.
3. More **east-block landmarks**: a mercado interior, a basketball court,
   rooftop murals, and a second Polo window.
4. Expand **Las Orillas** — crop-row traversal, farm hazards, harvest escort,
   goose patterns and more Chihuahua boss phases.
5. Build future landmarks around their **ultimate objective**: sanctuary at the
   Iglesia, restoration at the Mercado, and a fair peace in the Parque.
6. Camera look-down while sliding; landing squash; a proper bark on flap.

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
