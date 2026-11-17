import { matchesAllTerms, searchQuery } from '@shared/seo/searchText';

/** URL of the Pagefind browser bundle written by `pagefind --site dist`. */
const PAGEFIND_URL = '/pagefind/pagefind.js';
/** Results shown at first and added by each „Покажи още“. */
const PAGE_SIZE = 10;
/** List pages checked for a heading that matches the query. */
const MAX_HUBS = 5;
const DEBOUNCE_MS = 200;
const HTML_SUFFIX = /\.html$/;
const QUERY_PARAM = 'q';

/** The parts of a Pagefind result's data that the search page shows. */
interface PagefindResultData {
  readonly url: string;
  readonly excerpt: string;
  /** Plain text of the indexed part of the page. */
  readonly content?: string;
  readonly meta: { readonly title?: string; readonly latin?: string; readonly type?: string };
}

/** One Pagefind result before its data is loaded. */
interface PagefindResult {
  /** Pagefind's page id, the same in every search. */
  readonly id?: string;
  data(): Promise<PagefindResultData>;
}

/** Options of a Pagefind search that the search page uses. */
interface PagefindSearchOptions {
  readonly filters?: Readonly<Record<string, string>>;
}

/** The parts of the Pagefind browser API that the search page uses. */
export interface PagefindApi {
  init(): Promise<void>;
  search(
    query: string,
    options?: PagefindSearchOptions,
  ): Promise<{
    readonly results: ReadonlyArray<PagefindResult>;
  } | null>;
}

/**
 * Replaces `{name}` placeholders in a status template.
 * @param template - Text such as „Резултати: {count} за „{query}“.“.
 * @param values - Placeholder values by name.
 */
export function fillTemplate(template: string, values: Readonly<Record<string, string>>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => values[name] ?? match);
}

/**
 * Returns the site URL of a result: Pagefind reports the built `name.html` file, the site
 * serves it without the suffix.
 * @param url - Result URL from Pagefind.
 */
export function canonicalResultUrl(url: string): string {
  return url.replace(HTML_SUFFIX, '');
}

/** Loads the Pagefind browser API. */
export type PagefindLoader = () => Promise<PagefindApi>;

const loadPagefind: PagefindLoader = () => import(/* @vite-ignore */ PAGEFIND_URL);

/**
 * Removes the indexed Latin label (e.g. „yabalki. “) that Pagefind puts at the start of a page's
 * content, with or without `<mark>` tags around its words, also when the excerpt starts inside the
 * label and holds only its last words („biotiful. “ of „ferma biotiful“).
 * @param excerpt - Pagefind excerpt (HTML-encoded, with `<mark>` tags).
 * @param latin - The page's `latin` metadata.
 */
export function withoutLatinLabel(excerpt: string, latin: string | undefined): string {
  if (latin === undefined || latin === '') return excerpt;
  const words = latin.split(' ').map((word) => `(?:<mark>)?${word}(?:</mark>)?`);
  const tails = words.map((_, index) => words.slice(index).join('\\s+'));
  return excerpt.replace(new RegExp(`^\\s*(?:${tails.join('|')})\\.\\s*`), '');
}

/**
 * Returns whether Pagefind matched every query word in `best`, the top result. Pagefind falls back
 * to the longest indexed word that is a prefix of an unknown query word („гъби“ → „г“), so a top
 * result without the words means the site does not know them.
 * @param best - Data of the top result.
 * @param terms - Normalised query words.
 */
function isRelevant(best: PagefindResultData, terms: ReadonlyArray<string>): boolean {
  const text = [best.meta.title, best.meta.latin, best.content].filter(Boolean).join(' ');
  return matchesAllTerms(text, terms);
}

/**
 * Returns the results with the list pages whose heading matches every query word moved to the
 * front. Pagefind ranks a short list page („Местни ферми“) below single pages that repeat a common
 * word („Ферма …“), but the list is the best entry point for such a query.
 * @param results - All results of the query, in Pagefind order.
 * @param hubs - Results of the same query limited to list pages.
 * @param terms - Normalised query words.
 */
async function withMatchingHubsFirst(
  results: ReadonlyArray<PagefindResult>,
  hubs: ReadonlyArray<PagefindResult>,
  terms: ReadonlyArray<string>,
): Promise<ReadonlyArray<PagefindResult>> {
  const checked = await Promise.all(
    hubs.slice(0, MAX_HUBS).map(async (hub) => ({ hub, data: await hub.data() })),
  );
  const leading = checked
    .filter(
      ({ hub, data }) =>
        hub.id !== undefined &&
        matchesAllTerms([data.meta.title, data.meta.latin].filter(Boolean).join(' '), terms),
    )
    .map(({ hub }) => hub);
  const ids = new Set(leading.map((hub) => hub.id));
  return [...leading, ...results.filter((result) => !ids.has(result.id))];
}

