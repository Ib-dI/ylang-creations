import sharp from "sharp";

// Tightens a product photo's crop by detecting the real bounding box of its
// subject (alpha channel) and trimming the transparent padding around it,
// keeping a small breathing margin. Row/column pixel counts (not a naive
// per-pixel min/max) are used so a few stray edge artifact pixels — common
// in these exported PNGs — don't blow the bounding box out to the full image.

const ALPHA_THRESHOLD = 128;
const MARGIN_RATIO = 0.05; // 5% of bbox size, per side

export interface CropRect {
  left: number;
  top: number;
  width: number;
  height: number;
  origWidth: number;
  origHeight: number;
}

export async function detectCropRect(buffer: Buffer): Promise<CropRect | null> {
  const { data, info } = await sharp(buffer).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
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

  const bboxW = maxX - minX + 1;
  const bboxH = maxY - minY + 1;
  const marginX = Math.round(bboxW * MARGIN_RATIO);
  const marginY = Math.round(bboxH * MARGIN_RATIO);
  const left = Math.max(0, minX - marginX);
  const top = Math.max(0, minY - marginY);
  const right = Math.min(width, maxX + 1 + marginX);
  const bottom = Math.min(height, maxY + 1 + marginY);

  // Already tight (or nothing meaningful to trim) — skip re-encoding.
  if (right - left >= width * 0.98 && bottom - top >= height * 0.98) return null;

  return { left, top, width: right - left, height: bottom - top, origWidth: width, origHeight: height };
}

export async function cropToRect(buffer: Buffer, rect: CropRect): Promise<Buffer> {
  return sharp(buffer)
    .extract({ left: rect.left, top: rect.top, width: rect.width, height: rect.height })
    .png()
    .toBuffer();
}
