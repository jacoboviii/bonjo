// ---------------------------------------------------------------------------
// Tiny synthesized sound effects. No audio files needed.
// Each sound is a short WebAudio oscillator sweep. Replace these with real
// samples later without touching the rest of the game.
// ---------------------------------------------------------------------------

let ctx = null;
let muted = false;

function audio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, dur, type = 'square', vol = 0.04, slideTo = 0, delay = 0) {
  if (muted) return;
  const ac = audio();
  if (!ac) return;

  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(20, freq), t0);
  if (slideTo) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
  }

  // quick attack, smooth decay
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t0 + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  jump: () => tone(300, 0.1, 'square', 0.035, 520),
  flap: () => tone(220, 0.09, 'triangle', 0.05, 440),
  glide: () => tone(420, 0.2, 'sine', 0.015, 380),
  bone: () => {
    tone(880, 0.07, 'sine', 0.05);
    tone(1320, 0.09, 'sine', 0.04, 0, 0.06);
  },
  steal: () => {
    tone(760, 0.06, 'square', 0.04, 980);
    tone(1120, 0.05, 'square', 0.03, 0, 0.07);
  },
  bark: () => {
    tone(190, 0.08, 'square', 0.05, 120);
    tone(240, 0.09, 'square', 0.04, 140, 0.09);
  },
  yelp: () => tone(720, 0.18, 'sawtooth', 0.04, 240),
  pinata: () => {
    tone(300, 0.06, 'square', 0.05, 180);
    tone(500, 0.05, 'triangle', 0.03, 300, 0.05);
  },
  burst: () => {
    [660, 880, 1100].forEach((f, i) => tone(f, 0.12, 'triangle', 0.04, 0, i * 0.06));
  },
  boing: () => tone(240, 0.18, 'sine', 0.05, 520),
  eat: () => {
    tone(320, 0.05, 'square', 0.04, 200);
    tone(240, 0.06, 'triangle', 0.03, 150, 0.06);
  },
  night: () => {
    tone(196, 0.5, 'sine', 0.04, 98);
    tone(98, 0.6, 'triangle', 0.03, 70, 0.15);
  },
  day: () => {
    [523, 659, 784].forEach((f, i) => tone(f, 0.15, 'triangle', 0.04, 0, i * 0.1));
  },
  gameover: () => tone(220, 0.5, 'sawtooth', 0.05, 70),
  ring: () => tone(520, 0.16, 'sine', 0.05, 1040),
  hurt: () => tone(180, 0.28, 'sawtooth', 0.05, 60),
  stomp: () => tone(150, 0.12, 'square', 0.05, 70),
  checkpoint: () => {
    tone(660, 0.1, 'sine', 0.05);
    tone(880, 0.14, 'sine', 0.04, 0, 0.1);
  },
  win: () => {
    [523, 659, 784, 1046].forEach((f, i) => {
      tone(f, 0.2, 'triangle', 0.05, 0, i * 0.11);
    });
  },
};

export function toggleMute() {
  muted = !muted;
  return muted;
}
