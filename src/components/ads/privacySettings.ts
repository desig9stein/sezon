import { ensureAdSenseScript } from './adsenseLoader';

export { ensureAdSenseScript };

/** The control that holds the button reopening Google's privacy message and its description. */
const CONTROL_SELECTOR = '[data-privacy-settings]';

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
 * Reveals the privacy settings control and makes its button reopen Google's privacy message: a
 * click loads the AdSense tag if needed and queues the message. Does nothing without the control.
 * @param target - `window`, or a stand-in in tests.
 */
export function initPrivacySettings(target: PrivacyWindow): void {
  const control = target.document.querySelector<HTMLElement>(CONTROL_SELECTOR);
  const client = control?.dataset.adClient;
  const button = control?.querySelector('button');
  if (control === null || control === undefined || client === undefined || !button) return;
  control.hidden = false;
  button.addEventListener('click', () => {
    ensureAdSenseScript(target.document, client);
    queueRevocationMessage(target);
  });
}
