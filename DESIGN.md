# Bonjo — Design Document

**Version:** 0.4 (La Cuadra + Las Orillas survival slice)
**Genre:** Turf-defense survival platformer
**Platform:** Browser (desktop first), mobile touch supported
**Engine:** Phaser 3.90 + Vite + JavaScript, Arcade Physics
**Render:** 432px tall (3× the 144-unit design height); internal width follows the device landscape aspect (768px at 16:9, up to 1280px on wide screens) so the canvas fills the screen
**Pitch:** Bonjo is the only chow on the block. By day he scavenges the barrio;
by night he holds the street against waves of rival dogs. Survive two nights in
La Cuadra or three in Las Orillas, keep the turf, and don't run out of bones.

---

## 1. Pillars

The working one-pager lives in [`PILLARS.md`](PILLARS.md). The short version:

1. **A proud chow on his rounds.** Movement and animation sell a dog who owns
   the pavement; the barrio is specific, not generic.
2. **Subdue, don't destroy.** Rivals are territorial, not evil. Bonjo wins by
   out-jumping them; they yelp and run home.
3. **The street is a toy.** Piñatas, awnings, rings and rivals answer the verbs
   Bonjo already has. Friendly NPCs use a single context interact button for
   dialog and errands.
4. **Strength in service of peace.** Bonjo is the heaviest dog on the block, but
   his strength is protective, not conquering. He holds gates, clears roads,
   carries what others cannot, breaks up fights and then steps back. The old
   top dog takes turf by force; Bonjo makes a place safe enough for ordinary
   life to return. *The strongest dog keeps the peace.*

---

## 2. Story & setting

**Bonjo** is a black chow — the only chow on the block. He has a routine: the
same route, the same corners, the same smells. He likes his walks.

**La Cuadra** is the urban core: flat-roofed houses, a church tower, a tienda
awning, strings of papel picado, dogs behind every gate. The street is the
arena: one flat run of pavement broken by a few gaps, with awnings and rings
over the holes.

At the edge of town are **Las Orillas**: a continuous field floor, crop rows,
agave, dust, geese, and farm dogs who have never seen a chow before. That's
level 2: three nights and an aggressive Chihuahua boss.

**The survival loop:** Day 1 is for scavenging — bones, conchas, piñatas, and
the layout of the street. Night 1 sends the neighbor dogs. Day 2 is shorter and
tense. Night 2 is the last stand. Bonjo has three hearts, a bone-fed hunger bar
and a concha-charged stamina meter; the
porch is safe, dawn heals one heart, and surviving the second night keeps CASA
standing.

**The conflict** is turf, not evil. Other dogs from other houses bark, chase
and guard their corners. Bonjo subsumes them by sliding into them; they yelp and
retreat. Squirrels are opportunists who steal bones. Crows are a rare annoyance.

**Strength as care.** Bonjo's physical advantage is never a license to dominate.
He is the dog who can hold the gate, carry the harvest and end a fight; the
reward is a quieter block, not a bigger crown. The old top dog rules by taking
space. Bonjo makes space for everyone else, then rests.

**Story delivery.** Each level has a short tension line at its opening and a
peaceful epilogue on the win card. After completion, the map landmark switches
from its objective description to a restored-place description. Rival defeat
banners say they step aside, not fall. The story lives in the change of the
place and the next line of dialogue, not in a cutscene.

**Tone:** warm, funny, non-lethal. Spanish is used naturally for place and
flavor (`la cuadra`, `¡guau!`, `¡échale!`, `papel picado`), not as a punchline.

**Map hub:** the title opens a papel-lotería map of La Cuadra. CASA and Las
Orillas are playable; Iglesia, Mercado and Parque are visible future landmarks.
Selecting a landmark shows its description; completed levels receive an ink
stamp and saved best score.

**Level data:** `src/levels/laCuadra.js` and `lasOrillas.js` own world size,
spawn point, theme texture keys, geometry, enemy/prop locations and phase
timings. The shared
level scene selects a config through `{ levelId }`, so future landmarks can
become data configurations instead of copied scenes.

