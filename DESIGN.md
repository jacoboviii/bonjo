# Bonjo — Design Document

**Version:** 0.3 (La Cuadra playable slice)
**Genre:** 2D momentum platformer with environmental interactions
**Platform:** Browser (desktop first), mobile touch supported
**Engine:** Phaser 3.90 + Vite + JavaScript, Arcade Physics
**Render:** 512×288 (2× a 256×144 design view)
**Pitch:** Bonjo is the only chow on the block. Walk him through a small Mexican
city, bounce off market awnings, burst piñatas for bones, and subdue the
neighborhood dogs who think this street belongs to them.

---

## 1. Pillars

The working one-pager lives in [`PILLARS.md`](PILLARS.md). The short version:

1. **A proud chow on his rounds.** Movement and animation sell a dog who owns
   the pavement; the barrio is specific, not generic.
2. **Subdue, don't destroy.** Rivals are territorial, not evil. Bonjo wins by
   out-jumping them; they yelp and run home.
3. **The street is a toy.** No interact button: piñatas, awnings, rings and
   rivals all answer the verbs Bonjo already has.

---

## 2. Story & setting

**Bonjo** is a black chow — the only chow on the block. He has a routine: the
same route, the same corners, the same smells. He likes his walks.

**La Cuadra** is the urban core: flat-roofed houses, a church tower, a tienda
awning, strings of papel picado, dogs behind every gate. The streets are the
platforms; the rooftops are the high road.

At the edge of town are **Las Orillas**: irrigation ditches, crop rows, agave,
dust, and farm dogs who have never seen a chow before. That's level 2.

**The conflict** is turf, not evil. Other dogs from other houses bark, chase
and guard their corners. Bonjo subsumes them by diving on them; they yelp and
retreat. Squirrels are opportunists who steal bones. Crows are a rare annoyance.

**Tone:** warm, funny, non-lethal. Spanish is used naturally for place and
flavor (`la cuadra`, `¡guau!`, `¡échale!`, `papel picado`), not as a punchline.

---

## 3. Core loop

**30 seconds:** Walk → spot a rival → it barks and charges → jump/flap over it →
dive to subdue → collect the dropped bone → bounce an awning for height → hit a
piñata → land on the next roof.

**3 minutes:** Cross La Cuadra from Bonjo's house to the far corner, hitting
checkpoints and optionally clearing piñatas and rivals.

**Session:** Finish the level with more bones / a faster time; replay to find
the awnings and piñatas you missed.

---

## 4. Controls

| Input | Ground | Air |
| --- | --- | --- |
| A / D or ← / → | Run | Steer |
| SPACE / W (press) | Jump | Flap |
| SPACE / W (hold) | — | Glide while falling |
| S / ↓ | — | Dive |
| T | Tuning panel | Tuning panel |
| R | Restart | Restart |
| Touch ◀ ▶ | Run (slide between) | Steer |
| Touch ▲ (tap/hold) | Jump | Flap / glide |
| Touch ▼ | — | Dive |

There is **no interact button**. Every environmental interaction uses the verbs
you already have: jump into it, land on it, or dive through it.

Gamepad is out of scope. Touch controls support multi-touch, drag between
direction arrows, and a portrait "rotate your phone" screen.

---

## 5. Movement specification (current defaults)

All values live in `src/tuning.js`; the tuning panel edits them live. Distances
are design pixels (1 design px = 2 render px).

| Parameter | Value | Why |
| --- | --- | --- |
| Gravity | 1600 px/s² | snappy but readable fall |
| Max fall | 700 | terminal velocity |
| Run speed | 260 | ~1.4 screens/second |
| Ground accel | 2400 | reaches top speed in ~0.11 s |
| Air accel | 1500 | 70% air control |
| Ground friction | 2600 | stops quickly, no ice |
| Air friction | 500 | preserves momentum |
| Jump impulse | 420 | ~55 px (3.4 tiles) |
| Flap impulse | 380 | ~45 px per flap |
| Flaps | 2 | land or ring to refill |
| Glide gravity | 400 | 25% of normal |
| Glide max fall | 120 | slow, steerable descent |
| Dive gravity | 3000 | committed slam |
| Dive max fall | 1100 | fast |
| Jump cut | 0.45 | tap = short hop, hold = full jump |
| Min jump hold | 90 ms | quick taps still give a real hop |
| Coyote time | 100 ms | jump just after leaving a ledge |
| Jump buffer | 120 ms | press just before landing still counts |
| Camera look-ahead | 34 px | leads your facing direction |
| Camera smoothing | 0.1 | soft follow |

