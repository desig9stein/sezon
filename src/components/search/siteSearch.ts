import {
  FAMILY_TERM,
  isShortTerm,
  matchesAllTerms,
  matchesHeading,
  matchesWordForms,
  searchQuery,
  wordsOf,
} from '@shared/seo/searchText';

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
  readonly meta: {
    readonly title?: string;
    readonly latin?: string;
    /** Other name of the page, e.g. „За нас“ (spec 059). */
    readonly alias?: string;
    /** Names of a family page's produce (spec 062). */
    readonly members?: string;
    readonly type?: string;
  };
}

/** One Pagefind result before its data is loaded. */
interface PagefindResult {
  /** Pagefind's page id, the same in every search. */
  readonly id?: string;
  data(): Promise<PagefindResultData>;
}

/** Options of a Pagefind search that the search page uses. */
interface PagefindSearchOptions {
  readonly filters?: Readonly<Record<string, { readonly any: ReadonlyArray<string> }>>;
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
  const text = [best.meta.title, best.meta.latin, best.meta.members, best.content]
    .filter(Boolean)
    .join(' ');
  return matchesAllTerms(text, terms);
}

/** The names a result goes by: its title and, when it has one, its alias. */
function namesOf(data: PagefindResultData): string {
  return [data.meta.title, data.meta.alias].filter(Boolean).join(' ');
}

/**
 * Returns the results with the list and site pages whose heading or alias names every query word
 * (see `matchesHeading`) moved to the front. Pagefind ranks a short list page („Местни ферми“)
 * below single pages that repeat a common word („Ферма …“), but the list is the best entry point
 * for such a query.
 * @param results - All results of the query, in Pagefind order.
 * @param hubs - Results of the same query limited to list and site pages.
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
    .filter(({ hub, data }) => hub.id !== undefined && matchesHeading(namesOf(data), terms))
    .map(({ hub }) => hub);
  const ids = new Set(leading.map((hub) => hub.id));
  return [...leading, ...results.filter((result) => !ids.has(result.id))];
}

/** Separator of the produce names in a family page's `members` metadata. */
const MEMBER_SEPARATOR = ', ';
/** Weight of a name's title rank against its word count when ranking families. */
const RANK_WEIGHT = 100;

/**
 * Ranks a family page for the query words without the family word, lower is better, or returns
 * `undefined` when neither its name nor one of its produce names matches them. A name is ranked
 * like a result title (`titleRank`: every word exact, then close), then by its word count, so
 * „ябълки“ ranks Розоцветни (Ябълки) above Абаносови (Райска ябълка).
 * @param data - Data of a family page result.
 * @param terms - Normalised query words without the family word.
 */
function familyRank(data: PagefindResultData, terms: ReadonlyArray<string>): number | undefined {
  const NO_MATCH = 2;
  const names = [data.meta.title ?? '', ...(data.meta.members?.split(MEMBER_SEPARATOR) ?? [])];
  const ranks = names
    .map((name) => ({ name, rank: nameRank(name, terms) }))
    .filter(({ rank }) => rank < NO_MATCH)
    .map(({ name, rank }) => rank * RANK_WEIGHT + wordsOf(name).length);
  return ranks.length === 0 ? undefined : Math.min(...ranks);
}

/**
 * Returns the results with the family pages that a „семейство <продукт>“ query asks for moved to
 * the front (spec 062): family pages whose name or produce names (`members` metadata) match every
 * other query word, best match first (see `familyRank`). Without the family word, or without
 * other words, the results stay as they are.
 * @param results - All results of the query, in order.
 * @param families - Results of a search for the family word limited to family pages.
 * @param terms - Normalised query words.
 */
async function withAskedFamiliesFirst(
  results: ReadonlyArray<PagefindResult>,
  families: ReadonlyArray<PagefindResult>,
  terms: ReadonlyArray<string>,
): Promise<ReadonlyArray<PagefindResult>> {
  const others = terms.filter((term) => term !== FAMILY_TERM);
  if (others.length === terms.length || others.length === 0) return results;
  const checked = await Promise.all(
    families.map(async (family) => ({ family, data: await family.data() })),
  );
  const asked = checked
    .map(({ family, data }) => ({ family, rank: familyRank(data, others) }))
    .filter(({ rank }) => rank !== undefined)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    .map(({ family }) => family);
  const ids = new Set(asked.map((family) => family.id));
  return [...asked, ...results.filter((result) => !ids.has(result.id))];
}

/**
 * Keeps the results whose title, alias or content name every short query word as a word form
 * (spec 062): Pagefind matches word prefixes, so „нар“ would also find „нарязани“. When no result
 * does, the short word is the start of a longer word being typed („ябъ“), and every result is
 * kept. Loads the data of every result, so it runs only when the query has a short word.
 * @param results - All results of the query, in order.
 * @param terms - Normalised query words.
 */
