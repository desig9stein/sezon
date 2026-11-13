declare module 'subset-font' {
  /** Options of {@link subsetFont}; see the package README. */
  interface SubsetFontOptions {
    targetFormat?: 'sfnt' | 'woff' | 'woff2';
    variationAxes?: Record<string, number | { min: number; max: number; default?: number }>;
    keepFeatures?: string[];
    keepAllGlyphs?: boolean;
  }

  /** Subsets (and optionally instances) a font buffer to the characters of `text`. */
  export default function subsetFont(
    buffer: Buffer,
    text: string | undefined,
    options?: SubsetFontOptions,
  ): Promise<Buffer>;
}
