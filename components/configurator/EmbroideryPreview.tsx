"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Configuration ──────────────────────────────────────────────────────────
const FONT_FOLDER = "/fonts/moonlight";

// ─── Ajustements par lettre ─────────────────────────────────────────────────
type LetterAdj = { offsetY: number; advanceX: number; leftBearing: number };

const DEFAULT_ADJUSTMENTS: Record<string, LetterAdj> = {
  A: { offsetY: 0, advanceX: -10, leftBearing: 0 },
  B: { offsetY: 0, advanceX: -27, leftBearing: 0 },
  C: { offsetY: 15, advanceX: -36, leftBearing: 0 },
  D: { offsetY: 0, advanceX: -18, leftBearing: 0 },
  E: { offsetY: -26, advanceX: 0, leftBearing: 0 },
  F: { offsetY: 0, advanceX: -44, leftBearing: 0 },
  G: { offsetY: 26, advanceX: -33, leftBearing: 0 },
  H: { offsetY: 24, advanceX: -20, leftBearing: 0 },
  I: { offsetY: -6, advanceX: -26, leftBearing: 0 },
  J: { offsetY: 15, advanceX: -26, leftBearing: 0 },
  K: { offsetY: 0, advanceX: -11, leftBearing: 0 },
  L: { offsetY: 0, advanceX: 6, leftBearing: 0 },
  M: { offsetY: -3, advanceX: -46, leftBearing: 0 },
  N: { offsetY: 13, advanceX: -33, leftBearing: 0 },
  O: { offsetY: 0, advanceX: 0, leftBearing: 0 },
  P: { offsetY: 0, advanceX: -25, leftBearing: 0 },
  Q: { offsetY: 0, advanceX: 0, leftBearing: 0 },
  R: { offsetY: -4, advanceX: -10, leftBearing: 0 },
  S: { offsetY: 8, advanceX: -4, leftBearing: 0 },
  T: { offsetY: -9, advanceX: -51, leftBearing: 0 },
  U: { offsetY: 0, advanceX: 0, leftBearing: 0 },
  V: { offsetY: 0, advanceX: -73, leftBearing: 0 },
  W: { offsetY: -1, advanceX: -74, leftBearing: 0 },
  X: { offsetY: 0, advanceX: 0, leftBearing: 0 },
  Y: { offsetY: 0, advanceX: 0, leftBearing: 0 },
  Z: { offsetY: 27, advanceX: -16, leftBearing: 0 },
  a: { offsetY: 0, advanceX: -5, leftBearing: 0 },
  b: { offsetY: 0, advanceX: -7, leftBearing: 0 },
  c: { offsetY: 0, advanceX: -7, leftBearing: 0 },
  d: { offsetY: 0, advanceX: -19, leftBearing: 0 },
  e: { offsetY: -1, advanceX: -7, leftBearing: 0 },
  f: { offsetY: 20, advanceX: -15, leftBearing: 0 },
  g: { offsetY: 20, advanceX: -13, leftBearing: -14 },
  h: { offsetY: 0, advanceX: -10, leftBearing: 0 },
  i: { offsetY: 0, advanceX: -5, leftBearing: 0 },
  j: { offsetY: 20, advanceX: 0, leftBearing: 0 },
  k: { offsetY: 0, advanceX: -7, leftBearing: 0 },
  l: { offsetY: 0, advanceX: -17, leftBearing: 0 },
  m: { offsetY: 0, advanceX: -16, leftBearing: -8 },
  n: { offsetY: 4, advanceX: -16, leftBearing: -8 },
  o: { offsetY: 0, advanceX: -5, leftBearing: 0 },
  p: { offsetY: 20, advanceX: -33, leftBearing: -28 },
  q: { offsetY: 20, advanceX: -7, leftBearing: 0 },
  r: { offsetY: 0, advanceX: -7, leftBearing: 0 },
  s: { offsetY: 0, advanceX: -7, leftBearing: 0 },
  t: { offsetY: 0, advanceX: -7, leftBearing: 0 },
  u: { offsetY: 0, advanceX: 0, leftBearing: 0 },
  v: { offsetY: 0, advanceX: -5, leftBearing: 0 },
  w: { offsetY: 0, advanceX: -5, leftBearing: 0 },
  x: { offsetY: 0, advanceX: -5, leftBearing: 0 },
  y: { offsetY: 24, advanceX: -21, leftBearing: -19 },
  z: { offsetY: 24, advanceX: -24, leftBearing: -24 },
};

