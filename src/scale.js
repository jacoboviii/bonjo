// ---------------------------------------------------------------------------
// Rendering scale.
//
// The game is designed at 256x144 (height = 144 design units), rendered at
// SCALE=2 -> 288px tall. The *width* is chosen at boot from the device's
// landscape aspect ratio (512 minimum, 960 maximum) so the canvas fills a wide
// phone screen instead of letterboxing. The layout reads this.scale.width.
// ---------------------------------------------------------------------------

export const SCALE = 2;
export const VIEW_W = 256;
export const VIEW_H = 144;
export const BASE_W = 512;
export const GAME_W = 512; // minimum / 16:9 width
export const GAME_H = VIEW_H * SCALE; // 288
