import { laCuadra } from './laCuadra.js';

// Ordered level registry used by the map hub and, later, by progression.
// scene: null means the landmark is visible on the map but not playable yet.
export const LEVELS = [
  {
    id: 'laCuadra',
    scene: 'Level1',
    icon: 'house',
    nameKey: 'map.casa',
    descKey: 'map.casaDesc',
    x: 0.17,
    y: 0.62,
    unlocked: true,
  },
  {
    id: 'iglesia',
    scene: null,
    icon: 'church',
    nameKey: 'map.church',
    descKey: 'map.churchDesc',
    x: 0.62,
    y: 0.22,
    unlocked: false,
  },
  {
    id: 'mercado',
    scene: null,
    icon: 'market',
    nameKey: 'map.market',
    descKey: 'map.marketDesc',
    x: 0.78,
    y: 0.52,
    unlocked: false,
  },
  {
    id: 'parque',
    scene: null,
    icon: 'park',
    nameKey: 'map.park',
    descKey: 'map.parkDesc',
    x: 0.35,
    y: 0.82,
    unlocked: false,
  },
  {
    id: 'orillas',
    scene: null,
    icon: 'fields',
    nameKey: 'map.orillas',
    descKey: 'map.orillasDesc',
    x: 0.72,
    y: 0.78,
    unlocked: false,
  },
];

export function getLevel(id) {
  return LEVELS.find((level) => level.id === id) || null;
}

const LEVEL_DATA = {
  laCuadra,
};

export function getLevelData(id) {
  return LEVEL_DATA[id] || null;
}
