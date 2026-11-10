/** Lighthouse CI configuration: every audited URL must score 1.0 in all four categories. */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm astro preview --port 4323 --ignore-lock',
      startServerReadyPattern: 'localhost:4323',
      url: [
        'http://localhost:4323/',
        'http://localhost:4323/sezon/noemvri',
        'http://localhost:4323/zelenchutsi/zele',
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless=new',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 1 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 1 }],
        'categories:seo': ['error', { minScore: 1 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './.lighthouseci/reports',
    },
  },
};
