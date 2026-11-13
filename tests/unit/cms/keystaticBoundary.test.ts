import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const LINT_TIMEOUT_MS = 60_000;

/** Lints `code` as if it were the file at `filePath` and returns the rule ids reported. */
async function ruleIdsFor(filePath: string, code: string): Promise<(string | null)[]> {
  const [result] = await new ESLint().lintText(code, { filePath });
  return result?.messages.map((message) => message.ruleId) ?? [];
}

describe('src/ does not depend on Keystatic (spec 054)', () => {
  const cases = [
    [
      'src/pages/cms-probe.ts',
      "import config from '../../keystatic.config';\nexport { config };\n",
    ],
    [
      'src/components/CmsProbe.astro',
      "---\nimport { fields } from '@keystatic/core';\n---\n{String(fields)}\n",
    ],
    [
      'src/contexts/catalog/domain/CmsProbe.ts',
      "import config from '../../../../keystatic.config';\nexport { config };\n",
    ],
  ] as const;

  for (const [filePath, code] of cases) {
    it(
      `AC10: ESLint rejects a Keystatic import in ${filePath}`,
      async () => {
        expect(await ruleIdsFor(filePath, code)).toContain('no-restricted-imports');
      },
      LINT_TIMEOUT_MS,
    );
  }

  it(
    'AC10: keystatic.config.ts itself may import Keystatic',
    async () => {
      expect(
        await ruleIdsFor(
          'keystatic.config.ts',
          "import { config } from '@keystatic/core';\nexport default config;\n",
        ),
      ).not.toContain('no-restricted-imports');
    },
    LINT_TIMEOUT_MS,
  );
});
