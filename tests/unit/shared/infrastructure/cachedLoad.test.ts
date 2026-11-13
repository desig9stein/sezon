import { describe, expect, it } from 'vitest';
import { cachedLoad } from '@shared/infrastructure/cachedLoad';
import { LoadedSponsorRepository } from '@contexts/advertising/infrastructure/LoadedSponsorRepository';

describe('cachedLoad (QA 037)', () => {
  it('QA 037: loads once after a success, also for concurrent calls', async () => {
    let calls = 0;
    const load = cachedLoad(async () => {
      calls += 1;
      return calls;
    });
    expect(await Promise.all([load(), load()])).toEqual([1, 1]);
    expect(await load()).toBe(1);
    expect(calls).toBe(1);
  });

  it('QA 037: retries after a failure and caches the next success', async () => {
    let calls = 0;
    const load = cachedLoad(async () => {
      calls += 1;
      if (calls === 1) throw new Error('first load fails');
      return 'loaded';
    });
    await expect(load()).rejects.toThrow('first load fails');
    expect(await load()).toBe('loaded');
    expect(await load()).toBe('loaded');
    expect(calls).toBe(2);
  });

  it('QA 037: the sponsor repository retries a failed load', async () => {
    let calls = 0;
    const repository = new LoadedSponsorRepository(async () => {
      calls += 1;
      if (calls === 1) throw new Error('first load fails');
      return [];
    });
    await expect(repository.all()).rejects.toThrow('first load fails');
    expect(await repository.all()).toEqual([]);
    expect(await repository.all()).toEqual([]);
    expect(calls).toBe(2);
  });
});
