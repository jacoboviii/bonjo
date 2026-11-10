# Bonjo — Design Document

**Version:** 0.4 (La Cuadra survival slice)
**Genre:** Turf-defense survival platformer
**Platform:** Browser (desktop first), mobile touch supported
**Engine:** Phaser 3.90 + Vite + JavaScript, Arcade Physics
**Render:** 288px tall (2× the 144-unit design height); internal width follows the device landscape aspect (512px at 16:9, up to 960px on wide phones) so the canvas fills the screen
**Pitch:** Bonjo is the only chow on the block. By day he scavenges the barrio;
by night he holds the street against waves of rival dogs. Survive two nights,
keep the block, and don't run out of conchas.

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
awning, strings of papel picado, dogs behind every gate. The street is the
arena: one flat run of pavement broken by a few gaps, with awnings and rings
over the holes.

At the edge of town are **Las Orillas**: irrigation ditches, crop rows, agave,
dust, and farm dogs who have never seen a chow before. That's level 2.

**The survival loop:** Day 1 is for scavenging — bones, conchas, piñatas, and
the layout of the street. Night 1 sends the neighbor dogs. Day 2 is shorter and
tense. Night 2 is the last stand. Bonjo has three hearts and a hunger bar; the
porch is safe, dawn heals one heart, and surviving the second night takes the
block.

**The conflict** is turf, not evil. Other dogs from other houses bark, chase
and guard their corners. Bonjo subsumes them by diving on them; they yelp and
retreat. Squirrels are opportunists who steal bones. Crows are a rare annoyance.

**Tone:** warm, funny, non-lethal. Spanish is used naturally for place and
flavor (`la cuadra`, `¡guau!`, `¡échale!`, `papel picado`), not as a punchline.

---

## 3. Core loop

**30 seconds (day):** Walk the block → spot a rival → it barks and charges →
jump/flap over it → dive to subdue → collect the dropped bone → bounce an awning
→ hit a piñata → eat a concha before the hunger bar empties.

**30 seconds (night):** Hold the pavement → a rival spawns from a doorway →
dive it before it reaches you → keep one eye on the heart bar → survive until
dawn.

**3 minutes:** Day 1 scavenge (35 s) → Night 1 (28 s, 3 waves) → Day 2 (30 s)
→ Night 2 (33 s, 4 waves) → take the block.

**Session:** Survive two nights with more bones / a faster time; replay to find
the conchas and piñatas you missed.

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
flees home. Any other contact costs a heart and knocks Bonjo back. No gore, no
defeat state beyond "runs home."

Night waves vary by role:
- **Fast** dogs are smaller and quicker.
- **Thieves** steal one bone on contact and flee; dive them to recover it.
- **Brutes** take two dives.
- **Gate rushers** ignore Bonjo and run for the porch gate.
- The **top dog** appears at the end of Night 2: gold-tinted, crowned, three
  dives. The night cannot end until it is repelled.

### Squirrels (bone thieves)
Patrol platforms, hop, and grab a bone when Bonjo is within ~140 design px.
They freeze for 0.65 s (`HEY!`) then sprint to the edge with it. Dive/stomp to
make them drop it; if they escape, the bone is lost. They are the "small
nuisance" layer between rival encounters.

### Crows (rare aerial hazard)
One crow patrols a stretch of sky with a sine bob. Dive through it to pop it
(+1 bone); touch it otherwise and lose a heart. Kept rare so the dogs stay the
story.

### Piñatas
Two hang from ropes over the street. Any contact hits one (350 ms cooldown):
wobble, `¡ÉCHALE!`, one bone drops. Three hits burst it into `¡ÓRALE!` — a
shower of bones and a concha. Purely a reward; never a hazard.

### Market awnings
Striped canvas canopies over the gaps. Landing on one from above bounces Bonjo
~120 design px, refills flaps, squashes the canvas and plays a boing. They are
one-way (you pass through from below). Use them to reach rings, piñatas and
street bones.

### Bones and score
Bones are score pickups: 35 placed across both blocks plus piñata drops, trash
cans and rival rewards. Pickups build a short combo; the end screen combines
bones, max combo, subdued rivals, health, no-hit and time into a score and an
S–D rank.

### Street props and errands
Taco carts restore hunger; trash cans burst into bones; bicycles can be knocked
over; the marked parked car's alarm stuns nearby rivals. During the day Abuela
tosses a concha, the bell grants another, and the chihuahua barks warnings at
night. These are all optional, but they reward learning the block.

### Wind rings
Gold rings in gaps. Passing through refills all flaps and gives a small upward
kick (-140 px/s). 0.5 s re-trigger cooldown. The mid-air "checkpoint" of the
movement economy.

### Health & hunger
Bonjo has **3 hearts** and a hunger bar (0–100). Enemy contact costs one heart,
knocks him back and grants 1.2 s of invulnerability. Pits cost a heart and respawn
him at the last checkpoint. Hunger drains at 0.8/s; conchas restore 30. At zero
hunger, Bonjo loses a heart every 8 s until he eats. Dawn restores one heart.

