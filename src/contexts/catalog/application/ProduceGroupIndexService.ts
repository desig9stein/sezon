import type { Month } from '@contexts/seasonality';
import { ProduceGroupNotFoundError } from '@shared/domain/errors';
import type { ProduceGroup } from '../domain/ProduceGroup';
import type { ProduceGroupRepository, ProduceRepository } from '../domain/repositories';
import { seasonGroups, type SeasonGroups } from './seasonGroups';

/** The produce of one botanical group, grouped by its season level in one month. */
export interface ProduceGroupIndex extends SeasonGroups {
  readonly group: ProduceGroup;
}

/** Lists botanical groups and the produce of each for the group pages. */
export class ProduceGroupIndexService {
  constructor(
    private readonly produce: ProduceRepository,
    private readonly groups: ProduceGroupRepository,
  ) {}

  /** Returns every group, sorted by Bulgarian name. */
  allGroups(): Promise<ReadonlyArray<ProduceGroup>> {
    return this.groups.all();
  }

  /**
   * Returns the group with `slug` and its produce split by level in `month`, in repository order.
   * @throws ProduceGroupNotFoundError when no group has `slug`.
   */
  async groupFor(slug: string, month: Month): Promise<ProduceGroupIndex> {
    const group = await this.groups.findBySlug(slug);
    if (group === undefined) {
      throw new ProduceGroupNotFoundError(`No produce group with slug "${slug}".`);
    }
    const members = (await this.produce.all()).filter((item) => item.groupSlug === slug);
    return Object.freeze({ ...seasonGroups(members, month), group });
  }
}
