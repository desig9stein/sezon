import { collection, config, fields } from '@keystatic/core';
import { AD_PLACEMENTS } from '@contexts/advertising';
import {
  NUTRIENT_KINDS,
  NUTRIENT_UNITS,
  PRODUCE_KINDS,
  TRADITIONAL_SYSTEMS,
} from '@contexts/catalog';
import { INGREDIENT_UNITS, RECIPE_CATEGORIES } from '@contexts/recipes';
import { FIRST_MONTH_NUMBER, LAST_MONTH_NUMBER, SEASON_LEVEL_VALUES } from '@contexts/seasonality';
import { Slug, SLUG_PATTERN } from '@shared/domain';
import { DESCRIPTION_MAX_LENGTH, DESCRIPTION_MIN_LENGTH } from '@shared/seo';

/** Directory that holds one folder of YAML entries per content collection. */
export const DATA_DIRECTORY = 'src/data';
const PRODUCE_SUMMARY_MIN_LENGTH = 70;
const PRODUCE_SUMMARY_MAX_LENGTH = 160;
const SPONSOR_IMAGE_DIRECTORY = 'src/assets/sponsors';
/**
 * Path of the sponsor images as seen from `src/data/sponsors/*.yaml` (Astro `image()`). The banner
 * is a text path, not a Keystatic image field: that field stores files in a per-entry folder and
 * would drop a banner kept elsewhere.
 */
const SPONSOR_IMAGE_PUBLIC_PATH = '../../assets/sponsors/';
const YAML = { data: 'yaml' } as const;

/**
 * Returns the storage path of a collection: `src/data/<name>/*`, one `<slug>.yaml` per entry.
 * @param name - Collection name, equal to its folder in `src/data`.
 */
const entriesIn = (name: string) => `${DATA_DIRECTORY}/${name}/*` as const;

/**
 * Returns the Latin slug of a Bulgarian name, or an empty string while the name has no letters.
 * @param name - Bulgarian name typed in the editor.
 */
export function slugOf(name: string): string {
  try {
    return Slug.fromBulgarian(name).value;
  } catch {
    return '';
  }
}

/**
 * Builds the slug field of a collection: the name is stored in the YAML file under `key`, and the
 * slug, generated from the name by Bulgarian transliteration, is the file name.
 * @param label - Label of the name input.
 */
const nameAndSlug = (label: string) =>
  fields.slug({
    name: { label, validation: { isRequired: true } },
    slug: {
      label: 'Slug (file name)',
      generate: slugOf,
      validation: {
        pattern: { regex: SLUG_PATTERN, message: 'Lowercase Latin letters, digits and hyphens.' },
      },
    },
  });

/**
 * Builds a select field from a list of allowed values; each option is labelled with its value.
 * @param label - Field label.
 * @param values - Allowed values; the first is the default.
 */
const selectOf = (label: string, values: readonly [string, ...string[]]) =>
  fields.select({
    label,
    options: values.map((value) => ({ label: value, value })),
    defaultValue: values[0],
  });

const requiredText = (label: string, options: { multiline?: boolean } = {}) =>
  fields.text({ label, multiline: options.multiline ?? false, validation: { isRequired: true } });

const optionalText = (label: string, options: { multiline?: boolean } = {}) =>
  fields.text({ label, multiline: options.multiline ?? false });

const requiredDate = (label: string) => fields.date({ label, validation: { isRequired: true } });

/** A citation: a name and an https URL (`sourceSchema`). */
const source = (label: string) =>
  fields.object(
    {
      name: requiredText('Name'),
      url: fields.url({ label: 'URL', validation: { isRequired: true } }),
    },
    { label },
  );

const sourceList = (label: string) =>
  fields.array(source('Source'), {
    label,
    itemLabel: (props) => props.fields.name.value || 'Source',
    validation: { length: { min: 1 } },
  });

/**
 * A block that Keystatic keeps byte-for-byte as it is in the YAML file but does not edit, because
 * Keystatic cannot leave an optional nested object out of the file. Edit it in the YAML directly.
 */
const keptAsIs = () => fields.ignored();

