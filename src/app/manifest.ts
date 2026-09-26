import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bon Sang",
    short_name: "Bon Sang",
    description:
      "Comprendre le don du sang, tester son éligibilité et trouver une collecte près de chez soi.",
    lang: "fr",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f1e8",
    theme_color: "#b8102b",
  };
}
