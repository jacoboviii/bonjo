// ---------------------------------------------------------------------------
// Tiny localization layer. The chosen language is stored in localStorage and
// applied to Phaser text via t(), and to the static HTML rotate hint via
// applyDomLanguage().
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'bonjo.lang';
const SUPPORTED = ['en', 'es'];

const strings = {
  en: {
    'title.subtitle': 'the only chow on the block',
    'title.place': 'LA CUADRA · MÉXICO',
    'title.startKeyboard': 'PRESS SPACE TO FLY',
    'title.startTouch': 'TAP TO PLAY',
    'title.controls': 'A/D move  ·  SPACE flap/glide  ·  S dive  ·  T tuning',
    'title.version': 'PLAYTEST v0.3',
    'hud.bones': 'BONES',
    'level.intro': 'LEVEL 1 · LA CUADRA',
    'level.hint': 'A/D move  ·  SPACE flap/glide  ·  S dive  ·  T tuning',
    'win.title': 'THE BLOCK IS YOURS',
    'win.stats': 'BONES {bones}   ·   {time}s',
    'win.again': 'press R to fly again',
    'float.checkpoint': 'CHECKPOINT',
    'float.flap': 'FLAP+',
    'float.hey': 'HEY!',
    'float.bone': 'BONE!',
    'float.gone': 'GONE!',
    'float.echale': 'HIT IT!',
    'float.orale': 'BURST!',
    'bark': 'WOOF!',
    'tuning.title': 'BONJO · feel tuning',
    'tuning.movement': 'Movement',
    'tuning.air': 'Air',
    'tuning.camera': 'Camera',
    'tuning.actions': 'Actions',
    'tuning.runSpeed': 'run speed',
    'tuning.groundAccel': 'ground accel',
    'tuning.airAccel': 'air accel',
    'tuning.groundFriction': 'ground friction',
    'tuning.gravity': 'gravity',
    'tuning.glideGravity': 'glide gravity',
    'tuning.glideFall': 'glide fall speed',
    'tuning.diveGravity': 'dive gravity',
    'tuning.diveFall': 'dive fall speed',
    'tuning.jump': 'jump power',
    'tuning.flap': 'flap power',
    'tuning.flaps': 'flaps',
    'tuning.jumpCut': 'jump cut',
    'tuning.minJump': 'min jump hold (ms)',
    'tuning.coyote': 'coyote (ms)',
    'tuning.buffer': 'jump buffer (ms)',
    'tuning.lookAhead': 'look ahead',
    'tuning.cameraLerp': 'camera smoothing',
    'tuning.restart': 'restart level (R)',
    'tuning.reset': 'reset defaults',
  },
  es: {
    'title.subtitle': 'el único chow de la cuadra',
    'title.place': 'LA CUADRA · MÉXICO',
    'title.startKeyboard': 'PULSA ESPACIO PARA VOLAR',
    'title.startTouch': 'TOCA PARA JUGAR',
    'title.controls': 'A/D mover · ESPACIO volar/planear · S picada · T ajustes',
    'title.version': 'PRUEBA v0.3',
    'hud.bones': 'HUESOS',
    'level.intro': 'NIVEL 1 · LA CUADRA',
    'level.hint': 'A/D mover · ESPACIO volar/planear · S picada · T ajustes',
    'win.title': 'LA CUADRA ES TUYA',
    'win.stats': 'HUESOS {bones}   ·   {time}s',
    'win.again': 'pulsa R para volar de nuevo',
    'float.checkpoint': 'PUNTO DE CONTROL',
    'float.flap': 'ALAS+',
    'float.hey': '¡OYE!',
    'float.bone': '¡HUESO!',
    'float.gone': '¡SE FUE!',
    'float.echale': '¡ÉCHALE!',
    'float.orale': '¡ÓRALE!',
    'bark': '¡GUAU!',
    'tuning.title': 'BONJO · ajustes',
    'tuning.movement': 'Movimiento',
    'tuning.air': 'Aire',
    'tuning.camera': 'Cámara',
    'tuning.actions': 'Acciones',
    'tuning.runSpeed': 'velocidad',
    'tuning.groundAccel': 'aceleración en suelo',
    'tuning.airAccel': 'aceleración aérea',
    'tuning.groundFriction': 'fricción en suelo',
    'tuning.gravity': 'gravedad',
    'tuning.glideGravity': 'gravedad de planeo',
    'tuning.glideFall': 'caída de planeo',
    'tuning.diveGravity': 'gravedad de picada',
    'tuning.diveFall': 'caída de picada',
    'tuning.jump': 'salto',
    'tuning.flap': 'aleteo',
    'tuning.flaps': 'aleteos',
    'tuning.jumpCut': 'corte de salto',
    'tuning.minJump': 'sostén mínimo (ms)',
    'tuning.coyote': 'tiempo coyote (ms)',
    'tuning.buffer': 'búfer de salto (ms)',
    'tuning.lookAhead': 'vista adelante',
    'tuning.cameraLerp': 'suavizado',
    'tuning.restart': 'reiniciar nivel (R)',
    'tuning.reset': 'restablecer',
  },
};

let current = null;

function detectLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED.includes(stored)) return stored;
  } catch {
    // localStorage can throw in private mode / file URLs
  }

  const nav = (navigator.language || 'en').toLowerCase();
  return nav.startsWith('es') ? 'es' : 'en';
}

export function getLang() {
  if (!current) current = detectLang();
  return current;
}

export function setLang(lang) {
  if (!SUPPORTED.includes(lang)) return getLang();

  current = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore storage failures
  }

  applyDomLanguage();
  return current;
}

export function toggleLang() {
  return setLang(getLang() === 'en' ? 'es' : 'en');
}

export function t(key, vars) {
  const lang = getLang();
  let text = strings[lang]?.[key] ?? strings.en[key] ?? key;

  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replace(`{${name}}`, String(value));
    }
  }

  return text;
}

// Static HTML (the portrait rotate hint) uses data-en / data-es attributes.
export function applyDomLanguage() {
  if (typeof document === 'undefined') return;

  const lang = getLang();
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-en]').forEach((el) => {
    const text = el.dataset[lang];
    if (text) el.textContent = text;
  });
}

// Apply once on import so the rotate hint is correct before the game boots.
applyDomLanguage();
