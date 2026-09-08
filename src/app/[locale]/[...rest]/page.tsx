import { notFound } from "next/navigation";

// Le segment [locale] agit comme un catch-all : toute route inconnue tombe ici
// et déclenche le not-found localisé.
export default function CatchAllPage() {
  notFound();
}
