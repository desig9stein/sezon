import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default defineConfig([
  globalIgnores([
    'dist/',
    '.astro/',
    'node_modules/',
    'coverage/',
    '.lighthouseci/',
    'playwright-report/',
    'test-results/',
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
    files: ['src/contexts/*/domain/**/*.ts', 'src/shared/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['astro', 'astro:*', 'astro/*'],
              message: 'Domain code must not depend on Astro.',
            },
            {
              group: ['**/infrastructure/**', '**/application/**'],
              message: 'Domain must not import outer layers.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/pages/**', 'src/components/**', 'src/layouts/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/contexts/*/domain/**',
                '**/contexts/*/application/**',
                '**/contexts/*/infrastructure/**',
              ],
              message: 'Import bounded contexts only through their public index.ts.',
            },
          ],
        },
      ],
    },
  },
]);