const produce = collection({
  label: 'Produce',
  path: entriesIn('produce'),
  format: YAML,
  slugField: 'name',
  columns: ['kind', 'updatedAt'],
  schema: {
    name: nameAndSlug('Name'),
    latinName: optionalText('Latin name'),
    kind: selectOf('Kind', PRODUCE_KINDS),
    group: fields.relationship({
      label: 'Group',
      collection: 'groups',
      validation: { isRequired: true },
    }),
    summary: fields.text({
      label: 'Summary',
      multiline: true,
      validation: {
        isRequired: true,
        length: { min: PRODUCE_SUMMARY_MIN_LENGTH, max: PRODUCE_SUMMARY_MAX_LENGTH },
      },
    }),
    varieties: fields.array(
      fields.object({ name: requiredText('Name'), note: optionalText('Note') }),
      { label: 'Varieties', itemLabel: (props) => props.fields.name.value || 'Variety' },
    ),
    season: fields.array(
      fields.object({
        month: fields.integer({
          label: 'Month',
          validation: { isRequired: true, min: FIRST_MONTH_NUMBER, max: LAST_MONTH_NUMBER },
        }),
        level: selectOf('Level', SEASON_LEVEL_VALUES),
      }),
      {
        label: 'Season',
        itemLabel: (props) => `${props.fields.month.value ?? '?'}: ${props.fields.level.value}`,
        validation: { length: { min: 1 } },
      },
    ),
    regions: fields.array(
      fields.object({
        region: fields.relationship({
          label: 'Province',
          collection: 'regions',
          validation: { isRequired: true },
        }),
        note: requiredText('Note', { multiline: true }),
        source: keptAsIs(),
      }),
      { label: 'Regions', itemLabel: (props) => props.fields.region.value ?? 'Province' },
    ),
    nutrition: keptAsIs(),
    preparation: fields.array(
      fields.object({
        method: requiredText('Method'),
        tip: requiredText('Tip', { multiline: true }),
      }),
      { label: 'Preparation', itemLabel: (props) => props.fields.method.value || 'Method' },
    ),
    traditionalUses: fields.array(
      fields.object({
        system: selectOf('System', TRADITIONAL_SYSTEMS),
        use: fields.text({
          label: 'Use (starts with „Традиционно се използва“)',
          multiline: true,
          validation: { isRequired: true },
        }),
        source: source('Source'),
      }),
      { label: 'Traditional uses', itemLabel: (props) => props.fields.system.value },
    ),
    howToChoose: optionalText('How to choose', { multiline: true }),
    storage: optionalText('Storage', { multiline: true }),
    faq: fields.array(
      fields.object({
        question: requiredText('Question'),
        answer: requiredText('Answer', { multiline: true }),
      }),
      { label: 'FAQ', itemLabel: (props) => props.fields.question.value || 'Question' },
    ),
    updatedAt: requiredDate('Updated at'),
    photo: keptAsIs(),
    growing: keptAsIs(),
    organic: keptAsIs(),
  },
});

const groups = collection({
  label: 'Groups',
  path: entriesIn('groups'),
  format: YAML,
  slugField: 'name',
  schema: {
    name: nameAndSlug('Name'),
    latinName: requiredText('Latin name'),
    description: requiredText('Description', { multiline: true }),
  },
});

const nutrients = collection({
  label: 'Nutrients',
  path: entriesIn('nutrients'),
  format: YAML,
  slugField: 'name',
  schema: {
    name: nameAndSlug('Name'),
    kind: selectOf('Kind', NUTRIENT_KINDS),
    unit: selectOf('Unit', NUTRIENT_UNITS),
    referenceIntake: fields.number({
      label: 'Reference intake',
      validation: { isRequired: true, min: 0 },
    }),
    claims: fields.array(requiredText('Claim (no full stop)'), {
      label: 'Claims',
      itemLabel: (props) => props.value,
      validation: { length: { min: 1 } },
    }),
    claimsSource: source('Claims source'),
    note: optionalText('Note', { multiline: true }),
  },
});

const regions = collection({
  label: 'Regions',
  path: entriesIn('regions'),
  format: YAML,
  slugField: 'name',
  schema: {
    name: nameAndSlug('Name'),
    profile: keptAsIs(),
  },
});

