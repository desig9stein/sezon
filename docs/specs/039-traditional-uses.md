# 039. Traditional uses of dill and parsley from Bulgarian ethnobotany

- **Status:** Approved
- **Bounded context(s):** catalog (content data)
- **Related:** issue #110, spec 032 (Wikipedia-sourced uses removed)

## 1. Goal

Spec 032 removed the traditional uses of dill, parsley and cabbage because they cited only
Wikipedia. This step re-adds the uses that a primary source documents: peer-reviewed Bulgarian
ethnobotanical studies.

## 2. User stories

- As a reader, I want traditional uses only when a primary source documents them, worded as
  tradition and not as a health claim.

## 3. Scope

### In scope

- **Dill (`kopar`):** one folk use from Dragoeva et al. 2022 (Bulgaria). In Table 1, entry 8
  lists _Anethum graveolens_, aerial parts, as „stomachic, … carminative“, used internally as an
  infusion. The sentence keeps to digestion and bloating. It leaves out the disease entries and
  the infant use.
- **Parsley (`magdanoz`):** one folk use from Ivancheva & Stantcheva 2000 (Bulgaria). Table 1
  lists _Petroselinum hortense_ (a synonym of _P. crispum_), leaves and roots, as „Diuretic“,
  prepared by maceration. The other effects in that row are left out, including the abortion
  effect.
- **Cabbage (`zele`):** stays without a use.
  - The Bulgarian lead (Kozuharova et al. 2013, fresh-leaf compress) could not be opened from the
    build session, so it is not verified.
  - The only verified Balkan source (Kosovo, 2012) describes fermented leaves, a different part
    from the head the site describes.
- The checklist rows are updated.

### Out of scope

- Commission E and WHO monographs:
  - Commission E has a negative monograph for dill herb.
  - The WHO monograph covers the fruit, not the herb.
  - The Commission E parsley indication uses disease wording that Regulation (EC) No 1924/2006
    rules out.

## 4. Domain model

No change.

## 5. Behaviour and edge cases

The produce pages of dill and parsley show the traditional-use section with its source (existing
behaviour).

## 6. Accessibility requirements

No markup change.

## 7. SEO requirements

No change.

## 8. Acceptance criteria

1. **AC1:** Given dill, then it has exactly one folk use that starts with „Традиционно се използва“
   and cites DOI 10.2478/asn-2022-0021.
2. **AC2:** Given parsley, then it has exactly one folk use that starts with „Традиционно се
   използва“ and cites DOI 10.1016/S0378-8741(99)00129-4.
3. **AC3:** Given cabbage, then it has no traditional use.
4. **AC4:** Given the two new uses, then neither mentions a disease, abortion or infants.
5. **AC5:** Given the checklist, then dill and parsley show one traditional use each.

## 9. Test plan

| AC      | Test type | Test file                                         |
| ------- | --------- | ------------------------------------------------- |
| AC1–AC5 | unit      | `tests/unit/content/traditional-uses-039.test.ts` |

## 10. Third-party documentation consulted

| Source                                                                                                                                                                       | Where                                           | URL                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------- |
| Dragoeva A., Stoyanova Z., Marinov M., Koleva V., „Survey on current status of folk medicine in Bulgaria reported by local knowledgeable persons“, Acta Sci. Nat. 9(3), 2022 | Table 1, entry 8 (_Anethum graveolens_, AP)     | https://doi.org/10.2478/asn-2022-0021         |
| Ivancheva S., Stantcheva B., „Ethnobotanical inventory of medicinal plants in Bulgaria“, J. Ethnopharmacol. 69, 165–172, 2000                                                | Table 1, Apiaceae (_Petroselinum hortense_)     | https://doi.org/10.1016/S0378-8741(99)00129-4 |
| Kozuharova E. et al., Afr. J. Pharm. Pharmacol. 7(5), 2013                                                                                                                   | not reachable from the build session            | https://doi.org/10.5897/AJPP12.871            |
| Mustafa B. et al., „Medical ethnobotany of the Albanian Alps in Kosovo“, J. Ethnobiol. Ethnomed. 8:6, 2012                                                                   | Table 1 (_Brassica oleracea_, fermented leaves) | https://doi.org/10.1186/1746-4269-8-6         |
