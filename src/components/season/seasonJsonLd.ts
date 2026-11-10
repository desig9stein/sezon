import { routes } from '@components/layout/routes';
import type { SeasonOverview } from '@contexts/catalog';
import { ui } from '@i18n/bg';
import { itemListJsonLd, type JsonLd } from '@shared/seo';

/** Returns `ItemList` JSON-LD of the produce that is fresh in the overview's month. */
export function freshProduceItemList(overview: SeasonOverview, siteUrl: string): JsonLd {
  const fresh = [...overview.peak, ...overview.available];
  return itemListJsonLd(
    ui.overview.listName(overview.month),
    fresh.map((produce) => ({ name: produce.name, path: routes.produce(produce) })),
    siteUrl,
  );
}