---

## 3. Core loop

**30 seconds (day):** Walk the block → spot a rival → it barks and charges →
jump/flap over it → slide to subdue → collect the dropped bone → bounce an awning
→ hit a piñata → eat a bone before the hunger bar empties.

**30 seconds (night):** Hold the pavement → a rival spawns from a doorway →
slide it before it reaches you → keep one eye on the heart bar → survive until
dawn.

**3 minutes:** Day 1 scavenge (38 s) → Night 1 (31 s, 3 waves) → Day 2 (33 s)
→ Night 2 (36 s, 3 waves) → hold CASA until dawn.

**Session:** Survive two nights with more bones / a faster time; replay to find
the conchas and piñatas you missed.

---

## 4. Controls

| Input | Ground | Air |
| --- | --- | --- |
| A / D or ← / → | Run | Steer |
| SPACE / W (press) | Jump | Flap |
| SPACE / W (hold) | — | Glide while falling |
| S / ↓ | Slide attack | Air slide attack |
| E | Tail-sweep attack | Tail-sweep attack |
| F | Talk / ring / interact | Talk / ring / interact |
| Map: SPACE / ENTER | Play selected landmark | Play selected landmark |
| Map: ESC / B | Back to title | Back to title |
| O | Objectives panel (pauses) | Objectives panel (pauses) |
| T | Tuning panel | Tuning panel |
| R | Restart | Restart |
| Touch ◀ ▶ | Run (slide between) | Steer |
| Touch ▲ (tap/hold) | Jump | Flap / glide |
| Touch ▼ | Slide attack | Air slide attack |
| Touch 💬 | Talk / ring / interact | Talk / ring / interact |

Friendly NPCs and quest objects show a context prompt; **E** or the touch
bubble starts the interaction. Polo, the chihuahua, cats and the daytime
rooster use a named lotería-paper dialog card; the bell rings directly. An
open dialog card pauses gameplay, hunger, phase timers and enemy movement until
it closes.
Environmental
interactions still use the verbs Bonjo already has: jump into it, land on it,
or slide through it.

Gamepad is out of scope. Touch controls support multi-touch, drag between
direction arrows, and a portrait "rotate your phone" screen.

---

## 5. Movement specification (current defaults)

All values live in `src/tuning.js`; the tuning panel edits them live. Distances
are design pixels (1 design px = 3 render px).

| Parameter | Value | Why |
| --- | --- | --- |
| Gravity | 1600 px/s² | snappy but readable fall |
| Max fall | 700 | terminal velocity |
| Run speed | 200 | ~1.0 screens/second |
| Enemy speed | 0.8 | global patrol/chase/lunge/critter/crow multiplier |
| Ground accel | 2400 | reaches top speed in ~0.11 s |
| Air accel | 1500 | 70% air control |
| Ground friction | 2600 | stops quickly, no ice |
| Air friction | 500 | preserves momentum |
| Jump impulse | 420 | ~55 px (3.4 tiles) |
| Flap impulse | 380 | ~45 px per flap |
| IMPULSE stamina | 2 | earned from conchas and enemies |
| Glide gravity | 400 | 25% of normal |
| Glide max fall | 120 | slow, steerable descent |
| Jump cut | 0.45 | tap = short hop, hold = full jump |
| Min jump hold | 90 ms | quick taps still give a real hop |
| Coyote time | 100 ms | jump just after leaving a ledge |
| Jump buffer | 120 ms | press just before landing still counts |
| Camera look-ahead | 34 px | leads your facing direction |
| Camera smoothing | 0.1 | soft follow |

**State machine:** grounded → jump → flap ×2 → glide (hold, falling). The glide
pose stretches both front paws forward and trails the hind paws, like a small
flying dog. A fresh
S/↓ press starts the slide attack, on the ground or in the air. Air flaps and slides both spend
IMPULSE pips, so jumping and the slide share one stamina meter. IMPULSE is earned
by collecting conchas, which enemies sometimes drop; it no longer refills on
landing, resting, awnings or rings. Jump cut only applies to ground jumps, after the 90 ms minimum.

