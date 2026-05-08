// Replaces near-white background pixels with transparent in every PNG
// under public/partners/. One-off cleanup so logo files don't show as
// white blocks on the dark page background. Anti-aliased edges
// (pinkish, light-grey halos) are preserved by the threshold check.
//
// Run with:  node scripts/strip-white-bg.mjs
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const TARGET_DIR = path.resolve("public/partners");
const THRESHOLD = 245; // any pixel where R, G, B all >= this becomes alpha=0

async function process(file) {
  const fullPath = path.join(TARGET_DIR, file);
  const original = await sharp(fullPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { data, info } = original;
  let stripped = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] >= THRESHOLD && data[i + 1] >= THRESHOLD && data[i + 2] >= THRESHOLD) {
      data[i + 3] = 0;
      stripped++;
    }
  }
  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(fullPath);
  const totalPixels = info.width * info.height;
  const pct = ((stripped / totalPixels) * 100).toFixed(1);
  console.log(`  ${file}  ${info.width}×${info.height}  →  ${stripped} pixels stripped (${pct}%)`);
}

const files = (await fs.readdir(TARGET_DIR)).filter((f) => f.toLowerCase().endsWith(".png"));
console.log(`Stripping near-white backgrounds (threshold ${THRESHOLD}) from ${files.length} file(s):`);
for (const f of files) await process(f);
console.log("Done.");
