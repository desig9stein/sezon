import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('qa-reviewer checklist', () => {
  it('AC7: includes readability without CSS', () => {
    const checklist = readFileSync('.claude/agents/qa-reviewer.md', 'utf8');

    expect(checklist).toMatch(/without CSS/i);
  });
});
