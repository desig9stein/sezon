import { ADSENSE_SCRIPT_URL, appendAdSenseScript } from './adsenseLoader';

/** The button that reopens Google's privacy message. */
const BUTTON_SELECTOR = 'button[data-privacy-settings]';

/** The parts of Google's Privacy & messaging API (`window.googlefc`) the button uses. */
export interface GoogleFundingChoices {
  callbackQueue?: unknown[];
  showRevocationMessage?: () => void;
}

/** The parts of `window` the privacy settings button uses. */
export interface PrivacyWindow {
  readonly document: Document;
  googlefc?: GoogleFundingChoices;
}

/**
 * Queues a call to `googlefc.showRevocationMessage`, which clears the consent record and shows
 * Google's message again (ADR-0007). The queue is the only supported way to call the API; the
 * queued function looks the method up when it runs, because it exists only after Google's script
 * has loaded.
 * @param target - `window`, or a stand-in in tests.
 */
export function queueRevocationMessage(target: PrivacyWindow): void {
  const googlefc = target.googlefc ?? {};
  target.googlefc = googlefc;
  googlefc.callbackQueue = googlefc.callbackQueue ?? [];
  googlefc.callbackQueue.push(() => target.googlefc?.showRevocationMessage?.());
}

/**
 * Appends the AdSense tag, which delivers Google's privacy message, unless it is already on the
 * page.
 * @param document - The page document.
 * @param client - The AdSense publisher id.
 */
export function ensureAdSenseScript(document: Document, client: string): void {
  const loaded = [...document.querySelectorAll('script[src]')].some((script) =>
    (script.getAttribute('src') ?? '').startsWith(ADSENSE_SCRIPT_URL),
  );
  if (!loaded) appendAdSenseScript(document, client);
}

/**
 * Reveals the privacy settings button and makes it reopen Google's privacy message: a click loads
 * the AdSense tag if needed and queues the message. Does nothing without the button.
 * @param target - `window`, or a stand-in in tests.
 */
export function initPrivacySettings(target: PrivacyWindow): void {
  const button = target.document.querySelector<HTMLButtonElement>(BUTTON_SELECTOR);
  const client = button?.dataset.adClient;
  if (button === null || client === undefined) return;
  button.hidden = false;
  button.addEventListener('click', () => {
    ensureAdSenseScript(target.document, client);
    queueRevocationMessage(target);
  });
}
