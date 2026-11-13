/** The AdSense tag; it also delivers the Privacy & messaging consent message (ADR-0007). */
export const ADSENSE_SCRIPT_URL = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
/** How far ahead of the viewport a slot counts as near. */
export const LOAD_ROOT_MARGIN = '200px 0px';
/** Reader actions after which the loader starts watching the slots. */
export const INTERACTION_EVENTS = ['scroll', 'wheel', 'touchmove', 'keydown'] as const;
/** AdSense ad units the island fills: those with a publisher id. */
const SLOT_SELECTOR = 'ins.adsbygoogle[data-ad-client]';
/** Marks a slot whose ad has been requested. */
const REQUESTED_ATTRIBUTE = 'data-sezon-requested';

/** The parts of an IntersectionObserver entry the loader reads. */
export interface NearEntry {
  readonly isIntersecting: boolean;
  readonly target: Element;
}

/** The parts of `window` the loader uses. */
export interface AdSenseWindow {
  readonly document: Document;
  readonly IntersectionObserver?: typeof IntersectionObserver;
  adsbygoogle?: unknown[];
  addEventListener(type: string, listener: () => void, options?: AddEventListenerOptions): void;
  removeEventListener(type: string, listener: () => void): void;
}

/**
 * Returns the AdSense tag URL, as in Google's ad code.
 * @param client - The AdSense publisher id (`ca-pub-…`).
 */
export function adsenseScriptUrl(client: string): string {
  return `${ADSENSE_SCRIPT_URL}?client=${encodeURIComponent(client)}`;
}

/** Returns the targets of the entries that intersect the (extended) viewport. */
export function nearTargets(entries: ReadonlyArray<NearEntry>): Element[] {
  return entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target);
}

/** Returns a function that calls `load` on its first call and does nothing afterwards. */
export function loadOnce(load: () => void): () => void {
  let loaded = false;
  return () => {
    if (loaded) return;
    loaded = true;
    load();
  };
}

/**
 * Appends the AdSense tag to `<head>`, `async` and `crossorigin="anonymous"`.
 * @param document - The page document.
 * @param client - The AdSense publisher id (`ca-pub-…`).
 */
export function appendAdSenseScript(document: Document, client: string): void {
  const script = document.createElement('script');
  script.async = true;
  script.src = adsenseScriptUrl(client);
  script.crossOrigin = 'anonymous';
  document.head.append(script);
}

/**
 * Appends the AdSense tag unless one is already on the page, so the tag never loads twice.
 * @param document - The page document.
 * @param client - The AdSense publisher id (`ca-pub-…`).
 */
export function ensureAdSenseScript(document: Document, client: string): void {
  const loaded = [...document.querySelectorAll('script[src]')].some((script) =>
    (script.getAttribute('src') ?? '').startsWith(ADSENSE_SCRIPT_URL),
  );
  if (!loaded) appendAdSenseScript(document, client);
}

/**
 * Calls `start` once, on the reader's first scroll, wheel, touch move or key press.
 * @param target - `window`, or a stand-in in tests.
 */
function onFirstInteraction(target: AdSenseWindow, start: () => void): void {
  const listener = (): void => {
    for (const type of INTERACTION_EVENTS) target.removeEventListener(type, listener);
    start();
  };
  for (const type of INTERACTION_EVENTS) {
    target.addEventListener(type, listener, { once: true, passive: true });
  }
}

/**
 * Fills the page's AdSense slots lazily. After the reader's first interaction it observes the
 * slots and, when one comes within {@link LOAD_ROOT_MARGIN} of the viewport, loads the AdSense tag
 * (once per page) and requests an ad for it. Nothing loads on page load, even when a slot is
 * already in view. Does nothing without slots or without `IntersectionObserver`.
 * @param target - `window`, or a stand-in in tests.
 */
export function initAdSense(target: AdSenseWindow): void {
  const Observer = target.IntersectionObserver;
  const slots = [...target.document.querySelectorAll<HTMLElement>(SLOT_SELECTOR)].filter(
    (slot) => !slot.hasAttribute(REQUESTED_ATTRIBUTE),
  );
  const client = slots[0]?.dataset.adClient;
  if (Observer === undefined || client === undefined) return;

  const loadTag = loadOnce(() => ensureAdSenseScript(target.document, client));
  onFirstInteraction(target, () => {
    const observer = new Observer(
      (entries) => {
        for (const slot of nearTargets(entries)) {
          if (slot.hasAttribute(REQUESTED_ATTRIBUTE)) continue;
          observer.unobserve(slot);
          slot.setAttribute(REQUESTED_ATTRIBUTE, '');
          loadTag();
          target.adsbygoogle = target.adsbygoogle ?? [];
          target.adsbygoogle.push({});
        }
      },
      { rootMargin: LOAD_ROOT_MARGIN },
    );
    for (const slot of slots) observer.observe(slot);
  });
}