// ─── PES Parser ──────────────────────────────────────────────────────────────
interface Stitch { x: number; y: number; type: "stitch"|"jump"|"trim"|"end"; }
interface ColorBlock { color: string; stitches: Stitch[]; }
interface PESData {
  colorBlocks: ColorBlock[];
  minX: number; maxX: number; minY: number; maxY: number;
  width: number; height: number;
}
type FontFiles = Record<string, PESData>;

const PES_COLORS = [
  "#000000","#FFFFFF","#FFFF00","#FF0000","#0000FF","#00FF00",
  "#FF00FF","#00FFFF","#FF8000","#8000FF","#0080FF","#FF0080",
  "#804000","#008040","#400080","#FF4040","#40FF40","#4040FF",
  "#FF8080","#80FF80","#8080FF","#FFCC00","#CC00FF","#00FFCC",
];

function parsePES(buffer: ArrayBuffer): PESData {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const header = String.fromCharCode(bytes[0],bytes[1],bytes[2],bytes[3]);
  if (!header.startsWith("#PES")) throw new Error("Not a valid PES file");
  const pecOffset = view.getUint32(8, true);
  const stitchOffset = pecOffset + 532;
  const stitches: Stitch[] = [];
  let pos = stitchOffset, x = 0, y = 0;
  while (pos < bytes.length - 1) {
    const b1 = bytes[pos], b2 = bytes[pos+1];
    if (b1===0xff && b2===0x00) { stitches.push({x,y,type:"end"}); break; }
    else if (b1===0xfe && b2===0xb0) { pos+=3; stitches.push({x,y,type:"trim"}); continue; }
    else if ((b1&0x80)===0 && (b2&0x80)===0) {
      x += b1>63?b1-128:b1; y += b2>63?b2-128:b2;
      stitches.push({x,y,type:"stitch"}); pos+=2;
    } else if ((b1&0x80)!==0 && (b2&0x80)!==0) {
      const val=((b1&0x0f)<<8)|b2, dx=b1&0x10?-val:val>2047?val-4096:val;
      pos+=2;
      const b3=bytes[pos], b4=bytes[pos+1]; let dy=0;
      if ((b3&0x80)!==0) { const v2=((b3&0x0f)<<8)|b4; dy=b3&0x10?-v2:v2>2047?v2-4096:v2; pos+=2; }
      x+=dx; y+=dy; stitches.push({x,y,type:"jump"});
    } else pos+=2;
  }
  // Use loops instead of spread to avoid stack overflow on large files (8in = 100k+ stitches)
  const pts = stitches.filter(s=>s.type==="stitch");
  if (!pts.length) return {colorBlocks:[],minX:0,maxX:0,minY:0,maxY:0,width:0,height:0};
  let minX=pts[0].x, maxX=pts[0].x, minY=pts[0].y, maxY=pts[0].y;
  for (const s of pts) {
    if(s.x<minX)minX=s.x; if(s.x>maxX)maxX=s.x;
    if(s.y<minY)minY=s.y; if(s.y>maxY)maxY=s.y;
  }
  const colorBlocks: ColorBlock[] = [];
  let current: Stitch[] = [], ci=0;
  for (const s of stitches) {
    if (s.type==="trim"||s.type==="end") {
      if (current.length) { colorBlocks.push({color:PES_COLORS[ci%PES_COLORS.length],stitches:current}); current=[]; ci++; }
    } else current.push(s);
  }
  if (current.length) colorBlocks.push({color:PES_COLORS[ci%PES_COLORS.length],stitches:current});
  return {colorBlocks,minX,maxX,minY,maxY,width:maxX-minX,height:maxY-minY};
}

