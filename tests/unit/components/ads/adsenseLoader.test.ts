import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Window } from 'happy-dom';
import {
  ADSENSE_SCRIPT_URL,
  INTERACTION_EVENTS,
  LOAD_ROOT_MARGIN,
  adsenseScriptUrl,
  ensureAdSenseScript,
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
  /** When true, reports every observed target as intersecting at once, as browsers do. */
  static reportOnObserve = false;
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
    if (FakeObserver.reportOnObserve) this.report(target);
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
  const events = new window.EventTarget();
  const target = {
    document: window.document,
    IntersectionObserver: observer,
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
  } as unknown as AdSenseWindow;
  const interact = (type = 'scroll') => events.dispatchEvent(new window.Event(type));
  return { target, document: window.document as unknown as Document, interact };
};

const tagScripts = (document: Document) =>
  [...document.querySelectorAll('script')].filter((script) =>
    (script.getAttribute('src') ?? '').startsWith(ADSENSE_SCRIPT_URL),
  );

beforeEach(() => {
  FakeObserver.instances = [];
  FakeObserver.reportOnObserve = false;
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

  it('AC9: after an interaction, observes the slot 200 px ahead and loads nothing until it is near', () => {
    const { target, document, interact } = pageWith(SLOT_HTML);
    initAdSense(target);
    interact();
    const [observer] = FakeObserver.instances;
    expect(LOAD_ROOT_MARGIN).toBe('200px 0px');
    expect(observer?.options.rootMargin).toBe(LOAD_ROOT_MARGIN);
    expect(observer?.observed).toHaveLength(1);
    expect(tagScripts(document)).toHaveLength(0);
    expect(target.adsbygoogle).toBeUndefined();
  });

  it('AC10: loads the tag once and pushes once per near slot', () => {
    const { target, document, interact } = pageWith(`${SLOT_HTML}<p>Текст</p>${SLOT_HTML}`);
    initAdSense(target);
    interact();
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
    const { target, interact } = pageWith(SLOT_HTML);
    const queue: unknown[] = [{ earlier: true }];
    target.adsbygoogle = queue;
    initAdSense(target);
    interact();
    const observer = FakeObserver.instances[0]!;
    observer.report(observer.observed[0]!);
    expect(target.adsbygoogle).toBe(queue);
    expect(queue).toEqual([{ earlier: true }, {}]);
  });

  it('AC11: does nothing without IntersectionObserver', () => {
    const { target, document, interact } = pageWith(SLOT_HTML, undefined);
    initAdSense(target);
    interact();
    expect(tagScripts(document)).toHaveLength(0);
    expect(target.adsbygoogle).toBeUndefined();
  });

  it('AC11: does nothing without an AdSense slot', () => {
    const { target, document, interact } = pageWith(
      '<ins class="adsbygoogle"></ins><p>Без реклама</p>',
    );
    initAdSense(target);
    interact();
    expect(FakeObserver.instances).toHaveLength(0);
    expect(tagScripts(document)).toHaveLength(0);
    expect(target.adsbygoogle).toBeUndefined();
  });
});

describe('AdSense loader, QA 045/046 regressions', () => {
  it('QA1: loads nothing on page load even when the slot is already in view', () => {
    FakeObserver.reportOnObserve = true;
    const { target, document } = pageWith(SLOT_HTML);
    initAdSense(target);
    expect(FakeObserver.instances).toHaveLength(0);
    expect(tagScripts(document)).toHaveLength(0);
    expect(target.adsbygoogle).toBeUndefined();
  });

  it.each(['scroll', 'wheel', 'touchmove', 'keydown'])(
    'QA1: starts observing after the first %s and loads a slot already in view',
    (type) => {
      FakeObserver.reportOnObserve = true;
      const { target, document, interact } = pageWith(SLOT_HTML);
      initAdSense(target);
      interact(type);
      interact(type);
      expect(INTERACTION_EVENTS).toContain(type);
      expect(FakeObserver.instances).toHaveLength(1);
      expect(tagScripts(document)).toHaveLength(1);
      expect(target.adsbygoogle).toEqual([{}]);
    },
  );

  it('QA1: ignores other events', () => {
    FakeObserver.reportOnObserve = true;
    const { target, document, interact } = pageWith(SLOT_HTML);
    initAdSense(target);
    interact('load');
    interact('mousemove');
    expect(tagScripts(document)).toHaveLength(0);
  });

  it('QA13: never appends a second tag when one is already on the page', () => {
    FakeObserver.reportOnObserve = true;
    const { target, document, interact } = pageWith(SLOT_HTML);
    ensureAdSenseScript(document, CLIENT);
    initAdSense(target);
    interact();
    expect(tagScripts(document)).toHaveLength(1);
    expect(target.adsbygoogle).toEqual([{}]);
  });

  it('QA13: ensureAdSenseScript appends the tag only once', () => {
    const { document } = pageWith('');
    ensureAdSenseScript(document, CLIENT);
    ensureAdSenseScript(document, CLIENT);
    expect(tagScripts(document)).toHaveLength(1);
  });
});
