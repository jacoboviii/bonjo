// ---------------------------------------------------------------------------
// Rendering scale.
//
// The game is designed at 256x144 (height = 144 design units), rendered at
// SCALE=3 -> 432px tall. The *width* is chosen at boot from the device's
// landscape aspect ratio (768 minimum) so the canvas fills a wide phone screen
// instead of letterboxing. The layout reads this.scale.width.
// ---------------------------------------------------------------------------

export const SCALE = 3;
export const VIEW_W = 256;
export const VIEW_H = 144;
export const BASE_W = VIEW_W * SCALE;
export const GAME_W = BASE_W; // minimum / 16:9 width
export const GAME_H = VIEW_H * SCALE; // 432
