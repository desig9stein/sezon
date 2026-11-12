import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

interface FormField {
  readonly type: string;
  readonly id?: string;
  readonly attributes: { readonly label: string };
  readonly validations?: { readonly required?: boolean };
}

const form = parse(readFileSync('.github/ISSUE_TEMPLATE/correction.yml', 'utf8')) as {
  name: string;
  description: string;
  labels: string[];
  body: FormField[];
};

describe('correction issue form (spec 031)', () => {
  it('AC4: asks for the page, the error, the correction and the evidence', () => {
    expect(form.name).toBeTruthy();
    expect(form.description).toBeTruthy();
    expect(form.labels).toEqual(expect.arrayContaining(['type:content', 'area:content']));
    const fields = new Map(form.body.filter((field) => field.id).map((field) => [field.id, field]));
    expect(fields.get('page')?.type).toBe('input');
    for (const id of ['page', 'wrong', 'correct', 'evidence']) {
      expect(fields.get(id)?.validations?.required, id).toBe(true);
    }
    for (const id of ['wrong', 'correct', 'evidence'])
      expect(fields.get(id)?.type).toBe('textarea');
  });
});
