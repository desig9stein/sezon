import type { Repository } from '@shared/domain/Repository';
import type { Farm } from './Farm';

/** Read access to farms. */
export interface FarmRepository extends Repository<Farm> {
  /** Returns the farms that sell `produceSlug`, sorted by Bulgarian name. */
  findByProduce(produceSlug: string): Promise<ReadonlyArray<Farm>>;
}
