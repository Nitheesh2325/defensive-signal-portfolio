// Generates public/artwork/signal-contours-{light,dark}.svg — the original abstract artwork used
// on the Home route. Deterministic: the same seed always produces the same file.
//
//   node scripts/generate-artwork.mjs
//
// The drawing is a set of irregular contour rings around a quiet centre, with a few
// short radial ticks on the outer rings. It depicts no person and carries no
// information; pages must read correctly without it.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SEED = 20260928;
const SIZE = 640;
const CX = 320;
const CY = 330;
const RINGS = 13;
const SAMPLES = 96;

// Small deterministic PRNG (mulberry32).
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = prng(SEED);
const r1 = (n) => Math.round(n * 10) / 10;

// Three low-frequency waves shared by every ring so the contours nest cleanly.
const waves = [2, 3, 5].map((freq) => ({ freq, phase: rand() * Math.PI * 2, amp: 0.035 + rand() * 0.04 }));

function ringPoints(radius, wobble) {
  const pts = [];
  for (let i = 0; i < SAMPLES; i++) {
    const t = (i / SAMPLES) * Math.PI * 2;
    let k = 1;
    for (const w of waves) k += Math.sin(t * w.freq + w.phase) * w.amp * wobble;
    pts.push([CX + Math.cos(t) * radius * k, CY + Math.sin(t) * radius * k * 0.94]);
  }
  return pts;
}

// Closed Catmull-Rom spline as cubic Béziers.
function smoothPath(pts) {
  const n = pts.length;
  const at = (i) => pts[(i + n) % n];
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return `${d}Z`;
}

// Colours are presentation attributes, not a <style> block, so the files still render
// on hosts that send a strict Content-Security-Policy header with every response.
const PALETTES = {
  light: { ink: "#2a3a52", accent: "#b3431d" },
  dark: { ink: "#c9d4e3", accent: "#ff9a6c" },
};

const ringShapes = [];
for (let i = 0; i < RINGS; i++) {
  const radius = 34 + i * 20.5;
  const wobble = 0.25 + (i / (RINGS - 1)) * 1.1;
  const kind = i % 4 === 3 ? "accent" : i % 2 ? "faint" : "base";
  ringShapes.push({ kind, d: smoothPath(ringPoints(radius, wobble)) });
}

const tickShapes = [];
for (let i = 0; i < 18; i++) {
  const t = rand() * Math.PI * 2;
  const ring = 7 + Math.floor(rand() * (RINGS - 7));
  const radius = 34 + ring * 20.5;
  const len = 6 + rand() * 12;
  tickShapes.push({
    x1: r1(CX + Math.cos(t) * radius),
    y1: r1(CY + Math.sin(t) * radius * 0.94),
    x2: r1(CX + Math.cos(t) * (radius + len)),
    y2: r1(CY + Math.sin(t) * (radius + len) * 0.94),
  });
}

function draw({ ink, accent }) {
  const ring = ({ kind, d }) =>
    kind === "accent"
      ? `<path d="${d}" fill="none" stroke="${accent}" stroke-opacity=".85" stroke-width="1.8"/>`
      : `<path d="${d}" fill="none" stroke="${ink}" stroke-opacity="${kind === "faint" ? ".28" : ".55"}" stroke-width="1.4"/>`;
  const tick = (t) =>
    `<line x1="${t.x1}" y1="${t.y1}" x2="${t.x2}" y2="${t.y2}" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
<g stroke="${ink}" stroke-opacity=".35" stroke-width="1" stroke-dasharray="2 6">
<line x1="24" y1="${CY}" x2="${SIZE - 24}" y2="${CY}"/>
<line x1="${CX}" y1="24" x2="${CX}" y2="${SIZE - 24}"/>
</g>
${ringShapes.map(ring).join("\n")}
${tickShapes.map(tick).join("\n")}
<circle cx="${CX}" cy="${CY}" r="14" fill="none" stroke="${accent}" stroke-opacity=".4"/>
<circle cx="${CX}" cy="${CY}" r="5" fill="${accent}"/>
</svg>
`;
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "public", "artwork");
mkdirSync(dir, { recursive: true });
for (const [name, palette] of Object.entries(PALETTES)) {
  const svg = draw(palette);
  writeFileSync(join(dir, `signal-contours-${name}.svg`), svg);
  console.log(`wrote public/artwork/signal-contours-${name}.svg (${svg.length} bytes)`);
}
