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
    'title.controls': 'A/D move  ·  SPACE flap/glide  ·  S dive  ·  E talk  ·  T tuning',
    'title.version': 'PLAYTEST v0.4',
    'hud.bones': 'BONES',
    'hud.day': 'DAY',
    'hud.night': 'NIGHT',
    'hud.gate': 'GATE',
    'hud.combo': 'COMBO x{combo}',
    'goal.survive': 'SURVIVE 2 NIGHTS · TOP DOG',
    'goal.dawn': 'DAWN IN {seconds}s',
    'goal.dawnNow': 'DAWN',
    'goal.alpha': 'TOP DOG · {hits}/3',
    'quest.day': 'DAY ERRANDS · POLO + BELL',
    'name.polo': 'POLO',
    'name.chihuahua': 'CHIHUAHUA',
    'name.cat': 'CAT',
    'name.rooster': 'ROOSTER',
    'name.bell': 'BELL',
    'prompt.talk': 'TALK',
    'prompt.ring': 'RING',
    'prompt.tap': 'TAP',
    'dialog.close': 'E · CLOSE',
    'dialog.closeTouch': 'TAP · CLOSE',
    'dialog.polo.gift': 'Take a concha, Bonjo. You will need it tonight.',
    'dialog.polo.thanks': 'That is the last concha today. Keep the porch safe.',
    'dialog.polo.night': 'Get inside, Bonjo. The rivals are out.',
    'dialog.chihuahua.day': 'Woof! Polo has a concha for you.',
    'dialog.chihuahua.night': 'Grrr... stay close to the porch.',
    'dialog.cat': 'The cat blinks. You have been judged.',
    'dialog.rooster': 'Kikirikí! The block is awake.',
    'dialog.bell': 'DONG! The block hears you.',
    'alpha.title': 'THE TOP DOG',
    'alpha.cleared': 'TOP DOG DOWN',
    'gate.broken': 'GATE DOWN — PORCH OPEN',
    'run.score': 'SCORE {score} · RANK {rank}',
    'float.taco': 'TACOS!',
    'float.crash': 'CRASH!',
    'float.alarm': 'ALARM!',
    'float.stolen': 'STOLEN!',
    'float.gift': 'CONCHA!',
    'float.bell': 'DONG!',
    'float.hiss': 'HISS!',
    'float.chirp': 'CHIRP!',
    'float.caw': 'CAW!',
    'float.crow': 'COCK-A-DOODLE-DOO!',
    'level.intro': 'LEVEL 1 · LA CUADRA',
    'level.hint': 'A/D move  ·  SPACE flap/glide  ·  S dive  ·  E talk  ·  T tuning',
    'win.title': 'THE BLOCK IS YOURS',
    'win.stats': 'BONES {bones}   ·   {nights} NIGHTS   ·   {time}s',
    'win.again': 'press R  ·  tap for another night',
    'gameover.title': 'THE BLOCK WINS',
    'gameover.stats': 'BONES {bones}   ·   {nights} NIGHTS',
    'gameover.again': 'press R  ·  tap to try again',
    'porch.sign': 'CASA',
    'float.food': 'YUM!',
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
    'title.controls': 'A/D mover · ESPACIO volar/planear · S picada · E hablar · T ajustes',
    'title.version': 'PRUEBA v0.4',
    'hud.bones': 'HUESOS',
    'hud.day': 'DÍA',
    'hud.night': 'NOCHE',
    'hud.gate': 'PORTÓN',
    'hud.combo': 'COMBO x{combo}',
    'goal.survive': 'SOBREVIVE 2 NOCHES · PERRO JEFE',
    'goal.dawn': 'AMANECE EN {seconds}s',
    'goal.dawnNow': 'AMANECE',
    'goal.alpha': 'PERRO JEFE · {hits}/3',
    'quest.day': 'RECADOS · POLO + CAMPANA',
    'name.polo': 'POLO',
    'name.chihuahua': 'CHIHUAHUA',
    'name.cat': 'GATO',
    'name.rooster': 'GALLO',
    'name.bell': 'CAMPANA',
    'prompt.talk': 'HABLAR',
    'prompt.ring': 'TOCAR',
    'prompt.tap': 'TOCA',
    'dialog.close': 'E · CERRAR',
    'dialog.closeTouch': 'TOCA · CERRAR',
    'dialog.polo.gift': 'Toma una concha, Bonjo. Te hará falta esta noche.',
    'dialog.polo.thanks': 'Es la última concha de hoy. Cuida la casa.',
    'dialog.polo.night': 'Métete, Bonjo. Los rivales andan sueltos.',
    'dialog.chihuahua.day': '¡Guau! Polo tiene una concha para ti.',
    'dialog.chihuahua.night': 'Grrr... no te alejes de la casa.',
    'dialog.cat': 'El gato parpadea. Ya te juzgó.',
    'dialog.rooster': '¡Kikirikí! La cuadra despierta.',
    'dialog.bell': '¡DONG! La cuadra te escucha.',
    'alpha.title': 'EL PERRO JEFE',
    'alpha.cleared': 'PERRO JEFE VENCIDO',
    'gate.broken': 'PORTÓN CAÍDO — CASA ABIERTA',
    'run.score': 'PUNTOS {score} · RANGO {rank}',
    'float.taco': '¡TACOS!',
    'float.crash': '¡CRASH!',
    'float.alarm': '¡ALARMA!',
    'float.stolen': '¡ROBADO!',
    'float.gift': '¡CONCHA!',
    'float.bell': '¡DONG!',
    'float.hiss': '¡FSSS!',
    'float.chirp': '¡PÍO!',
    'float.caw': '¡CAAW!',
    'float.crow': '¡KIKIRIKÍ!',
    'level.intro': 'NIVEL 1 · LA CUADRA',
    'level.hint': 'A/D mover · ESPACIO volar/planear · S picada · E hablar · T ajustes',
    'win.title': 'LA CUADRA ES TUYA',
    'win.stats': 'HUESOS {bones}   ·   {nights} NOCHES   ·   {time}s',
    'win.again': 'pulsa R  ·  toca para otra noche',
    'gameover.title': 'LA CUADRA GANA',
    'gameover.stats': 'HUESOS {bones}   ·   {nights} NOCHES',
    'gameover.again': 'pulsa R  ·  toca para reintentar',
    'porch.sign': 'CASA',
    'float.food': '¡ÑAM!',
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

  // La casa habla español. English is available from the EN/ES toggle.
  return 'es';
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