/**
 * Wires the search form inside `root` to the Pagefind index: loads Pagefind on the first focus,
 * input or `?q=` query, searches while typing with the normalised query, keeps `?q=` in the address
 * bar, shows results ten at a time with a „Покажи още“ button and announces the outcome in the
 * status line.
 * @param root - Element rendered by `SiteSearch.astro`, with the status templates as data attributes.
 * @param loader - Loads the Pagefind API; a failed load is retried on the next query.
 */
export function initSiteSearch(root: HTMLElement, loader: PagefindLoader = loadPagefind): void {
  const form = root.querySelector('form');
  const input = root.querySelector<HTMLInputElement>('input[type="search"]');
  const status = root.querySelector<HTMLElement>('[role="status"]');
  const list = root.querySelector<HTMLOListElement>('[data-search-results]');
  const more = root.querySelector<HTMLButtonElement>('[data-search-more]');
  if (form === null || input === null || status === null || list === null) return;

  const text = {
    loading: root.dataset.loading ?? '',
    found: root.dataset.found ?? '',
    none: root.dataset.none ?? '',
    failed: root.dataset.failed ?? '',
    firstShown: root.dataset.firstShown ?? '',
    shownOf: root.dataset.shownOf ?? '',
  };
  const hubType = root.dataset.hubType;
  let pagefind: Promise<PagefindApi> | undefined;
  let latest = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: ReadonlyArray<PagefindResult> = [];
  let total = 0;

  const load = (): Promise<PagefindApi> => {
    pagefind ??= loader()
      .then(async (api) => {
        await api.init();
        return api;
      })
      .catch((error: unknown) => {
        pagefind = undefined;
        throw error;
      });
    return pagefind;
  };

  const itemOf = (item: PagefindResultData): HTMLLIElement => {
    const li = document.createElement('li');
    if (item.meta.type !== undefined && item.meta.type !== '') {
      const type = document.createElement('p');
      type.className = 'site-search__type';
      type.textContent = item.meta.type;
      li.append(type);
    }
    const link = document.createElement('a');
    link.href = canonicalResultUrl(item.url);
    link.textContent = item.meta.title ?? link.href;
    const excerpt = document.createElement('p');
    excerpt.innerHTML = withoutLatinLabel(item.excerpt, item.meta.latin);
    li.append(link, excerpt);
    return li;
  };

  const updateMore = (): void => {
    if (more !== null) more.hidden = pending.length === 0;
  };

  const clear = (): void => {
    pending = [];
    total = 0;
    list.replaceChildren();
    updateMore();
  };

  const run = async (raw: string): Promise<void> => {
    const query = raw.trim();
    const id = ++latest;
    const url = new URL(window.location.href);
    if (query === '') url.searchParams.delete(QUERY_PARAM);
    else url.searchParams.set(QUERY_PARAM, query);
    window.history.replaceState(null, '', url);
    if (query === '') {
      status.textContent = '';
      clear();
      return;
    }
    status.textContent = text.loading;
    try {
      const terms = searchQuery(query);
      const api = await load();
      const normalised = terms.join(' ');
      const [search, hubSearch] = await Promise.all([
        api.search(normalised),
        hubType === undefined ? null : api.search(normalised, { filters: { type: hubType } }),
      ]);
      const results = await withMatchingHubsFirst(
        search?.results ?? [],
        hubSearch?.results ?? [],
        terms,
      );
      const items = await Promise.all(results.slice(0, PAGE_SIZE).map((result) => result.data()));
      if (id !== latest) return;
      const best = items[0];
      if (best === undefined || !isRelevant(best, terms)) {
        clear();
        status.textContent = fillTemplate(text.none, { query });
        return;
      }
      pending = results.slice(PAGE_SIZE);
      total = results.length;
      list.replaceChildren(...items.map(itemOf));
      updateMore();
      const found = fillTemplate(text.found, { count: String(total), query });
      status.textContent =
        total > PAGE_SIZE
          ? `${found} ${fillTemplate(text.firstShown, { shown: String(items.length) })}`
          : found;
    } catch {
      if (id !== latest) return;
      clear();
      status.textContent = text.failed;
    }
  };

  const showMore = async (): Promise<void> => {
    const id = latest;
    const next = pending.slice(0, PAGE_SIZE);
    if (next.length === 0) return;
    const items = await Promise.all(next.map((result) => result.data()));
    if (id !== latest) return;
    pending = pending.slice(PAGE_SIZE);
    const added = items.map(itemOf);
    list.append(...added);
    updateMore();
    status.textContent = fillTemplate(text.shownOf, {
      shown: String(list.children.length),
      count: String(total),
    });
    added[0]?.querySelector('a')?.focus();
  };

  input.addEventListener('focus', () => void load().catch(() => undefined), { once: true });
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => void run(input.value), DEBOUNCE_MS);
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearTimeout(timer);
    void run(input.value);
  });
  more?.addEventListener('click', () => void showMore());

  const initial = new URL(window.location.href).searchParams.get(QUERY_PARAM) ?? '';
  if (initial.trim() !== '') {
    input.value = initial;
    void run(initial);
  }
}
