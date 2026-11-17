import { describe, expect, it } from 'vitest';
import { townsByAltitudeBand } from '@contexts/recipes';

const BANDS = [
  { fromMetres: 300, minutes: 30 },
  { fromMetres: 900, minutes: 35 },
  { fromMetres: 1800, minutes: 40 },
] as const;

const TOWNS = [
  { name: 'Варна', fromMetres: 0, toMetres: 49 },
  { name: 'Добрич', fromMetres: 200, toMetres: 299 },
  { name: 'Благоевград', fromMetres: 300, toMetres: 499 },
  { name: 'София', fromMetres: 500, toMetres: 699 },
  { name: 'Смолян', fromMetres: 700, toMetres: 999 },
  { name: 'Планинско', fromMetres: 1000 },
] as const;

describe('townsByAltitudeBand (spec 061)', () => {
  it('AC4: puts each town in the band its whole altitude group lies in', () => {
    const { bands } = townsByAltitudeBand(25, BANDS, TOWNS);
    expect(
      bands.map(({ fromMetres, toMetres, minutes, towns }) => [
        fromMetres,
        toMetres,
        minutes,
        towns.map((town) => town.name),
      ]),
    ).toEqual([
      [0, 300, 25, ['Варна', 'Добрич']],
      [300, 900, 30, ['Благоевград', 'София']],
      [900, 1800, 35, []],
      [1800, undefined, 40, []],
    ]);
  });

  it('AC4: names the towns whose group spans two or more bands, with those bands', () => {
    const { spanning } = townsByAltitudeBand(25, BANDS, TOWNS);
    expect(
      spanning.map(({ town, bands }) => [town.name, bands.map((band) => band.minutes)]),
    ).toEqual([
      ['Смолян', [30, 35]],
      ['Планинско', [35, 40]],
    ]);
  });

  it('AC4: with one higher band, a 1000+ group spans nothing above 300 m', () => {
    const { bands, spanning } = townsByAltitudeBand(5, [{ fromMetres: 300, minutes: 10 }], TOWNS);
    expect(bands.map((band) => band.towns.length)).toEqual([2, 4]);
    expect(spanning).toEqual([]);
  });
});
