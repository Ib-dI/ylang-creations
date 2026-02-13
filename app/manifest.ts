import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ylang Creations",
    short_name: "Ylang",
    description:
      "Créations artisanales pour bébés et enfants, faites main avec amour.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFBF2", // ylang-cream
    theme_color: "#D48B76", // ylang-terracotta
    icons: [
      {
        src: "/logo/logo-1.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
