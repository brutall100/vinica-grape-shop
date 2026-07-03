// One-off generator for placeholder product images (grape cluster SVGs).
// Usage: node scripts/generate-placeholder-images.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const palettes = {
  green: { berry: "#9CBF5E", berryDark: "#7FA84A", bg1: "#F3F7EC", bg2: "#E2EDD2" },
  yellow: { berry: "#E3C566", berryDark: "#C9A94A", bg1: "#FAF6EA", bg2: "#F1E7C8" },
  pink: { berry: "#E39BA8", berryDark: "#C97788", bg1: "#FAF0F2", bg2: "#F3DDE1" },
  red: { berry: "#C4485C", berryDark: "#A23349", bg1: "#F9EEF0", bg2: "#F0D8DC" },
  blue: { berry: "#5A5A8C", berryDark: "#42426E", bg1: "#EFEFF6", bg2: "#DEDEEC" },
};

const products = [
  ["solaris", "yellow"],
  ["rondo", "blue"],
  ["regent", "blue"],
  ["marquette", "blue"],
  ["zilga", "blue"],
  ["supaga", "yellow"],
  ["guna", "red"],
  ["arkadia", "green"],
  ["somerset-seedless", "pink"],
  ["reliance", "pink"],
  ["kismis-zaporozskij", "blue"],
  ["muscat-bleu", "blue"],
];

// deterministic pseudo-random per slug so every variety looks slightly different
function hash(str) {
  let h = 2166136261;
  for (const ch of str) h = (h ^ ch.charCodeAt(0)) * 16777619;
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822519);
    h = Math.imul(h ^ (h >>> 13), 3266489917);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function clusterSvg(slug, paletteName) {
  const p = palettes[paletteName];
  const rnd = hash(slug);
  const cx = 400;
  const berries = [];
  // rows of a grape cluster narrowing towards the bottom
  const rows = [4, 5, 4, 3, 2, 1];
  let y = 330;
  for (const count of rows) {
    const spread = count * 62;
    for (let i = 0; i < count; i++) {
      const x = cx - spread / 2 + 62 * i + 31 + (rnd() - 0.5) * 16;
      const yy = y + (rnd() - 0.5) * 18;
      const r = 40 + rnd() * 7;
      berries.push(
        `<circle cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" r="${r.toFixed(1)}" fill="${p.berry}" stroke="${p.berryDark}" stroke-width="3"/>` +
          `<circle cx="${(x - r * 0.3).toFixed(1)}" cy="${(yy - r * 0.35).toFixed(1)}" r="${(r * 0.22).toFixed(1)}" fill="#FFFFFF" opacity="0.35"/>`,
      );
    }
    y += 68;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.bg1}"/><stop offset="1" stop-color="${p.bg2}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  <path d="M400 320 C 400 250, 390 210, 370 160" stroke="#7A5C3E" stroke-width="14" fill="none" stroke-linecap="round"/>
  <path d="M370 200 C 300 150, 250 160, 210 200 C 250 240, 330 245, 370 200 Z" fill="#6E9440" stroke="#587935" stroke-width="4"/>
  <path d="M375 195 C 430 130, 500 125, 555 160 C 520 215, 430 235, 375 195 Z" fill="#7FA84A" stroke="#587935" stroke-width="4"/>
  <path d="M368 190 C 340 170, 330 150, 335 120" stroke="#587935" stroke-width="5" fill="none"/>
  ${berries.join("\n  ")}
</svg>
`;
}

const outDir = join(process.cwd(), "public", "products");
mkdirSync(outDir, { recursive: true });
for (const [slug, palette] of products) {
  writeFileSync(join(outDir, `${slug}.svg`), clusterSvg(slug, palette));
  console.log(`generated ${slug}.svg (${palette})`);
}