### Day, night & waves
Day 1 lasts 35 s, Night 1 is 28 s with 3 rival waves, Day 2 is 30 s, Night 2 is
33 s with 4 waves. Night darkens the street (lit windows pop) and spawns rivals
near Bonjo's block every ~6 s. A visible goal HUD shows “survive 2 nights,” dawn
warnings and the top-dog hit count. The final night adds gate rushers and, at
roughly 12 s left, the top dog. Repel it to win; the timer will wait at zero
until it is down. The HUD always shows phase, timer, hearts, hunger and gate
health.

### The porch
Bonjo's house at the start of the street. Rivals won't enter the first 160
design px of the block, so the porch is a safe corner. A **porch gate** marks
that line: gate rushers chew it down, and if it breaks the safe zone is open
until dawn repairs it. Abuela and the chihuahua live here. Dawn drops a concha
by the door. The street is the arena; the porch is where you catch your breath.

### Checkpoints
Balloons at the midpoint and on the east block; touch one to set the respawn
point after a pit. There is no goal balloon: the win condition is surviving
Night 2 and repelling the top dog.

---

## 7. Level 1 — La Cuadra (urban core)

World 4200×900 design px. The camera shows 144 design units vertically (288px
render); visible width follows the internal canvas width (256 units at 16:9,
wider on phones).
Ground line y=600. The background is a tiled town under a clear blue day sky:
blue mountains, fields/agave, low houses with lit windows, a church tower and
cross, papel picado. A closer, faster parallax storefront row adds awnings,
balconies and signs; parked cars, bicycles, hydrants, planters and street lamps
line the far curb (background only, no collision). Agave clumps and agricultural
edges surround the street. The town layers are anchored to the street's world Y
so they sit on the sidewalk, and a light blue haze keeps the play lane readable.

Beat sheet:

1. **The porch.** Bonjo starts outside his house. A concha is nearby; a piñata
   hangs over the corner; a rival dog patrols the near block. Learn jump → flap
   → dive, and eat when the hunger bar dips.
2. **The first gap.** A market awning and a gold ring over the hole. Bounce the
   awning, pass through the ring, keep moving.
3. **The long block.** A squirrel drags a bone; a rival guards the turf. Day 1
   is for scavenging — clear what you can before dark.
4. **The checkpoint.** Second awning/piñata; the midpoint balloon; a safe beat.
5. **Night 1.** The street darkens; three rivals spawn near Bonjo. Dive them or
   retreat to the porch. Dawn heals a heart and drops a concha.
6. **Day 2 / Night 2.** A shorter day, a harder night; thieves, brutes and a
   gate rusher. The top dog arrives before dawn.
7. **The east block.** New gaps, awnings, high laundry/fire-escape routes, a
   second checkpoint and more scavenging.
8. **Win.** Repel the top dog and survive Night 2: "THE BLOCK IS YOURS."

Losing all hearts ends the run: "THE BLOCK WINS."

---

## 8. Level 2 sketch — Las Orillas (agricultural edge)

- Irrigation canal gaps with narrow stone bridges.
- Agave rows as hazards: spiky, not bouncy.
- Crop rows that hide bones and conchas; scare a goat and it runs, revealing a path.
- Farm dogs: bigger, slower, higher HP? Keep the same subdue rule.
- A windmill / water pump as a moving platform or updraft.
- Nights are darker and longer; fewer conchas; the farmhouse porch is the safe zone.
- Palette shifts from terracotta/teal to ochre/olive/dust; more sky.

---

## 9. Art direction — Blue-Hour La Cuadra

A limited folk-print palette (ink, cream paper, terracotta, coral, marigold,
teal, magenta, cobalt) with cool, low-contrast backgrounds and warm, saturated
gameplay layers. Day is clear cobalt-blue; night is deep indigo with warm
windows. Title, win and game-over screens are framed as lotería cards with
papel-picado strings and ink borders. Agave, milpa rows and agricultural lots
are recurring motifs. Avoid detail for its own sake: strong silhouettes, a few
values, and readable foreground/background separation.

**La Cuadra palette**

| Role | Hex |
| --- | --- |
| Ink / outlines | `#1d1326` |
| Paper / lotería card | `#f4dfb0`, light `#f8e9c6` |
| Sky top → horizon | `#2b5b96` → `#82b6df` → `#f7d5a8` |
| Adobe | `#c98a5e`, shadow `#a96a45` |
| Terracotta | `#c46b4a`, highlight `#d9775a` |
| Painted teal | `#2f7f78` |
| Marigold | `#f2b544` |
| Papel picado | coral `#e85a4f`, mint `#7fc7a3`, marigold `#f2b544`, magenta `#b54a78` |
| Bonjo fur | `#2a2135` (black chow), rim `#6f5c86`, tongue `#b45cd6` |
| Rival dog | tan `#c98a4f`, red bandana `#d94f4f` |
| Health | heart red `#d94f4f` |
| Hunger | concha pink `#f2a6b8`, bar orange `#f0a03c` |
| Night | sky tint `#05030d` at 68%; full-scene overlay 45% |