### IMPULSE stamina
The two IMPULSE pips are the shared stamina meter. A ground jump is free; an air
flap or a slide attack spends one pip. There is no passive or landing refill.
Each defeated enemy has a 40% chance to drop a concha, and every collected
concha restores one pip. The Golden Wing raises the maximum to three and fills the meter.
At zero, air flaps and slides are unavailable, but Bonjo can still run, ground
jump and glide.

---

## 6. Systems

### Context action
`E` / the touch action button does one of two things depending on proximity:
talk or ring when an NPC/quest prompt is active, otherwise perform a short
Bonjo tail sweep. Bonjo plants his paws and whips his fluffy tail through a
quick circular sweep instead of doing a full-body spin. The everyday attack
deals one point, plus a short daze and a small slide-back. Its halo expands to
the exact damage radius, sized to cover Bonjo plus an adjacent enemy sprite; it
is not a second hitbox. A gold tail arc, bright tip and fur-dust ring carry the
sweep visually, and the damage check follows Bonjo for the full sweep, even
while moving or jumping. A sweep that hits
from above also bounces Bonjo off the target. The hit test
measures to the nearest body edge so mismatched sprite origins cannot make a
touching target miss. A deliberate down-input, on the ground or in the air,
starts the slide attack: two points of damage, strong knockback and a heavy
impact, spending one
IMPULSE pip from the same stamina pool as air flaps. A stretched gold aura follows
Bonjo while a trail of warm afterimages and embers streams behind him. Bonjo is
briefly damage-immune during each slide. Every connecting tail sweep or slide throws a small impact ring,
dust burst and light camera kick; the slide's version is the heaviest. The spin
starts immediately, snaps through one rotation in 260 ms and has a ~420 ms
cooldown; one press during that recovery is buffered so it fires as soon as the
cooldown ends. It subdues bone-thief critters and crows, and can hit a piñata.

On touch, all five controls use the same button size. The bottom-right cluster
is flap, spin and slide, with spin beside jump; the talk button appears above
that cluster when an NPC or bell prompt is nearby.

### Rival dogs (main enemy)
The first level has a light daytime patrol of four rivals, four critters and
three crows. Las Orillas raises that to five rivals, five geese and four crows;
future levels should continue the same step-up.

Patrol a turf range and hop. When Bonjo is within ~220 design px and roughly the
same height, they bark (`¡GUAU!`), hop, and chase at ~120 px/s (patrol ~55).
They stop at the edges of their turf rather than running into pits. Sliding
into one or hitting it with the spin subsumes it: yelp, +1 bone and a 40%
chance of a concha; it flees home. Landing on one from above is a safe bounce,
not an attack. Any other contact costs a heart and knocks Bonjo back. The stomp
bounce has a short grace window so the same overlapping body cannot hurt Bonjo
on the way up. No gore, no
defeat state beyond "runs home."

When a rival gets within ~125 px it plants its feet, crouches, flashes and
shows `!` for about 0.6 s, then lunges at roughly 190 px/s. The wind-up is the
dodge window: jump over the charge or slide through it. After a lunge it recovers,
then returns to patrol/chase.

Night waves vary by role, with distinct silhouettes and palettes:
- **Fast** dogs are smaller, blue-grey and quicker, with a teal bandana.
- **Thieves** are masked purple dogs. They steal one bone on contact and flee;
  slide them to recover it.
- **Brutes** are larger, scarred and spiked-collar brown dogs. They take two
  slides and lunge more slowly.
- **Gate rushers** ignore Bonjo and run for the porch gate.
- The **top dog** appears at the end of Night 2: gold-tinted, crowned, three
  slides, and its own pressure lunge. The night cannot end until it is repelled.

### Squirrels (bone thieves)
Patrol platforms, hop, and grab a bone when Bonjo is within ~140 design px.
They freeze for 0.65 s (`HEY!`) then sprint to the edge with it. Slide or spin
to make them drop it; stomping only bounces. If they escape, the bone is lost. They are the "small
nuisance" layer between rival encounters.

