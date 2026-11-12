import { readFile, writeFile } from 'node:fs/promises';

/**
 * Builds `src/assets/map/provinces.json` from Natural Earth's 1:10m admin-1 GeoJSON
 * (`ne_10m_admin_1_states_provinces.geojson`, public domain). Usage:
 * `node scripts/map/build.ts <path-to-geojson>`. Bulgaria's 28 provinces are projected with an
 * equirectangular projection scaled by the cosine of the mid latitude, simplified with
 * Douglas–Peucker and written as SVG path data keyed by region slug, enclosed provinces last.
 */

const OUTPUT = 'src/assets/map/provinces.json';
const WIDTH = 600;
const TOLERANCE = 0.9;
const DECIMALS = 1;
const DEGREES_TO_RADIANS = Math.PI / 180;

/** ISO 3166-2 code of each province → region slug in `src/data/regions`. */
const SLUG_BY_ISO: Readonly<Record<string, string>> = {
  'BG-01': 'blagoevgrad',
  'BG-02': 'burgas',
  'BG-03': 'varna',
  'BG-04': 'veliko-tarnovo',
  'BG-05': 'vidin',
  'BG-06': 'vratsa',
  'BG-07': 'gabrovo',
  'BG-08': 'dobrich',
  'BG-09': 'kardzhali',
  'BG-10': 'kyustendil',
  'BG-11': 'lovech',
  'BG-12': 'montana',
  'BG-13': 'pazardzhik',
  'BG-14': 'pernik',
  'BG-15': 'pleven',
  'BG-16': 'plovdiv',
  'BG-17': 'razgrad',
  'BG-18': 'ruse',
  'BG-19': 'silistra',
  'BG-20': 'sliven',
  'BG-21': 'smolyan',
  'BG-22': 'sofia-grad',
  'BG-23': 'sofiyska',
  'BG-24': 'stara-zagora',
  'BG-25': 'targovishte',
  'BG-26': 'haskovo',
  'BG-27': 'shumen',
  'BG-28': 'yambol',
};

/** Provinces enclosed by another province, drawn last so the enclosing one does not cover them. */
const DRAW_LAST: ReadonlyArray<string> = ['sofia-grad'];

type Point = readonly [number, number];
interface Feature {
  readonly properties: { readonly iso_a2?: string; readonly iso_3166_2?: string };
  readonly geometry: { readonly type: string; readonly coordinates: unknown };
}

/** Returns the outer rings of a Polygon or MultiPolygon geometry. */
function outerRings(geometry: Feature['geometry']): ReadonlyArray<ReadonlyArray<Point>> {
  if (geometry.type === 'Polygon') return [(geometry.coordinates as Point[][])[0] ?? []];
  return (geometry.coordinates as Point[][][]).map((polygon) => polygon[0] ?? []);
}

/** Perpendicular distance from `point` to the segment `start`–`end`. */
function distance(point: Point, start: Point, end: Point): number {
  const [dx, dy] = [end[0] - start[0], end[1] - start[1]];
  const length = Math.hypot(dx, dy);
  if (length === 0) return Math.hypot(point[0] - start[0], point[1] - start[1]);
  return Math.abs(dy * point[0] - dx * point[1] + end[0] * start[1] - end[1] * start[0]) / length;
}

/** Douglas–Peucker simplification of a polyline. */
function simplify(points: ReadonlyArray<Point>, tolerance: number): ReadonlyArray<Point> {
  if (points.length < 3) return points;
  const first = points[0] as Point;
  const last = points[points.length - 1] as Point;
  let index = 0;
  let farthest = 0;
  points.forEach((point, i) => {
    const d = distance(point, first, last);
    if (d > farthest) [farthest, index] = [d, i];
  });
  if (farthest <= tolerance) return [first, last];
  return [
    ...simplify(points.slice(0, index + 1), tolerance).slice(0, -1),
    ...simplify(points.slice(index), tolerance),
  ];
}

const round = (value: number) => Number(value.toFixed(DECIMALS));

async function build(source: string): Promise<void> {
  const collection = JSON.parse(await readFile(source, 'utf8')) as { features: Feature[] };
  const features = collection.features.filter((feature) => feature.properties.iso_a2 === 'BG');
  const all = features.flatMap((feature) => outerRings(feature.geometry).flat());
  const lons = all.map(([lon]) => lon);
  const lats = all.map(([, lat]) => lat);
  const [minLon, maxLon, minLat, maxLat] = [
    Math.min(...lons),
    Math.max(...lons),
    Math.min(...lats),
    Math.max(...lats),
  ];
  const xScale = Math.cos(((minLat + maxLat) / 2) * DEGREES_TO_RADIANS);
  const scale = WIDTH / ((maxLon - minLon) * xScale);
  const project = ([lon, lat]: Point): Point => [
    (lon - minLon) * xScale * scale,
    (maxLat - lat) * scale,
  ];
  const provinces: Record<string, string> = {};
  for (const feature of features) {
    const slug = SLUG_BY_ISO[feature.properties.iso_3166_2 ?? ''];
    if (slug === undefined) throw new Error(`Unknown province ${feature.properties.iso_3166_2}`);
    provinces[slug] = outerRings(feature.geometry)
      .map((ring) => simplify(ring.map(project), TOLERANCE))
      .map((ring) => `M${ring.map(([x, y]) => `${round(x)} ${round(y)}`).join('L')}Z`)
      .join('');
  }
  const ordered = Object.fromEntries(
    Object.entries(provinces).sort(
      ([a], [b]) => Number(DRAW_LAST.includes(a)) - Number(DRAW_LAST.includes(b)),
    ),
  );
  const height = Math.ceil((maxLat - minLat) * scale);
  await writeFile(
    OUTPUT,
    `${JSON.stringify({ viewBox: `0 0 ${WIDTH} ${height}`, provinces: ordered }, null, 2)}\n`,
  );
  console.log(`${OUTPUT}: ${Object.keys(provinces).length} provinces`);
}

const [source] = process.argv.slice(2);
if (source === undefined) throw new Error('Usage: node scripts/map/build.ts <admin1.geojson>');
await build(source);
