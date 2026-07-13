"use client";

import { useEffect, useRef, useState } from "react";
import { loadFontsShared } from "@/lib/embroidery/font-cache";
import { layoutEmbroideryText } from "@/lib/embroidery/layout-text";
import { drawEmbroideryGlyphs } from "@/lib/embroidery/draw-glyphs";
import type { EmbroideryFontFormat, FontFiles } from "@/lib/embroidery/types";

export type { EmbroideryFontFormat } from "@/lib/embroidery/types";

export interface EmbroideryPreviewProps {
  text: string;
  threadColor?: string | null;
  className?: string;
  targetHeight?: number;
  fontId: string;
  fontFolder: string;
  fontFormat: EmbroideryFontFormat;
  // false for fonts with native multi-color threads (e.g. Alfabeto Liz) —
  // threadColor is ignored and the font's own PES colors are rendered as-is.
  supportsThreadColor?: boolean;
}

export default function EmbroideryPreview({
  text, threadColor, className="", targetHeight=130, fontId, fontFolder, fontFormat, supportsThreadColor = true,
}: EmbroideryPreviewProps) {
  const effectiveThreadColor = supportsThreadColor ? threadColor : undefined;
  const [fontFiles, setFontFiles] = useState<FontFiles>({});
  const [errorMsg, setErrorMsg] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadFontsShared(fontFolder, fontFormat)
      .then(fonts => setFontFiles(fonts))
      .catch(e => setErrorMsg(e instanceof Error ? e.message : "Erreur inconnue"));
  }, [fontFolder, fontFormat]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (!text) { canvas.width=1; canvas.height=1; return; }

    const layout = layoutEmbroideryText(text, fontFiles, fontId, targetHeight);
    if (!layout) { canvas.width=1; canvas.height=1; return; }

    // Backing store rendered at devicePixelRatio so fine curved detail (e.g.
    // Alfabeto Liz's flowers) stays crisp on HiDPI screens instead of being
    // upscaled from a 1:1 canvas — CSS size stays in logical px, layout
    // coordinates are unchanged (ctx.scale maps them to device px).
    const dpr = typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1;

    canvas.width = layout.canvasWidth * dpr;
    canvas.height = layout.canvasHeight * dpr;
    canvas.style.width = `${layout.canvasWidth}px`;
    canvas.style.height = `${layout.canvasHeight}px`;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.scale(dpr, dpr);

    drawEmbroideryGlyphs(ctx, layout, effectiveThreadColor ?? undefined);
  }, [text, fontFiles, effectiveThreadColor, targetHeight, fontId]);

  if (errorMsg) return <div className="text-xs text-red-500">Erreur EXP: {errorMsg}</div>;

  return (
    <div className={className} style={{display:"flex",alignItems:"center",justifyContent:"center",overflow:"visible"}}>
      <canvas ref={canvasRef} style={{display:"block",imageRendering:"crisp-edges"}}/>
    </div>
  );
}
