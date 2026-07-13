// Parser for Melco/Tajima .exp embroidery files — a flat stream of relative
// stitch/jump/trim moves with no embedded thread colors, so colors are
// assigned sequentially from a fixed palette as each trim starts a new block
// (mirrors how .pes color-change markers split colorBlocks in pes-parser.ts).

import type { PESData, Stitch } from "./types";

const PES_COLORS = [
  "#000000", "#FFFFFF", "#FFFF00", "#FF0000", "#0000FF", "#00FF00",
  "#FF00FF", "#00FFFF", "#FF8000", "#8000FF", "#0080FF", "#FF0080",
  "#804000", "#008040", "#400080", "#FF4040", "#40FF40", "#4040FF",
  "#FF8080", "#80FF80", "#8080FF", "#FFCC00", "#CC00FF", "#00FFCC",
];

function buildFromStitches(stitches: Stitch[]): PESData {
  const pts = stitches.filter((s) => s.type === "stitch");
  if (!pts.length) return { colorBlocks: [], minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
  let minX = pts[0].x, maxX = pts[0].x, minY = pts[0].y, maxY = pts[0].y;
  for (const s of pts) {
    if (s.x < minX) minX = s.x; if (s.x > maxX) maxX = s.x;
    if (s.y < minY) minY = s.y; if (s.y > maxY) maxY = s.y;
  }
  const sx = minX, sy = minY;
  const norm = (s: Stitch): Stitch => ({ ...s, x: s.x - sx, y: s.y - sy });
  const colorBlocks: PESData["colorBlocks"] = [];
  let current: Stitch[] = [], ci = 0;
  for (const s of stitches) {
    if (s.type === "trim" || s.type === "end") {
      if (current.length) { colorBlocks.push({ color: PES_COLORS[ci % PES_COLORS.length], stitches: current }); current = []; ci++; }
    } else current.push(norm(s));
  }
  if (current.length) colorBlocks.push({ color: PES_COLORS[ci % PES_COLORS.length], stitches: current });
  const nMaxX = maxX - sx, nMaxY = maxY - sy;
  return { colorBlocks, minX: 0, maxX: nMaxX, minY: 0, maxY: nMaxY, width: nMaxX, height: nMaxY };
}

export function parseEXP(buffer: ArrayBuffer): PESData {
  const bytes = new Uint8Array(buffer);
  const stitches: Stitch[] = [];
  let x = 0, y = 0, pos = 0;
  while (pos < bytes.length - 1) {
    const b0 = bytes[pos];
    if (b0 === 0x80) {
      const cmd = bytes[pos + 1]; pos += 2;
      if (cmd === 0x02 || cmd === 0x00) { stitches.push({ x, y, type: "end" }); break; }
      else if (cmd === 0x01 || cmd === 0x04) {
        if (pos + 1 < bytes.length) {
          const dx = bytes[pos] > 127 ? bytes[pos] - 256 : bytes[pos];
          const dy = bytes[pos + 1] > 127 ? bytes[pos + 1] - 256 : bytes[pos + 1];
          x += dx; y -= dy;
          stitches.push({ x, y, type: cmd === 0x01 ? "trim" : "jump" }); pos += 2;
        }
      }
    } else {
      const dx = b0 > 127 ? b0 - 256 : b0;
      const dy = bytes[pos + 1] > 127 ? bytes[pos + 1] - 256 : bytes[pos + 1];
      x += dx; y -= dy;
      stitches.push({ x, y, type: "stitch" }); pos += 2;
    }
  }
  return buildFromStitches(stitches);
}
