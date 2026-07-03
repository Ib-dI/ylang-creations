// Fonts whose glyph set is uppercase-only with no accented characters.
// Text is silently normalized before being handed to the renderer so the
// customer's input (kept as-is in the form field) doesn't fall through to
// the low-opacity placeholder glyph in EmbroideryPreview.
const CAPS_ONLY_FONT_IDS = new Set(["alfabeto-liz"]);

export function normalizeForFont(text: string, fontId: string): string {
  if (!CAPS_ONLY_FONT_IDS.has(fontId)) return text;
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics (é → e, à → a, ...)
    .toUpperCase();
}
