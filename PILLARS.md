# Bonjo — Day 1: Pillars & the 30-second loop

**The fantasy (one sentence):** You are Bonjo, the only chow on the block — a
proud, heavy little dog whose strength keeps his Mexican barrio safe enough to
live in, one night at a time.

> **The strongest dog keeps the peace.**

---

## Survival layer

The platformer is the body; survival is the pressure.

- **Health:** 3 hearts. Enemy contact costs one; pits cost one; 0 ends the run.
- **Hunger:** a slow bar. Conchas restore 30; at zero, health drains.
- **Day/night:** Day 1 (35 s) scavenge → Night 1 (28 s, 3 waves) → Day 2
  (30 s) → Night 2 (33 s, 4 waves) → win.
- **The porch:** a safe zone at the start; rivals won't enter it, and dawn
  restores a heart and drops a concha.
- **The night is the antagonist.** Waves spawn at the edges of the block; the
  player chooses to fight, retreat, or spend supplies.

The survival layer is only worth keeping if a full two-night run creates
*choices* — eat now or save the concha, fight the wave or retreat to the porch.
If it only adds chores, cut it.

---

## Four pillars

### 1. A proud chow on his rounds

**Means:** Bonjo moves like he owns the pavement: a chest-out strut, a snap into
a run, a big flap, a committed dive. The camera leads him; the animation sells
the character (walk cycle, sit, pant, purple tongue). The place is specific:
adobe, terracotta, papel picado, a church tower, agave at the edge of town.

**Forbids:** generic floating-island fantasy, weightless movement,
silent-protagonist energy, decoration that isn't a real neighborhood.

**Test:** in the first ten seconds, does it feel like walking a dog who thinks
the street is his?

### 2. Subdue, don't destroy

**Means:** the other dogs are territorial, not evil. Bonjo wins by out-jumping
them; a dive ends the scrap, the rival yelps and runs home, and drops a bone.
Comedy, noise, no blood.

**Forbids:** killing, gore, faceless monsters, bosses that must die, "enemy" as
a health bar.

**Test:** after a fight, does the player feel like a good boy — not a killer?

### 3. The street is a toy

**Means:** environmental props answer a verb the player already has:
jump/flap into a piñata, land on an awning, glide through a ring, dive onto a
rival. Friendly NPCs and quest objects use one context **interact** button for
dialog, conchas and bell ringing.

**Forbids:** decorative-only props, quick-time events, inventory puzzles, a
second control scheme.

**Test:** can a new player discover one interaction in the first minute without
being told?

### 4. Strength in service of peace

**Means:** Bonjo is the heaviest dog on the block. His weight and momentum hold
gates, clear paths, carry harvest, break up fights and stop bullies. Wins are
protective, not possessive: rivals go home, the porch stands, the fields are
safe, and Bonjo steps back.

**Forbids:** conquest as the goal, a throne, killing or maiming, strength
treated as cruelty, bosses that must die. The crown belongs to the old
hierarchy; Bonjo would rather sleep on his porch.

**Test:** after a win, does the place feel safer and more ordinary — not
conquered?

*The setting is not a fifth pillar; it's the texture of pillar 1. If a decision
could be set in any generic platformer, it isn't specific enough.*

---

## The 30-second loop (one paragraph)

Bonjo trots out of his gate and down the block; a neighbor dog barks and
charges, so he hops it, flaps once for height, and dives — the rival yelps and
runs home, leaving a bone. Bonjo grabs it, eats a concha before his hunger bar
dips, bounces off a striped market awning to reach a piñata, smacks it twice,
bursts it on the third, and rides the bone shower onto the next corner. A gold
ring refills his flaps; he glides across the street, past a squirrel dragging a
stolen bone into a doorway. Then the light fades, the town windows glow, and
three dogs from other houses come out — Bonjo plants himself in the middle of
the block, hearts full, and holds the street until dawn.

---

## The first 60 seconds (the only thing to build/test this week)

| Time | Beat | Teaches |
| --- | --- | --- |
| 0–5 s | Bonjo's gate; a bone and a concha ahead; the first piñata above the corner | move, collect; an optional toy to notice |
| 5–15 s | A rival behind a low wall, barking; safe to watch | jump; the rival is a threat |
| 15–25 s | The rival charges; dive on it; it flees and drops a bone | dive = subdue |
| 25–35 s | The first gap: awning + gold ring; the hunger bar dips | land on awning → bounce → ring; eat |
| 35–45 s | **Night 1.** The street darkens; three rivals spawn at the edges | hearts, waves, retreat or fight |
| 45–60 s | Hold the block or fall back to the porch; survive to dawn | the survival loop |

The squirrel/checkpoint/piñata chain comes in Day 2, after the player has felt
one full night.

---

## Feature filter for the week

Before adding anything, answer:

1. Which pillar does this serve?
2. Which existing verb does it use?
3. Can a player meet it in the first minute?
4. Would Bonjo do this?
5. Does it increase the *night's* pressure without making the day a chore?

If any answer is "none", it waits.

---

## Playtest (three people, no explanation)

- Where did they stop moving?
- Where did they die twice?
- Did they find the awning and the piñata without being told?
- Did they notice the hunger bar before it mattered?
- Did they retreat to the porch, or did they try to fight everything?
- What did they try that the game didn't allow?

Fix only the top three. Then play the first two nights again.

---

## Two-night playtest (record 3 runs)

Play a full run each time. At the end, open the browser console and copy the
`BONJO RUN {...}` line (also stored as `localStorage["bonjo.lastRun"]`):

```
outcome · seconds · nights · bones · health · hunger
damage · falls · starved · food · waves
```

For each run, also note:

| Question | Run 1 | Run 2 | Run 3 |
| --- | --- | --- | --- |
| Did hunger ever force a choice? | | | |
| Night 1: fair / too easy / too hard | | | |
| Night 2: fair / too easy / too hard | | | |
| Did you use the porch? Why? | | | |
| Did the night start read clearly? | | | |
| Where did you lose hearts? | | | |
| Would you play a third night? | | | |

Dev helper on the local server: press **N** to skip to the next phase while
testing; it is stripped from the production build.
