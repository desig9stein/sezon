# 042. Produce without growing regions

- **Status:** Approved
- **Bounded context(s):** catalog (content model), UI (produce page)
- **Related:** issues #39, #40 and #41 (new produce), specs 029 and 033 (sourced regions), the „no
  invented data“ rule

## 1. Goal

Every produce must list at least one growing region. For produce such as courgettes, green beans,
okra and wild plants, official statistics name no province: МЗХ counts them only nationally or
under „other vegetables“. A region note without a source would break the „no invented data“ rule.

This change makes the region list optional. A produce page without regions says that there are no
official data by province and shows no map.

## 2. User stories

- As a reader, I want to know when no official data names the provinces where a produce grows,
  instead of reading an unsourced claim.
- As a content author, I want to add a produce without inventing a region.

## 3. Scope

### In scope

- **Schema:** `regions` may be empty (it is still unique by region).
- **Produce page:** the regions section moves to a component, `GrowingRegions.astro`.
  - With regions, it renders the list and the linked map as before.
  - With none, it renders „Няма официални данни по области за този продукт.“, with no map and no
    empty list.
  - The heading and the link to the farms stay.
- **Content guide:** documents when the list may be empty.

### Out of scope

- Removing regions from existing produce.

## 4. Domain model

No change. `Produce.growingRegions` may already be empty.

## 5. Behaviour and edge cases

- `RegionPagesQuery` counts only produce with that region. A produce without regions appears on no
  region page.
- Readable without CSS: the sentence follows the heading.

## 6. Accessibility requirements

- The heading order is unchanged.
- No empty `<ul>` and no map without content.

## 7. SEO requirements

No change.

## 8. Acceptance criteria

1. **AC1:** Given a produce record with `regions: []`, when parsed, then it is valid. Duplicate
   regions are still rejected.
2. **AC2:** Given `GrowingRegions` with regions, then it renders a list item per region, with the
   link and the note, and the map.
3. **AC3:** Given `GrowingRegions` with no regions, then it renders the empty-state sentence and
   neither a `<ul>` nor an `<svg>`.
4. **AC4:** Given the content guide, then it states that the list may be empty only when no
   official source names a province.

## 9. Test plan

| AC  | Test type | Test file                                                    |
| --- | --------- | ------------------------------------------------------------ |
| AC1 | unit      | `tests/unit/contexts/catalog/infrastructure/schemas.test.ts` |
| AC2 | component | `tests/components/GrowingRegions-042.test.ts`                |
| AC3 | component | `tests/components/GrowingRegions-042.test.ts`                |
| AC4 | unit      | `tests/unit/content/optional-regions-042.test.ts`            |

## 10. Third-party documentation consulted

None: no new third-party API.
