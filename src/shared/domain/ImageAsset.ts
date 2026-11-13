/** Image formats the build pipeline accepts as image sources. */
export const IMAGE_FORMATS = [
  'png',
  'jpg',
  'jpeg',
  'tiff',
  'webp',
  'gif',
  'svg',
  'avif',
  'apng',
] as const;

export type ImageFormat = (typeof IMAGE_FORMATS)[number];

/** A local image resolved at build time: its URL, intrinsic size in px and format. */
export interface ImageAsset {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly format: ImageFormat;
}