**State machine:** grounded → jump → flap ×2 → glide (hold, falling) → dive
(hold S). Landing refills flaps. Awnings also refill flaps; rings refill them in
the air. Jump cut only applies to ground jumps, after the 90 ms minimum.

---

## 6. Systems

### Rival dogs (main enemy)
Patrol a turf range and hop. When Bonjo is within ~220 design px and roughly the
same height, they bark (`¡GUAU!`), hop, and chase at ~120 px/s (patrol ~55).
They stop at the edges of their turf rather than running into pits. Diving onto
one — or falling on it faster than 160 px/s — subsumes it: yelp, +1 bone, and it
flees home. Any other contact sends Bonjo back to the last checkpoint. No gore,
no defeat state beyond "runs home."

### Squirrels (bone thieves)
Patrol platforms, hop, and grab a bone when Bonjo is within ~140 design px.
They freeze for 0.65 s (`HEY!`) then sprint to the edge with it. Dive/stomp to
make them drop it; if they escape, the bone is lost. They are the "small
nuisance" layer between rival encounters.

### Crows (rare aerial hazard)
One crow patrols a stretch of sky with a sine bob. Dive through it to pop it
(+1 bone); touch it otherwise and respawn. Kept rare so the dogs stay the story.

### Piñatas
Two hang from ropes over the street. Any contact hits one (350 ms cooldown):
wobble, `¡ÉCHALE!`, one bone drops. Three hits bursts it into `¡ÓRALE!` and a
shower of bones. Purely a reward; never a hazard.

### Market awnings
Striped canvas canopies over the gaps. Landing on one from above bounces Bonjo
~120 design px, refills flaps, squashes the canvas and plays a boing. They are
one-way (you pass through from below). Use them to reach rings, piñatas and
rooftop bones.

### Bones
Score pickups, 20 placed at start plus piñata drops. Later: currency for dog
variants. Placed slightly off the critical path to reward curiosity.

### Wind rings
Gold rings in gaps. Passing through refills all flaps and gives a small upward
kick (-140 px/s). 0.5 s re-trigger cooldown. The mid-air "checkpoint" of the
movement economy.

### Checkpoints & goal
One balloon at the midpoint; touch to set the respawn point. The goal balloon
ends the level with bones + time. R restarts.

---

## 7. Level 1 — La Cuadra (urban core)

World 3200×900 design px. Camera shows 256×144 design units (512×288 render).
Ground line y=600. The background is a tiled town: mountains, fields/agave,
low houses with lit windows, a church tower and cross, papel picado.

Beat sheet:

1. **The block.** Bonjo starts outside his house. A piñata hangs ahead; a rival
   dog patrols the near corner. Learn jump → flap → dive on a dog.
2. **The gap.** First pit; a market awning and a gold ring above it. Bounce the
   awning, pass through the ring.
3. **The climb.** Two floating roofs and a squirrel with a bone.
4. **The drop.** Glide down to the next street; a second rival.
5. **The tienda.** Second awning + piñata; the long street with the checkpoint
   balloon.
6. **The last corner.** Final rival guards the goal; one crow overhead.
7. **Goal balloon.** "THE BLOCK IS YOURS."

---

## 8. Level 2 sketch — Las Orillas (agricultural edge)

- Irrigation canal gaps with narrow stone bridges.
- Agave rows as hazards: spiky, not bouncy.
- Crop rows that hide bones; scare a goat and it runs, revealing a path.
- Farm dogs: bigger, slower, higher HP? Keep the same subdue rule.
- A windmill / water pump as a moving platform or updraft.
- Palette shifts from terracotta/teal to ochre/olive/dust; more sky.

---

## 9. Art direction

**La Cuadra palette**

