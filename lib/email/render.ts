import type { ReactElement } from "react";

// Brevo attend du HTML brut : on rend les templates React côté serveur.
// Import dynamique : Next interdit l'import statique de react-dom/server
// dans le graphe des routes App Router.
export async function renderEmail(element: ReactElement): Promise<string> {
  const { renderToStaticMarkup } = await import("react-dom/server");
  return `<!DOCTYPE html>${renderToStaticMarkup(element)}`;
}
