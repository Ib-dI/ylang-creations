"use client";

import { useEffect, useRef, useState } from "react";

const FONT_FOLDER = "/fonts/moonlight";

// Cache module-level : toutes les instances partagent le même chargement
let _fontCache: FontFiles | null = null;
let _fontLoadPromise: Promise<FontFiles> | null = null;

async function loadFontsShared(folder: string): Promise<FontFiles> {
  if (_fontCache) return _fontCache;
  if (_fontLoadPromise) return _fontLoadPromise;

  _fontLoadPromise = (async () => {
    const mRes = await fetch(`${folder}/manifest.json`);
    if (!mRes.ok) throw new Error(`manifest.json introuvable dans ${folder}`);
    const raw = await mRes.json();

    let filenames: string[] = [];
    let prefix = "";
    if (Array.isArray(raw)) {
      filenames = raw;
    } else if (typeof raw === "object" && raw !== null) {
      const keys = Object.keys(raw).sort((a, b) => parseFloat(a) - parseFloat(b));
      const firstKey = keys[0];
      if (firstKey) { filenames = raw[firstKey]; prefix = `${firstKey}/`; }
    }
    if (!filenames.length) throw new Error("Aucun fichier dans le manifest.");

    const newFonts: FontFiles = {};
    await Promise.all(filenames.map(async (filename: string) => {
      if (!filename.toLowerCase().endsWith(".exp")) return;
      let letter = "";
      const lowerFile = filename.toLowerCase();
      for (const [key, val] of Object.entries(SYMBOL_MAP)) {
        if (lowerFile.startsWith(key.toLowerCase())) { letter = val; break; }
      }
      if (!letter) {
        const firstChar = filename.charAt(0);
        if (firstChar.match(/[a-zA-Z0-9]/)) letter = firstChar;
      }
      if (!letter) return;
      try {
        const res = await fetch(`${folder}/${prefix}${filename}`);
        if (!res.ok) return;
        newFonts[letter] = parseEXP(await res.arrayBuffer());
      } catch (e) { console.warn(`Failed to load ${filename}`, e); }
    }));

    _fontCache = newFonts;
    return newFonts;
  })();

  return _fontLoadPromise;
}

type LetterAdj = { offsetY: number; advanceX: number; leftBearing: number };

