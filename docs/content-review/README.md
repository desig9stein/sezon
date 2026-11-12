# Content review

Status of the editorial review of each produce (issue #10). A produce gets `reviewStatus: reviewed`
only after the reviewer (Marin Popov) has checked every open item and signed off below. Until then
its page shows „Данните очакват редакторска проверка“.

## What is already verified

- **Nutrition values (2026-11-12):** every value equals the USDA FoodData Central SR Legacy record
  cited by the produce (April 2018 release). `tests/unit/content/usda-nutrition.test.ts` checks
  this in the unit tests (CI) against `tests/fixtures/usda/sr-legacy-extract.json`.
- **Traditional uses (2026-11-12):** the three uses that cited Wikipedia (dill, parsley, cabbage) were
  removed, because no primary source was found. New uses need a primary source (not Wikipedia).
- **Growing regions (2026-11-12, spec 033):** apples, pears, walnuts and cabbage list the provinces
  that lead the МЗХ agrostatistics surveys (orchard structure 2023, vegetables 2022), with the
  figures and the source in each note. The other nine products have no official provincial data
  (the surveys count them nationally or under „other vegetables“), so their region notes stay
  editorial.
- **EFSA-sourced nutrition:** a produce that cites EFSA instead of USDA is not machine-checked; mark
  it as such in its row. Today every produce cites USDA.

## Open items per produce

| Produce    | Name     | Nutrition                                                              | Traditional uses | Open items for the reviewer                                                                                          | Signed off |
| ---------- | -------- | ---------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------- | ---------- |
| `dyuli`    | Дюли     | ✓ FDC [168163](https://fdc.nal.usda.gov/food-details/168163/nutrients) | 0                | Seasons by month (no official provincial data: region notes are editorial)                                           | ☐          |
| `kopar`    | Копър    | ✓ FDC [172233](https://fdc.nal.usda.gov/food-details/172233/nutrients) | 0                | Seasons by month (no official provincial data: region notes are editorial)                                           | ☐          |
| `krushi`   | Круши    | ✓ FDC [169118](https://fdc.nal.usda.gov/food-details/169118/nutrients) | 0                | Seasons by month (regions verified: МЗХ agrostatistics)                                                              | ☐          |
| `magdanoz` | Магданоз | ✓ FDC [170416](https://fdc.nal.usda.gov/food-details/170416/nutrients) | 0                | Seasons by month (no official provincial data: region notes are editorial)                                           | ☐          |
| `morkovi`  | Моркови  | ✓ FDC [170393](https://fdc.nal.usda.gov/food-details/170393/nutrients) | 0                | Seasons by month (no official provincial data: region notes are editorial)                                           | ☐          |
| `orehi`    | Орехи    | ✓ FDC [170187](https://fdc.nal.usda.gov/food-details/170187/nutrients) | 0                | Seasons by month (regions verified: МЗХ agrostatistics)                                                              | ☐          |
| `praz`     | Праз     | ✓ FDC [169246](https://fdc.nal.usda.gov/food-details/169246/nutrients) | 0                | Seasons by month (no official provincial data: region notes are editorial); replace Wikipedia in the growing sources | ☐          |
| `spanak`   | Спанак   | ✓ FDC [168462](https://fdc.nal.usda.gov/food-details/168462/nutrients) | 0                | Seasons by month (no official provincial data: region notes are editorial)                                           | ☐          |
| `tikva`    | Тиква    | ✓ FDC [168448](https://fdc.nal.usda.gov/food-details/168448/nutrients) | 0                | Seasons by month (no official provincial data: region notes are editorial)                                           | ☐          |
| `tselina`  | Целина   | ✓ FDC [170400](https://fdc.nal.usda.gov/food-details/170400/nutrients) | 0                | Seasons by month (no official provincial data: region notes are editorial)                                           | ☐          |
| `tsveklo`  | Цвекло   | ✓ FDC [169145](https://fdc.nal.usda.gov/food-details/169145/nutrients) | 0                | Seasons by month (no official provincial data: region notes are editorial)                                           | ☐          |
| `yabalki`  | Ябълки   | ✓ FDC [171688](https://fdc.nal.usda.gov/food-details/171688/nutrients) | 0                | Seasons by month (regions verified: МЗХ agrostatistics)                                                              | ☐          |
| `zele`     | Зеле     | ✓ FDC [169975](https://fdc.nal.usda.gov/food-details/169975/nutrients) | 0                | Seasons by month (regions verified: МЗХ agrostatistics)                                                              | ☐          |

### How to check the open items

- **Seasons by month:** compare the `season` levels with a Bulgarian source (e.g. the Ministry of
  Agriculture's agrarian reports, regional market bulletins or a specialised publication). Add the
  source to the produce or note it here.
- **Regions:** for the four sourced products, compare the notes with the cited МЗХ tables. For the
  others, confirm the editorial notes or remove a province you cannot support.
- **Sign-off:** when every item is checked, set `reviewStatus: reviewed` and `updatedAt` in the
  produce file and tick the row.

## Regenerating the USDA extract

When a produce is added or its FDC record changes:

1. Download the SR Legacy CSV release:
   `https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip`
   and unzip it outside the repository.
2. Run `pnpm content:usda <unzipped-directory>`.
3. Commit the updated `tests/fixtures/usda/sr-legacy-extract.json`.
