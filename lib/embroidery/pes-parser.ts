// Parser for Brother/Babylock .pes embroidery files (embedded PEC stitch block).
// Ported from embodery-preview/public/pes-parser.js, itself ported from the
// reference implementation in pyembroidery (EmbroidePy/pyembroidery),
// PesReader.py / PecReader.py / EmbThreadPec.py.

const JUMP_CODE = 0x10;
const TRIM_CODE = 0x20;
const FLAG_LONG = 0x80;

const THREAD_SET: Array<[number, number, number, string] | null> = [
  null,
  [14, 31, 124, "Prussian Blue"], [10, 85, 163, "Blue"], [0, 135, 119, "Teal Green"],
  [75, 107, 175, "Cornflower Blue"], [237, 23, 31, "Red"], [209, 92, 0, "Reddish Brown"],
  [145, 54, 151, "Magenta"], [228, 154, 203, "Light Lilac"], [145, 95, 172, "Lilac"],
  [158, 214, 125, "Mint Green"], [232, 169, 0, "Deep Gold"], [254, 186, 53, "Orange"],
  [255, 255, 0, "Yellow"], [112, 188, 31, "Lime Green"], [186, 152, 0, "Brass"],
  [168, 168, 168, "Silver"], [125, 111, 0, "Russet Brown"], [255, 255, 179, "Cream Brown"],
  [79, 85, 86, "Pewter"], [0, 0, 0, "Black"], [11, 61, 145, "Ultramarine"],
  [119, 1, 118, "Royal Purple"], [41, 49, 51, "Dark Gray"], [42, 19, 1, "Dark Brown"],
  [246, 74, 138, "Deep Rose"], [178, 118, 36, "Light Brown"], [252, 187, 197, "Salmon Pink"],
  [254, 55, 15, "Vermilion"], [240, 240, 240, "White"], [106, 28, 138, "Violet"],
  [168, 221, 196, "Seacrest"], [37, 132, 187, "Sky Blue"], [254, 179, 67, "Pumpkin"],
  [255, 243, 107, "Cream Yellow"], [208, 166, 96, "Khaki"], [209, 84, 0, "Clay Brown"],
  [102, 186, 73, "Leaf Green"], [19, 74, 70, "Peacock Blue"], [135, 135, 135, "Gray"],
  [216, 204, 198, "Warm Gray"], [67, 86, 7, "Dark Olive"], [253, 217, 222, "Flesh Pink"],
  [249, 147, 188, "Pink"], [0, 56, 34, "Deep Green"], [178, 175, 212, "Lavender"],
  [104, 106, 176, "Wisteria Violet"], [239, 227, 185, "Beige"], [247, 56, 102, "Carmine"],
  [181, 75, 100, "Amber Red"], [19, 43, 26, "Olive Green"], [199, 1, 86, "Dark Fuchsia"],
  [254, 158, 50, "Tangerine"], [168, 222, 235, "Light Blue"], [0, 103, 62, "Emerald Green"],
  [78, 41, 144, "Purple"], [47, 126, 32, "Moss Green"], [255, 204, 204, "Flesh Pink"],
  [255, 217, 17, "Harvest Gold"], [9, 91, 166, "Electric Blue"], [240, 249, 112, "Lemon Yellow"],
  [227, 243, 91, "Fresh Green"], [255, 153, 0, "Orange"], [255, 240, 141, "Cream Yellow"],
  [255, 200, 200, "Applique"],
];

function signed7(b: number): number {
  return b > 63 ? -128 + b : b;
}

function signed12(b: number): number {
  b &= 0xfff;
  return b > 0x7ff ? -0x1000 + b : b;
}

class Reader {
  bytes: Uint8Array;
  pos = 0;
  constructor(buffer: ArrayBuffer) {
    this.bytes = new Uint8Array(buffer);
  }
  seek(n: number) {
    this.pos = n;
  }
  skip(n: number) {
    this.pos += n;
  }
  u8(): number | null {
    if (this.pos >= this.bytes.length) return null;
    return this.bytes[this.pos++];
  }
  read(n: number): Uint8Array {
    const out = this.bytes.slice(this.pos, this.pos + n);
    this.pos += n;
    return out;
  }
  string8(len: number): string {
    const bytes = this.read(len);
    let out = "";
    for (const b of bytes) out += String.fromCharCode(b);
    return out;
  }
  int16le(): number | null {
    const a = this.u8();
    const b = this.u8();
    if (a === null || b === null) return null;
    return a + (b << 8);
  }
  int24le(): number | null {
    const a = this.u8();
    const b = this.u8();
    const c = this.u8();
    if (a === null || b === null || c === null) return null;
    return a + (b << 8) + (c << 16);
  }
  int32le(): number | null {
    const a = this.u8();
    const b = this.u8();
    const c = this.u8();
    const d = this.u8();
    if (a === null || b === null || c === null || d === null) return null;
    return (a + (b << 8) + (c << 16) + (d << 24)) >>> 0;
  }
  pesString(): string | null {
    const len = this.u8();
    if (!len) return null;
    return this.string8(len).trim();
  }
}

