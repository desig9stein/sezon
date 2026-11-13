import { InvalidConfigurationError } from '@shared/domain/errors';

/** A Google AdSense publisher id: `ca-pub-` and its digits. */
const CLIENT_PATTERN = /^ca-pub-\d{10,20}$/;
/** An AdSense ad unit id (`data-ad-slot`): digits only. */
const SLOT_PATTERN = /^\d+$/;

/** The AdSense publisher and ad unit that fill ad slots without a sponsor (ADR-0003). */
export interface AdSenseConfig {
  readonly client: string;
  readonly slot: string;
}

/**
 * Returns the AdSense configuration, or `undefined` when AdSense is off.
 * @param client - `PUBLIC_ADSENSE_CLIENT`; blank or unset turns AdSense off.
 * @param slot - `PUBLIC_ADSENSE_SLOT`; required when `client` is set.
 * @throws InvalidConfigurationError when the client is not a publisher id, or the slot is missing
 *   or not digits only while the client is set.
 */
export function adsenseConfig(
  client: string | undefined,
  slot: string | undefined,
): AdSenseConfig | undefined {
  const trimmedClient = (client ?? '').trim();
  if (trimmedClient === '') return undefined;
  if (!CLIENT_PATTERN.test(trimmedClient)) {
    throw new InvalidConfigurationError(
      `PUBLIC_ADSENSE_CLIENT is not an AdSense publisher id (ca-pub-…): ${trimmedClient}`,
    );
  }
  const trimmedSlot = (slot ?? '').trim();
  if (!SLOT_PATTERN.test(trimmedSlot)) {
    throw new InvalidConfigurationError(
      `PUBLIC_ADSENSE_SLOT must be the digits of an AdSense ad unit id: "${trimmedSlot}"`,
    );
  }
  return Object.freeze({ client: trimmedClient, slot: trimmedSlot });
}

/** The build's AdSense configuration; `undefined` while AdSense is off. */
export const ADSENSE: AdSenseConfig | undefined = adsenseConfig(
  import.meta.env.PUBLIC_ADSENSE_CLIENT,
  import.meta.env.PUBLIC_ADSENSE_SLOT,
);
