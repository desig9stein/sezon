import type { ImageAsset } from '@contexts/catalog';

/** Application name Unsplash asks for in the `utm_source` of attribution links. */
const UNSPLASH_UTM_SOURCE = 'sezon';
const UNSPLASH_HOST = 'unsplash.com';

/**
 * Returns the display height that keeps the image's aspect ratio at `width`.
 * @param image - Image with its intrinsic size.
 * @param width - Display width in px.
 */
export function displayHeight(image: ImageAsset, width: number): number {
  return Math.round((width * image.height) / image.width);
}

/**
 * Returns a credit link: Unsplash links get the referral parameters the Unsplash API guidelines
 * require; other links are returned unchanged.
 * @param url - Absolute `https` URL of the author or the source page.
 */
export function creditHref(url: string): string {
  const link = new URL(url);
  if (link.hostname !== UNSPLASH_HOST) return url;
  link.searchParams.set('utm_source', UNSPLASH_UTM_SOURCE);
  link.searchParams.set('utm_medium', 'referral');
  return link.toString();
}
