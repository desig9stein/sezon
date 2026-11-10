/** Returns a frozen shallow copy of `items`. */
export function frozenList<T>(items: ReadonlyArray<T>): ReadonlyArray<T> {
  return Object.freeze([...items]);
}

/** Returns a frozen list of frozen shallow copies of `items`. */
export function frozenRecords<T extends object>(
  items: ReadonlyArray<T>,
): ReadonlyArray<Readonly<T>> {
  return Object.freeze(items.map((item) => Object.freeze({ ...item })));
}