Rules:
- Background town is darker, cooler and lower contrast than gameplay objects.
- Roof/wall tops are terracotta + teal trim; the player reads "stand here."
- Every interactive object gets a warm accent: piñata pink/gold, awning
  coral/cream, ring gold, concha pink.
- Black chow always carries a lavender rim light so he reads against dark walls.
- At night the sky goes near-black while the windows stay lit; the HUD stays
  bright above the overlay.
- Title/end screens use paper lotería cards with ink borders, corner stamps and
  papel-picado strings.
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
| Cat hiss | short saw/square snarl |
| Bird scatter / chirp | two quick high sine chirps |
| Crow caw | low saw/square squawk |
| Rooster | three-note dawn crow |
| Piñata hit / burst | wooden thock / short arpeggio |
| Awning | springy sine sweep |
| Concha | short crunch |
| Night falls | low bell |
| Dawn | rising three-note chime |
| Hurt | sawtooth fall |
| Game over | descending sawtooth |
| Checkpoint / win | chime / four-note fanfare |

Music later: one loop per barrio, low-passed, with marimba/requinto colors.

---

## 11. Scope

### In this slice
- La Cuadra: town background, flat adobe street, papel picado, porch
- Movement: run, jump, variable height, coyote, buffer, flaps, glide, dive
- **Survival:** 3 hearts, hunger bar, conchas, day/night, waves, top-dog finale, two-night win
- **Roles:** fast dogs, bone thieves, brutes, gate rushers, crowned top dog
- **Level:** two blocks, one-way fire escapes/laundry lines, second checkpoint, interactive taco carts/trash/bikes/car alarm
- **Defense:** porch gate with health and a compromised safe zone
- **NPCs/quests:** Abuela's concha, bell blessing, chihuahua warnings
- **Scoring:** bone combo, rivals, no-hit/time bonuses, S–D rank
- Rival dogs (bark/chase/subdue), squirrels (bone thieves), two crows
- Ambient cats, birds and a rooster; fenced level ends
- Piñatas, bouncing awnings
- Bones, rings, checkpoints
- Walk cycle, sit/pant idle
- Title + top-dog + win + game-over, keyboard + touch, portrait guard
- **Spanish default, English toggle**
- Tuning panel

### Cut / later
- Menus, pause, save data, gamepad
- More levels, dog variants, upgrades
- Base upgrades, crafting, persistent progression
- Breakable pots, doorbells, chickens/goats
- Music

---

## 12. Roadmap

| Step | Goal | Done when |
| --- | --- | --- |
| 1 | Feel | Jumps/flaps/glide feel right; sit/pant reads |
| 2 | Survive La Cuadra | Two-day/two-night loop with health, hunger, waves, porch |
| 3 | Las Orillas | Second biome with farm hazards, scarcity and a distinct palette |
| 4 | Survival depth | Upgrades, wave variants, day scavenging events |
| 5 | Ship a demo | itch.io build, 5 playtesters, top 3 complaints |

---

## 13. Risks & open questions

| Risk | Mitigation |
| --- | --- |
| Rivals feel unfair at speed | Bark + hop telegraph; stop at turf edges; 0.65 s squirrel pause |
| Hunger is annoying rather than tense | Slow drain (0.8/s), generous conchas, dawn refill; no death spiral in one minute |
| Night waves overwhelm | 3/4 waves, 6 s apart, spawn at block edges; porch safe |
| Health too punishing with 3 hearts | Dawn heal, 1.2 s i-frames, knockback instead of teleport |
| Piñata supplies trivialize survival | 3 hits, cooldown, modest food drop |
| Awnings break level pacing | One-way, placed in gaps as optional high routes |
| Black chow disappears at night | Lavender rim light + bright tongue/collar |
| Mexican setting feels superficial | Specific architecture/food/plant details; Spanish used naturally; no costume humor |
| Too many enemy types | Rivals are the story; squirrels/crow are seasoning |

**Open questions**
- Does hunger add tension or just chores? Playtest a full two-night run.
- Should nights get longer each cycle, or waves get denser?
- Should subdued rivals stay gone for the night, or respawn?
- Should food restore health as well as hunger?
- Is the porch safe zone too safe? Does it need a cost?

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
| Hunger is a chore | drain 0.5/s, conchas +40 |
| Hunger never matters | drain 1.0/s, fewer conchas |
| Night 1 overwhelms | waveTotal 2, spawn every 8 s |
| Nights too easy | +1 wave, or night length +5 s |
| Health too punishing | 4 hearts, or 1.5 s i-frames |
| Porch too safe | shrink safe zone to 120 px, or add a concha cost |
| Waves spawn too close | spawn at the platform edge, never within 70 px |
