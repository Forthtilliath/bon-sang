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
    background_color: "#0b0b0d",
    theme_color: "#d21f2c",
  };
}
