// Paints a TextLayout (from layout-text.ts) onto a canvas 2D context —
// stitch paths for recognized glyphs, a faint Georgia placeholder otherwise.
// The only impure half of the embroidery renderer; the geometry it consumes
// was already computed and is independently testable.

import type { PESData, Stitch } from "@/lib/embroidery/types";
import type { TextLayout } from "@/lib/embroidery/layout-text";

// Lightens (amt>0) or darkens (amt<0) proportionally toward white/black
// rather than adding a flat amount to each channel — a flat +80 clamps
// light colors (silver #C0C0C0, pink #FFB6C1) straight to pure white,
// losing the hue entirely. Proportional blending degrades gracefully and
// matches the old flat-additive result exactly for dark/mid colors.
function shadeColor(hex: string, amt: number, alpha = 1): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const channels = [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
  const ratio = Math.abs(amt) / 255;
  const [r, g, b] = channels.map((c) => (amt >= 0 ? Math.round(c + (255 - c) * ratio) : Math.round(c * (1 - ratio))));
  return alpha < 1 ? `rgba(${r},${g},${b},${alpha})` : `rgb(${r},${g},${b})`;
}

function drawPath(ctx: CanvasRenderingContext2D, stitches: Stitch[], scale: number, offsetX: number) {
  let drawing = false;
  for (const s of stitches) {
    const sx = offsetX + s.x * scale, sy = s.y * scale;
    if (s.type === "jump") { ctx.stroke(); ctx.beginPath(); drawing = false; }
    else if (s.type === "stitch") {
      if (!drawing) { ctx.moveTo(sx, sy); drawing = true; } else ctx.lineTo(sx, sy);
    }
  }
  ctx.stroke();
}

function renderEXP(
  ctx: CanvasRenderingContext2D,
  pes: PESData,
  scale: number,
  offsetX: number,
  colorOverride?: string,
  colorableIndices?: number[],
) {
  if (!pes.colorBlocks.length) return;
  ctx.lineCap = "round"; ctx.lineJoin = "round";

  const colorFor = (blockIndex: number, originalColor: string): string => {
    if (!colorOverride) return originalColor;
    if (!colorableIndices) return colorOverride;
    return colorableIndices.includes(blockIndex) ? colorOverride : originalColor;
  };

  // scale (CAP/maxH du plus grand glyphe de la police) est une fraction
  // minuscule (souvent 0.03-0.09) aux tailles réelles du configurateur, donc
  // scale*constante seul retombe sous le pixel et s'anti-crénelle en trait
  // quasi invisible — surtout visible sur Alfabeto Liz avec ses courbes
  // fines. Un plancher garantit un trait lisible quelle que soit la police.
  const w = (mult: number, floor: number) => Math.max(scale * mult, floor);

  // Passe 1 : underlay – suit exactement les chemins de points
  // Utilise la couleur du fil (légèrement éclaircie) comme en broderie réelle
  // pour un rendu naturel sans cadre artificiel
  pes.colorBlocks.forEach((block, blockIndex) => {
    if (block.stitches.length < 2) return;
    const color = colorFor(blockIndex, block.color);
    ctx.beginPath();
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = shadeColor(color, 80, 0.92); // couleur du fil éclaircie
    ctx.lineWidth = w(2.2, 1.4);
    drawPath(ctx, block.stitches, scale, offsetX);
  });

  // Passe 2 : ombrage de profondeur
  pes.colorBlocks.forEach((block, blockIndex) => {
    if (block.stitches.length < 2) return;
    const color = colorFor(blockIndex, block.color);
    ctx.beginPath(); ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 0.6; ctx.shadowOffsetY = 0.6;
    ctx.strokeStyle = shadeColor(color, -40); ctx.lineWidth = w(0.95, 1.0);
    drawPath(ctx, block.stitches, scale, offsetX);
    ctx.beginPath(); ctx.shadowColor = "transparent";
    ctx.strokeStyle = color; ctx.lineWidth = w(0.62, 0.75);
    drawPath(ctx, block.stitches, scale, offsetX);
    ctx.beginPath();
    ctx.strokeStyle = shadeColor(color, 70, 0.45); ctx.lineWidth = w(0.22, 0.3);
    drawPath(ctx, block.stitches, scale, offsetX);
  });
}

export function drawEmbroideryGlyphs(ctx: CanvasRenderingContext2D, layout: TextLayout, colorOverride?: string) {
  for (const g of layout.glyphs) {
    if (g.pes?.colorBlocks.length) {
      ctx.save();
      ctx.translate(0, g.vertY);
      renderEXP(ctx, g.pes, layout.scale, g.originX, colorOverride, g.colorableIndices);
      ctx.restore();
    } else {
      ctx.save();
      ctx.font = `${layout.capHeight * 0.75}px Georgia`;
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.textBaseline = "bottom";
      ctx.fillText(g.char, g.originX, layout.baselineY + g.offsetYScaled);
      ctx.restore();
    }
  }
}
