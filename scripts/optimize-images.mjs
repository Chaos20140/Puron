// Regenerates the web-delivery variants of every raster asset in public/.
//
// WHY: the originals are print-sized exports (a 1600x922 partner logo rendered
// into a ~180x80 box, a 1076x1462 team photo shown at 448px). Shipping them as
// PNG cost ~960 KB on the mobile home page and starved the LCP element of
// bandwidth. Each source is resized to at most 2x its largest CSS box and
// written as WebP next to the original; the PNG/JPG stays in public/ as the
// source for the next run.
//
// Three pipelines:
//  - photo:   plain resize + lossy WebP.
//  - brand:   the nav/footer logo. Cropped to its ink and re-coloured for the
//             dark UI (see brandLogo()).
//  - partner: the ticker marks. Flattened to white silhouettes, cropped to their
//             ink, and MEASURED — the measurements are written to
//             src/app/components/sections/partnerLogoMetrics.generated.ts,
//             which ClientTicker uses to give every logo the same visual weight.
//
// Run:  pnpm images
import sharp from "sharp";
import { readdirSync, statSync, existsSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
let before = 0;
let after = 0;
const report = (src, out, note) => {
  const b = statSync(src).size;
  const a = statSync(out).size;
  before += b;
  after += a;
  console.log(`${path.relative(pub, src).padEnd(40)} ${kb(b).padStart(8)} -> ${kb(a).padStart(8)}  ${note}`);
};

/** Bounding box of every pixel with alpha > threshold. */
function inkBox(data, width, height, threshold = 8) {
  let x0 = width, y0 = height, x1 = -1, y1 = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > threshold) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) throw new Error("image has no visible pixels");
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

const raw = async (src) => {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
};

const fromRaw = (data, width, height) => sharp(data, { raw: { width, height, channels: 4 } });

// ---------------------------------------------------------------- photos ----
const photos = [
  // Team portrait: max rendered box is 448px wide. 2x = 896.
  { src: "team/mahsuni.png", width: 900, quality: 78 },
  // Reel covers: card is at most 384px wide (lg 3-col grid). 2x = 768.
  { src: "reels/reel-1.jpg", width: 768, quality: 72 },
  { src: "reels/reel-2.jpg", width: 768, quality: 72 },
  { src: "reels/reel-3.jpg", width: 768, quality: 72 },
];
for (const job of photos) {
  const src = path.join(pub, job.src);
  if (!existsSync(src)) continue;
  const out = src.replace(/\.(png|jpe?g)$/i, ".webp");
  await sharp(src).resize({ width: job.width, withoutEnlargement: true }).webp({ quality: job.quality, effort: 6 }).toFile(out);
  report(src, out, "photo");
}

// ------------------------------------------------------------ brand logo ----
// The client's lockup (hexagon + "PURON MEDIA" + tagline) is drawn for a WHITE
// background: the hexagon ring is black. On the near-black nav and footer that
// ring disappears and the mark reads as a floating cube, so the dark-UI variant
// maps the neutral dark pixels to the site's foreground colour (#F5F5F7). The
// purple is left untouched, and alpha is preserved so the anti-aliased edges
// stay smooth. Cropped to its ink: the delivered PNG is 91% transparent margin,
// which would otherwise decide how big the logo renders.
async function brandLogo(file) {
  const src = path.join(pub, file);
  if (!existsSync(src)) return null;
  const { data, width, height } = await raw(src);
  const LIGHT = [0xf5, 0xf5, 0xf7];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    // Classify by BRIGHTNESS, blended rather than thresholded: the ring's
    // compression noise carries a faint purple tint, so a "neutral and dark"
    // test skipped those pixels and left dark speckles inside the light ring.
    // The purple peaks around 200+ in its brightest channel, the ring stays
    // below ~80; everything between is blended so no seam appears.
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    const keep = Math.min(1, Math.max(0, (max - 110) / (175 - 110)));
    for (let c = 0; c < 3; c++) data[i + c] = Math.round(LIGHT[c] * (1 - keep) + data[i + c] * keep);
  }
  const box = inkBox(data, width, height);
  const out = src.replace(/\.png$/i, ".webp");
  // Lossy at q86 is indistinguishable from lossless at 3x zoom and half the
  // size (25 KB vs 51 KB) — it loads with high priority on every page.
  await fromRaw(data, width, height).extract(box).webp({ quality: 86, alphaQuality: 92, effort: 6 }).toFile(out);
  report(src, out, `brand, ${box.width}x${box.height}`);
  return box;
}
const brand = await brandLogo("brand-logo.png");

