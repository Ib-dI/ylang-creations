// Computes where each glyph of an embroidered line of text sits — canvas
// size, per-character position and vertical offset — with zero Canvas API
// calls, so it's testable with plain assertions on the returned numbers.
// draw-glyphs.ts consumes this layout to actually paint pixels.

import { FONT_ADJUSTMENTS } from "@/lib/embroidery/font-adjustments";
import type { FontFiles, PESData } from "@/lib/embroidery/types";

export interface GlyphLayout {
  char: string;
  pes?: PESData;
  originX: number;
  /** translate() offset used when drawing this glyph's stitch path. */
  vertY: number;
  /** adj.offsetY already scaled to this render's targetHeight, for the no-pes fallback glyph's baseline. */
  offsetYScaled: number;
  colorableIndices?: number[];
}

export interface TextLayout {
  glyphs: GlyphLayout[];
  canvasWidth: number;
  canvasHeight: number;
  /** stitch-coordinate -> canvas-pixel scale factor, for drawing EXP/PES paths. */
  scale: number;
  baselineY: number;
  /** CAP (targetHeight), needed for the no-pes fallback glyph's font size. */
  capHeight: number;
}

// Returns null when no font files are loaded yet (nothing to lay out).
export function layoutEmbroideryText(
  text: string,
  fontFiles: FontFiles,
  fontId: string,
  targetHeight: number,
): TextLayout | null {
  const adjustments = FONT_ADJUSTMENTS[fontId] ?? {};
  const PX = 16, PY = 12, CAP = targetHeight;
  const chars = text.split("").map((c) => (c === " " ? null : c));
  const allPes = Object.values(fontFiles);
  if (!allPes.length) return null;

  let maxH = 1;
  for (const p of allPes) if (p.height > maxH) maxH = p.height;
  const SCALE = CAP / maxH;

  // FONT_ADJUSTMENTS was calibrated in the preview tool with targetHeight=130
  // as reference — scale it proportionally to whatever CAP is actually rendered.
  const ADJ_SCALE = CAP / 130;

  let maxDescender = 0;
  for (const ch of chars) {
    if (!ch) continue;
    const adj = adjustments[ch];
    if (adj && adj.offsetY > 0) maxDescender = Math.max(maxDescender, adj.offsetY * ADJ_SCALE);
  }

  const baselineY = PY + CAP;
  const canvasH = baselineY + Math.ceil(maxDescender) + PY;
  const GAP = CAP * 0.05;

  const advances = chars.map((ch) => {
    if (!ch) return CAP * 0.28;
    const pes = fontFiles[ch];
    if (!pes) return CAP * 0.4;
    const adj = adjustments[ch] ?? { offsetY: 0, advanceX: 0, leftBearing: 0 };
    // pes.width*SCALE = largeur réelle de la lettre en px canvas ; adj.advanceX
    // calibré à targetHeight=130, donc on scale.
    return pes.width * SCALE + GAP + adj.advanceX * ADJ_SCALE;
  });

  let tw = PX;
  advances.forEach((adv, i) => {
    tw += i < chars.length - 1 ? adv : chars[i] ? (fontFiles[chars[i]!]?.width ?? 0) * SCALE : adv;
  });
  tw += PX;

  const glyphs: GlyphLayout[] = [];
  let curX = PX;
  chars.forEach((ch, i) => {
    if (ch) {
      const pes = fontFiles[ch];
      const adj = adjustments[ch] ?? { offsetY: 0, advanceX: 0, leftBearing: 0 };
      const originX = curX + adj.leftBearing * ADJ_SCALE;
      const offsetYScaled = adj.offsetY * ADJ_SCALE;
      const vertY = pes ? baselineY - pes.maxY * SCALE + offsetYScaled : offsetYScaled;
      glyphs.push({ char: ch, pes, originX, vertY, offsetYScaled, colorableIndices: adj.colorableIndices });
    }
    curX += advances[i];
  });

  return {
    glyphs,
    canvasWidth: Math.max(Math.ceil(tw), 1),
    canvasHeight: Math.ceil(canvasH),
    scale: SCALE,
    baselineY,
    capHeight: CAP,
  };
}