const farms = collection({
  label: 'Farms',
  path: entriesIn('farms'),
  format: YAML,
  slugField: 'name',
  columns: ['region'],
  schema: {
    name: nameAndSlug('Name'),
    region: fields.relationship({
      label: 'Province',
      collection: 'regions',
      validation: { isRequired: true },
    }),
    produce: fields.multiRelationship({
      label: 'Produce',
      collection: 'produce',
      validation: { length: { min: 1 } },
    }),
    description: requiredText('Description', { multiline: true }),
    contact: fields.object(
      {
        website: fields.url({ label: 'Website' }),
        email: optionalText('Email'),
        phone: optionalText('Phone (+359…)'),
      },
      { label: 'Contact (at least one)' },
    ),
    address: optionalText('Address'),
    sponsored: fields.checkbox({ label: 'Sponsored' }),
    sources: fields.array(fields.url({ label: 'URL', validation: { isRequired: true } }), {
      label: 'Sources',
      itemLabel: (props) => props.value ?? 'URL',
      validation: { length: { min: 1 } },
    }),
    organic: keptAsIs(),
  },
});

const recipes = collection({
  label: 'Recipes',
  path: entriesIn('recipes'),
  format: YAML,
  slugField: 'title',
  columns: ['category', 'updatedAt'],
  schema: {
    title: nameAndSlug('Title'),
    summary: fields.text({
      label: 'Summary',
      multiline: true,
      validation: {
        isRequired: true,
        length: { min: DESCRIPTION_MIN_LENGTH, max: DESCRIPTION_MAX_LENGTH },
      },
    }),
    category: selectOf('Category', RECIPE_CATEGORIES),
    produce: fields.multiRelationship({
      label: 'Produce',
      collection: 'produce',
      validation: { length: { min: 1 } },
    }),
    yield: requiredText('Yield'),
    prepMinutes: fields.integer({ label: 'Preparation (minutes)', validation: { min: 0 } }),
    cookMinutes: fields.integer({ label: 'Cooking (minutes)', validation: { min: 0 } }),
    processingMinutes: fields.integer({
      label: 'Processing (minutes)',
      validation: { isRequired: true, min: 0 },
    }),
    waitDays: fields.integer({ label: 'Wait (days)', validation: { min: 0 } }),
    ingredients: fields.array(
      fields.object({
        name: requiredText('Name'),
        quantity: fields.number({ label: 'Quantity', validation: { isRequired: true, min: 0 } }),
        unit: selectOf('Unit', INGREDIENT_UNITS),
      }),
      {
        label: 'Ingredients',
        itemLabel: (props) => props.fields.name.value || 'Ingredient',
        validation: { length: { min: 1 } },
      },
    ),
    steps: fields.array(requiredText('Step', { multiline: true }), {
      label: 'Steps',
      itemLabel: (props) => props.value,
      validation: { length: { min: 1 } },
    }),
    safety: fields.object(
      {
        note: requiredText('Note'),
        sterilisation: requiredText('Sterilisation'),
        storage: requiredText('Storage'),
        sources: sourceList('Safety sources'),
      },
      { label: 'Safety' },
    ),
    sources: sourceList('Sources'),
    publishedAt: requiredDate('Published at'),
    updatedAt: requiredDate('Updated at'),
  },
});

const sponsors = collection({
  label: 'Sponsors',
  path: entriesIn('sponsors'),
  format: YAML,
  slugField: 'name',
  columns: ['placement', 'from', 'to'],
  schema: {
    name: nameAndSlug('Name'),
    image: fields.text({
      label: 'Banner path',
      description: `A 4:1 image in ${SPONSOR_IMAGE_DIRECTORY}/, written as ${SPONSOR_IMAGE_PUBLIC_PATH}<id>.jpg`,
      validation: { isRequired: true },
    }),
    alt: requiredText('Alternative text (Bulgarian)'),
    url: fields.url({ label: 'URL', validation: { isRequired: true } }),
    placement: selectOf('Placement', AD_PLACEMENTS),
    from: requiredDate('From'),
    to: requiredDate('To'),
  },
});

/**
 * Keystatic configuration for local editing in `astro dev` (ADR-0008, spec 054). Each collection
 * reads and writes the same YAML files as the Astro content collection of the same name.
 */
export default config({
  storage: { kind: 'local' },
  ui: { brand: { name: 'Sezon' } },
  collections: { produce, groups, nutrients, regions, farms, recipes, sponsors },
});
