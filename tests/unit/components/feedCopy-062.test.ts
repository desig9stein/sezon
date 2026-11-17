// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { initFeedCopy } from '@components/feed/feedCopy';

const ADDRESS = 'https://sezon.example/rss.xml';
const COPIED = 'Адресът е копиран.';
const FAILED = 'Копирането не успя – избери адреса и го копирай.';

function mount() {
  document.body.innerHTML = `
    <input data-feed-address readonly value="${ADDRESS}" />
    <button type="button" data-copy-feed hidden>Копирай</button>
    <p role="status" data-copied="${COPIED}" data-copy-failed="${FAILED}"></p>`;
  const button = document.querySelector<HTMLButtonElement>('[data-copy-feed]');
  const status = document.querySelector<HTMLElement>('[role="status"]');
  const input = document.querySelector<HTMLInputElement>('[data-feed-address]');
  if (!button || !status || !input) throw new Error('markup missing');
  return { button, status, input };
}

function stubClipboard(writeText: (text: string) => Promise<void>) {
  vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('feed address copy (spec 062, QA)', () => {
  it('AC15: shows the button and reports a successful copy', async () => {
    const writeText = vi.fn(async () => undefined);
    stubClipboard(writeText);
    const { button, status } = mount();
    initFeedCopy(document);
    expect(button.hidden).toBe(false);
    button.click();
    await vi.waitFor(() => expect(status.textContent).toBe(COPIED));
    expect(writeText).toHaveBeenCalledWith(ADDRESS);
  });

  it('AC15: reports a failed copy and focuses the field so the address can be copied by hand', async () => {
    stubClipboard(async () => {
      throw new Error('denied');
    });
    const { button, status, input } = mount();
    initFeedCopy(document);
    button.click();
    await vi.waitFor(() => expect(status.textContent).toBe(FAILED));
    expect(document.activeElement).toBe(input);
  });
});
