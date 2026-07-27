// Regenerates the web-delivery variants of every raster asset in public/.
//
// WHY: the originals are print-sized exports (a 1600x922 partner logo rendered
// into a 176x80 box, a 1076x1462 team photo shown at 448px). Shipping them as
// PNG cost ~960 KB on the mobile home page and starved the LCP element of
// bandwidth. Each source is resized to at most 2x its largest CSS box and
// written as WebP next to the original; the PNG/JPG stays as the <picture>
// fallback for the few browsers without WebP.
//
// The partner logos are painted as flat white silhouettes
// (filter: brightness(0) invert(1)), so their colour channels are discarded at
// render time anyway — they are flattened to white here, which makes the alpha
// channel the only real payload and compresses far better.
//
// Run:  node scripts/optimize-images.mjs
import sharp from "sharp";
import { readdirSync, statSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

/** @type {{src: string, width: number, mode?: "logo"|"photo", quality?: number}[]} */
const jobs = [
  // Nav + footer wordmark: rendered at h-14 (56px) -> ~203x56 CSS px. 2x = 406x112.
  // NOT mode "logo": unlike the ticker marks this one keeps its brand colour
  // (the lettering is #AE1AD3 purple) and is drawn without a CSS filter.
  { src: "wordmark.png", width: 420, mode: "photo", quality: 88 },
  // Team portrait: max rendered box is 448px wide. 2x = 896.
  { src: "team/mahsuni.png", width: 900, mode: "photo", quality: 78 },
  // Reel covers: card is at most 384px wide (lg 3-col grid). 2x = 768.
  { src: "reels/reel-1.jpg", width: 768, mode: "photo", quality: 72 },
  { src: "reels/reel-2.jpg", width: 768, mode: "photo", quality: 72 },
  { src: "reels/reel-3.jpg", width: 768, mode: "photo", quality: 72 },
];

// Every partner logo: box is w-44 h-20 (176x80) at the largest breakpoint.
for (const f of readdirSync(path.join(pub, "partners"))) {
  if (/\.(png|jpe?g)$/i.test(f)) jobs.push({ src: `partners/${f}`, width: 360, mode: "logo" });
}

let before = 0;
let after = 0;

for (const job of jobs) {
  const src = path.join(pub, job.src);
  if (!existsSync(src)) {
    console.warn(`skip (missing): ${job.src}`);
    continue;
  }
  const out = src.replace(/\.(png|jpe?g)$/i, ".webp");
  const meta = await sharp(src).metadata();
  const width = Math.min(job.width, meta.width ?? job.width);

  let pipe = sharp(src).resize({ width, withoutEnlargement: true });

  if (job.mode === "logo") {
    // The ticker crushes every logo to a white silhouette anyway. Painting it
    // white here keeps only the alpha channel meaningful -> far smaller file,
    // pixel-identical result on the page.
    pipe = pipe
      .ensureAlpha()
      .composite([{ input: { create: { width, height: Math.round((width / (meta.width ?? width)) * (meta.height ?? width)), channels: 4, background: "#ffffff" } }, blend: "in" }])
      .webp({ quality: 90, alphaQuality: 90, effort: 6 });
  } else {
    pipe = pipe.webp({ quality: job.quality ?? 78, effort: 6 });
  }

  await pipe.toFile(out);

  const b = statSync(src).size;
  const a = statSync(out).size;
  before += b;
  after += a;
  console.log(`${job.src.padEnd(38)} ${kb(b).padStart(8)} -> ${kb(a).padStart(8)}  (${path.basename(out)}, ${width}px)`);
}

// The OG share card is only ever fetched by crawlers, but 307 KB of PNG for a
// flat gradient is wasteful — re-encode it in place as an optimised PNG.
const og = path.join(pub, "og-image.png");
if (existsSync(og)) {
  const b = statSync(og).size;
  const tmp = og + ".tmp";
  await sharp(og).png({ quality: 82, compressionLevel: 9, palette: true }).toFile(tmp);
  const a = statSync(tmp).size;
  if (a < b) {
    const { renameSync } = await import("fs");
    renameSync(tmp, og);
    console.log(`${"og-image.png".padEnd(38)} ${kb(b).padStart(8)} -> ${kb(a).padStart(8)}  (in place)`);
    before += b;
    after += a;
  } else {
    const { unlinkSync } = await import("fs");
    unlinkSync(tmp);
  }
}

console.log(`\ntotal: ${kb(before)} -> ${kb(after)} (${(100 - (after / before) * 100).toFixed(0)}% kleiner)`);
