/**
 * `crypto.randomUUID()` avec repli. L'API n'existe que dans un contexte sécurisé
 * (HTTPS ou `localhost`) et manque sur quelques navigateurs anciens. Les replis ne
 * sont pas cryptographiquement sûrs mais suffisent pour des identifiants locaux.
 */
export function randomId(): string {
  const c: Crypto | undefined = globalThis.crypto;

  if (typeof c?.randomUUID === "function") {
    return c.randomUUID();
  }

  if (typeof c?.getRandomValues === "function") {
    const bytes = c.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
    return (
      hex.slice(0, 4).join("") +
      "-" +
      hex.slice(4, 6).join("") +
      "-" +
      hex.slice(6, 8).join("") +
      "-" +
      hex.slice(8, 10).join("") +
      "-" +
      hex.slice(10, 16).join("")
    );
  }

  return `id-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
}
