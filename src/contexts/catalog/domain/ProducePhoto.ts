import type { ImageAsset } from '@shared/domain/ImageAsset';

export { IMAGE_FORMATS } from '@shared/domain/ImageAsset';
export type { ImageAsset, ImageFormat } from '@shared/domain/ImageAsset';

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