// int24be isn't in the base Reader (only used for thread RGB) — small local
// helper (standalone function, not a Reader.prototype augmentation: keeps
// the module free of declaration-merging tricks that don't type-check
// cleanly against a class expression).
function int24be(r: Reader): number | null {
  const a = r.u8();
  const b = r.u8();
  const c = r.u8();
  if (a === null || b === null || c === null) return null;
  return c + (b << 8) + (a << 16);
}

type Thread = [number, number, number, string, string?, string?];

type StitchEvent =
  | { type: "color_change" }
  | { type: "move" | "trim" | "stitch"; dx: number; dy: number };

function mapPecColors(colorBytes: Uint8Array, chart: Thread[]): Thread[] {
  const threads: Thread[] = [];
  const maxValue = THREAD_SET.length;
  if (!chart || chart.length === 0) {
    for (const byte of colorBytes) {
      threads.push((THREAD_SET[byte % maxValue] as Thread) || [128, 128, 128, "Unknown"]);
    }
  } else if (chart.length >= colorBytes.length) {
    for (let i = 0; i < colorBytes.length; i++) threads.push(chart[i]);
  } else {
    const chartCopy = chart.slice();
    const map = new Map<number, Thread>();
    for (const byte of colorBytes) {
      const colorIndex = byte % maxValue;
      let thread = map.get(colorIndex);
      if (!thread) {
        thread = chartCopy.length ? chartCopy.shift()! : ((THREAD_SET[colorIndex] as Thread) || [128, 128, 128, "Unknown"]);
        map.set(colorIndex, thread);
      }
      threads.push(thread);
    }
  }
  return threads;
}

function readPecStitches(r: Reader): StitchEvent[] {
  const events: StitchEvent[] = [];
  while (true) {
    let val1 = r.u8();
    let val2 = r.u8();
    if (val1 === null || val2 === null || (val1 === 0xff && val2 === 0x00)) break;
    if (val1 === 0xfe && val2 === 0xb0) {
      r.skip(1);
      events.push({ type: "color_change" });
      continue;
    }
    let jump = false;
    let trim = false;
    let x: number, y: number;
    if ((val1 & FLAG_LONG) !== 0) {
      if (val1 & TRIM_CODE) trim = true;
      if (val1 & JUMP_CODE) jump = true;
      const code = (val1 << 8) | val2;
      x = signed12(code);
      const nextVal2 = r.u8();
      if (nextVal2 === null) break;
      val2 = nextVal2;
    } else {
      x = signed7(val1);
    }
    if ((val2 & FLAG_LONG) !== 0) {
      if (val2 & TRIM_CODE) trim = true;
      if (val2 & JUMP_CODE) jump = true;
      const val3 = r.u8();
      if (val3 === null) break;
      const code = (val2 << 8) | val3;
      y = signed12(code);
    } else {
      y = signed7(val2);
    }
    if (jump) events.push({ type: "move", dx: x, dy: y });
    else if (trim) events.push({ type: "trim", dx: x, dy: y });
    else events.push({ type: "stitch", dx: x, dy: y });
  }
  return events;
}

interface PecResult {
  label: string;
  threads: Thread[];
  events: StitchEvent[];
}

function readPec(r: Reader, chart: Thread[]): PecResult {
  r.skip(3); // "LA:"
  const label = r.string8(16).replace(/\0/g, "").trim();
  r.skip(0xf);
  r.u8(); // graphicStride, unused here
  r.u8(); // graphicHeight, unused here
  r.skip(0xc);
  const colorChanges = r.u8() ?? 0;
  const countColors = colorChanges + 1;
  const colorBytes = r.read(countColors);
  const threads = mapPecColors(colorBytes, chart);
  r.skip(0x1d0 - colorChanges);
  r.int24le(); // lenField, unused here (we read events until the terminator)
  r.skip(0x0b);
  const events = readPecStitches(r);
  return { label, threads, events };
}

