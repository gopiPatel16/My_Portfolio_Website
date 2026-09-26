/**
 * Photographic backdrop for the hero.
 *
 * The composition assumes what this photograph has: an empty dark wall on the
 * left for the copy, and the lit desk on the right. Set `src` to null to fall
 * back to the animated FlowField in the same composition.
 */
export const heroBackground: { src: string | null; srcSet?: string; alt: string } = {
  src: '/img/hero-desk.webp',
  srcSet: '/img/hero-desk-sm.webp 1100w, /img/hero-desk.webp 1600w',
  alt: '',
}