const DEFAULT_ADJUSTMENTS: Record<string, LetterAdj> = {
  A:{offsetY:18,advanceX:0,leftBearing:0},
  B:{offsetY:0,advanceX:-40,leftBearing:0},
  C:{offsetY:29,advanceX:-46,leftBearing:0},
  D:{offsetY:0,advanceX:-33,leftBearing:0},
  E:{offsetY:0,advanceX:-12,leftBearing:0},
  F:{offsetY:0,advanceX:-74,leftBearing:0},
  G:{offsetY:38,advanceX:-60,leftBearing:0},
  H:{offsetY:44,advanceX:-51,leftBearing:0},
  I:{offsetY:0,advanceX:-37,leftBearing:0},
  J:{offsetY:24,advanceX:-43,leftBearing:0},
  K:{offsetY:0,advanceX:-23,leftBearing:0},
  L:{offsetY:0,advanceX:-7,leftBearing:0},
  M:{offsetY:0,advanceX:-54,leftBearing:0},
  N:{offsetY:10,advanceX:-49,leftBearing:0},
  O:{offsetY:0,advanceX:-22,leftBearing:0},
  P:{offsetY:0,advanceX:-45,leftBearing:0},
  Q:{offsetY:19,advanceX:-9,leftBearing:0},
  R:{offsetY:0,advanceX:-23,leftBearing:0},
  S:{offsetY:15,advanceX:-18,leftBearing:0},
  T:{offsetY:0,advanceX:-68,leftBearing:0},
  U:{offsetY:0,advanceX:-88,leftBearing:0},
  V:{offsetY:0,advanceX:-84,leftBearing:0},
  W:{offsetY:0,advanceX:-84,leftBearing:0},
  X:{offsetY:0,advanceX:-39,leftBearing:0},
  Y:{offsetY:45,advanceX:-9,leftBearing:0},
  Z:{offsetY:30,advanceX:-34,leftBearing:0},
  a:{offsetY:0,advanceX:-17,leftBearing:0},
  b:{offsetY:0,advanceX:-16,leftBearing:0},
  c:{offsetY:0,advanceX:-14,leftBearing:0},
  d:{offsetY:0,advanceX:-32,leftBearing:0},
  e:{offsetY:0,advanceX:-17,leftBearing:0},
  f:{offsetY:36,advanceX:-66,leftBearing:-35},
  g:{offsetY:36,advanceX:-27,leftBearing:-14},
  h:{offsetY:0,advanceX:-26,leftBearing:-6},
  i:{offsetY:0,advanceX:-15,leftBearing:0},
  j:{offsetY:36,advanceX:-51,leftBearing:-34},
  k:{offsetY:0,advanceX:-37,leftBearing:-15},
  l:{offsetY:0,advanceX:-30,leftBearing:0},
  m:{offsetY:0,advanceX:-26,leftBearing:-10},
  n:{offsetY:0,advanceX:-22,leftBearing:-5},
  o:{offsetY:0,advanceX:-18,leftBearing:0},
  p:{offsetY:37,advanceX:-42,leftBearing:-28},
  q:{offsetY:30,advanceX:-17,leftBearing:0},
  r:{offsetY:0,advanceX:-13,leftBearing:3},
  s:{offsetY:0,advanceX:-24,leftBearing:-7},
  t:{offsetY:0,advanceX:-18,leftBearing:0},
  u:{offsetY:0,advanceX:-18,leftBearing:-2},
  v:{offsetY:0,advanceX:-16,leftBearing:0},
  w:{offsetY:0,advanceX:-18,leftBearing:0},
  x:{offsetY:0,advanceX:-23,leftBearing:-6},
  y:{offsetY:28,advanceX:-34,leftBearing:-19},
  z:{offsetY:36,advanceX:-40,leftBearing:-24}
};

const SYMBOL_MAP: Record<string, string> = {
  _amp_: "&", _ap_: "'", _at_: "@", _col_: ":", _comma_: ",",
  _dash_: "-", _dol_: "$", _dot_: ".", _exc_: "!", _hash_: "#",
  _inv_: '"', _parL_: "(", _parR_: ")", _perc_: "%", _quest_: "?",
  _sem_: ";", _sl_: "/", _st_: "*",
};

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

function buildFromStitches(stitches: Stitch[]): PESData {
  const pts = stitches.filter(s => s.type === "stitch");
  if (!pts.length) return { colorBlocks:[], minX:0, maxX:0, minY:0, maxY:0, width:0, height:0 };
  let minX=pts[0].x, maxX=pts[0].x, minY=pts[0].y, maxY=pts[0].y;
  for (const s of pts) {
    if(s.x<minX)minX=s.x; if(s.x>maxX)maxX=s.x;
    if(s.y<minY)minY=s.y; if(s.y>maxY)maxY=s.y;
  }
  const sx=minX, sy=minY;
  const norm = (s: Stitch): Stitch => ({ ...s, x: s.x-sx, y: s.y-sy });
  const colorBlocks: ColorBlock[] = [];
  let current: Stitch[] = [], ci=0;
  for (const s of stitches) {
    if (s.type==="trim"||s.type==="end") {
      if (current.length) { colorBlocks.push({ color: PES_COLORS[ci%PES_COLORS.length], stitches: current }); current=[]; ci++; }
    } else current.push(norm(s));
  }
  if (current.length) colorBlocks.push({ color: PES_COLORS[ci%PES_COLORS.length], stitches: current });
  const nMaxX=maxX-sx, nMaxY=maxY-sy;
  return { colorBlocks, minX:0, maxX:nMaxX, minY:0, maxY:nMaxY, width:nMaxX, height:nMaxY };
}

