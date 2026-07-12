import { readFileSync } from "node:fs";

interface Stitch { x: number; y: number; type: "stitch" | "jump" | "trim" | "end"; }
interface ColorBlock { color: string; stitches: Stitch[]; }
interface PESData { colorBlocks: ColorBlock[]; minX: number; maxX: number; minY: number; maxY: number; width: number; height: number; }

function buildFromStitches(stitches: Stitch[]): PESData {
  const pts = stitches.filter((s) => s.type === "stitch");
  if (!pts.length) return { colorBlocks: [], minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
  let minX = pts[0].x, maxX = pts[0].x, minY = pts[0].y, maxY = pts[0].y;
  for (const s of pts) {
    if (s.x < minX) minX = s.x; if (s.x > maxX) maxX = s.x;
    if (s.y < minY) minY = s.y; if (s.y > maxY) maxY = s.y;
  }
  const sx = minX, sy = minY;
  return {
    colorBlocks: [{ color: "#000", stitches: pts.map((p) => ({ x: p.x - sx, y: p.y - sy, type: "stitch" })) }],
    minX: 0, maxX: maxX - sx, minY: 0, maxY: maxY - sy, width: maxX - sx, height: maxY - sy,
  };
}

function parseEXP(buffer: ArrayBuffer): PESData {
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

// Same FONT_ADJUSTMENTS['moonlight'] entries relevant to "Ylang", copied from EmbroideryPreview.tsx.
const ADJ: Record<string, { offsetY: number; advanceX: number; leftBearing: number }> = {
  Y: { offsetY: 45, advanceX: -9, leftBearing: 0 },
  l: { offsetY: 0, advanceX: -30, leftBearing: 0 },
  a: { offsetY: 0, advanceX: -17, leftBearing: 0 },
  n: { offsetY: 0, advanceX: -22, leftBearing: -5 },
  g: { offsetY: 36, advanceX: -27, leftBearing: -14 },
};

const FILES: Record<string, string> = {
  Y: "Y_Moonlight_8in_NinviaStore.exp",
  l: "l_Moonlight_lower_8in_NinviaStore.exp",
  a: "a_Moonlight_lower_8in_NinviaStore.exp",
  n: "n_Moonlight_lower_8in_NinviaStore.exp",
  g: "g_Moonlight_lower_8in_NinviaStore.exp",
};

function toAB(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

const fontFiles: Record<string, PESData> = {};
for (const [letter, filename] of Object.entries(FILES)) {
  fontFiles[letter] = parseEXP(toAB(readFileSync(`public/fonts/moonlight/${filename}`)));
}

function simulate(CAP: number, label: string) {
  const PX = 16, PY = 12;
  const chars = "Ylang".split("");
  const allPes = Object.values(fontFiles);
  let maxH = 1;
  for (const p of allPes) if (p.height > maxH) maxH = p.height;
  const SCALE = CAP / maxH;
  const ADJ_SCALE = CAP / 130;

  let maxDescender = 0;
  for (const ch of chars) {
    const adj = ADJ[ch];
    if (adj && adj.offsetY > 0) maxDescender = Math.max(maxDescender, adj.offsetY * ADJ_SCALE);
  }

  const baselineY = PY + CAP;
  const canvasH = baselineY + Math.ceil(maxDescender) + PY;

  // Per-letter vertY (top-left y-coordinate the glyph is drawn at, before rotation)
  const perLetter = chars.map((ch) => {
    const pes = fontFiles[ch];
    const adj = ADJ[ch] ?? { offsetY: 0, advanceX: 0, leftBearing: 0 };
    const vertY = pes ? baselineY - pes.maxY * SCALE + adj.offsetY * ADJ_SCALE : adj.offsetY * ADJ_SCALE;
    return { ch, offsetY: adj.offsetY, vertY: vertY.toFixed(2) };
  });

  // EmbroideryZoneOverlay's compensation, using canvasH as a stand-in for lastCanvasH
  // (equal when only one line — matches this single-name product).
  const PY_TOP = 12;
  const symmetricBase = 2 * PY_TOP + CAP;
  const actualDescender = canvasH > symmetricBase ? canvasH - symmetricBase : 0;
  const verticalCompensation = actualDescender / 2;

  console.log(`\n=== ${label} (CAP=${CAP.toFixed(2)}) ===`);
  console.log("SCALE (glyph geometry)=", SCALE.toFixed(4), " ADJ_SCALE (offsetY)=", ADJ_SCALE.toFixed(4));
  console.log("canvasH=", canvasH.toFixed(2), " baselineY=", baselineY.toFixed(2), " maxDescender=", maxDescender.toFixed(2));
  console.log("verticalCompensation=", verticalCompensation.toFixed(2));
  console.log("per-letter vertY:", perLetter);
}

simulate(51, "OLD fontSize (pre-crop-remap)");
simulate(69.74358974358975, "NEW fontSize (post-crop-remap, current DB value)");