function readPesThread(r: Reader): Thread {
  const catalogNumber = r.pesString();
  const rgb = int24be(r);
  r.skip(5);
  const description = r.pesString();
  const brand = r.pesString() ?? undefined;
  const chart = r.pesString() ?? undefined;
  const c = rgb === null ? [0, 0, 0] : [(rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff];
  return [c[0], c[1], c[2], description || catalogNumber || "Thread", brand, chart];
}

interface PesMeta {
  magic: string;
  version?: number;
}

function readPesMetadata(r: Reader) {
  r.pesString(); // name, unused
  r.pesString(); // category, unused
  r.pesString(); // author, unused
  r.pesString(); // keywords, unused
  r.pesString(); // comments, unused
}

function readThreadListCommon(r: Reader, gapBeforeImage: number, gapAfterImage: number): Thread[] {
  const threadList: Thread[] = [];
  r.skip(gapBeforeImage);
  r.pesString(); // image name, unused
  r.skip(gapAfterImage);
  const fills = r.int16le();
  if (fills !== 0) return threadList;
  const motifs = r.int16le();
  if (motifs !== 0) return threadList;
  const feather = r.int16le();
  if (feather !== 0) return threadList;
  const countThreads = r.int16le() || 0;
  for (let i = 0; i < countThreads; i++) threadList.push(readPesThread(r));
  return threadList;
}

function parsePesHeader(r: Reader, magic: string, meta: PesMeta): Thread[] {
  switch (magic) {
    case "#PES0100":
      meta.version = 10; r.skip(4); readPesMetadata(r); r.skip(14); r.pesString();
      return readThreadListCommon(r, 38, 34);
    case "#PES0090":
      meta.version = 9; r.skip(4); readPesMetadata(r); r.skip(14); r.pesString();
      return readThreadListCommon(r, 30, 34);
    case "#PES0080":
      meta.version = 8; r.skip(4); readPesMetadata(r);
      return readThreadListCommon(r, 38, 26);
    case "#PES0070":
      meta.version = 7; r.skip(4); readPesMetadata(r);
      return readThreadListCommon(r, 36, 24);
    case "#PES0060":
      meta.version = 6; r.skip(4); readPesMetadata(r);
      return readThreadListCommon(r, 36, 24);
    case "#PES0050":
    case "#PES0055":
    case "#PES0056":
      meta.version = magic === "#PES0050" ? 5 : magic === "#PES0055" ? 5.5 : 5.6;
      r.skip(4); readPesMetadata(r);
      return readThreadListCommon(r, 24, 24);
    case "#PES0040":
      meta.version = 4; r.skip(4); readPesMetadata(r);
      return [];
    default:
      return [];
  }
}

export interface PESData {
  colorBlocks: { color: string; stitches: { x: number; y: number; type: "stitch" }[] }[];
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

function toHex([r0, g0, b0]: Thread): string {
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hex(r0)}${hex(g0)}${hex(b0)}`;
}

export function parsePesToPESData(buffer: ArrayBuffer): PESData {
  const r = new Reader(buffer);
  const magic = r.string8(8);
  const meta: PesMeta = { magic };

  let threadChart: Thread[] = [];
  let pec: PecResult;
  if (magic === "#PEC0001") {
    pec = readPec(r, threadChart);
  } else {
    const pecBlockPosition = r.int32le() ?? 0;
    try {
      threadChart = parsePesHeader(r, magic, meta) || [];
    } catch {
      threadChart = [];
    }
    r.seek(pecBlockPosition);
    pec = readPec(r, threadChart);
  }

  // Walk stitch events into absolute-coordinate polylines, one per color/jump
  // segment — same approach as embodery-preview's finalize(), but emitted
  // directly as PESData.colorBlocks (stitch-only points, no jump entries)
  // to match parseEXP's output shape.
  let x = 0;
  let y = 0;
  let colorIndex = 0;
  const colorBlocks: PESData["colorBlocks"] = [];
  let current: { x: number; y: number }[] | null = null;
  let currentColor = pec.threads[0] || [0, 0, 0, "Unknown"];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  const colorOf = (i: number): Thread => pec.threads[Math.min(i, pec.threads.length - 1)] || [0, 0, 0, "Unknown"];

  const flush = () => {
    if (current && current.length > 1) {
      colorBlocks.push({
        color: toHex(currentColor),
        stitches: current.map((p) => ({ x: p.x, y: p.y, type: "stitch" as const })),
      });
    }
    current = null;
  };

  for (const ev of pec.events) {
    if (ev.type === "color_change") {
      flush();
      colorIndex++;
      currentColor = colorOf(colorIndex);
      current = [{ x, y }];
      continue;
    }
    x += ev.dx;
    y += ev.dy;
    if (ev.type === "stitch") {
      if (!current) {
        currentColor = colorOf(colorIndex);
        current = [{ x: x - ev.dx, y: y - ev.dy }];
      }
      current.push({ x, y });
    } else {
      flush();
      currentColor = colorOf(colorIndex);
      current = [{ x, y }];
    }
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  flush();

  if (!isFinite(minX)) {
    minX = minY = maxX = maxY = 0;
  }

  // Normalize to start at (0, 0), matching parseEXP's buildFromStitches().
  const sx = minX, sy = minY;
  const normalized = colorBlocks.map((block) => ({
    color: block.color,
    stitches: block.stitches.map((s) => ({ x: s.x - sx, y: s.y - sy, type: s.type })),
  }));

  return {
    colorBlocks: normalized,
    minX: 0,
    maxX: maxX - sx,
    minY: 0,
    maxY: maxY - sy,
    width: maxX - sx,
    height: maxY - sy,
  };
}
