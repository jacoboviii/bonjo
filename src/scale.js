// ---------------------------------------------------------------------------
// Rendering scale.
//
// The game is *designed* at 256x144 (the old "bigger" view). SCALE=2 renders
// it at 512x288 with every coordinate, sprite and font doubled, so text and
// art get twice the detail while the framing stays exactly the same.
//
// Gameplay values in tuning.js stay in design units; Dog/Crow multiply them by
// SCALE when applying them to the 2x world.
// ---------------------------------------------------------------------------

export const SCALE = 2;
export const VIEW_W = 256;
export const VIEW_H = 144;
export const GAME_W = VIEW_W * SCALE; // 512
export const GAME_H = VIEW_H * SCALE; // 288
