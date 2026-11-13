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

const yamlFilesIn = (directory: string) =>
  glob({ pattern: '*.yaml', base: `./src/data/${directory}` });

export const collections = {
  produce: defineCollection({ loader: yamlFilesIn('produce'), schema: produceSchemaWith }),
  groups: defineCollection({ loader: yamlFilesIn('groups'), schema: groupSchema }),
  nutrients: defineCollection({ loader: yamlFilesIn('nutrients'), schema: nutrientSchema }),
  regions: defineCollection({ loader: yamlFilesIn('regions'), schema: regionSchema }),
  farms: defineCollection({ loader: yamlFilesIn('farms'), schema: farmSchema }),
  sponsors: defineCollection({ loader: yamlFilesIn('sponsors'), schema: sponsorSchemaWith }),
};
