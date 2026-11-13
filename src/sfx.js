// ---------------------------------------------------------------------------
// Synthesized sound effects. No audio files needed.
//
// The palette is built from filtered noise, short pitch envelopes and a few
// additive partials so the effects read as physical events (cloth, wood,
// metal, breath) rather than bare beeps. Everything still routes through one
// compressor so mobile speakers do not clip.
// ---------------------------------------------------------------------------

let ctx = null;
let master = null;
let noiseBuffer = null;
let muted = false;

function audio() {
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();

      master = ctx.createDynamicsCompressor();
      master.threshold.value = -18;
      master.knee.value = 22;
      master.ratio.value = 5;
      master.attack.value = 0.004;
      master.release.value = 0.22;

      const output = ctx.createGain();
      output.gain.value = 0.9;
      master.connect(output).connect(ctx.destination);
    }

    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function getNoise(ac) {
  if (noiseBuffer) return noiseBuffer;

  const length = Math.floor(ac.sampleRate * 1.25);
  noiseBuffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

function output(ac, node, gain, pan = 0) {
  let tail = gain;
  if (pan && ac.createStereoPanner) {
    const panner = ac.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    gain.connect(panner);
    tail = panner;
  }
  tail.connect(master);
}

function envelope(ac, t0, dur, vol, attack = 0.006) {
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(
    Math.max(0.0002, vol),
    t0 + Math.max(0.002, attack),
  );
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  return gain;
}

/**
 * A filtered oscillator with optional vibrato.
 */
function osc({
  type = 'sine',
  f0 = 440,
  f1 = f0,
  dur = 0.2,
  vol = 0.035,
  attack = 0.006,
  delay = 0,
  pan = 0,
  detune = 0,
  filter = null,
  vibrato = null,
} = {}) {
  if (muted) return;
  const ac = audio();
  if (!ac) return;

  const t0 = ac.currentTime + delay;
  const o = ac.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(Math.max(20, f0), t0);
  if (f1 !== f0) {
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
  }
  o.detune.value = detune;

  let head = o;
  if (filter) {
    const f = ac.createBiquadFilter();
    f.type = filter.type || 'lowpass';
    f.frequency.setValueAtTime(
      Math.max(40, filter.f0 || 1000),
      t0,
    );
    if (filter.f1) {
      f.frequency.exponentialRampToValueAtTime(
        Math.max(40, filter.f1),
        t0 + dur,
      );
    }
    f.Q.value = filter.q ?? 0.7;
    o.connect(f);
    head = f;
  }

  const gain = envelope(ac, t0, dur, vol, attack);
  head.connect(gain);
  output(ac, head, gain, pan);

  if (vibrato) {
    const lfo = ac.createOscillator();
    const depth = ac.createGain();
    lfo.frequency.value = vibrato.rate || 6;
    depth.gain.value = vibrato.depth || 10;
    lfo.connect(depth).connect(o.frequency);
    lfo.start(t0);
    lfo.stop(t0 + dur + 0.03);
  }

  o.start(t0);
  o.stop(t0 + dur + 0.03);
}

/**
 * Filtered noise burst, useful for cloth, breath, impacts and grit.
 */
function noise({
  dur = 0.16,
  vol = 0.025,
  type = 'bandpass',
  f0 = 900,
  f1 = f0,
  q = 0.8,
  attack = 0.003,
  delay = 0,
  pan = 0,
} = {}) {
  if (muted) return;
  const ac = audio();
  if (!ac) return;

  const t0 = ac.currentTime + delay;
  const src = ac.createBufferSource();
  src.buffer = getNoise(ac);

  const f = ac.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(Math.max(40, f0), t0);
  if (f1 !== f0) {
    f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t0 + dur);
  }
  f.Q.value = q;

  const gain = envelope(ac, t0, dur, vol, attack);
  src.connect(f).connect(gain);
  output(ac, f, gain, pan);

  src.start(t0);
  src.stop(t0 + dur + 0.03);
}

function thump(f0 = 120, vol = 0.035, dur = 0.13, delay = 0) {
  osc({
    type: 'sine',
    f0,
    f1: Math.max(35, f0 * 0.45),
    dur,
    vol,
    attack: 0.004,
    delay,
  });
}

