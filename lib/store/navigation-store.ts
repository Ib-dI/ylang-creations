import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LastBrowse {
  path: string;
  label: string;
}

interface NavigationStore {
  lastBrowse: LastBrowse | null;
  setLastBrowse: (path: string, label: string) => void;
}

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set) => ({
      lastBrowse: null,
      setLastBrowse: (path, label) => set({ lastBrowse: { path, label } }),
    }),
    {
      name: "ylang-navigation-storage",
      // Réhydraté après le montage (ClientLayoutWrapper) : le premier rendu
      // client doit correspondre au HTML serveur, sinon erreur d'hydratation
      skipHydration: true,
    },
  ),
);

export const DEFAULT_BROWSE: LastBrowse = {
  path: "/collections",
  label: "Découvrir nos créations",
};
