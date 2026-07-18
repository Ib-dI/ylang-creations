// Seam unique pour l'upload/suppression d'images admin (produits, configurateur, réglages).
// Toute écriture vers /api/admin/storage/upload doit passer par ce module.

export const ADMIN_IMAGE_ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
] as const;

export const ADMIN_IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB

export type ImageScope =
  | { scope: "product"; folderId: string }
  | { scope: "configurator-fabric"; folderId: string }
  | {
      scope: "configurator-product";
      productId: string;
      layer: "base" | "mask" | "color-mask";
    }
  | {
      scope: "settings";
      area: "hero" | "testimonials" | "craftsmanship" | "about";
    };

export class AdminImageValidationError extends Error {}

function assertValidImage(file: File): void {
  if (
    !ADMIN_IMAGE_ALLOWED_MIME_TYPES.includes(
      file.type as (typeof ADMIN_IMAGE_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    throw new AdminImageValidationError(
      "Type de fichier non autorisé. Formats acceptés : PNG, JPEG, GIF, WebP",
    );
  }
  if (file.size > ADMIN_IMAGE_MAX_SIZE) {
    throw new AdminImageValidationError(
      "Le fichier ne doit pas dépasser 5MB",
    );
  }
}

function buildImagePath(scope: ImageScope, fileName: string): string {
  const safeName = fileName.replace(/\s/g, "-").toLowerCase();
  const timestamp = Date.now();
  switch (scope.scope) {
    case "product":
      return `products/${scope.folderId}/${timestamp}-${safeName}`;
    case "configurator-fabric":
      return `configurator/fabrics/${scope.folderId}/${safeName}`;
    case "configurator-product":
      return `configurator/products/${scope.productId}/${scope.layer}-${safeName}`;
    case "settings":
      return `settings/${scope.area}/${timestamp}-${safeName}`;
  }
}

const PUBLIC_URL_MARKER = "/object/public/products/";

/** Pure function: URL publique Supabase -> chemin relatif dans le bucket. Passe au travers si déjà relatif. */
export function toStoragePath(pathOrUrl: string): string {
  const idx = pathOrUrl.indexOf(PUBLIC_URL_MARKER);
  if (idx === -1) return pathOrUrl;
  return pathOrUrl.slice(idx + PUBLIC_URL_MARKER.length);
}

export async function uploadAdminImage(
  file: File,
  scope: ImageScope,
): Promise<{ url: string; path: string }> {
  assertValidImage(file);

  const path = buildImagePath(scope, file.name);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("path", path);

  const response = await fetch("/api/admin/storage/upload", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Erreur lors de l'upload de l'image");
  }
  return { url: data.url as string, path: data.path as string };
}

export async function deleteAdminImage(pathOrUrl: string): Promise<void> {
  try {
    const path = toStoragePath(pathOrUrl);
    await fetch(`/api/admin/storage/upload?path=${encodeURIComponent(path)}`, {
      method: "DELETE",
    });
  } catch (error) {
    // Best-effort : un fichier orphelin non supprimé ne doit jamais faire échouer une sauvegarde.
    console.error("Error deleting admin image:", error);
  }
}

/** Remplace un champ image unique. Supprime l'ancienne image du storage si elle est remplacée ou retirée. */
export async function replaceAdminImage(
  previous: string | null,
  current: string | File | null,
  scope: ImageScope,
): Promise<string | null> {
  if (current instanceof File) {
    const { url } = await uploadAdminImage(current, scope);
    if (previous && previous !== url) await deleteAdminImage(previous);
    return url;
  }
  if (previous && previous !== current) await deleteAdminImage(previous);
  return current;
}

/**
 * Remplace une liste d'images en préservant l'ordre. Les `File` sont uploadées ;
 * les URLs de `previous` absentes du résultat final sont supprimées du storage.
 */
export async function replaceAdminImageList(
  previous: string[],
  current: (string | File | null)[],
  scope: ImageScope,
): Promise<(string | null)[]> {
  const resolved: (string | null)[] = [];
  for (const item of current) {
    if (item instanceof File) {
      const { url } = await uploadAdminImage(item, scope);
      resolved.push(url);
    } else {
      resolved.push(item);
    }
  }

  const orphans = previous.filter((url) => !resolved.includes(url));
  await Promise.all(orphans.map((url) => deleteAdminImage(url)));

  return resolved;
}
