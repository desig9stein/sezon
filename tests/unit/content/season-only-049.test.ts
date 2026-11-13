import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { testImage } from '@tests/fixtures/photos';

const GUIDE = readFileSync('docs/CONTENT-GUIDE.md', 'utf8');
const MINIMAL_HEADING = '### Minimal entry';

/** Returns the first YAML code block after `heading` in the content guide. */
function yamlAfter(heading: string): string {
  const start = GUIDE.indexOf(heading);
  const block = /```yaml\n([\s\S]*?)```/.exec(GUIDE.slice(start));
  return start === -1 ? '' : (block?.[1] ?? '');
}

describe('season-only mandatory produce in the content guide (spec 049)', () => {
  it('AC16: shows a minimal entry that the schema accepts', () => {
    const minimal = parse(yamlAfter(MINIMAL_HEADING)) as Record<string, unknown>;
    expect(Object.keys(minimal).sort()).toEqual(
      ['group', 'kind', 'name', 'season', 'summary', 'updatedAt'].sort(),
    );
    expect(produceSchemaWith({ image: testImage }).safeParse(minimal).success).toBe(true);
  });

  it.each([
    'latinName',
    'varieties',
    'regions',
    'nutrition',
    'preparation',
    'traditionalUses',
    'howToChoose',
    'storage',
    'faq',
    'photo',
    'growing',
    'organic',
  ])('AC16: says what the optional `%s` adds', (field) => {
    const section = GUIDE.slice(GUIDE.indexOf('### Optional blocks'));
    expect(section).toMatch(new RegExp(`^\\| \`${field}\` +\\|`, 'm'));
  });
});
