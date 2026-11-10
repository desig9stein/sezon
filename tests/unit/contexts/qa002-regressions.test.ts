import { describe, expect, it } from 'vitest';
import { Nutrient, NutritionFacts } from '@contexts/catalog';
import { produceSchema } from '@contexts/catalog/infrastructure/schemas';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { ContactInfo } from '@contexts/farms';
import { farmSchema } from '@contexts/farms/infrastructure/schemas';
import { IndexedRepository } from '@shared/infrastructure/IndexedRepository';
import {
  InvalidContactInfoError,
  InvalidNutrientError,
  InvalidProduceError,
} from '@shared/domain/errors';
import { farmRecord, produceRecord } from '@tests/fixtures/records';

describe('QA 002 regressions', () => {
  describe('updatedAt', () => {
    it.each([null, true, 0, '2026', '11/10/2026', '10.11.2026', ''])('rejects %o', (value) => {
      expect(produceSchema.safeParse({ ...produceRecord(), updatedAt: value }).success).toBe(false);
    });

    it('accepts an ISO date string and a Date', () => {
      expect(
        produceSchema.parse({ ...produceRecord(), updatedAt: '2026-11-10' }).updatedAt,
      ).toEqual(new Date('2026-11-10'));
      expect(
        produceSchema.safeParse({ ...produceRecord(), updatedAt: new Date('2026-11-10') }).success,
      ).toBe(true);
    });

    it('does not expose a mutable Date on Produce', () => {
      const produce = toProduce('zele', produceRecord());
      produce.updatedAt.setFullYear(1999);
      expect(produce.updatedAt.getFullYear()).toBe(2026);
    });

    it('rejects an invalid date in the domain', () => {
      expect(() => toProduce('zele', produceRecord({ updatedAt: new Date(Number.NaN) }))).toThrow(
        InvalidProduceError,
      );
    });
  });

  describe('strict schemas', () => {
    it('rejects unknown top-level and nested produce keys', () => {
      expect(produceSchema.safeParse({ ...produceRecord(), sumary: 'x' }).success).toBe(false);
      expect(
        produceSchema.safeParse({
          ...produceRecord(),
          nutrition: { ...produceRecord().nutrition, sugarG: 99 },
        }).success,
      ).toBe(false);
    });

    it('rejects unknown farm keys', () => {
      expect(farmSchema.safeParse({ ...farmRecord(), adress: 'x' }).success).toBe(false);
      expect(
        farmSchema.safeParse({ ...farmRecord(), contact: { webiste: 'https://example.com' } })
          .success,
      ).toBe(false);
    });
  });

  describe('schema details', () => {
    it('rejects a summary with a line break', () => {
      const summary = `${'а'.repeat(40)}\n${'б'.repeat(40)}`;
      expect(produceSchema.safeParse({ ...produceRecord(), summary }).success).toBe(false);
    });

    it('requires the traditional-use prefix as whole words', () => {
      const use = 'Традиционно се използвалоооо при всичко.';
      const record = produceRecord();
      const traditionalUses = [{ ...record.traditionalUses[0], use }];
      expect(produceSchema.safeParse({ ...record, traditionalUses }).success).toBe(false);
    });

    it('rejects sugars greater than carbohydrates', () => {
      const nutrition = { ...produceRecord().nutrition, sugarsG: 10, carbohydrateG: 5 };
      expect(produceSchema.safeParse({ ...produceRecord(), nutrition }).success).toBe(false);
    });

    it.each(['https://a', 'https://localhost', 'https:example.com'])('rejects url %s', (url) => {
      const nutrition = { ...produceRecord().nutrition, source: { name: 'X', url } };
      expect(produceSchema.safeParse({ ...produceRecord(), nutrition }).success).toBe(false);
    });

    it('accepts only Bulgarian phone numbers', () => {
      const withPhone = (phone: string) => farmRecord({ contact: { phone } });
      expect(farmSchema.safeParse(withPhone('+14155550123')).success).toBe(false);
      expect(farmSchema.safeParse(withPhone('+359888123456')).success).toBe(true);
    });
  });

  describe('domain invariants', () => {
    it.each([
      [{ website: '', email: '', phone: '' }],
      [{ website: 'http://example.com' }],
      [{ phone: '0888 123 456' }],
      [{ email: 'not-an-email' }],
    ])('ContactInfo rejects %o', (input) => {
      expect(() => ContactInfo.create(input)).toThrow(InvalidContactInfoError);
    });

    it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
      'Nutrient rejects reference intake %s',
      (referenceIntake) => {
        expect(() =>
          Nutrient.create({
            slug: 'vitamin-c',
            name: 'Витамин C',
            kind: 'vitamin',
            unit: 'mg',
            referenceIntake,
            description: 'x',
          }),
        ).toThrow(InvalidNutrientError);
      },
    );

    it.each([-40, Number.NaN])('percentOfReferenceIntake rejects %s', (amount) => {
      const nutrient = Nutrient.create({
        slug: 'vitamin-c',
        name: 'Витамин C',
        kind: 'vitamin',
        unit: 'mg',
        referenceIntake: 80,
        description: 'x',
      });
      expect(() => nutrient.percentOfReferenceIntake(amount)).toThrow(InvalidNutrientError);
    });

    it('nutrition facts and contact info are nominal types', () => {
      // @ts-expect-error a plain object must not satisfy NutritionFacts
      const facts: NutritionFacts = { energyKcal: -1 };
      // @ts-expect-error a plain object must not satisfy ContactInfo
      const contact: ContactInfo = { website: undefined, email: undefined, phone: undefined };
      expect(facts).toBeDefined();
      expect(contact).toBeDefined();
    });
  });

  describe('IndexedRepository', () => {
    it('retries the loader after a failed load', async () => {
      let calls = 0;
      const repository = new IndexedRepository(async () => {
        calls += 1;
        if (calls === 1) throw new Error('transient');
        return [{ slug: 'zele', name: 'Зеле' }];
      });
      await expect(repository.all()).rejects.toThrow('transient');
      expect((await repository.all()).map((item) => item.slug)).toEqual(['zele']);
      expect(calls).toBe(2);
    });

    it('breaks ties between equal names by slug', async () => {
      const repository = new IndexedRepository(async () => [
        { slug: 'b', name: 'Ябълки' },
        { slug: 'a', name: 'Ябълки' },
      ]);
      expect((await repository.all()).map((item) => item.slug)).toEqual(['a', 'b']);
    });
  });
});
