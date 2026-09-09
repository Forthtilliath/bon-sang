/** Injecte un bloc JSON-LD. `data` est construit côté serveur, jamais depuis une entrée utilisateur. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