### Crows (rare aerial hazard)
One crow patrols a stretch of sky with a sine bob and a two-frame wingbeat.
Spin through it to pop it (+1 bone); landing on it only bounces. Touch it
otherwise and lose a heart. At night it becomes an owl with its own flap frames. Kept rare so the dogs stay the
story.

### Piñatas
Piñatas hang by ropes from utility poles and cross-street cables. Any contact hits one (350 ms cooldown):
wobble, `¡ÉCHALE!`, one bone drops. Three hits burst it into `¡ÓRALE!` — a
shower of bones plus a concha. A piñata with a small heart marker leaves a life
heart instead. Purely a reward; never a hazard.

### Market awnings
Striped canvas canopies over the gaps. Landing on one from above bounces Bonjo
~120 design px, squashes the canvas and plays a boing. They are
one-way (you pass through from below). Use them to reach rings, piñatas and
street bones.

### Vertical routes
Both levels have two high climbs that stack fire escapes, laundry lines and
terracotta roof ledges above the street. Each tier is spaced for a jump plus a
flap, with high rings that give a mid-air kick. High routes carry extra bones,
conchas, a vaulted piñata and an aerial crow/owl; the reward is both score and a
cleaner view of the barrio. Missing a tier drops Bonjo back to the street, so
the route is optional pressure rather than a hard gate.

### End-of-level reward
The far end of each level holds a floating **Golden Wing** token. Reaching it
unlocks one extra IMPULSE pip for the rest of that run, fills the stamina meter
and adds a third pip to the HUD. It is deliberately off the survival path: a reason to
explore the full map, not a requirement to win.

### Bones and score
Bones are score pickups and Bonjo's food: 35 placed across both blocks plus
piñata drops, trash cans and rival rewards. Each bone restores 12 hunger and
builds a short combo; the end screen combines bones, max combo, subdued rivals,
health, no-hit and time into a score and an S–D rank.

### Street props and errands
Taco carts restore hunger; trash cans burst into bones; bicycles can be knocked
over; the marked parked car's alarm stuns nearby rivals. During the day Polo
tosses a concha, the bell grants another, and the chihuahua barks warnings at
night. These are all optional, but they reward learning the block.

### Wind rings
Gold rings in gaps. Passing through gives a small upward kick (-140 px/s).
0.5 s re-trigger cooldown. They no longer refill stamina; that comes from
collecting conchas dropped by enemies.

### Health, life hearts & hunger
Bonjo has **3 hearts** and a hunger bar (0–100). Enemy contact costs one heart,
knocks him back and grants 1.7 s of invulnerability. Pits cost a heart and respawn
him at the last checkpoint. Hunger drains at 0.8/s; bones restore 12 and taco
carts restore 28. At zero hunger, Bonjo loses a heart every 8 s until he eats.
Dawn restores one heart and 10 hunger.

Each level has one placed life heart and a marked piñata with another. A life
heart raises the max from 3 to 4 and fills the new heart; once at 4, it heals
one missing heart. At full health it stays in the world for later.

### Day, night & waves
Day 1 lasts 38 s, Night 1 is 31 s with 2 rival waves, Day 2 is 33 s, Night 2 is
36 s with 3 waves. Night darkens the street (lit windows pop), sends Polo, the
chihuahua, the rooster and the day birds inside, and swaps squirrels/crows for
skunks/owls while bats cross the sky. Rivals spawn near Bonjo's block every ~6 s.
The compact HUD uses the bone icon for hunger and the concha icon for IMPULSE;
the same two icon textures are used by the course pickups. The HUD labels
health/IMPULSE stamina/hunger. The **O / OBJETIVOS** panel pauses the
game and explains the current goal, day errands and each HUD meter, including
dawn warnings and the top-dog hit count. The final night adds gate rushers and, at
roughly 12 s left, the top dog. Repel it to win; the timer will wait at zero
until it is down. The HUD always shows phase, timer, labeled hearts/IMPULSE/hunger
and gate health; objectives and errands live in the O panel.

