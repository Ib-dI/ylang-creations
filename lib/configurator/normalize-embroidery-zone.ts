import type { EmbroideryZone } from "@/types/configurateur-page";

// The embroidery zone column used to store one flat EmbroideryZone object per
// product, shared across every embroidery font. It's now a map keyed by font
// id, since fonts have very different letter sizes/proportions and need
// independently calibrated positioning. Old rows still hold the flat shape in
// the DB — detect it and treat it as the "moonlight" entry (the only font
// that existed when those rows were calibrated), rather than running a risky
// bulk SQL migration.
export function normalizeEmbroideryZoneByFont(raw: unknown): Record<string, EmbroideryZone> {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  if (typeof obj.x === "number" && typeof obj.y === "number") {
    return { moonlight: obj as unknown as EmbroideryZone };
  }
  return obj as Record<string, EmbroideryZone>;
}
