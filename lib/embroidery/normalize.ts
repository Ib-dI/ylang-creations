// Per-font glyph coverage. None of the digitized fonts have accented
// glyphs (é, à, ç, ...); Alfabeto Liz additionally has uppercase only.
// Text is silently normalized before being handed to the renderer so the
// customer's input (kept as-is in the form field) doesn't fall through to
// the low-opacity placeholder glyph in EmbroideryPreview.
const FONT_GLYPH_SUPPORT: Record<string, { accents: boolean; lowercase: boolean }> = {
  "alfabeto-liz": { accents: false, lowercase: false },
  moonlight: { accents: false, lowercase: true },
  singular: { accents: false, lowercase: true },
};

export function normalizeForFont(text: string, fontId: string): string {
  const support = FONT_GLYPH_SUPPORT[fontId];
  if (!support) return text;

  let out = text;
  if (!support.accents) {
    out = out
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, ""); // strip combining diacritics (é → e, à → a, ...)
  }
  if (!support.lowercase) {
    out = out.toUpperCase();
  }
  return out;
}