### The porch
Bonjo's house at the start of the street is a proper two-storey adobe home
behind an open CASA gateway with a standable roof platform. Rivals won't enter
the first 160 design px of the block, so the porch is a safe corner. The gateway
and painted threshold mark that line: Bonjo walks through the open leaves,
normal rivals stop at the threshold, and gate rushers chew the gate down. If it
breaks the safe zone is open until dawn repairs it. Polo and the chihuahua
live here. Dawn drops a concha by the door. The street is the arena; the porch
is where you catch your breath.

### Checkpoints
Balloons at the midpoint and on the east block; touch one to set the respawn
point after a pit. There is no goal balloon: the win condition is surviving
Night 2 and repelling the top dog.

---

## 7. Level 1 — La Cuadra (urban core)

World 5000×900 design px. The camera shows 144 design units vertically (432px
render); visible width follows the internal canvas width (256 units at 16:9,
wider on phones).
Ground line y=600. The background is a tiled town under a clear blue day sky:
blue mountains, fields/agave, low houses with lit windows, a church tower and
cross, papel picado. A closer, faster parallax storefront row adds awnings,
balconies and signs; parked cars, bicycles, hydrants, planters and street lamps
line the far curb (background only, no collision). Agave clumps and agricultural
edges surround the street. A few foreground houses sit on the sidewalk with
non-blocking facades and one-way rooftop platforms; the floor gaps beneath them
are filled. The town layers are anchored to the street's world Y so they sit on
the sidewalk, and a light blue haze keeps the play lane readable.

**Ultimate objective:** hold CASA until dawn — keep the porch standing and drive
the top dog off the block. The win screen is not a throne; it is home, still
standing. Two layered rooftop climbs rise from the west block and east
extension.

Beat sheet:

1. **The porch.** Bonjo starts outside his house. A concha is nearby; a piñata
   hangs over the corner; a rival dog patrols the near block. Learn jump → flap
   → slide, and eat a bone when the hunger bar dips.
2. **The first gap.** A market awning and a gold ring over the hole. Bounce the
   awning, pass through the ring, keep moving.
3. **The long block.** A squirrel drags a bone; a rival guards the turf. Day 1
   is for scavenging — clear what you can before dark.
4. **The checkpoint.** Second awning/piñata; the midpoint balloon; a safe beat.
5. **Night 1.** The street darkens; three rivals spawn near Bonjo. Slide them or
   retreat to the porch. Dawn heals a heart and drops a concha.
6. **Day 2 / Night 2.** A shorter day, a harder night; thieves, brutes and a
   gate rusher. The top dog arrives before dawn.
7. **The east block.** New gaps, awnings, high laundry/fire-escape routes, a
   second checkpoint and more scavenging.
8. **Win.** Repel the top dog and survive Night 2: "CASA IS SAFE."

Losing all hearts ends the run: "THE BLOCK WINS."

---

## 8. Las Orillas — agricultural edge

- Continuous field floor with no pit gaps; houses and props sit on solid ground.
- Agave rows and crop-line dressing.
- Geese replace the squirrel bone-thief slot, including at night. They waddle,
  flutter between patrol points and honk when startled or caught stealing.
- **Three nights**, ending with an aggressive **Chihuahua boss** instead of the top dog.
- Farmhouse rooftops remain standable one-way platforms.
- No porch, Polo, bell or gate defense; those systems are feature-driven off.
- Palette shifts from terracotta/teal to ochre/olive/dust; more sky.
- **Ultimate objective:** drive the Chihuahua off the fields and secure them by
  dawn. Strength is responsibility here: the fields are not loot, they are a
  place other animals depend on.
- The field now runs to 4600 design px, with an eastern extension of new bones,
  ledges, rival turf and a farmhouse edge.
- Two high field climbs rise over the west fields and east edge, using roof,
  fire-escape and laundry tiers with high rings and aerial hazards.
