import { describe, expect, it, vi } from 'vitest';
import { Window } from 'happy-dom';
import { ADSENSE_SCRIPT_URL, adsenseScriptUrl } from '@components/ads/adsenseLoader';
import {
  ensureAdSenseScript,
  initPrivacySettings,
  queueRevocationMessage,
  type PrivacyWindow,
} from '@components/ads/privacySettings';

const CLIENT = 'ca-pub-1234567890123456';
const BUTTON = `<button type="button" data-privacy-settings data-ad-client="${CLIENT}" hidden>Настройки за поверителност</button>`;

const pageWith = (body: string) => {
  const window = new Window();
  window.document.body.innerHTML = body;
  const target = { document: window.document } as unknown as PrivacyWindow;
  return { target, document: window.document as unknown as Document };
};

const tagScripts = (document: Document) =>
  [...document.querySelectorAll('script')].filter((script) =>
    (script.getAttribute('src') ?? '').startsWith(ADSENSE_SCRIPT_URL),
  );

describe('privacy settings button (spec 046)', () => {
  it('AC3: queues a call to showRevocationMessage that resolves the method when run', () => {
    const { target } = pageWith('');
    queueRevocationMessage(target);
    const queue = target.googlefc?.callbackQueue ?? [];
    expect(queue).toHaveLength(1);
    const callback = queue[0];
    expect(typeof callback).toBe('function');

    const showRevocationMessage = vi.fn();
    target.googlefc = { ...target.googlefc, showRevocationMessage };
    (callback as () => void)();
    expect(showRevocationMessage).toHaveBeenCalledTimes(1);
  });

  it('AC3: keeps an existing googlefc queue', () => {
    const { target } = pageWith('');
    const earlier = () => undefined;
    const queue: unknown[] = [earlier];
    target.googlefc = { callbackQueue: queue };
    queueRevocationMessage(target);
    expect(target.googlefc.callbackQueue).toBe(queue);
    expect(queue).toHaveLength(2);
    expect(queue[0]).toBe(earlier);
  });

  it('AC4: appends the AdSense tag only when it is not on the page', () => {
    const { document } = pageWith('');
    ensureAdSenseScript(document, CLIENT);
    ensureAdSenseScript(document, CLIENT);
    const scripts = tagScripts(document);
    expect(scripts).toHaveLength(1);
    expect(scripts[0]?.getAttribute('src')).toBe(adsenseScriptUrl(CLIENT));
  });

  it('AC4: reveals the button and, on each click, loads the tag once and queues the message', () => {
    const { target, document } = pageWith(BUTTON);
    initPrivacySettings(target);
    const button = document.querySelector<HTMLButtonElement>('[data-privacy-settings]')!;
    expect(button.hidden).toBe(false);
    expect(tagScripts(document)).toHaveLength(0);

    button.click();
    button.click();
    expect(tagScripts(document)).toHaveLength(1);
    expect(target.googlefc?.callbackQueue).toHaveLength(2);
  });

  it('AC4: does nothing without the button', () => {
    const { target, document } = pageWith('<p>Без бутон</p>');
    initPrivacySettings(target);
    expect(tagScripts(document)).toHaveLength(0);
    expect(target.googlefc).toBeUndefined();
  });
});
