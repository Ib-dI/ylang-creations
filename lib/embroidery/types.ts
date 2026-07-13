// Shared shapes for the embroidery digitizing pipeline: a font is a map of
// character -> stitch-path data, produced by either the .pes or .exp parser.

export type EmbroideryFontFormat = "exp" | "pes";

export interface Stitch {
  x: number;
  y: number;
  type: "stitch" | "jump" | "trim" | "end";
}

export interface ColorBlock {
  color: string;
  stitches: Stitch[];
}

export interface PESData {
  colorBlocks: ColorBlock[];
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

export type FontFiles = Record<string, PESData>;
