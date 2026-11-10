import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parse } from 'yaml';

const DATA_DIR = join(process.cwd(), 'src', 'data');

/** A raw seed entry: its id (file name without extension) and parsed YAML content. */
export interface SeedEntry {
  readonly id: string;
  readonly data: unknown;
}

/** Reads every `*.yaml` file of a collection directory under `src/data`. */
export function readSeedCollection(collection: string): SeedEntry[] {
  const directory = join(DATA_DIR, collection);
  return readdirSync(directory)
    .filter((file) => file.endsWith('.yaml'))
    .sort()
    .map((file) => ({
      id: basename(file, '.yaml'),
      data: parse(readFileSync(join(directory, file), 'utf8')),
    }));
}
