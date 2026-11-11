import type { Produce } from '../domain/Produce';
import { PRODUCE_KINDS, type ProduceKind } from '../domain/ProduceKind';
import type { ProduceRepository } from '../domain/repositories';

/** Every produce grouped by kind, for the year-at-a-glance calendar. */
export interface SeasonCalendar {
  readonly groups: ReadonlyArray<{
    readonly kind: ProduceKind;
    readonly produce: ReadonlyArray<Produce>;
  }>;
}

/** Builds the seasonal calendar of the whole catalogue. */
export class SeasonCalendarService {
  constructor(private readonly produce: ProduceRepository) {}

  /** Groups every produce by kind in section order (empty kinds left out), in repository order. */
  async calendar(): Promise<SeasonCalendar> {
    const all = await this.produce.all();
    const groups = PRODUCE_KINDS.map((kind) =>
      Object.freeze({ kind, produce: Object.freeze(all.filter((item) => item.kind === kind)) }),
    ).filter((group) => group.produce.length > 0);
    return Object.freeze({ groups: Object.freeze(groups) });
  }
}