- Pacing: 35 s day, 31 s first night with +5 s per night, 31 s between nights;
  the third night lasts 41 s before the Chihuahua pressure.
- Future: windmill/water-pump traversal, crop hazards, harvest escort and
  goose-specific attacks.

### Future landmarks — the objective spine

| Landmark | Ultimate objective | Peace payoff |
| --- | --- | --- |
| Iglesia | Ring the bell at dawn and make the church a sanctuary. | The bell answers across the barrio. |
| Mercado | Clear the market and return what was taken. | Stalls reopen; the daily rhythm resumes. |
| Parque | Settle the packs without a war. | Rivals share neutral ground. |
| Finale | Unite the barrio for one last night. | Bonjo rests on his porch while the neighborhood lives. |

The rule is constant: **one place to save, one rival to overcome, one dawn
payoff.** The finale is not a bigger fight for a bigger crown. It is the
strongest dog finally getting to be unnecessary.

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
| Fast / thief / brute | blue-grey `#a7c7d6`, masked purple `#8a6d9a`, scarred brown `#b07a4f` |
| Health | heart red `#d94f4f` |
| Hunger | bone cream `#f4dcc0`, bar orange `#f0a03c` |
| IMPULSE | concha pink `#f2a6b8`, gold pip `#ffd166` |
| Night | sky tint `#05030d` at 68%; full-scene overlay 45% |

Rules:
- Background town is darker, cooler and lower contrast than gameplay objects.
- Roof/wall tops are terracotta + teal trim; the player reads "stand here."
- Every interactive object gets a warm accent: piñata pink/gold, awning
  coral/cream, ring gold, concha pink.
- Black chow always carries a lavender rim light so he reads against dark walls.
- At night the sky goes near-black while the windows stay lit; the sun sets,
  a pale cratered moon rises above the darkness, and the HUD stays bright.
- Title/end screens use paper lotería cards with ink borders, corner stamps and
  papel-picado strings.
- Friendly NPC dialog uses the same paper card, pauses gameplay while open and
  excludes its duration from the run timer, with the speaker's name in an
  ink nameplate inside the window instead of a floating world label.
- Avoid sombrero/serape clichés; the specificity is architecture, papel picado,
  church, fields and language.

---

## 10. Audio

Layered WebAudio synthesis, no files. Filtered noise, pitch envelopes and a
little additive shimmer give each event a physical texture; one master
compressor keeps mobile speakers from clipping.

| Event | Sound |
| --- | --- |
| Jump / flap | cloth-noise whoosh + body accent / two feathery air bursts |
| Footstep / landing | quiet surface tap / low body thump and grit |
| Slide attack | short gritty whoosh + low body slide |
| Bone | wooden clack + bright chime |
| Ring | filtered strike + metallic partials |
| Squirrel steal | two-note chatter |
| Rival growl | low filtered saw + breath noise before a lunge |
| Rival bark | chest-noise transient + filtered canine woof |
| Rival subdued | descending, vibrating yelp |
| Goose honk | nasal sawtooth honk with a short square-wave tail |
| Bonjo tail sweep | quick cloth whoosh + bright two-note chime |
| Attack connect | dry impact tick + low body thump |
| Cat hiss | breathy band-passed noise |
| Bird scatter / chirp | quick shimmering sine chirps |
| Crow caw | filtered squawk with a second throaty pulse |
| Owl hoot | two soft, close sine hoots with breath |
| Rooster | three filtered, vibrating dawn calls |
| Piñata hit / burst | wooden thock / crack + short arpeggio |
| Awning | springy pitch-bend with vibrato |
| Concha | layered crunch |
| Night falls | low drone, wind and dark chime |
| Dawn | rising filtered chime and breeze |
| Hurt | impact thud + short pained cry |
| Game over | low fall, grit and descending tone |
| Checkpoint / win | chime / four-note fanfare |

Music later: one loop per barrio, low-passed, with marimba/requinto colors.

---

## 11. Scope

