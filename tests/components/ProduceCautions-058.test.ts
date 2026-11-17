import { describe, expect, it } from 'vitest';
import { Window } from 'happy-dom';
import ProduceCautions from '@components/produce/ProduceCautions.astro';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { testImage } from '@tests/fixtures/photos';
import { CAUTION_SOURCE, MINIMAL_PRODUCE_INPUT, WILD_PRODUCE_INPUT } from '@tests/fixtures/records';
import { render } from './render';

const schema = produceSchemaWith({ image: testImage });
const EMERGENCY_PATTERN = /112.*Пирогов/s;
const GATHERING_NOTE_START = 'Събирай само';

const cultivatedWith = (kind: string) =>
  toProduce(
    'kesteni',
    schema.parse({
      ...MINIMAL_PRODUCE_INPUT,
      cautions: [
        {
          kind,
          text: 'Тестов текст на предупреждение с достатъчна дължина.',
          source: CAUTION_SOURCE,
        },
      ],
    }),
  );

async function calloutOf(produce: ReturnType<typeof toProduce>) {
  const html = await render(ProduceCautions, { produce });
  const window = new Window();
  window.document.write(`<main>${html}</main>`);
  return window.document.querySelector('section.cautions');
}

const paragraphs = (callout: Awaited<ReturnType<typeof calloutOf>>) =>
  [...(callout?.querySelectorAll('p') ?? [])].map((p) => p.textContent?.trim() ?? '');

describe('emergency line in the cautions callout (spec 058)', () => {
  it('AC4: a wild produce shows the gathering note, then the emergency line, then the list', async () => {
    const callout = await calloutOf(toProduce('gluharche', schema.parse(WILD_PRODUCE_INPUT)));
    const [note, emergency] = paragraphs(callout);
    expect(note?.startsWith(GATHERING_NOTE_START)).toBe(true);
    expect(emergency).toMatch(EMERGENCY_PATTERN);
    const emergencyParagraph = callout?.querySelectorAll('p')[1];
    const list = callout?.querySelector('ul');
    expect(
      emergencyParagraph !== undefined &&
        list !== null &&
        list !== undefined &&
        (emergencyParagraph.compareDocumentPosition(list) & 4) === 4,
    ).toBe(true);
  });

  it.each(['look-alike', 'toxic-part'])(
    'AC4: a cultivated produce with a %s caution shows the emergency line',
    async (kind) => {
      const callout = await calloutOf(cultivatedWith(kind));
      const texts = paragraphs(callout);
      expect(texts.some((text) => EMERGENCY_PATTERN.test(text))).toBe(true);
      expect(texts.some((text) => text.startsWith(GATHERING_NOTE_START))).toBe(false);
    },
  );

  it.each(['allergy', 'protected', 'preparation'])(
    'AC4: a cultivated produce whose only caution is %s has no emergency line',
    async (kind) => {
      const callout = await calloutOf(cultivatedWith(kind));
      expect(callout).not.toBeNull();
      expect(paragraphs(callout).some((text) => EMERGENCY_PATTERN.test(text))).toBe(false);
    },
  );

  it('AC4: a produce without cautions renders no callout', async () => {
    const callout = await calloutOf(toProduce('ryapa', schema.parse(MINIMAL_PRODUCE_INPUT)));
    expect(callout).toBeNull();
  });
});
