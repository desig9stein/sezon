# Content review

Status of the editorial review of each produce (issue #10). A produce gets `reviewStatus: reviewed`
only after the reviewer (Марин Попов) has checked every open item and signed off below. Until then
its page shows „Данните очакват редакторска проверка“.

## What is already verified

- **Nutrition values (2026-11-12):** every value equals the USDA FoodData Central SR Legacy record
  cited by the produce (April 2018 release). `tests/unit/content/usda-nutrition.test.ts` checks
  this on every build against `tests/fixtures/usda/sr-legacy-extract.json`.
- **Traditional uses (2026-11-12):** the three uses that cited Wikipedia (dill, parsley, cabbage) were
  removed, because no primary source was found. New uses need a primary source (not Wikipedia).

## Open items per produce

| Produce    | Name     | Nutrition                                                              | Traditional uses | Open items for the reviewer                                         | Signed off |
| ---------- | -------- | ---------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------- | ---------- |
| `dyuli`    | Дюли     | ✓ FDC [168163](https://fdc.nal.usda.gov/food-details/168163/nutrients) | 0                | Seasons by month; regions                                           | ☐          |
| `kopar`    | Копър    | ✓ FDC [172233](https://fdc.nal.usda.gov/food-details/172233/nutrients) | 0                | Seasons by month; regions                                           | ☐          |
| `krushi`   | Круши    | ✓ FDC [169118](https://fdc.nal.usda.gov/food-details/169118/nutrients) | 0                | Seasons by month; regions                                           | ☐          |
| `magdanoz` | Магданоз | ✓ FDC [170416](https://fdc.nal.usda.gov/food-details/170416/nutrients) | 0                | Seasons by month; regions                                           | ☐          |
| `morkovi`  | Моркови  | ✓ FDC [170393](https://fdc.nal.usda.gov/food-details/170393/nutrients) | 0                | Seasons by month; regions                                           | ☐          |
| `orehi`    | Орехи    | ✓ FDC [170187](https://fdc.nal.usda.gov/food-details/170187/nutrients) | 0                | Seasons by month; regions                                           | ☐          |
| `praz`     | Праз     | ✓ FDC [169246](https://fdc.nal.usda.gov/food-details/169246/nutrients) | 0                | Seasons by month; regions; replace Wikipedia in the growing sources | ☐          |
| `spanak`   | Спанак   | ✓ FDC [168462](https://fdc.nal.usda.gov/food-details/168462/nutrients) | 0                | Seasons by month; regions                                           | ☐          |
| `tikva`    | Тиква    | ✓ FDC [168448](https://fdc.nal.usda.gov/food-details/168448/nutrients) | 0                | Seasons by month; regions                                           | ☐          |
| `tselina`  | Целина   | ✓ FDC [170400](https://fdc.nal.usda.gov/food-details/170400/nutrients) | 0                | Seasons by month; regions                                           | ☐          |
| `tsveklo`  | Цвекло   | ✓ FDC [169145](https://fdc.nal.usda.gov/food-details/169145/nutrients) | 0                | Seasons by month; regions                                           | ☐          |
| `yabalki`  | Ябълки   | ✓ FDC [171688](https://fdc.nal.usda.gov/food-details/171688/nutrients) | 0                | Seasons by month; regions                                           | ☐          |
| `zele`     | Зеле     | ✓ FDC [169975](https://fdc.nal.usda.gov/food-details/169975/nutrients) | 0                | Seasons by month; regions                                           | ☐          |

### How to check the open items

- **Seasons by month:** compare the `season` levels with a Bulgarian source (e.g. the Ministry of
  Agriculture's agrarian reports, regional market bulletins or a specialised publication). Add the
  source to the produce or note it here.
- **Regions:** check that each `regions` entry is a province where the produce is grown
  commercially (agrarian reports, NSI regional statistics).
- **Sign-off:** when every item is checked, set `reviewStatus: reviewed` and `updatedAt` in the
  produce file and tick the row.

## Regenerating the USDA extract

When a produce is added or its FDC record changes:

1. Download the SR Legacy CSV release:
   `https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip`
   and unzip it outside the repository.
2. Run `node scripts/content/usda-extract.ts <unzipped-directory>`.
3. Commit the updated `tests/fixtures/usda/sr-legacy-extract.json`.
