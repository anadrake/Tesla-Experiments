// One-time map imagery build (Phase 7, Anastasiya: "Snazzy-style map, open data, no key").
// Renders OpenStreetMap vector tiles (OpenFreeMap, Positron) with Light/Dark palettes matched to the Figma
// map tiles, and routes the trip on real roads (OSRM). The map is TILE design px square — twice the 1960px
// Figma "map canvas" (which sits in its centre) so you can pinch out — split into a 2×2 grid of JPGs.
// Writes: src/assets/map/tiles-{light,dark}-{col}{row}.jpg + src/screens/Map/routeData.json (tile-space coords).
// Usage: node scripts/render-map.mjs   (needs network; output is committed — not run at app runtime)
import { chromium } from 'playwright-core';
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

/** Trip on Washington Blvd, Culver City (the area the Figma map shows). [lng, lat] */
const ORIGIN = [-118.399, 34.018];
const DESTINATION = [-118.3809, 34.0291]; // close enough that the pin lands in the default (1960) view area
const ZOOM = 15.9; // ≈ the street density of the Figma map tiles
/** Draw everything (labels, road widths) this much bigger than the default style, like the Figma map. */
const SCALE = 1.75;
/** Whole map in design px; the Figma 1960 canvas is its centre. */
const TILE = 3920;
const QUAD = TILE / 2;
/** Image px per design px. iPad Pro shows ~1.43 device px per design px, so 1.5 stays sharp at 1×. */
const DENSITY = 1.5;
const CSS_SIZE = Math.round(QUAD / SCALE);
/** Where the car sits on the 1960 Figma canvas so it lands where the Figma nav arrow is on screen. */
const CAR_CANVAS_PX = [962, 806];
const CAR_TILE_PX = CAR_CANVAS_PX.map((v) => v + (TILE - 1960) / 2);
const CAR_FRACTION = 0.56; // how far along the route the car is

const PALETTES = {
  light: { bg: '#f3f3f3', park: '#e7e7e7', water: '#dcdcdc', building: '#ebebeb', minor: '#ffffff', major: '#ffffff', casing: '#dadada', label: '#8c8c8c', halo: '#f3f3f3', rail: '#d6d6d6' },
  dark: { bg: '#2b2b2b', park: '#313131', water: '#232323', building: '#2f2f2f', minor: '#383838', major: '#424242', casing: '#2b2b2b', label: '#b9b9b9', halo: '#2b2b2b', rail: '#3a3a3a' },
};

const route = await fetch(
  `https://router.project-osrm.org/route/v1/driving/${ORIGIN.join(',')};${DESTINATION.join(',')}?overview=full&geometries=geojson`,
).then((r) => r.json());
const line = route.routes[0].geometry.coordinates;
const car = line[Math.round(line.length * CAR_FRACTION)];

const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
// Small CSS canvas × high pixel ratio = one QUAD of design px at ZOOM, with everything SCALE× larger.
// The page shows the top-left quadrant; the others are rendered by panning one CSS_SIZE across/down.
const page = await b.newPage({ viewport: { width: CSS_SIZE, height: CSS_SIZE }, deviceScaleFactor: (QUAD * DENSITY) / CSS_SIZE });
await page.goto(`file://${new URL('./map-render.html', import.meta.url).pathname}`);
await page.addStyleTag({ content: `#map { width: ${CSS_SIZE}px !important; height: ${CSS_SIZE}px !important; }` });

let routeData;
for (const [name, pal] of Object.entries(PALETTES)) {
  routeData = await page.evaluate(
    async ({ pal, car, line, zoom, carPx, scale, tile }) => {
      const style = await (await fetch('https://tiles.openfreemap.org/styles/positron')).json();
      for (const l of style.layers) {
        const id = l.id;
        const p = (l.paint ??= {});
        if (l.type === 'background') p['background-color'] = pal.bg;
        else if (l.type === 'fill') {
          if (/building/.test(id)) l.layout = { ...(l.layout ?? {}), visibility: 'none' }; // Figma map has no footprints
          p['fill-color'] = /water/.test(id) ? pal.water : /park|grass|wood|landcover|landuse/.test(id) ? pal.park : pal.bg;
          p['fill-outline-color'] = p['fill-color'];
        } else if (l.type === 'line') {
          if (/boundary|admin/.test(id)) l.layout = { ...(l.layout ?? {}), visibility: 'none' };
          else if (/rail/.test(id)) p['line-color'] = pal.rail;
          else if (/water|river|stream/.test(id)) p['line-color'] = pal.water;
          else if (/casing/.test(id)) p['line-color'] = pal.casing;
          else p['line-color'] = /motorway|trunk|primary|secondary/.test(id) ? pal.major : pal.minor;
        } else if (l.type === 'symbol') {
          if (p['text-color'] !== undefined || l.layout?.['text-field']) {
            p['text-color'] = pal.label;
            p['text-halo-color'] = pal.halo;
          }
          if (l.layout?.['icon-image']) l.layout.visibility = 'none'; // POI icons off; our pins replace them
        }
      }
      if (window.__hudMap) window.__hudMap.remove(); // not window.map: that is the #map element (named access)
      const z = zoom - Math.log2(scale); // same ground area on the smaller CSS canvas
      const map = (window.__hudMap = new maplibregl.Map({ container: 'map', style, center: car, zoom: z, interactive: false, attributionControl: false }));
      await new Promise((r) => map.once('load', r));
      const c = map.project(car);
      map.panBy([c.x - carPx[0] / scale, c.y - carPx[1] / scale], { animate: false });
      window.__settle = () => new Promise((r) => (map.loaded() && map.areTilesLoaded() ? setTimeout(r, 800) : map.once('idle', () => setTimeout(r, 800))));
      await window.__settle();
      const px = (ll) => {
        const q = map.project(ll); // CSS px → tile px
        return [Math.round(q.x * scale * 10) / 10, Math.round(q.y * scale * 10) / 10];
      };
      return { tile, route: line.map(px), car: px(car), destination: px(line[line.length - 1]), zoom };
    },
    { pal, car, line, zoom: ZOOM, carPx: CAR_TILE_PX, scale: SCALE, tile: TILE },
  );
  for (const [col, row] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
    const d = [col * CSS_SIZE, row * CSS_SIZE];
    await page.evaluate(async (d) => {
      window.__hudMap.panBy(d, { animate: false });
      await window.__settle();
    }, d);
    const png = `/tmp/map-${name}-${col}${row}.png`;
    await page.locator('#map').screenshot({ path: png });
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '75', png, '--out', `src/assets/map/tiles-${name}-${col}${row}.jpg`]);
    await page.evaluate((d) => window.__hudMap.panBy([-d[0], -d[1]], { animate: false }), d);
  }
  console.log('✓', name);
}

// Car heading = direction of the route at the car
const i = Math.round(line.length * CAR_FRACTION);
const [a, z] = [routeData.route[Math.max(0, i - 2)], routeData.route[Math.min(routeData.route.length - 1, i + 2)]];
routeData.carHeadingDeg = Math.round((Math.atan2(z[1] - a[1], z[0] - a[0]) * 180) / Math.PI);
routeData.source = '© OpenStreetMap contributors · OpenFreeMap · OSRM';
writeFileSync('src/screens/Map/routeData.json', JSON.stringify(routeData));
console.log('✓ routeData', routeData.route.length, 'pts, heading', routeData.carHeadingDeg);
await b.close();
