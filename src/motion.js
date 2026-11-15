// Accessibility: respect the OS reduced-motion preference and keep the
// background drift subtle for everyone else.
export const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 0.25 keeps a little depth without the strong near-layer sweep that can
// trigger motion sickness. Reduced-motion players get a fully static backdrop.
export const parallaxScale = prefersReducedMotion ? 0 : 0.25;
