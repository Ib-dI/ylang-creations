import type { ConfigurateurEmbroideryFont } from "@/types/configurateur-page";

// Police de secours utilisée uniquement si la table des polices de broderie
// ne renvoie aucune ligne active (ex. avant tout paramétrage via l'admin).
// Reproduit le comportement historique (Moonlight, 15 €) au lieu de rendre
// la broderie invisible et gratuite.
export const FALLBACK_EMBROIDERY_FONT: ConfigurateurEmbroideryFont = {
  id: "moonlight",
  name: "Moonlight",
  folder: "moonlight",
  format: "exp",
  price: 1500,
  order: 0,
};
