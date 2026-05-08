// Quick stats on a PNG: pixel composition + sample brightness.
// node scripts/inspect-png.mjs public/partners/kfz-akdemir.png
import path from "node:path";
import sharp from "sharp";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node inspect-png.mjs <file>");
  process.exit(1);
}

const { data, info } = await sharp(path.resolve(file))
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

let opaque = 0;
let transparent = 0;
let semi = 0;
let avgBrightness = 0;
let opaqueCount = 0;
for (let i = 0; i < data.length; i += 4) {
  const a = data[i + 3];
  if (a === 0) transparent++;
  else if (a === 255) {
    opaque++;
    avgBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    opaqueCount++;
  } else semi++;
}
const total = data.length / 4;
console.log(`${file}  ${info.width}×${info.height}`);
console.log(`  fully transparent: ${transparent} (${((transparent / total) * 100).toFixed(1)}%)`);
console.log(`  fully opaque:      ${opaque} (${((opaque / total) * 100).toFixed(1)}%)`);
console.log(`  semi-transparent:  ${semi} (${((semi / total) * 100).toFixed(1)}%)`);
if (opaqueCount > 0) {
  console.log(`  avg brightness of opaque pixels: ${(avgBrightness / opaqueCount).toFixed(0)}/255`);
}
