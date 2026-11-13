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
    'title.controls': 'A/D move  ·  SPACE flap/glide  ·  S dive  ·  E action  ·  T tuning',
    'title.version': 'PLAYTEST v0.4',
    'hud.bones': 'BONES',
    'hud.day': 'DAY',
    'hud.night': 'NIGHT',
    'hud.gate': 'GATE',
    'hud.combo': 'COMBO x{combo}',
    'hud.health': 'HEALTH',
    'hud.flaps': 'FLAPS',
    'hud.hunger': 'HUNGER',
    'hud.objectives': 'OBJECTIVES · O',
    'hud.objectivesTouch': 'OBJECTIVES',
    'objectives.title': 'OBJECTIVES',
    'objectives.now': 'NOW',
    'objectives.nowDesc': 'Hold CASA for two nights and drive the top dog off the block.',
    'objectives.nowDesc.orillas': 'Survive three nights, defeat the Chihuahua boss and drive it off the fields.',
    'objectives.errands': 'ERRANDS',
    'objectives.errandsLine': 'POLO + BELL',
    'objectives.errandsDesc': 'By day: Polo’s concha and a bell blessing.',
    'objectives.powers': 'POWERS',
    'objectives.healthDesc': 'HEALTH · hits you can take. Hearts restore life or raise your max to 4.',
    'objectives.flapsDesc': 'FLAPS · air jumps; refill on landing.',
    'objectives.hungerDesc': 'HUNGER · eat conchas before it empties.',
    'objectives.close': 'O / TAP · CLOSE',
    'map.title': 'LA CUADRA · MAP',
    'map.subtitle': 'CHOOSE A LANDMARK',
    'map.back': 'TITLE',
    'map.legend': 'ONE BLOCK, MANY STORIES',
    'map.landmark': 'LANDMARK',
    'map.casa': 'CASA',
    'map.casaDesc': 'The home block. Hold CASA for two nights, run errands and keep the porch safe.',
    'map.casaPeace': 'The gate stands. The porch is quiet; Bonjo can rest.',
    'map.church': 'IGLESIA',
    'map.churchDesc': 'The parish tower watches over the barrio. A future route.',
    'map.market': 'MERCADO',
    'map.marketDesc': 'Awnings, carts and conchas. A future route.',
    'map.park': 'PARQUE',
    'map.parkDesc': 'A quieter corner for cats and birds. A future route.',
    'map.orillas': 'LAS ORILLAS',
    'map.orillasDesc': 'Survive three nights and drive the aggressive Chihuahua off the fields.',
    'map.orillasPeace': 'The fields are safe, and the harvest comes home.',
    'map.comingSoon': 'COMING SOON',
    'map.cleared': 'CLEARED',
    'map.current': 'CURRENT',
    'map.play': 'PLAY',
    'map.best': 'BEST {score}',
    'map.shortcut': 'MAP · M',
    'goal.survive': 'HOLD CASA · 2 NIGHTS · TOP DOG',
    'goal.orillas': 'SECURE THE FIELDS · 3 NIGHTS',
    'goal.orillasBoss': 'CHIHUAHUA BOSS · {hits}/3',
    'boss.chihuahua': 'THE CHIHUAHUA BOSS',
    'boss.chihuahuaDown': 'THE CHIHUAHUA STEPS ASIDE',
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
    'alpha.cleared': 'TOP DOG STEPS ASIDE',
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
    'float.hoot': 'HOO!',
    'float.crow': 'COCK-A-DOODLE-DOO!',
    'level.intro': 'LEVEL 1 · LA CUADRA',
    'story.casa': 'The block is holding its breath. The Top Dog wants CASA.',
    'story.orillas': 'The fields are contested. The Chihuahua guards what is left.',
    'level.intro.orillas': 'LAS ORILLAS · THE EDGE',
    'level.hint': 'A/D move  ·  SPACE flap/glide  ·  S dive  ·  E action  ·  T tuning',
    'win.title': 'CASA IS SAFE',
    'win.casaEpilogue': 'The gate holds. The block goes quiet. Bonjo curls up on the porch.',
    'win.orillasTitle': 'THE FIELDS ARE SAFE',
    'win.orillasEpilogue': 'The fields are safe. The Chihuahua leaves a crate of harvest by the fence.',
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
    'float.life': 'LIFE +',
    'float.lifeMax': 'MAX LIFE +1',
    'float.lifeFull': 'LIFE FULL',
    'float.powerFlap': 'EXTRA FLAP!',
    'float.spin': 'SPIN!',
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
    'title.controls': 'A/D mover · ESPACIO volar/planear · S picada · E acción · T ajustes',
    'title.version': 'PRUEBA v0.4',
    'hud.bones': 'HUESOS',
    'hud.day': 'DÍA',
    'hud.night': 'NOCHE',
    'hud.gate': 'PORTÓN',
    'hud.combo': 'COMBO x{combo}',
    'hud.health': 'VIDA',
    'hud.flaps': 'ALAS',
    'hud.hunger': 'HAMBRE',
    'hud.objectives': 'OBJETIVOS · O',
    'hud.objectivesTouch': 'OBJETIVOS',
    'objectives.title': 'OBJETIVOS',
    'objectives.now': 'AHORA',
    'objectives.nowDesc': 'Defiende CASA dos noches y expulsa al perro jefe de la cuadra.',
    'objectives.nowDesc.orillas': 'Sobrevive tres noches, vence al jefe chihuahua y expúlsalo de los campos.',
    'objectives.errands': 'RECADOS',
    'objectives.errandsLine': 'POLO + CAMPANA',
    'objectives.errandsDesc': 'De día: concha de Polo y bendición de la campana.',
    'objectives.powers': 'PODERES',
    'objectives.healthDesc': 'VIDA · golpes que aguantas. Los corazones curan o suben tu máximo a 4.',
    'objectives.flapsDesc': 'ALAS · aleteos; se recargan al aterrizar.',
    'objectives.hungerDesc': 'HAMBRE · come conchas antes de que se vacíe.',
    'objectives.close': 'O / TOCA · CERRAR',
    'map.title': 'LA CUADRA · MAPA',
    'map.subtitle': 'ELIGE UN LUGAR',
    'map.back': 'TÍTULO',
    'map.legend': 'UN BARRIO, MUCHAS HISTORIAS',
    'map.landmark': 'LUGAR',
    'map.casa': 'CASA',
    'map.casaDesc': 'La casa. Defiende CASA dos noches, haz recados y cuida el porche.',
    'map.casaPeace': 'El portón sigue en pie. El porche está tranquilo; Bonjo puede descansar.',
    'map.church': 'IGLESIA',
    'map.churchDesc': 'La torre de la parroquia vigila el barrio. Una ruta futura.',
    'map.market': 'MERCADO',
    'map.marketDesc': 'Toldos, carritos y conchas. Una ruta futura.',
    'map.park': 'PARQUE',
    'map.parkDesc': 'Un rincón tranquilo para gatos y pájaros. Una ruta futura.',
    'map.orillas': 'LAS ORILLAS',
    'map.orillasDesc': 'Sobrevive tres noches y expulsa al jefe chihuahua de los campos.',
    'map.orillasPeace': 'Los campos están a salvo y la cosecha vuelve a casa.',
    'map.comingSoon': 'PRÓXIMAMENTE',
    'map.cleared': 'COMPLETADO',
    'map.current': 'ACTUAL',
    'map.play': 'JUGAR',
    'map.best': 'MEJOR {score}',
    'map.shortcut': 'MAPA · M',
    'goal.survive': 'DEFIENDE CASA · 2 NOCHES · PERRO JEFE',
    'goal.orillas': 'ASEGURA LOS CAMPOS · 3 NOCHES',
    'goal.orillasBoss': 'JEFE CHIHUAHUA · {hits}/3',
    'boss.chihuahua': 'EL JEFE CHIHUAHUA',
    'boss.chihuahuaDown': 'EL CHIHUAHUA SE APARTA',
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
    'alpha.cleared': 'EL PERRO JEFE SE APARTA',
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
    'float.hoot': '¡UUH!',
    'float.crow': '¡KIKIRIKÍ!',
    'level.intro': 'NIVEL 1 · LA CUADRA',
    'story.casa': 'La cuadra contiene el aliento. El perro jefe quiere CASA.',
    'story.orillas': 'Los campos están en disputa. El chihuahua cuida lo que queda.',
    'level.intro.orillas': 'LAS ORILLAS · EL CAMPO',
    'level.hint': 'A/D mover · ESPACIO volar/planear · S picada · E acción · T ajustes',
    'win.title': 'LA CASA ESTÁ A SALVO',
    'win.casaEpilogue': 'El portón aguanta. La cuadra se queda en silencio. Bonjo se acurruca en el porche.',
    'win.orillasTitle': 'LOS CAMPOS ESTÁN A SALVO',
    'win.orillasEpilogue': 'Los campos están a salvo. El chihuahua deja una caja de cosecha junto a la cerca.',
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
    'float.life': '¡VIDA +!',
    'float.lifeMax': '¡VIDA MÁXIMA +1!',
    'float.lifeFull': 'VIDA LLENA',
    'float.powerFlap': '¡ALA EXTRA!',
    'float.spin': '¡GIRO!',
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
