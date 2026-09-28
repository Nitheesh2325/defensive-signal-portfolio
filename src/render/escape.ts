const ENTITIES: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escapes text for use in HTML element content and quoted attribute values. */
export const esc = (value: string): string => value.replace(/[&<>"']/g, (ch) => ENTITIES[ch] ?? ch);

/** Only `mailto:`, `https:`, root-relative, and in-page links are rendered. */
export const safeHref = (href: string): string => {
  if (/^(mailto:|https:\/\/|\/(?!\/)|#)/i.test(href)) return esc(href);
  throw new Error(`Refusing to render an unsupported link: ${href}`);
};

/** Joins rendered fragments, skipping empty ones. */
export const join = (parts: readonly (string | false | null | undefined)[]): string =>
  parts.filter((p): p is string => typeof p === "string" && p.length > 0).join("\n");
