/** Image formats the build pipeline accepts as photo sources. */
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

/** Who took a photo and where it was published. */
export interface PhotoCredit {
  readonly author: string;
  readonly authorUrl: string;
  readonly sourceName: string;
  readonly sourceUrl: string;
}

/** A photograph of a produce with its Bulgarian alternative text and credit. */
export interface ProducePhoto {
  readonly image: ImageAsset;
  readonly alt: string;
  readonly credit: PhotoCredit;
}
