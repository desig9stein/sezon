import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  groupSchema,
  nutrientSchema,
  produceSchemaWith,
} from '@contexts/catalog/infrastructure/schemas';
import { sponsorSchemaWith } from '@contexts/advertising/infrastructure/schemas';
import { farmSchema } from '@contexts/farms/infrastructure/schemas';
import { regionSchema } from '@contexts/geography/infrastructure/schemas';
import { recipeSchema } from '@contexts/recipes/infrastructure/schemas';

/** Directory, relative to the repository root, with one folder of entries per collection. */
export const DATA_DIRECTORY = 'src/data';
/** File pattern of the entries in a collection folder. */
export const ENTRY_FILE_PATTERN = '*.yaml';

const yamlFilesIn = (directory: string) =>
  glob({ pattern: ENTRY_FILE_PATTERN, base: `./${DATA_DIRECTORY}/${directory}` });

export const collections = {
  produce: defineCollection({ loader: yamlFilesIn('produce'), schema: produceSchemaWith }),
  groups: defineCollection({ loader: yamlFilesIn('groups'), schema: groupSchema }),
  nutrients: defineCollection({ loader: yamlFilesIn('nutrients'), schema: nutrientSchema }),
  regions: defineCollection({ loader: yamlFilesIn('regions'), schema: regionSchema }),
  farms: defineCollection({ loader: yamlFilesIn('farms'), schema: farmSchema }),
  recipes: defineCollection({ loader: yamlFilesIn('recipes'), schema: recipeSchema }),
  sponsors: defineCollection({ loader: yamlFilesIn('sponsors'), schema: sponsorSchemaWith }),
};
