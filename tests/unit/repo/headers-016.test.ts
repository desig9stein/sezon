import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('security headers', () => {
  it("AC10: the CSP allows 'wasm-unsafe-eval' scripts and no inline scripts", () => {
    const csp = readFileSync('public/_headers', 'utf8').match(/Content-Security-Policy: (.+)/)?.[1];
    const scriptSrc = csp?.match(/script-src ([^;]+)/)?.[1] ?? '';
    expect(scriptSrc.split(' ')).toContain("'wasm-unsafe-eval'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
  });
});