// ─── Canvas Renderer ─────────────────────────────────────────────────────────
function shadeColor(hex: string, amt: number, alpha=1): string {
  const n = parseInt(hex.replace("#",""),16);
  const r=Math.min(255,Math.max(0,(n>>16)+amt));
  const g=Math.min(255,Math.max(0,((n>>8)&0xff)+amt));
  const b=Math.min(255,Math.max(0,(n&0xff)+amt));
  return alpha<1?`rgba(${r},${g},${b},${alpha})`:`rgb(${r},${g},${b})`;
}

function drawPath(ctx: CanvasRenderingContext2D, stitches: Stitch[], scale: number, offsetX: number) {
  let drawing=false;
  for (const s of stitches) {
    const sx=offsetX+s.x*scale, sy=s.y*scale;
    if (s.type==="jump") { ctx.stroke(); ctx.beginPath(); drawing=false; }
    else if (s.type==="stitch") {
      if (!drawing) { ctx.moveTo(sx,sy); drawing=true; } else ctx.lineTo(sx,sy);
    }
  }
  ctx.stroke();
}

function renderPES(ctx: CanvasRenderingContext2D, pes: PESData, scale: number, offsetX: number, colorOverride?: string) {
  if (!pes.colorBlocks.length) return;
  ctx.lineCap="round"; ctx.lineJoin="round";
  for (const block of pes.colorBlocks) {
    if (block.stitches.length<2) continue;
    const color = colorOverride??block.color;
    ctx.beginPath();
    ctx.shadowColor="rgba(0,0,0,0.45)"; ctx.shadowBlur=2;
    ctx.shadowOffsetX=0.6; ctx.shadowOffsetY=0.6;
    ctx.strokeStyle=shadeColor(color,-40); ctx.lineWidth=scale*0.95;
    drawPath(ctx,block.stitches,scale,offsetX);
    ctx.beginPath();
    ctx.shadowColor="transparent";
    ctx.strokeStyle=color; ctx.lineWidth=scale*0.62;
    drawPath(ctx,block.stitches,scale,offsetX);
    ctx.beginPath();
    ctx.strokeStyle=shadeColor(color,70,0.45); ctx.lineWidth=scale*0.22;
    drawPath(ctx,block.stitches,scale,offsetX);
  }
}

// ─── Component ───────────────────────────────────────────────────────────────
export interface EmbroideryPreviewProps {
  text: string;
  threadColor?: string | null;
  className?: string;
  // Hauteur cible en pixels canvas (défaut: 130). Contrôle la taille de rendu
  // indépendamment du CSS — utilise cette prop pour changer la taille, pas CSS width/height.
  targetHeight?: number;
}