| Role | Hex |
| --- | --- |
| Sky top / ink | `#1b1029` / `#2b1b3d` |
| Sunset | `#9e4a5e` → `#e0715f` |
| Adobe | `#c98a5e`, shadow `#a96a45` |
| Terracotta roof | `#b5533a`, highlight `#d9775a` |
| Painted teal | `#3f8f8a` |
| Marigold windows | `#ffd166` |
| Papel picado | coral `#f26b5e`, mint `#6ec6a8`, gold `#ffd166`, purple `#b45cd6` |
| Bonjo fur | `#2a2135` (black chow), rim `#6f5c86`, tongue `#b45cd6` |
| Rival dog | tan `#c98a4f`, red bandana `#d94f4f` |

Rules:
- Background town is darker and lower contrast than gameplay objects.
- Roof/wall tops are terracotta + teal trim; the player reads "stand here."
- Every interactive object gets a warm accent: piñata pink/gold, awning
  coral/cream, ring gold.
- Black chow always carries a lavender rim light so he reads against dark walls.
- Avoid sombrero/serape clichés; the specificity is architecture, papel picado,
  church, fields and language.

---

## 10. Audio

Synthesized WebAudio, no files:

| Event | Sound |
| --- | --- |
| Jump / flap | short square / triangle sweep |
| Bone | two sine pings |
| Ring | sine sweep up |
| Squirrel steal | two-note chatter |
| Rival bark | low double woof |
| Rival subdued | descending yelp |
| Piñata hit / burst | wooden thock / short arpeggio |
| Awning | springy sine sweep |
| Hurt | sawtooth fall |
| Checkpoint / win | chime / four-note fanfare |

Music later: one loop per barrio, low-passed, with marimba/requinto colors.

---

## 11. Scope

### In this slice
- La Cuadra: town background, adobe/roof platforms, papel picado
- Movement: run, jump, variable height, coyote, buffer, flaps, glide, dive
- Rival dogs (bark/chase/subdue), squirrels (bone thieves), one crow
- Piñatas, bouncing awnings
- Bones, rings, checkpoint, goal
- Walk cycle, sit/pant idle
- Title + win, keyboard + touch, portrait guard
- Tuning panel

### Cut / later
- Menus, pause, save data, gamepad
- More levels, bosses, dog variants, unlocks
- Breakable pots, doorbells, chickens/goats, laundry lines
- Music, localization

---

## 12. Roadmap

| Step | Goal | Done when |
| --- | --- | --- |
| 1 | Feel | Jumps/flaps/glide feel right; sit/pant reads |
| 2 | La Cuadra | Full traversal with rivals, piñatas, awnings, checkpoint |
| 3 | Las Orillas | Second biome with farm hazards and a distinct palette |
| 4 | Toy pass | Pots, doorbells, chickens, laundry lines |
| 5 | Ship a demo | itch.io build, 5 playtesters, top 3 complaints |

---

## 13. Risks & open questions

| Risk | Mitigation |
| --- | --- |
| Rivals feel unfair at speed | Bark + hop telegraph; stop at turf edges; 0.65 s squirrel pause |
| Piñata bones trivialize score | 3 hits, cooldown, modest drops |
| Awnings break level pacing | One-way, placed in gaps as optional high routes |
| Black chow disappears at night | Lavender rim light + bright tongue/collar |
| Mexican setting feels superficial | Specific architecture/food/plant details; Spanish used naturally; no costume humor |
| Too many enemy types | Rivals are the story; squirrels/crow are seasoning |

**Open questions**
- Do rivals need a "guard a bone" behavior, or is chasing enough?
- Should a subdued rival stay gone for the level, or respawn after a checkpoint?
- Does the awning bounce refill too many flaps?
- Is the dive useful enough outside of enemies/piñatas?

---

## 14. Tuning guide — symptom → fix

| Symptom | Try |
| --- | --- |
| Feels floaty / slow | gravity 1800–2000, max fall 800 |
| Feels heavy / twitchy | gravity 1300–1450, jump impulse 460 |
| Jumps feel weak | jump impulse +20, flap impulse +20 |
| Quick taps feel dead | min jump hold 60–120 ms |
| Too easy to overshoot landings | air friction +150, run speed −20 |
| Glide is boring | glide gravity 550, glide max fall 160 |
| Dive feels mushy | dive gravity 4000, dive max fall 1300 |
| Rivals too aggressive | bark range 160, chase speed 100 |
| Piñata too generous | 2 bones per burst, cooldown 500 ms |
| Awnings too strong | bounce −520 instead of −620 |
