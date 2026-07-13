// Loads and caches a font's digitized letter files (manifest.json + one
// stitch-path file per character), module-level so every EmbroideryPreview
// instance sharing a font only fetches/parses it once.

import { parsePesToPESData } from "@/lib/embroidery/pes-parser";
import { parseEXP } from "@/lib/embroidery/exp-parser";
import type { EmbroideryFontFormat, FontFiles } from "@/lib/embroidery/types";

const SYMBOL_MAP: Record<string, string> = {
  _amp_: "&", _ap_: "'", _at_: "@", _col_: ":", _comma_: ",",
  _dash_: "-", _dol_: "$", _dot_: ".", _exc_: "!", _hash_: "#",
  _inv_: "¡", _parL_: "(", _parR_: ")", _perc_: "%", _quest_: "?",
  _sem_: ";", _sl_: "/", _st_: "*",
};

// Cache module-level, keyed by "format:folder" so multiple fonts coexist.
const _fontCache = new Map<string, FontFiles>();
const _fontLoadPromises = new Map<string, Promise<FontFiles>>();

function encodeFolderPath(folder: string): string {
  return folder.split("/").map(encodeURIComponent).join("/");
}

export async function loadFontsShared(folder: string, format: EmbroideryFontFormat): Promise<FontFiles> {
  const cacheKey = `${format}:${folder}`;
  if (_fontCache.has(cacheKey)) return _fontCache.get(cacheKey)!;
  if (_fontLoadPromises.has(cacheKey)) return _fontLoadPromises.get(cacheKey)!;

  const promise = (async () => {
    const encodedFolder = encodeFolderPath(folder);
    const mRes = await fetch(`${encodedFolder}/manifest.json`);
    if (!mRes.ok) throw new Error(`manifest.json introuvable dans ${folder}`);
    const raw = await mRes.json();

    const newFonts: FontFiles = {};
    const parseBuffer = format === "pes" ? parsePesToPESData : parseEXP;
    const extension = `.${format}`;

    const isDirectLetterMap =
      typeof raw === "object" && raw !== null && !Array.isArray(raw) &&
      typeof Object.values(raw as Record<string, unknown>)[0] === "string";

    if (isDirectLetterMap) {
      // Direct letter → filename map, e.g. { "A": "99999974_A.pes", ... }.
      const map = raw as Record<string, string>;
      await Promise.all(
        Object.entries(map).map(async ([letter, filename]) => {
          try {
            const res = await fetch(`${encodedFolder}/${encodeURIComponent(filename)}`);
            if (!res.ok) return;
            newFonts[letter] = parseBuffer(await res.arrayBuffer());
          } catch (e) {
            console.warn(`Failed to load ${filename}`, e);
          }
        }),
      );
    } else {
      // Array of prefix/suffix-named files (optionally nested under a
      // size-variant key), letter resolved via SYMBOL_MAP or first character.
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

      await Promise.all(filenames.map(async (filename: string) => {
        if (!filename.toLowerCase().endsWith(extension)) return;
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
          const res = await fetch(`${encodedFolder}/${prefix}${filename}`);
          if (!res.ok) return;
          newFonts[letter] = parseBuffer(await res.arrayBuffer());
        } catch (e) { console.warn(`Failed to load ${filename}`, e); }
      }));
    }

    _fontCache.set(cacheKey, newFonts);
    return newFonts;
  })();

  _fontLoadPromises.set(cacheKey, promise);
  return promise;
}