export const sfx = {
  // Movement: cloth/air first, then a small body accent.
  jump: () => {
    noise({ dur: 0.09, vol: 0.022, type: 'bandpass', f0: 650, f1: 1400, q: 0.7 });
    osc({ type: 'triangle', f0: 180, f1: 110, dur: 0.12, vol: 0.028 });
    osc({ type: 'sine', f0: 420, f1: 760, dur: 0.08, vol: 0.012 });
  },
  flap: () => {
    noise({ dur: 0.075, vol: 0.03, type: 'lowpass', f0: 1300, f1: 380, q: 0.6 });
    noise({ dur: 0.11, vol: 0.018, type: 'bandpass', f0: 620, f1: 260, q: 1, delay: 0.045 });
  },
  glide: () => {
    noise({ dur: 0.32, vol: 0.007, type: 'bandpass', f0: 900, f1: 620, q: 0.7, attack: 0.05 });
  },
  land: () => {
    thump(105, 0.045, 0.14);
    noise({ dur: 0.08, vol: 0.018, type: 'lowpass', f0: 520, f1: 180, q: 0.8 });
  },
  footstep: () => {
    const pitch = 0.88 + Math.random() * 0.24;
    noise({ dur: 0.045, vol: 0.009, type: 'bandpass', f0: 420 * pitch, f1: 180 * pitch, q: 1.4 });
    thump(80 * pitch, 0.012, 0.05);
  },
  click: () => {
    noise({ dur: 0.025, vol: 0.008, type: 'bandpass', f0: 1800, f1: 900, q: 1.2 });
    osc({ type: 'sine', f0: 740, f1: 690, dur: 0.045, vol: 0.01 });
  },

  // Pickups and props.
  bone: () => {
    osc({ type: 'triangle', f0: 780, f1: 980, dur: 0.08, vol: 0.022 });
    osc({ type: 'sine', f0: 1320, dur: 0.1, vol: 0.018, delay: 0.055 });
    noise({ dur: 0.035, vol: 0.009, type: 'highpass', f0: 2200, q: 0.8 });
  },
  steal: () => {
    osc({ type: 'square', f0: 880, f1: 1180, dur: 0.055, vol: 0.022 });
    osc({ type: 'square', f0: 1120, f1: 760, dur: 0.07, vol: 0.016, delay: 0.06 });
  },
  pinata: () => {
    noise({ dur: 0.055, vol: 0.025, type: 'bandpass', f0: 700, f1: 320, q: 1 });
    osc({ type: 'triangle', f0: 420, f1: 220, dur: 0.08, vol: 0.022 });
  },
  burst: () => {
    noise({ dur: 0.09, vol: 0.035, type: 'lowpass', f0: 2200, f1: 420, q: 0.7 });
    noise({ dur: 0.06, vol: 0.025, type: 'highpass', f0: 1800, q: 0.6, delay: 0.055 });
    [660, 880, 1100].forEach((f, i) =>
      osc({ type: 'triangle', f0: f, dur: 0.12, vol: 0.022, delay: 0.06 + i * 0.06 }),
    );
  },
  boing: () => {
    osc({
      type: 'sine',
      f0: 190,
      f1: 480,
      dur: 0.24,
      vol: 0.038,
      vibrato: { rate: 18, depth: 14 },
    });
    thump(90, 0.018, 0.08);
  },
  alarm: () => {
    // Two-tone car horn, with a little noise bite at the front.
    noise({ dur: 0.04, vol: 0.012, type: 'bandpass', f0: 1800, f1: 900, q: 0.8 });
    [0, 0.2, 0.4].forEach((delay, i) => {
      const f = i % 2 ? 520 : 430;
      osc({ type: 'square', f0: f, f1: f * 1.02, dur: 0.18, vol: 0.026, delay, filter: { type: 'lowpass', f0: 1500, q: 0.6 } });
      osc({ type: 'sawtooth', f0: f * 1.5, f1: f * 1.52, dur: 0.14, vol: 0.008, delay });
    });
  },
  crash: () => {
    noise({ dur: 0.1, vol: 0.038, type: 'lowpass', f0: 2400, f1: 300, q: 0.7 });
    noise({ dur: 0.08, vol: 0.018, type: 'bandpass', f0: 1400, f1: 700, q: 1.1, delay: 0.04 });
    osc({ type: 'triangle', f0: 1300, f1: 760, dur: 0.07, vol: 0.012, delay: 0.03 });
  },
  bell: () => {
    noise({ dur: 0.035, vol: 0.012, type: 'highpass', f0: 1900, q: 0.8 });
    [
      [392, 0.9, 0.018],
      [523, 0.75, 0.013],
      [784, 0.55, 0.009],
      [1046, 0.42, 0.005],
    ].forEach(([f, dur, vol], i) => {
      osc({ type: 'sine', f0: f, dur, vol, delay: i * 0.012 });
    });
  },

  // Animals.
  growl: () => {
    osc({
      type: 'sawtooth',
      f0: 145,
      f1: 92,
      dur: 0.24,
      vol: 0.016,
      filter: { f0: 520, f1: 260, q: 1.4 },
    });
    noise({ dur: 0.18, vol: 0.009, type: 'lowpass', f0: 430, f1: 160, q: 1 });
  },
  spin: () => {
    noise({ dur: 0.2, vol: 0.025, type: 'bandpass', f0: 420, f1: 1500, q: 0.8 });
    osc({ type: 'triangle', f0: 520, f1: 900, dur: 0.18, vol: 0.018 });
    osc({ type: 'sine', f0: 1040, dur: 0.12, vol: 0.01, delay: 0.08 });
  },
  honk: () => {
    osc({
      type: 'sawtooth',
      f0: 390,
      f1: 230,
      dur: 0.16,
      vol: 0.02,
      filter: { f0: 1500, f1: 850, q: 1.3 },
    });
    osc({ type: 'square', f0: 250, f1: 190, dur: 0.12, vol: 0.008, delay: 0.04 });
    noise({ dur: 0.05, vol: 0.008, type: 'bandpass', f0: 1000, f1: 600, q: 1.1 });
  },
  slide: () => {
    noise({ dur: 0.18, vol: 0.022, type: 'bandpass', f0: 1600, f1: 420, q: 0.8 });
    thump(90, 0.018, 0.1);
  },
  bark: () => {
    const k = 0.92 + Math.random() * 0.16;
    noise({ dur: 0.075, vol: 0.034, type: 'bandpass', f0: 460 * k, f1: 210 * k, q: 0.8 });
    osc({
      type: 'sawtooth',
      f0: 190 * k,
      f1: 115 * k,
      dur: 0.11,
      vol: 0.042,
      filter: { type: 'lowpass', f0: 900, f1: 480, q: 0.7 },
    });
    osc({
      type: 'square',
      f0: 245 * k,
      f1: 150 * k,
      dur: 0.075,
      vol: 0.022,
      delay: 0.08,
      filter: { type: 'lowpass', f0: 1100, f1: 600, q: 0.6 },
    });
  },
  yelp: () => {
    noise({ dur: 0.04, vol: 0.015, type: 'highpass', f0: 1200, q: 0.7 });
    osc({
      type: 'sine',
      f0: 760,
      f1: 270,
      dur: 0.24,
      vol: 0.027,
      vibrato: { rate: 5.5, depth: 18 },
    });
  },
  hiss: () => {
    noise({ dur: 0.3, vol: 0.021, type: 'bandpass', f0: 1900, f1: 1100, q: 0.7, attack: 0.02 });
    noise({ dur: 0.18, vol: 0.008, type: 'highpass', f0: 2600, q: 0.7, delay: 0.02 });
  },
  chirp: () => {
    for (let i = 0; i < 3; i++) {
      osc({
        type: 'sine',
        f0: 1200 + i * 120,
        f1: 1900 + i * 160,
        dur: 0.055,
        vol: 0.015,
        delay: i * 0.075,
        vibrato: { rate: 28, depth: 70 },
      });
    }
  },
  caw: () => {
    noise({ dur: 0.03, vol: 0.012, type: 'highpass', f0: 1000, q: 0.6 });
    osc({
      type: 'sawtooth',
      f0: 430,
      f1: 230,
      dur: 0.15,
      vol: 0.026,
      filter: { type: 'bandpass', f0: 1100, f1: 520, q: 1.1 },
    });
    osc({
      type: 'square',
      f0: 350,
      f1: 205,
      dur: 0.16,
      vol: 0.016,
      delay: 0.14,
      filter: { type: 'bandpass', f0: 900, f1: 470, q: 1.2 },
    });
  },
  owl: () => {
    osc({
      type: 'sine',
      f0: 315,
      f1: 250,
      dur: 0.24,
      vol: 0.02,
      vibrato: { rate: 2.2, depth: 6 },
    });
    osc({
      type: 'sine',
      f0: 270,
      f1: 210,
      dur: 0.3,
      vol: 0.016,
      delay: 0.26,
      vibrato: { rate: 2, depth: 5 },
    });
    noise({ dur: 0.18, vol: 0.004, type: 'bandpass', f0: 700, f1: 500, q: 1.2, delay: 0.26 });
  },
  rooster: () => {
    noise({ dur: 0.04, vol: 0.01, type: 'highpass', f0: 1200, q: 0.8 });
    [
      [520, 760, 0.18, 0],
      [760, 560, 0.22, 0.18],
      [560, 380, 0.32, 0.4],
    ].forEach(([f0, f1, dur, delay]) => {
      osc({
        type: 'sawtooth',
        f0,
        f1,
        dur,
        vol: 0.022,
        delay,
        filter: { type: 'bandpass', f0: 1050, f1: 700, q: 1 },
        vibrato: { rate: 7, depth: 14 },
      });
    });
  },

  // Survival / UI feedback.
  eat: () => {
    for (let i = 0; i < 3; i++) {
      noise({ dur: 0.04, vol: 0.014, type: 'lowpass', f0: 1100 - i * 180, f1: 400, q: 0.8, delay: i * 0.055 });
    }
    thump(95, 0.012, 0.07);
  },
  night: () => {
    osc({ type: 'sine', f0: 196, f1: 98, dur: 0.7, vol: 0.023, attack: 0.08 });
    osc({ type: 'triangle', f0: 98, f1: 72, dur: 0.8, vol: 0.014, delay: 0.12 });
    noise({ dur: 0.65, vol: 0.004, type: 'lowpass', f0: 500, f1: 250, q: 0.5, attack: 0.12, delay: 0.05 });
  },
  day: () => {
    [523, 659, 784].forEach((f, i) => {
      osc({ type: 'triangle', f0: f, dur: 0.35, vol: 0.018, delay: i * 0.1 });
    });
    noise({ dur: 0.35, vol: 0.004, type: 'bandpass', f0: 1400, f1: 900, q: 0.8, attack: 0.06 });
  },
  gameover: () => {
    noise({ dur: 0.08, vol: 0.02, type: 'lowpass', f0: 500, f1: 150, q: 0.7 });
    osc({ type: 'sawtooth', f0: 220, f1: 65, dur: 0.55, vol: 0.028, filter: { type: 'lowpass', f0: 800, f1: 220, q: 0.8 } });
    osc({ type: 'sine', f0: 98, f1: 45, dur: 0.65, vol: 0.018, delay: 0.1 });
  },
  ring: () => {
    noise({ dur: 0.03, vol: 0.01, type: 'highpass', f0: 2000, q: 0.8 });
    osc({ type: 'sine', f0: 620, f1: 640, dur: 0.65, vol: 0.025 });
    osc({ type: 'sine', f0: 930, f1: 950, dur: 0.45, vol: 0.012, delay: 0.03 });
  },
  hurt: () => {
    noise({ dur: 0.08, vol: 0.035, type: 'lowpass', f0: 900, f1: 160, q: 0.7 });
    thump(95, 0.03, 0.18);
    osc({ type: 'sawtooth', f0: 330, f1: 140, dur: 0.2, vol: 0.018, delay: 0.04 });
  },
  stomp: () => {
    thump(70, 0.05, 0.16);
    noise({ dur: 0.07, vol: 0.025, type: 'lowpass', f0: 750, f1: 150, q: 0.8 });
    noise({ dur: 0.12, vol: 0.012, type: 'highpass', f0: 1600, f1: 500, q: 0.8, delay: 0.03 });
  },
  impact: () => {
    thump(112, 0.018, 0.09);
    noise({ dur: 0.045, vol: 0.012, type: 'highpass', f0: 1700, f1: 700, q: 0.7 });
  },
  slam: () => {
    thump(52, 0.085, 0.24);
    thump(88, 0.04, 0.16, 0.035);
    noise({ dur: 0.16, vol: 0.035, type: 'lowpass', f0: 900, f1: 120, q: 0.7 });
    noise({ dur: 0.18, vol: 0.018, type: 'highpass', f0: 1900, f1: 500, q: 0.7, delay: 0.04 });
  },
  checkpoint: () => {
    osc({ type: 'triangle', f0: 660, f1: 670, dur: 0.22, vol: 0.022 });
    osc({ type: 'sine', f0: 990, f1: 1000, dur: 0.32, vol: 0.016, delay: 0.11 });
    noise({ dur: 0.04, vol: 0.008, type: 'highpass', f0: 2200, q: 0.7 });
  },
  life: () => {
    [784, 988, 1318].forEach((f, i) =>
      osc({ type: 'sine', f0: f, f1: f * 1.01, dur: 0.2, vol: 0.018, delay: i * 0.075 }),
    );
    osc({ type: 'triangle', f0: 392, f1: 523, dur: 0.16, vol: 0.012 });
  },
  win: () => {
    [523, 659, 784, 1046].forEach((f, i) => {
      osc({ type: 'triangle', f0: f, f1: f * 1.005, dur: 0.32, vol: 0.024, delay: i * 0.11 });
      osc({ type: 'sine', f0: f * 2, dur: 0.18, vol: 0.005, delay: i * 0.11 });
    });
    noise({ dur: 0.3, vol: 0.005, type: 'bandpass', f0: 1800, f1: 3200, q: 0.7, attack: 0.04 });
  },
};

export function toggleMute() {
  muted = !muted;
  return muted;
}
