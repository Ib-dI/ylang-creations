"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit, Trash2, Type } from "lucide-react";
import { toast } from "sonner";

type EmbroideryFont = {
  id: string;
  name: string;
  folder: string;
  format: "exp" | "pes";
  price: number; // cents
  order: number;
  isActive: boolean;
  supportsThreadColor: boolean;
};

// Fonts that ship with code assets (manifest + files + calibration) and can
// safely be registered in the DB. A developer adds an entry here when a new
// font is deployed; the admin only ever picks from this fixed list.
// supportsThreadColor is an intrinsic property of the font asset (does it use
// native multi-color PES threads, e.g. Alfabeto Liz's flowers?) — like folder
// and format, it isn't exposed as an admin-editable field.
const AVAILABLE_FONT_DEFINITIONS: Array<
  Pick<EmbroideryFont, "id" | "name" | "folder" | "format" | "supportsThreadColor">
> = [
  { id: "moonlight", name: "Moonlight", folder: "moonlight", format: "exp", supportsThreadColor: true },
  { id: "alfabeto-liz", name: "Alfabeto Liz", folder: "Alfabeto Liz", format: "pes", supportsThreadColor: false },
  { id: "singular", name: "Singular", folder: "Singular", format: "pes", supportsThreadColor: true },
];

export default function EmbroideryFontsPanel() {
  const [fonts, setFonts] = useState<EmbroideryFont[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFont, setEditingFont] = useState<Partial<EmbroideryFont> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadFonts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/configurator/embroidery-fonts");
      const data = await res.json();
      setFonts(data.fonts || []);
    } catch {
      toast.error("Erreur lors du chargement des polices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFonts();
  }, []);

  const unregisteredDefinitions = AVAILABLE_FONT_DEFINITIONS.filter(
    (def) => !fonts.some((f) => f.id === def.id),
  );

  const openCreateModal = () => {
    const first = unregisteredDefinitions[0];
    setEditingFont(
      first
        ? { ...first, price: 1500, order: fonts.length, isActive: true }
        : { price: 1500, order: fonts.length, isActive: true },
    );
    setIsModalOpen(true);
  };

  const openEditModal = (font: EmbroideryFont) => {
    setEditingFont({ ...font });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingFont?.id || !editingFont?.name || !editingFont?.folder || !editingFont?.format) {
      toast.error("Champs obligatoires manquants");
      return;
    }
    setIsSaving(true);
    const isExisting = fonts.some((f) => f.id === editingFont.id);
    const url = isExisting
      ? `/api/admin/configurator/embroidery-fonts?id=${editingFont.id}`
      : "/api/admin/configurator/embroidery-fonts";
    try {
      const res = await fetch(url, {
        method: isExisting ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingFont),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(typeof data.error === "string" ? data.error : "Erreur");
      }
      toast.success(isExisting ? "Police mise à jour" : "Police ajoutée");
      setIsModalOpen(false);
      setEditingFont(null);
      await loadFonts();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (font: EmbroideryFont) => {
    try {
      const res = await fetch(`/api/admin/configurator/embroidery-fonts?id=${font.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !font.isActive }),
      });
      if (!res.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }
      await loadFonts();
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/configurator/embroidery-fonts?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Erreur lors de la suppression");
      }
      toast.success("Police supprimée");
      setDeleteConfirmId(null);
      await loadFonts();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="font-body text-sm text-gray-500">
          Nom, prix et disponibilité des polices de broderie. Les fichiers et le calibrage restent gérés par le code.
        </p>
        <Button onClick={openCreateModal} disabled={unregisteredDefinitions.length === 0} className="gap-2">
          <Plus className="h-4 w-4" /> Ajouter une police
        </Button>
      </div>

      {fonts.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 bg-white py-24">
          <Type className="mb-3 h-10 w-10 text-gray-300" />
          <p className="font-body font-medium text-gray-400">Aucune police enregistrée</p>
          <p className="font-body mt-1 text-sm text-gray-300">Ajoutez Moonlight et Alfabeto Liz pour commencer</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fonts
            .sort((a, b) => a.order - b.order)
            .map((font) => (
              <div key={font.id} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-sm font-medium text-gray-800">{font.name}</p>
                  <p className="font-body mt-0.5 text-xs text-gray-400">
                    {font.folder} · .{font.format} · {(font.price / 100).toFixed(2)} €
                    {!font.supportsThreadColor && " · Couleurs natives (fil non personnalisable)"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => toggleActive(font)}
                    className={`px-2 py-1 font-body text-[10px] font-semibold uppercase ${
                      font.isActive ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {font.isActive ? "Actif" : "Inactif"}
                  </button>
                  <button onClick={() => openEditModal(font)} className="p-1.5 text-gray-400 hover:text-gray-700">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteConfirmId(font.id)} className="p-1.5 text-gray-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingFont(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{fonts.some((f) => f.id === editingFont?.id) ? "Modifier la police" : "Ajouter une police"}</DialogTitle>
            <DialogDescription>Nom, prix et disponibilité affichés au client.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {!fonts.some((f) => f.id === editingFont?.id) && (
              <div>
                <label className="mb-1 block font-body text-xs font-medium text-gray-600">Police disponible</label>
                <select
                  value={editingFont?.id || ""}
                  onChange={(e) => {
                    const def = AVAILABLE_FONT_DEFINITIONS.find((d) => d.id === e.target.value);
                    if (def) setEditingFont((prev) => ({ ...prev, ...def }));
                  }}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm"
                >
                  <option value="" disabled>Choisir…</option>
                  {unregisteredDefinitions.map((def) => (
                    <option key={def.id} value={def.id}>{def.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="mb-1 block font-body text-xs font-medium text-gray-600">Nom affiché</label>
              <input
                type="text"
                value={editingFont?.name || ""}
                onChange={(e) => setEditingFont((prev) => ({ ...prev!, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block font-body text-xs font-medium text-gray-600">Prix (€)</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={((editingFont?.price ?? 0) / 100).toString()}
                onChange={(e) => setEditingFont((prev) => ({ ...prev!, price: Math.round(parseFloat(e.target.value || "0") * 100) }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block font-body text-xs font-medium text-gray-600">Ordre d&apos;affichage</label>
              <input
                type="number"
                min={0}
                value={editingFont?.order ?? 0}
                onChange={(e) => setEditingFont((prev) => ({ ...prev!, order: parseInt(e.target.value) || 0 }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 font-body text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => setEditingFont((prev) => ({ ...prev!, isActive: !prev?.isActive }))}
              className={`relative h-6 w-11 rounded-full transition-colors ${editingFont?.isActive ? "bg-gray-900" : "bg-gray-300"}`}
            >
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${editingFont?.isActive ? "left-6" : "left-1"}`} />
            </button>
          </div>

          <DialogFooter>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cette police ?</DialogTitle>
            <DialogDescription>Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="primary"
              className="cursor-pointer bg-red-500 font-medium text-white hover:bg-red-600"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