function parseEXP(buffer: ArrayBuffer): PESData {
  const bytes = new Uint8Array(buffer);
  const stitches: Stitch[] = [];
  let x=0, y=0, pos=0;
  while (pos < bytes.length-1) {
    const b0 = bytes[pos];
    if (b0===0x80) {
      const cmd=bytes[pos+1]; pos+=2;
      if (cmd===0x02||cmd===0x00) { stitches.push({x,y,type:"end"}); break; }
      else if (cmd===0x01||cmd===0x04) {
        if (pos+1<bytes.length) {
          const dx=bytes[pos]>127?bytes[pos]-256:bytes[pos];
          const dy=bytes[pos+1]>127?bytes[pos+1]-256:bytes[pos+1];
          x+=dx; y-=dy;
          stitches.push({x,y,type:cmd===0x01?"trim":"jump"}); pos+=2;
        }
      }
    } else {
      const dx=b0>127?b0-256:b0;
      const dy=bytes[pos+1]>127?bytes[pos+1]-256:bytes[pos+1];
      x+=dx; y-=dy;
      stitches.push({x,y,type:"stitch"}); pos+=2;
    }
  }
  return buildFromStitches(stitches);
}

function shadeColor(hex: string, amt: number, alpha=1): string {
  const n=parseInt(hex.replace("#",""),16);
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

function renderEXP(ctx: CanvasRenderingContext2D, pes: PESData, scale: number, offsetX: number, colorOverride?: string) {
  if (!pes.colorBlocks.length) return;
  ctx.lineCap="round"; ctx.lineJoin="round";

  // Passe 1 : underlay – suit exactement les chemins de points
  // Utilise la couleur du fil (légèrement éclaircie) comme en broderie réelle
  // pour un rendu naturel sans cadre artificiel
  for (const block of pes.colorBlocks) {
    if (block.stitches.length<2) continue;
    const color=colorOverride??block.color;
    ctx.beginPath();
    ctx.shadowColor="transparent";
    ctx.strokeStyle=shadeColor(color,80,0.92); // couleur du fil éclaircie
    ctx.lineWidth=scale*2.2;
    drawPath(ctx,block.stitches,scale,offsetX);
  }

  // Passe 2 : ombrage de profondeur
  for (const block of pes.colorBlocks) {
    if (block.stitches.length<2) continue;
    const color=colorOverride??block.color;
    ctx.beginPath(); ctx.shadowColor="rgba(0,0,0,0.45)"; ctx.shadowBlur=2;
    ctx.shadowOffsetX=0.6; ctx.shadowOffsetY=0.6;
    ctx.strokeStyle=shadeColor(color,-40); ctx.lineWidth=scale*0.95;
    drawPath(ctx,block.stitches,scale,offsetX);
    ctx.beginPath(); ctx.shadowColor="transparent";
    ctx.strokeStyle=color; ctx.lineWidth=scale*0.62;
    drawPath(ctx,block.stitches,scale,offsetX);
    ctx.beginPath();
    ctx.strokeStyle=shadeColor(color,70,0.45); ctx.lineWidth=scale*0.22;
    drawPath(ctx,block.stitches,scale,offsetX);
  }
}

export interface EmbroideryPreviewProps {
  text: string;
  threadColor?: string | null;
  className?: string;
  targetHeight?: number;
}

export default function EmbroideryPreview({
  text, threadColor, className="", targetHeight=130,
}: EmbroideryPreviewProps) {
  const [fontFiles, setFontFiles] = useState<FontFiles>(_fontCache ?? {});
  const [errorMsg, setErrorMsg] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (_fontCache) { setFontFiles(_fontCache); return; }
    loadFontsShared(FONT_FOLDER)
      .then(fonts => setFontFiles(fonts))
      .catch(e => setErrorMsg(e instanceof Error ? e.message : "Erreur inconnue"));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (!text) { canvas.width=1; canvas.height=1; return; }

    const PX=16, PY=12, CAP=targetHeight;
    const chars = text.split("").map(c=>c===" "?null:c);
    const allPes = Object.values(fontFiles);
    if (!allPes.length) { canvas.width=1; canvas.height=1; return; }

    let maxH=1;
    for (const p of allPes) if(p.height>maxH) maxH=p.height;
    const SCALE = CAP/maxH;

    const ADJ_SCALE = CAP / 130;

    // Calcul du descender max parmi les caractères du texte
    let maxDescender = 0;
    for (const ch of chars) {
      if (!ch) continue;
      const adj = DEFAULT_ADJUSTMENTS[ch];
      if (adj && adj.offsetY > 0) {
        maxDescender = Math.max(maxDescender, adj.offsetY * ADJ_SCALE);
      }
    }

    const baselineY = PY+CAP;
    const canvasH = baselineY + Math.ceil(maxDescender) + PY;

    const GAP = CAP * 0.05;

    // Les ajustements DEFAULT_ADJUSTMENTS ont été calibrés dans l'outil de preview
    // avec targetHeight=130 comme référence. Pour les appliquer correctement à
    // n'importe quelle targetHeight, on les scale proportionnellement.

    const advances = chars.map(ch=>{
      if (!ch) return CAP*0.28;
      const pes=fontFiles[ch]; if(!pes) return CAP*0.4;
      const adj=DEFAULT_ADJUSTMENTS[ch]??{offsetY:0,advanceX:0,leftBearing:0};
      // pes.width*SCALE = largeur réelle de la lettre en px canvas
      // adj.advanceX calibré à targetHeight=130, donc on scale
      return pes.width*SCALE + GAP + adj.advanceX*ADJ_SCALE;
    });

    let tw=PX;
    advances.forEach((adv,i)=>{
      tw += i<chars.length-1 ? adv : (chars[i]?(fontFiles[chars[i]!]?.width??0)*SCALE:adv);
    });
    tw+=PX;

    canvas.width=Math.max(Math.ceil(tw),1);
    canvas.height=Math.ceil(canvasH);
    ctx.clearRect(0,0,canvas.width,canvas.height);

    let curX=PX;
    chars.forEach((ch,i)=>{
      if (!ch) { curX+=advances[i]; return; }
      const pes=fontFiles[ch];
      const adj=DEFAULT_ADJUSTMENTS[ch]??{offsetY:0,advanceX:0,leftBearing:0};

      const originX = curX + adj.leftBearing*ADJ_SCALE;
      const vertY = pes ? (baselineY - pes.maxY*SCALE + adj.offsetY*ADJ_SCALE) : adj.offsetY*ADJ_SCALE;

      if (pes?.colorBlocks.length) {
        ctx.save();
        ctx.translate(0, vertY);
        renderEXP(ctx, pes, SCALE, originX, threadColor??undefined);
        ctx.restore();
      } else {
        ctx.save();
        ctx.font=`${CAP*0.75}px Georgia`;
        ctx.fillStyle="rgba(0,0,0,0.15)";
        ctx.textBaseline="bottom";
        ctx.fillText(ch, originX, baselineY+adj.offsetY*ADJ_SCALE);
        ctx.restore();
      }
      curX+=advances[i];
    });
  }, [text, fontFiles, threadColor, targetHeight]);

  if (errorMsg) return <div className="text-xs text-red-500">Erreur EXP: {errorMsg}</div>;

  return (
    <div className={className} style={{display:"flex",alignItems:"center",justifyContent:"center",overflow:"visible"}}>
      <canvas ref={canvasRef} style={{display:"block",imageRendering:"crisp-edges"}}/>
    </div>
  );
}