import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import type { Farm } from '../domain/Farm';
import type { FarmRepository } from '../domain/repositories';

/** {@link FarmRepository} over an asynchronously loaded list of farms. */
export class IndexedFarmRepository extends IndexedRepository<Farm> implements FarmRepository {
  /** Returns the farms that sell `produceSlug`, sorted by Bulgarian name. */
  async findByProduce(produceSlug: string): Promise<ReadonlyArray<Farm>> {
    return Object.freeze((await this.all()).filter((farm) => farm.sells(produceSlug)));
  }
}