export default function EmbroideryPreview({
  text,
  threadColor,
  className = "",
  targetHeight = 130,
}: EmbroideryPreviewProps) {
  const [fontFiles, setFontFiles] = useState<FontFiles>({});
  const [errorMsg, setErrorMsg] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadFont = useCallback(async (folder: string) => {
    setErrorMsg("");
    try {
      const mRes = await fetch(`${folder}/manifest.json`);
      if (!mRes.ok) throw new Error(`manifest.json introuvable dans ${folder}`);
      const filenames: string[] = await mRes.json();
      const newFonts: FontFiles = {};
      await Promise.all(filenames.map(async (filename) => {
        const letter = filename.charAt(0);
        if (!letter.match(/[a-zA-Z]/)) return;
        try {
          const res = await fetch(`${folder}/${filename}`);
          if (!res.ok) return;
          newFonts[letter] = parsePES(await res.arrayBuffer());
        } catch {}
      }));
      if (!Object.keys(newFonts).length) throw new Error("Aucun fichier PES valide chargé.");
      setFontFiles(newFonts);
    } catch (e: any) {
      setErrorMsg(e.message ?? "Erreur inconnue");
    }
  }, []);

  useEffect(() => { loadFont(FONT_FOLDER); }, [loadFont]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!text) { canvas.width=1; canvas.height=1; return; }

    const PX=16, PY=12, CAP=targetHeight;
    const chars = text.split("").map(c=>c===" "?null:c);
    const allPes = Object.values(fontFiles);

    if (!allPes.length) { canvas.width=1; canvas.height=1; return; }

    // Scale: tallest letter fits in CAP pixels
    let maxH=1;
    for (const p of allPes) if(p.height>maxH) maxH=p.height;
    const SCALE = CAP / maxH;

    // Baseline detection from x-height letters
    const XHL = new Set(["a","c","e","m","n","o","r","s","u","v","w","x","z"]);
    const DESC = new Set(["g","y","p","q","j"]);
    const xhV = Object.entries(fontFiles).filter(([l])=>XHL.has(l)).map(([,p])=>p.maxY).filter(v=>v>0).sort((a,b)=>a-b);
    const fbV = Object.entries(fontFiles).filter(([l])=>!DESC.has(l)&&l===l.toLowerCase()).map(([,p])=>p.maxY).filter(v=>v>0).sort((a,b)=>a-b);
    const cands = xhV.length>=2?xhV:fbV;
    const lower = cands.slice(0,Math.ceil(cands.length/2));
    const baseN = lower[Math.floor(lower.length/2)]??maxH;

    // Global Y bounds
    let gMinY=0, gMaxY=1;
    for (const p of allPes) { if(p.minY<gMinY)gMinY=p.minY; if(p.maxY>gMaxY)gMaxY=p.maxY; }
    const totH = (gMaxY-gMinY)*SCALE;

    // Letter advances
    const advances = chars.map(ch=>{
      if (!ch) return CAP*0.28;
      const pes=fontFiles[ch]; if(!pes) return CAP*0.4;
      const adj=DEFAULT_ADJUSTMENTS[ch]??{offsetY:0,advanceX:0,leftBearing:0};
      return pes.maxX*SCALE+adj.advanceX;
    });

    // Canvas width
    const fp = chars[0]?fontFiles[chars[0]]:null;
    const fmx = fp?fp.minX:0;
    let tw = PX - fmx*SCALE;
    advances.forEach((adv,i)=>{
      tw += i<chars.length-1 ? adv : (chars[i]?(fontFiles[chars[i]!]?.maxX??0)*SCALE:adv);
    });
    tw += PX;

    canvas.width = Math.max(Math.ceil(tw), 1);
    canvas.height = Math.ceil(PY + totH + PY);

    const vOff = PY - gMinY*SCALE;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let curX = PX - fmx*SCALE;
    chars.forEach((ch, i)=>{
      if (!ch) { curX+=advances[i]; return; }
      const pes=fontFiles[ch];
      const adj=DEFAULT_ADJUSTMENTS[ch]??{offsetY:0,advanceX:0,leftBearing:0};
      const dx = curX+adj.leftBearing;
      if (pes?.colorBlocks.length) {
        ctx.save();
        ctx.translate(0, vOff+adj.offsetY);
        renderPES(ctx, pes, SCALE, dx, threadColor??undefined);
        ctx.restore();
      } else {
        ctx.save();
        ctx.font=`${CAP*0.75}px Georgia`;
        ctx.fillStyle="rgba(0,0,0,0.15)";
        ctx.textBaseline="bottom";
        ctx.fillText(ch, dx, vOff+baseN*SCALE);
        ctx.restore();
      }
      curX+=advances[i];
    });
  }, [text, fontFiles, threadColor, targetHeight]);

  if (errorMsg) return <div className="text-xs text-red-500">Erreur PES: {errorMsg}</div>;

  // Le canvas a ses vraies dimensions en pixels.
  // On l'enveloppe dans un div qui centre et ne compresse pas.
  // CSS ne doit PAS redimensionner le canvas directement (ça pixelise et déforme).
  // Le parent dans le configurateur doit utiliser overflow:visible.
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          imageRendering: "crisp-edges",
          // Pas de width/height CSS : on laisse le canvas à sa taille naturelle
          // Le parent (configurateur) peut utiliser transform:scale() pour ajuster
        }}
      />
    </div>
  );
}