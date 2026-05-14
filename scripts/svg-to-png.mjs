// One-off: rasterize public/favicon.svg → public/logo.png for use in
// emails (SVG support in email clients is patchy; PNG is universal).
import path from "node:path";
import sharp from "sharp";

const input = path.resolve("public/favicon.svg");
const output = path.resolve("public/logo.png");
const width = process.argv[2] ? parseInt(process.argv[2], 10) : 256;

await sharp(input).resize({ width }).png().toFile(output);
console.log(`Wrote ${output} (${width}px wide)`);
