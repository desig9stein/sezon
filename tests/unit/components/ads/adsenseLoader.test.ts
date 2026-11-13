import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Window } from 'happy-dom';
import {
  ADSENSE_SCRIPT_URL,
  LOAD_ROOT_MARGIN,
  adsenseScriptUrl,
  initAdSense,
  loadOnce,
  nearTargets,
  type AdSenseWindow,
} from '@components/ads/adsenseLoader';

const CLIENT = 'ca-pub-1234567890123456';
const SLOT_HTML = `<ins class="adsbygoogle" style="display:block" data-ad-client="${CLIENT}" data-ad-slot="1234567890"></ins>`;

type Entry = { isIntersecting: boolean; target: Element };

/** An IntersectionObserver stand-in that records its use and lets the test report entries. */
class FakeObserver {
  static instances: FakeObserver[] = [];
  readonly observed: Element[] = [];
  readonly unobserved: Element[] = [];

  constructor(
    readonly callback: (entries: ReadonlyArray<Entry>) => void,
    readonly options: { rootMargin?: string } = {},
  ) {
    FakeObserver.instances.push(this);
  }

  observe(target: Element): void {
    this.observed.push(target);
  }

  unobserve(target: Element): void {
    this.unobserved.push(target);
  }

  disconnect(): void {}

  report(target: Element, isIntersecting = true): void {
    this.callback([{ isIntersecting, target }]);
  }
}

const pageWith = (body: string, observer: unknown = FakeObserver) => {
  const window = new Window();
  window.document.body.innerHTML = body;
  const target = {
    document: window.document,
    IntersectionObserver: observer,
  } as unknown as AdSenseWindow;
  return { target, document: window.document as unknown as Document };
};

const tagScripts = (document: Document) =>
  [...document.querySelectorAll('script')].filter((script) =>
    (script.getAttribute('src') ?? '').startsWith(ADSENSE_SCRIPT_URL),
  );

beforeEach(() => {
  FakeObserver.instances = [];
});

describe('AdSense loader (spec 045)', () => {
  it('AC7: keeps the targets of intersecting entries only', () => {
    const near = {} as Element;
    const far = {} as Element;
    expect(
      nearTargets([
        { isIntersecting: false, target: far },
        { isIntersecting: true, target: near },
      ]),
    ).toEqual([near]);
    expect(nearTargets([])).toEqual([]);
  });

  it('AC8: runs the wrapped function once', () => {
    const load = vi.fn();
    const once = loadOnce(load);
    once();
    once();
    once();
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('AC10: builds the tag URL with the client', () => {
    expect(adsenseScriptUrl(CLIENT)).toBe(`${ADSENSE_SCRIPT_URL}?client=${CLIENT}`);
  });

  it('AC9: observes the slot 200 px ahead and loads nothing on page load', () => {
    const { target, document } = pageWith(SLOT_HTML);
    initAdSense(target);
    const [observer] = FakeObserver.instances;
    expect(LOAD_ROOT_MARGIN).toBe('200px 0px');
    expect(observer?.options.rootMargin).toBe(LOAD_ROOT_MARGIN);
    expect(observer?.observed).toHaveLength(1);
    expect(tagScripts(document)).toHaveLength(0);
    expect(target.adsbygoogle).toBeUndefined();
  });

  it('AC10: loads the tag once and pushes once per near slot', () => {
    const { target, document } = pageWith(`${SLOT_HTML}<p>Текст</p>${SLOT_HTML}`);
    initAdSense(target);
    const observer = FakeObserver.instances[0]!;
    const [first, second] = observer.observed;

    observer.report(first!, false);
    expect(tagScripts(document)).toHaveLength(0);

    observer.report(first!);
    observer.report(first!);
    observer.report(second!);

    const scripts = tagScripts(document);
    expect(scripts).toHaveLength(1);
    const script = scripts[0]!;
    expect(script.getAttribute('src')).toBe(adsenseScriptUrl(CLIENT));
    expect(script.async).toBe(true);
    expect(script.getAttribute('crossorigin')).toBe('anonymous');
    expect(script.parentElement).toBe(document.head);
    expect(target.adsbygoogle).toEqual([{}, {}]);
    expect(observer.unobserved).toEqual([first, second]);
  });

  it('AC10: keeps an existing adsbygoogle queue', () => {
    const { target } = pageWith(SLOT_HTML);
    const queue: unknown[] = [{ earlier: true }];
    target.adsbygoogle = queue;
    initAdSense(target);
    const observer = FakeObserver.instances[0]!;
    observer.report(observer.observed[0]!);
    expect(target.adsbygoogle).toBe(queue);
    expect(queue).toEqual([{ earlier: true }, {}]);
  });

  it('AC11: does nothing without IntersectionObserver', () => {
    const { target, document } = pageWith(SLOT_HTML, undefined);
    initAdSense(target);
    expect(tagScripts(document)).toHaveLength(0);
    expect(target.adsbygoogle).toBeUndefined();
  });

  it('AC11: does nothing without an AdSense slot', () => {
    const { target, document } = pageWith('<ins class="adsbygoogle"></ins><p>Без реклама</p>');
    initAdSense(target);
    expect(FakeObserver.instances).toHaveLength(0);
    expect(tagScripts(document)).toHaveLength(0);
    expect(target.adsbygoogle).toBeUndefined();
  });
});
