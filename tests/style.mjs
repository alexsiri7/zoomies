// Collectable/obstacle style test with no dependencies (Node >= 22).
// Usage: node tests/style.mjs [path-to-three.min.js]
// Builds every collectable, obstacle and finish from public/things.js with the real
// Three.js r128 (fetched from the SRI-pinned URL in index.html, or read from the
// given path) and fails unless collectables alone glow warm gold and bob and spin,
// obstacles are cool or dark, never glow and stay still, and only low obstacles
// carry the hurdle marker.
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const pub = new URL('../public/', import.meta.url);
const html = readFileSync(new URL('index.html', pub), 'utf8');
const tag = html.match(/<script src="(https:[^"]+three[^"]*)" integrity="([^"]+)"/);
if (!tag) throw new Error('no three.js <script> with integrity in public/index.html');
const [, threeUrl, integrity] = tag;
const three = process.argv[2] ? readFileSync(process.argv[2]) : Buffer.from(await (await fetch(threeUrl)).arrayBuffer());
if ('sha512-' + createHash('sha512').update(three).digest('base64') !== integrity) {
  throw new Error(`three.js does not match the integrity in index.html (${threeUrl})`);
}

const ctx = { console };
ctx.self = ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(three.toString(), ctx);
vm.runInContext(readFileSync(new URL('things.js', pub), 'utf8'), ctx);
const { LEVELS, kibble, bowl, bob } = ctx.ZoomiesThings;

// Hue in degrees, saturation and lightness in 0..1.
const PICKUP = { hueMin: 25, hueMax: 60, satMin: 0.8, lightMin: 0.5 };
// Obstacles may not be warm and bright; this band contains the whole PICKUP band.
const WARM_BRIGHT = { hueFrom: 330, hueTo: 70, satMin: 0.45, lightMin: 0.5 };
const BUILDS = 20; // bookcase picks random book colours

const hsl = (c) => { const o = {}; c.getHSL(o); return { h: o.h * 360, s: o.s, l: o.l }; };
const inPickupBand = (c) => { const { h, s, l } = hsl(c); return h >= PICKUP.hueMin && h <= PICKUP.hueMax && s >= PICKUP.satMin && l >= PICKUP.lightMin; };
const warmBright = (c) => { const { h, s, l } = hsl(c); return (h >= WARM_BRIGHT.hueFrom || h <= WARM_BRIGHT.hueTo) && s >= WARM_BRIGHT.satMin && l >= WARM_BRIGHT.lightMin; };
const glows = (m) => !!m.emissive && m.emissive.getHex() !== 0;
const bobs = (g) => {
  if (!g.userData.bob) return false;
  const at = (t) => { bob(g, 0.1, t); return [g.rotation.y, g.position.y]; };
  const [r0, y0] = at(0), [r1, y1] = at(0.3);
  return r1 !== r0 && y1 !== y0;
};
const hasHurdle = (g) => { let found = false; g.traverse((o) => { if (o.userData.marker === 'hurdle') found = true; }); return found; };

const failures = [];
function check(name, build, rules) {
  for (let b = 0; b < BUILDS; b++) {
    const g = build();
    let i = 0;
    g.traverse((o) => {
      if (!o.isMesh) return;
      const m = o.material, why = rules.material(m);
      if (why) failures.push(`${name} mesh ${i}: ${m.type} #${m.color.getHexString()} ${why}`);
      i++;
    });
    const whyGroup = rules.group && rules.group(g);
    if (whyGroup) { failures.push(`${name}: ${whyGroup}`); break; }
  }
}

const collectable = {
  material: (m) => !glows(m) ? 'does not glow' : !inPickupBand(m.color) ? 'is outside the pickup colour band' : null,
  group: (g) => !bobs(g) ? 'does not bob and spin' : null,
};
const obstacle = (isLow) => ({
  material: (m) => glows(m) ? 'glows' : m.type === 'MeshBasicMaterial' ? 'is unlit (reads as glowing)' : warmBright(m.color) ? 'is warm and bright' : null,
  group: (g) => g.userData.bob ? 'bobs' : isLow && !hasHurdle(g) ? 'low obstacle has no hurdle' : !isLow && hasHurdle(g) ? 'tall obstacle has a hurdle' : null,
});
const finish = {
  material: (m) => glows(m) ? 'glows' : inPickupBand(m.color) ? 'uses the pickup colour band' : null,
  group: (g) => g.userData.bob ? 'bobs' : null,
};

check('kibble', kibble, collectable);
check('bowl', bowl, collectable);
let obstacles = 0;
for (const L of LEVELS) {
  for (const [kind, isLow] of [['tall', false], ['low', true]]) {
    for (const [name, [build]] of Object.entries(L[kind])) { check(`${L.name} ${kind} ${name}`, build, obstacle(isLow)); obstacles++; }
  }
  check(`${L.name} finish`, L.finish, finish);
}

if (failures.length) {
  console.error('FAIL\n' + [...new Set(failures)].map((f) => '  - ' + f).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`OK: 2 collectable, ${obstacles} obstacle, ${LEVELS.length} finish builders checked`);
}
