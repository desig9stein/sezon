# 028. Informal „ти“ voice in UI and content

- **Status:** Approved
- **Bounded context(s):** UI strings (`src/i18n/bg.ts`), content (`src/data/**`)
- **Related:** issue #74, `PRODUCT.md` (voice decision of 2026-11-11), `docs/CONTENT-GUIDE.md`

## 1. Goal

The owner decided that the site addresses the reader informally, with „ти“, in a friendly and
plain voice. Some UI strings and most content tips still use the formal „Вие“ form („Вижте“,
„Изберете“, „Купете“). This change rewords every reader-addressing sentence into the „ти“ form,
so the site speaks with one voice, and records the rule for new content.

## 2. User stories

- As a reader, I want the site to talk to me in one consistent, friendly voice.
- As a content author, I want a written rule and an automatic check, so new entries keep the voice.

## 3. Scope

### In scope

- Every UI string in `src/i18n/bg.ts` that addresses the reader: imperatives („Вижте“ →
  „Виж“) and second-person plural verbs („ако търсите“ → „ако търсиш“).
- Every content text in `src/data/**` that addresses the reader: how to choose, storage,
  preparation tips, growing tips, FAQ answers, summaries.
- A unit test that fails on the formal forms found today and on „Вие / Ви / Вас / Ваш…“.
- `docs/CONTENT-GUIDE.md`: the voice rule with examples.

### Out of scope

- Facts, numbers, sources and the meaning of any sentence: only the grammatical person changes.
- Layout or behaviour.
- Quoted farm self-descriptions („По данни на фермата …“) that do not address the reader.

## 4. Domain model

No change.

## 5. Behaviour and edge cases

- Imperatives become singular: „Изберете“ → „Избери“, „Пазете“ → „Пази“, „Яжте“ → „Яж“,
  „Добавяйте“ → „Добавяй“, „дръжте“ → „дръж“.
- Second-person plural present becomes singular: „търсите“ → „търсиш“, „за да ги купите“ →
  „за да ги купиш“.
- Plural nouns that happen to end in „-ите“/„-ете“ („плодовете“, „фибрите“) are not verbs and
  stay.
- The disclaimer for traditional uses keeps its meaning („консултирай се с лекар“).
- Titles stay ≤ 60 and descriptions 70–160 characters (existing SEO tests).

## 6. Accessibility requirements

- Not applicable beyond the existing checks: no markup changes. Plain, direct sentences help
  readability (WCAG 3.1.5 advisory).

## 7. SEO requirements

- Titles and descriptions keep their length limits; the existing unit and e2e SEO tests guard
  them.

## 8. Acceptance criteria

1. **AC1:** Given `src/i18n/bg.ts`, when scanned, then it contains none of the formal forms in the
   test's list and no „Вие / Ви / Вас / Ваш…“.
2. **AC2:** Given every YAML file in `src/data/**`, when scanned, then it contains none of those
   forms.
3. **AC3:** Given `docs/CONTENT-GUIDE.md`, then it has a voice section that names the „ти“ form and
   gives a formal → informal example.
4. **AC4:** Given the built site, the existing title and description length tests still pass.

## 9. Test plan

| AC  | Test type | Test file                                   |
| --- | --------- | ------------------------------------------- |
| AC1 | unit      | `tests/unit/content/voice.test.ts`          |
| AC2 | unit      | `tests/unit/content/voice.test.ts`          |
| AC3 | unit      | `tests/unit/content/voice.test.ts`          |
| AC4 | unit, e2e | existing SEO tests (`tests/unit/i18n`, e2e) |

## 10. Third-party documentation consulted

| Package | Version | Source (URL or Context7 ID)                 | Topic |
| ------- | ------- | ------------------------------------------- | ----- |
| –       | –       | No third-party API; Bulgarian grammar only. | –     |
