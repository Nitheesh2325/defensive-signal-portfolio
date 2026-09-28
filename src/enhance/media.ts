/**
 * Calls `onChange` now and whenever the media query result changes.
 * Returns a function that stops listening. Safe where matchMedia is missing.
 */
export function watchMedia(query: string, onChange: (matches: boolean) => void): () => void {
  if (typeof window.matchMedia !== "function") {
    onChange(false);
    return () => {};
  }
  const list = window.matchMedia(query);
  const handler = (): void => onChange(list.matches);
  handler();
  list.addEventListener("change", handler);
  return () => list.removeEventListener("change", handler);
}
