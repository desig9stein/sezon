/**
 * Wires the feed address on `/abonament` (spec 062): the read-only field selects its address on
 * focus and on a tap, and the „Копирай“ button, shown only when the clipboard API exists, copies
 * the address and reports the outcome in the status line; when copying fails, it says so and
 * focuses the field so the address can be copied by hand.
 * @param root - Document or element that holds the field, the button and the status line.
 */
export function initFeedCopy(root: ParentNode): void {
  const input = root.querySelector<HTMLInputElement>('[data-feed-address]');
  const button = root.querySelector<HTMLButtonElement>('[data-copy-feed]');
  const status = root.querySelector<HTMLElement>('[data-copied]');
  if (input === null) return;
  const select = (): void => input.select();
  input.addEventListener('focus', select);
  input.addEventListener('click', select);
  if (button === null || status === null || !('clipboard' in navigator)) return;
  button.hidden = false;
  button.addEventListener('click', () => {
    navigator.clipboard.writeText(input.value).then(
      () => {
        status.textContent = status.dataset.copied ?? '';
      },
      () => {
        status.textContent = status.dataset.copyFailed ?? '';
        input.focus();
      },
    );
  });
}
