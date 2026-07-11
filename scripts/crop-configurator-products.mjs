// One-off maintenance script: tighten the crop on configurator product images
// (base/mask/colorMask) to remove excess transparent padding, and remap the
// embroidery zone coordinates (x/y/fontSize/maxWidth/nameSpacing) so the
// embroidery stays aligned on the newly-cropped product.
//
// Usage:
//   node scripts/crop-configurator-products.mjs           # dry run (no writes)
//   node scripts/crop-configurator-products.mjs --write   # apply crop + DB update

import { config } from "dotenv";
config({ path: ".env.local" });

import sharp from "sharp";
import { Client } from "pg";
import fs from "node:fs/promises";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const ALPHA_THRESHOLD = 128;
const MARGIN_RATIO = 0.05; // 5% of bbox size, per side
const PUBLIC_DIR = "public";
const BACKUP_DIR = path.join("scripts", "backups", `configurator-crop-${Date.now()}`);

// Row/column counts (rather than a naive single-pixel min/max scan) so a
// handful of stray edge artifact pixels (common in these exported PNGs)
// don't blow the bounding box out to the full image.
async function findBoundingBox(imagePath) {
  const { data, info } = await sharp(imagePath).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const rowCounts = new Array(height).fill(0);
  const colCounts = new Array(width).fill(0);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > ALPHA_THRESHOLD) {
        rowCounts[y]++;
        colCounts[x]++;
      }
    }
  }

  const rowThresh = Math.max(5, Math.round(width * 0.01));
  const colThresh = Math.max(5, Math.round(height * 0.01));
  const minY = rowCounts.findIndex((c) => c > rowThresh);
  const maxY = height - 1 - [...rowCounts].reverse().findIndex((c) => c > rowThresh);
  const minX = colCounts.findIndex((c) => c > colThresh);
  const maxX = width - 1 - [...colCounts].reverse().findIndex((c) => c > colThresh);

  if (minX < 0 || minY < 0 || maxX < minX || maxY < minY) return null; // no foreground found
  return { minX, maxX, minY, maxY, width, height };
}

function computeCropRect(bbox) {
  const { minX, maxX, minY, maxY, width, height } = bbox;
  const bboxW = maxX - minX + 1;
  const bboxH = maxY - minY + 1;
  const marginX = Math.round(bboxW * MARGIN_RATIO);
  const marginY = Math.round(bboxH * MARGIN_RATIO);

  const left = Math.max(0, minX - marginX);
  const top = Math.max(0, minY - marginY);
  const right = Math.min(width, maxX + 1 + marginX);
  const bottom = Math.min(height, maxY + 1 + marginY);

  return { left, top, width: right - left, height: bottom - top, origWidth: width, origHeight: height };
}

function remapEmbroideryZone(zoneByFont, crop) {
  const zoomFactor = crop.origWidth / crop.width;
  const remapped = {};
  for (const [fontId, zone] of Object.entries(zoneByFont)) {
    const newZone = { ...zone };
    if (typeof zone.x === "number") {
      newZone.x = (zone.x * crop.origWidth - crop.left) / crop.width;
    }
    if (typeof zone.y === "number") {
      newZone.y = (zone.y * crop.origHeight - crop.top) / crop.height;
    }
    if (typeof zone.fontSize === "number") {
      newZone.fontSize = zone.fontSize * zoomFactor;
    }
    if (typeof zone.maxWidth === "number") {
      newZone.maxWidth = zone.maxWidth * zoomFactor;
    }
    if (typeof zone.nameSpacing === "number") {
      newZone.nameSpacing = zone.nameSpacing * zoomFactor;
    }
    remapped[fontId] = newZone;
  }
  return remapped;
}

async function backupFile(relPath) {
  const src = path.join(PUBLIC_DIR, relPath);
  const dest = path.join(BACKUP_DIR, relPath);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
}

async function cropImageInPlace(relPath, crop) {
  const filePath = path.join(PUBLIC_DIR, relPath);
  const buffer = await sharp(filePath)
    .extract({ left: crop.left, top: crop.top, width: crop.width, height: crop.height })
    .png()
    .toBuffer();
  await fs.writeFile(filePath, buffer);
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const { rows } = await client.query(
    `SELECT id, name, base_image, mask_image, color_mask_image, embroidery_zone
     FROM configurator_product WHERE is_active = true`,
  );

  console.log(`${WRITE ? "APPLYING" : "DRY RUN"} — ${rows.length} produit(s) actif(s)\n`);

  const dbBackup = [];
  const plan = [];

  for (const row of rows) {
    const basePath = path.join(PUBLIC_DIR, row.base_image);
    const bbox = await findBoundingBox(basePath);
    if (!bbox) {
      console.warn(`⚠︎ ${row.id}: aucun pixel opaque détecté, produit ignoré`);
      continue;
    }
    const crop = computeCropRect(bbox);
    const zoomFactor = crop.origWidth / crop.width;
    const newZone = remapEmbroideryZone(row.embroidery_zone, crop);

    plan.push({ row, crop, newZone });
    dbBackup.push({ id: row.id, embroidery_zone: row.embroidery_zone });

    console.log(
      `${row.id} (${row.name}): ${crop.origWidth}x${crop.origHeight} → ${crop.width}x${crop.height} ` +
      `(crop [${crop.left},${crop.top}]) · zoom×${zoomFactor.toFixed(3)}`,
    );
    for (const [fontId, z] of Object.entries(row.embroidery_zone)) {
      const nz = newZone[fontId];
      console.log(
        `   ${fontId}: x ${z.x.toFixed(3)}→${nz.x.toFixed(3)} · y ${z.y.toFixed(3)}→${nz.y.toFixed(3)} ` +
        `· fontSize ${z.fontSize}→${nz.fontSize.toFixed(1)}`,
      );
    }
  }

  if (!WRITE) {
    console.log("\nDry run — relancer avec --write pour appliquer le recadrage et mettre à jour la DB.");
    await client.end();
    return;
  }

  await fs.mkdir(BACKUP_DIR, { recursive: true });
  await fs.writeFile(
    path.join(BACKUP_DIR, "embroidery_zone_backup.json"),
    JSON.stringify(dbBackup, null, 2),
  );

  for (const { row, crop, newZone } of plan) {
    const images = [row.base_image, row.mask_image, row.color_mask_image].filter(Boolean);
    for (const relPath of images) await backupFile(relPath);
    for (const relPath of images) await cropImageInPlace(relPath, crop);

    await client.query(`UPDATE configurator_product SET embroidery_zone = $1, updated_at = now() WHERE id = $2`, [
      JSON.stringify(newZone),
      row.id,
    ]);
    console.log(`✓ ${row.id} recadré + zones mises à jour en DB`);
  }

  console.log(`\nBackup images + DB : ${BACKUP_DIR}`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