### In this slice
- La Cuadra: town background, flat adobe street, papel picado, porch
- Movement: run, jump, variable height, coyote, buffer, stamina-gated flaps and slide attack, glide, spin
- **Map hub:** La Cuadra landmark map, saved completion stamps and best scores, locked future routes
- **Two playable configs:** La Cuadra and the agricultural Las Orillas, driven by level data
- **Survival:** 3 hearts (expandable to 4 with life hearts), bone-fed hunger bar, concha-charged stamina, day/night, waves, top-dog finale in La Cuadra and a three-night Chihuahua-boss win in Las Orillas
- **Roles:** fast dogs, bone thieves, brutes, gate rushers, crowned top dog, Chihuahua boss
- **Level:** two blocks, one-way fire escapes/laundry lines, second checkpoint, interactive taco carts/trash/bikes/car alarm
- **Defense:** porch gate with health and a compromised safe zone
- **NPCs/quests:** named dialog cards, Polo's concha, bell blessing, chihuahua warnings
- **Scoring:** bone combo, rivals, power-ups, no-hit/time bonuses, S–D rank
- **End reward:** Golden Wing token at the far end of each level grants +1 IMPULSE pip for the run
- Rival dogs (bark/chase/subdue); squirrels/skunks in La Cuadra; geese in Las Orillas; two crows/owls; Chihuahua boss
- Ambient day birds/rooster; night skunks/geese, owls, bats and cats; fenced level ends
- Piñatas with concha or life-heart drops, bouncing awnings
- Bones, rings, checkpoints
- Walk cycle, sit/pant idle
- Title + top-dog + win + game-over, keyboard + touch, portrait guard
- **Spanish default, English toggle**
- Tuning panel

### Cut / later
- Full menus, save data, gamepad (the objectives panel pauses play)
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
| 3 | Las Orillas | Playable field slice; next: farm hazards and scarcity tuning |
| 4 | Survival depth | Upgrades, wave variants, day scavenging events |
| 5 | Ship a demo | itch.io build, 5 playtesters, top 3 complaints |

---

## 13. Risks & open questions

| Risk | Mitigation |
| --- | --- |
| Rivals feel unfair at speed | 0.6 s crouch/`!`/growl lunge wind-up; slower lunges and longer cooldowns; stop at turf edges; 0.65 s squirrel pause |
| Hunger is annoying rather than tense | Slow drain (0.8/s), plentiful bones, dawn refill; no death spiral in one minute |
| Night waves overwhelm | 2/3 waves, 6 s apart, spawn at block edges; porch safe |
| Health too punishing with 3 hearts | Dawn heal, 1.7 s i-frames, knockback instead of teleport |
| Piñata supplies trivialize survival | 3 hits, cooldown, modest food drop |
| Awnings break level pacing | One-way, placed in gaps as optional high routes |
| Black chow disappears at night | Lavender rim light + bright tongue/collar |
| Mexican setting feels superficial | Specific architecture/food/plant details; Spanish used naturally; no costume humor |
| Too many enemy types | Rivals are the story; squirrels/crow are seasoning |

**Open questions**
- Does hunger add tension or just chores? Playtest a full two-night run.
- Should nights get longer each cycle, or waves get denser?
- Should subdued rivals stay gone for the night, or respawn?
- Should bones restore health as well as hunger?
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
| Slide feels weak | slide damage 2, stronger knockback and impact |
| Rivals too aggressive | bark range 160, chase speed 100 |
| Piñata too generous | 2 bones per burst, cooldown 500 ms |
| Awnings too strong | bounce −520 instead of −620 |
| Hunger is a chore | drain 0.5/s, bones +18 |
| Hunger never matters | drain 1.0/s, fewer bones |
| Night 1 overwhelms | waveTotal 2, spawn every 8 s |
| Nights too easy | +1 wave, or night length +5 s |
| Health too punishing | 4 hearts, or 1.5 s i-frames |
| Porch too safe | shrink safe zone to 120 px, or add a stamina cost |
| Waves spawn too close | spawn at the platform edge, never within 70 px |
