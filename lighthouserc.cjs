/**
 * Lighthouse CI configuration: every audited URL must score at least 0.95 in Performance and 1.0
 * in Accessibility, Best Practices and SEO (ADR-0005).
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm astro preview --port 4323 --ignore-lock',
      startServerReadyPattern: 'localhost:4323',
      url: [
        'http://localhost:4323/',
        'http://localhost:4323/sezon/noemvri',
        'http://localhost:4323/zelenchutsi',
        'http://localhost:4323/zelenchutsi/zele',
        'http://localhost:4323/nutrienti/vitamin-c',
        'http://localhost:4323/tarsene',
        'http://localhost:4323/grupi/krastotsvetni',
        'http://localhost:4323/kalendar',
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless=new',
      },
    },
    assert: {
      // Best of 3 runs: Performance varies by a point on shared CI runners even for pages without
      // JavaScript; Accessibility, Best Practices and SEO are deterministic. See ADR-0001.
      aggregationMethod: 'optimistic',
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 1 }],
        'categories:seo': ['error', { minScore: 1 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './.lighthouseci/reports',
    },
  },
};