// ---------------------------------------------------------- partner logos ----
// Per-logo treatments, keyed by source file name.
//  knockoutDisc: the mark is a filled disc with WHITE artwork on it (the
//  Özdemir plug + lightning bolt). A plain white silhouette would merge that
//  artwork into the disc and erase it, so inside the disc white becomes
//  transparent (cut out) while the coloured fill becomes the silhouette. White
//  artwork OUTSIDE the disc — the lettering — stays white.
const PARTNER_TREATMENT = {
  "leitungsverlegung-oezdemir.png": { knockoutDisc: true },
};

async function partnerLogo(file) {
  const src = path.join(pub, "partners", file);
  const { data, width, height } = await raw(src);
  const treatment = PARTNER_TREATMENT[file] ?? {};

  if (treatment.knockoutDisc) {
    // The disc = the extent of the saturated (coloured) pixels.
    let x0 = width, y0 = height, x1 = -1, y1 = -1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        if (data[i + 3] > 200 && max > 100 && (max - min) / max > 0.35) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const radius = Math.max(x1 - x0, y1 - y0) / 2 + 1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (Math.hypot(x - cx, y - cy) > radius) continue;
        const i = (y * width + x) * 4;
        const min = Math.min(data[i], data[i + 1], data[i + 2]);
        // 0 for the coloured fill (its lowest channel is ~90), 1 for white.
        const whiteness = Math.min(1, Math.max(0, (min - 120) / (235 - 120)));
        data[i + 3] = Math.round(data[i + 3] * (1 - whiteness));
      }
    }
  }

  // Flatten to a white silhouette: only alpha carries information.
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
  }

  // Crop to the ink BEFORE sizing — several sources are padded (AutoWelt's
  // 447x447 canvas holds a 4:1 wordmark), and that padding used to decide how
  // small the logo rendered.
  const box = inkBox(data, width, height);
  const out = src.replace(/\.png$/i, ".webp");
  const { data: small, info } = await fromRaw(data, width, height)
    .extract(box)
    // Largest render is ~150x75 CSS px; 2x covers retina.
    .resize({ width: 480, height: 200, fit: "inside", withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });
  await fromRaw(small, info.width, info.height).webp({ quality: 90, alphaQuality: 90, effort: 6 }).toFile(out);

  // Ink density: share of the bounding box that is actually painted. A thin
  // line-art mark reads lighter than a solid block of the same size.
  let ink = 0;
  for (let i = 3; i < small.length; i += 4) ink += small[i];
  const density = ink / (255 * info.width * info.height);

  report(src, out, `partner, ${info.width}x${info.height}, ink ${(density * 100).toFixed(0)}%`);
  return { file: path.basename(out), width: info.width, height: info.height, density: +density.toFixed(3) };
}

const metrics = [];
for (const f of readdirSync(path.join(pub, "partners")).sort()) {
  if (/\.png$/i.test(f)) metrics.push(await partnerLogo(f));
}

writeFileSync(
  path.join(root, "src/app/components/sections/partnerLogoMetrics.generated.ts"),
  `// GENERATED by scripts/optimize-images.mjs (\`pnpm images\`) — do not edit by hand.
// Measured from the exported WebP silhouettes: pixel size after cropping to the
// ink, and ink density (share of the box that is painted). ClientTicker turns
// these into sizes that give every logo the same visual weight.
export type PartnerLogoMetrics = { width: number; height: number; density: number };

export const PARTNER_LOGO_METRICS: Record<string, PartnerLogoMetrics> = {
${metrics.map((m) => `  ${JSON.stringify(m.file)}: { width: ${m.width}, height: ${m.height}, density: ${m.density} },`).join("\n")}
};
`,
);

// ------------------------------------------------------------- og image ----
// Only ever fetched by crawlers. Re-quantise it ONCE: re-running the palette
// quantiser on an already-palette PNG on every run would degrade it a little
// each time, so an already-palette file is left alone.
const og = path.join(pub, "og-image.png");
if (existsSync(og) && !(await sharp(og).metadata()).paletteBitDepth) {
  const tmp = og + ".tmp";
  await sharp(og).png({ quality: 82, compressionLevel: 9, palette: true }).toFile(tmp);
  const { renameSync, unlinkSync } = await import("fs");
  if (statSync(tmp).size < statSync(og).size) renameSync(tmp, og);
  else unlinkSync(tmp);
}

if (brand) console.log(`\nbrand-logo.webp: ${brand.width}x${brand.height}`);
console.log(`total: ${kb(before)} -> ${kb(after)}`);
