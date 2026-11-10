import type { Repository } from '@shared/domain/Repository';
import type { Nutrient } from './Nutrient';
import type { Produce } from './Produce';
import type { ProduceGroup } from './ProduceGroup';

export type ProduceRepository = Repository<Produce>;
export type ProduceGroupRepository = Repository<ProduceGroup>;
export type NutrientRepository = Repository<Nutrient>;
