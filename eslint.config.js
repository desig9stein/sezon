import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

const ASTRO = {
  group: ['astro', 'astro:*', 'astro/*'],
  message: 'Domain code must not depend on Astro.',
};
const DEEP_CONTEXT_IMPORTS = {
  group: [
    '@contexts/*/*/**',
    '**/contexts/*/domain/**',
    '**/contexts/*/application/**',
    '**/contexts/*/infrastructure/**',
  ],
  message: 'Import other bounded contexts only through their public index.ts.',
};
const OUTER_LAYERS = {
  group: ['**/infrastructure/**', '**/application/**', '@composition/*', '**/composition/**'],
  message: 'Domain must not import outer layers.',
};
const APP_LAYERS = {
  group: ['@contexts/*', '@i18n/*', '@composition/*', '@components/*', '@layouts/*', '@design/*'],
  message: 'The shared kernel must not depend on contexts, UI or composition.',
};
const UPSTREAM_CONTEXTS = {
  advertising: [],
  catalog: ['seasonality'],
  farms: [],
  geography: [],
  recipes: [],
  seasonality: [],
};

/** Builds `no-restricted-imports` blocks that enforce the dependency rules in AGENTS.md section 6. */
function architectureRules() {
  const restrict = (files, patterns) => ({
    files,
    rules: { 'no-restricted-imports': ['error', { patterns }] },
  });
  const domainBlocks = Object.entries(UPSTREAM_CONTEXTS).map(([context, upstreams]) =>
    restrict(
      [`src/contexts/${context}/domain/**/*.ts`],
      [
        ASTRO,
        OUTER_LAYERS,
        DEEP_CONTEXT_IMPORTS,
        {
          group: ['@contexts/*', ...upstreams.map((upstream) => `!@contexts/${upstream}`)],
          message: `The ${context} domain may import only these upstream contexts: ${upstreams.join(', ') || 'none'}.`,
        },
      ],
    ),
  );
  return [
    restrict(['src/shared/domain/**/*.ts'], [ASTRO, OUTER_LAYERS, APP_LAYERS]),
    restrict(['src/shared/seo/**/*.ts', 'src/shared/infrastructure/**/*.ts'], [APP_LAYERS]),
    ...domainBlocks,
    restrict(
      ['src/contexts/*/application/**/*.ts'],
      [
        DEEP_CONTEXT_IMPORTS,
        {
          group: ['**/infrastructure/**', '@composition/*', 'astro:*'],
          message: 'Application code must not import infrastructure.',
        },
      ],
    ),
    restrict(['src/contexts/*/infrastructure/**/*.ts'], [DEEP_CONTEXT_IMPORTS]),
    restrict(
      ['src/contexts/*/index.ts'],
      [
        {
          group: ['./infrastructure/**'],
          message: 'A context index.ts must not export infrastructure.',
        },
      ],
    ),
    restrict(
      ['src/pages/**', 'src/components/**', 'src/layouts/**'],
      [
        {
          ...DEEP_CONTEXT_IMPORTS,
          message: 'Use services from src/composition and types from the context public index.ts.',
        },
      ],
    ),
  ];
}

export default defineConfig([
  globalIgnores([
    'dist/',
    '.astro/',
    'node_modules/',
    'coverage/',
    '.lighthouseci/',
    'playwright-report/',
    'test-results/',
    '.claude/skills/',
    '.github/skills/',
  ]),
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-strict'],
  {
    files: ['*.config.{js,mjs,ts}', '*.cjs', 'tests/e2e/**'],
    languageOptions: { globals: globals.node },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      // Lists styled with `list-style: none` keep `role="list"` so Safari/VoiceOver announces them.
      'astro/jsx-a11y/no-redundant-roles': ['error', { ul: ['list'], ol: ['list'] }],
      // A labelled <section> is a region; scroll containers (e.g. wide tables) must be focusable
      // so keyboard users can scroll them. Do not add tabindex to other sections.
      'astro/jsx-a11y/no-noninteractive-tabindex': [
        'error',
        { roles: ['region'], tags: ['section'] },
      ],
    },
  },
  {
    files: ['src/**/*.ts', 'src/**/*.astro'],
    ignores: ['tests/**'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
  {
    files: ['tests/**'],
    rules: { '@typescript-eslint/no-non-null-assertion': 'off' },
  },
  ...architectureRules(),
]);
