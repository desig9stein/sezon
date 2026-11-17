import type { SourceLanguage } from '@shared/domain/sourceLanguage';

/** A citation for a fact: a human-readable name and an https URL. */
export interface Source {
  readonly name: string;
  readonly url: string;
  /** Language of the name when it is not Bulgarian. */
  readonly lang?: SourceLanguage | undefined;
}
