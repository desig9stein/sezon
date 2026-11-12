# Content sources

What is sourced and what is editorial for each produce (issue #10). There is no review status or
approval step (spec 034): a fact either has a source or the methodology page says it is editorial.

## What is already verified

- **Nutrition values (2026-11-12):** every value equals the USDA FoodData Central SR Legacy record
  cited by the produce (April 2018 release). `tests/unit/content/usda-nutrition.test.ts` checks
  this in the unit tests (CI) against `tests/fixtures/usda/sr-legacy-extract.json`.
- **Traditional uses (2026-11-12):** the three uses that cited Wikipedia (dill, parsley, cabbage) were
  removed, because no primary source was found. New uses need a primary source (not Wikipedia).
- **Growing regions (2026-11-12, spec 033):** apples, pears and walnuts list the provinces that lead
  the МЗХ orchard structure survey (2023), with the figures and the source in each note. Cabbage
  data exists only by NUTS2 region: Plovdiv and Pazardzhik are in the South Central region, which
  has over half of the harvested open-field area (2022), but the provinces themselves are not
  ranked. The other nine products have no official provincial data (the surveys count them
  nationally, under „other vegetables“, or not at all, like quince), so their region notes stay
  editorial.
- **EFSA-sourced nutrition:** a produce that cites EFSA instead of USDA is not machine-checked; mark
  it as such in its row. Today every produce cites USDA.

## Per produce

| Produce    | Name     | Nutrition                                                              | Traditional uses | Editorial parts                                                                                                                   |
| ---------- | -------- | ---------------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `dyuli`    | Дюли     | ✓ FDC [168163](https://fdc.nal.usda.gov/food-details/168163/nutrients) | 0                | Seasons; region notes (no official provincial data). Growing guide cites gradinata.bg (spec 035)                                  |
| `kopar`    | Копър    | ✓ FDC [172233](https://fdc.nal.usda.gov/food-details/172233/nutrients) | 0                | Seasons; region notes (no official provincial data). Growing guide cites gradinata.bg (spec 035)                                  |
| `krushi`   | Круши    | ✓ FDC [169118](https://fdc.nal.usda.gov/food-details/169118/nutrients) | 0                | Seasons (regions verified: МЗХ agrostatistics). Growing guide cites gradinata.bg (spec 035)                                       |
| `magdanoz` | Магданоз | ✓ FDC [170416](https://fdc.nal.usda.gov/food-details/170416/nutrients) | 0                | Seasons; region notes (no official provincial data). Growing guide cites gradinata.bg (spec 035)                                  |
| `morkovi`  | Моркови  | ✓ FDC [170393](https://fdc.nal.usda.gov/food-details/170393/nutrients) | 0                | Seasons; region notes (no official provincial data)                                                                               |
| `orehi`    | Орехи    | ✓ FDC [170187](https://fdc.nal.usda.gov/food-details/170187/nutrients) | 0                | Seasons (regions verified: МЗХ agrostatistics). Growing guide cites gradinata.bg (spec 035)                                       |
| `praz`     | Праз     | ✓ FDC [169246](https://fdc.nal.usda.gov/food-details/169246/nutrients) | 0                | Seasons; region notes (no official provincial data). Growing guide from Wikipedia only (spec 034)                                 |
| `spanak`   | Спанак   | ✓ FDC [168462](https://fdc.nal.usda.gov/food-details/168462/nutrients) | 0                | Seasons; region notes (no official provincial data)                                                                               |
| `tikva`    | Тиква    | ✓ FDC [168448](https://fdc.nal.usda.gov/food-details/168448/nutrients) | 0                | Seasons; region notes (no official provincial data). Growing guide cites gradinata.bg (spec 035)                                  |
| `tselina`  | Целина   | ✓ FDC [170400](https://fdc.nal.usda.gov/food-details/170400/nutrients) | 0                | Seasons; region notes (no official provincial data). Growing guide cites gradinata.bg (spec 035)                                  |
| `tsveklo`  | Цвекло   | ✓ FDC [169145](https://fdc.nal.usda.gov/food-details/169145/nutrients) | 0                | Seasons; region notes (no official provincial data). Growing guide cites gradinata.bg (spec 035)                                  |
| `yabalki`  | Ябълки   | ✓ FDC [171688](https://fdc.nal.usda.gov/food-details/171688/nutrients) | 0                | Seasons (regions verified: МЗХ agrostatistics). Growing guide cites gradinata.bg (spec 035)                                       |
| `zele`     | Зеле     | ✓ FDC [169975](https://fdc.nal.usda.gov/food-details/169975/nutrients) | 0                | Seasons (regions supported at NUTS2 level: South Central region; no provincial data). Growing guide cites gradinata.bg (spec 035) |

### Where to look for sources

- **Seasons by month:** no official monthly calendar per produce was found (search of 2026-11-12):
  - the МЗХ „Агростатистика“ surveys give yearly areas and yields, not months;
  - the МЗХ market situation reports mention harvest timing only in passing (e.g. „Ситуация на
    пазара на пресни плодове и зеленчуци – юни 2024“: open-field cabbage harvest „в ранна фаза“ in
    June);
  - SAPI price reports are paid and not public;
  - the research institutes publish variety studies without harvest months that can be cited.

  The levels therefore stay editorial, as the methodology page says. Where a Bulgarian source
  turns up, add it to the produce or note it here.

- **Regions:** the four sourced products follow the cited МЗХ tables. For the others, add a source
  when official provincial data appears.

## Regenerating the USDA extract

When a produce is added or its FDC record changes:

1. Download the SR Legacy CSV release:
   `https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip`
   and unzip it outside the repository.
2. Run `pnpm content:usda <unzipped-directory>`.
3. Commit the updated `tests/fixtures/usda/sr-legacy-extract.json`.