async function withShortTermsAsWords(
  results: ReadonlyArray<PagefindResult>,
  terms: ReadonlyArray<string>,
): Promise<ReadonlyArray<PagefindResult>> {
  if (!terms.some(isShortTerm)) return results;
  const checked = await Promise.all(
    results.map(async (result) => ({ result, data: await result.data() })),
  );
  const words = checked
    .filter(({ data }) => matchesWordForms(`${namesOf(data)} ${data.content ?? ''}`, terms))
    .map(({ result }) => result);
  return words.length === 0 ? results : words;
}

/** How well a result's title names the query: 0 every word exact, 1 every word close, 2 neither. */
function titleRank(data: PagefindResultData, terms: ReadonlyArray<string>): number {
  return nameRank(namesOf(data), terms);
}

/** How well `names` name the query: 0 every word exact, 1 every word close, 2 neither. */
function nameRank(names: string, terms: ReadonlyArray<string>): number {
  const words = wordsOf(names);
  if (terms.every((term) => words.includes(wordsOf(term)[0] ?? term))) return 0;
  return matchesHeading(names, terms) ? 1 : 2;
}

/**
 * Orders the first page of results so that a page named by the query comes first: titles with
 * every query word as a whole word, then titles with close words, shorter titles first within
 * each group; other results keep Pagefind's order („зеле“ lists „Зеле“ before „Зелен лук“).
 * Results of `laterType` come after the others of the same group: Pagefind ranks a short family
 * page above the produce it names („тикв“), but the produce is what the reader wants (spec 062).
 * @param items - Data of the first page of results, in Pagefind order.
 * @param terms - Normalised query words.
 * @param laterType - Result type listed after the others of its group, e.g. the family pages.
 */
export function byTitleMatch(
  items: ReadonlyArray<PagefindResultData>,
  terms: ReadonlyArray<string>,
  laterType?: string,
): ReadonlyArray<PagefindResultData> {
  const NO_MATCH = 2;
  const ranked = items.map((item, index) => {
    const rank = titleRank(item, terms);
    const length = rank === NO_MATCH ? 0 : wordsOf(item.meta.title ?? '').length;
    const later = laterType !== undefined && item.meta.type === laterType ? 1 : 0;
    return { item, index, rank, later, length };
  });
  return ranked
    .sort(
      (a, b) => a.rank - b.rank || a.later - b.later || a.length - b.length || a.index - b.index,
    )
    .map(({ item }) => item);
}

/**
 * Wires the search form inside `root` to the Pagefind index: loads Pagefind on the first focus,
 * input or `?q=` query, searches while typing with the normalised query, keeps `?q=` in the address
 * bar, shows results ten at a time with a „Покажи още“ button under the „Резултати“ heading,
 * names the query in the page title and announces the outcome in the status line.
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
    scope: root.dataset.scope ?? '',
    title: root.dataset.title ?? '',
  };
  const heading = root.querySelector<HTMLElement>('[data-search-heading]');
  const pageTitle = document.title;
  const showResults = (query: string): void => {
    if (heading !== null) heading.hidden = query === '';
    document.title =
      query === '' || text.title === '' ? pageTitle : fillTemplate(text.title, { query });
  };
  const hubTypes = root.dataset.hubType?.split(',');
  const groupType = root.dataset.groupType;
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
      showResults('');
      return;
    }
    status.textContent = text.loading;
    try {
      const terms = searchQuery(query);
      const api = await load();
      const normalised = terms.join(' ');
      const asksFamily = groupType !== undefined && terms.includes(FAMILY_TERM);

      const [search, hubSearch, familySearch] = await Promise.all([
        api.search(normalised),
        hubTypes === undefined
          ? null
          : api.search(normalised, { filters: { type: { any: hubTypes } } }),
        asksFamily ? api.search(FAMILY_TERM, { filters: { type: { any: [groupType] } } }) : null,
      ]);
      const results = await withAskedFamiliesFirst(
        await withShortTermsAsWords(
          await withMatchingHubsFirst(search?.results ?? [], hubSearch?.results ?? [], terms),
          terms,
        ),
        familySearch?.results ?? [],
        terms,
      );
      const items = byTitleMatch(
        await Promise.all(results.slice(0, PAGE_SIZE).map((result) => result.data())),
        terms,
        asksFamily ? undefined : groupType,
      );
      if (id !== latest) return;
      const best = items[0];
      if (best === undefined || !isRelevant(best, terms)) {
        clear();
        showResults('');
        document.title = fillTemplate(text.title, { query }) || pageTitle;
        status.textContent = [fillTemplate(text.none, { query }), text.scope]
          .filter((part) => part !== '')
          .join(' ');
        return;
      }
      pending = results.slice(PAGE_SIZE);
      total = results.length;
      list.replaceChildren(...items.map(itemOf));
      showResults(query);
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
