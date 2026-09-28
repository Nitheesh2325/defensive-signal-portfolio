/**
 * Work route filter.
 *
 * Without JavaScript every case note is visible and the filter stays hidden. With
 * JavaScript, the chosen practice area is stored in the address (`?area=…`) so the
 * view can be shared, bookmarked, and moved through with Back and Forward.
 */

const PARAM = "area";

export function initWorkFilter(root: ParentNode = document): void {
  const bar = root.querySelector<HTMLElement>("[data-filter]");
  const list = root.querySelector<HTMLElement>("[data-cases]");
  if (!bar || !list) return;

  const buttons = Array.from(bar.querySelectorAll<HTMLButtonElement>("[data-filter-value]"));
  const cases = Array.from(list.querySelectorAll<HTMLElement>("[data-area]"));
  const status = bar.querySelector<HTMLElement>("[data-filter-status]");
  const known = new Set(buttons.map((b) => b.dataset.filterValue ?? "").filter(Boolean));

  const readArea = (): string => {
    const value = new URLSearchParams(window.location.search).get(PARAM) ?? "";
    return known.has(value) ? value : "";
  };

  const apply = (area: string, announce: boolean): void => {
    let shown = 0;
    for (const note of cases) {
      const match = area === "" || note.dataset.area === area;
      note.hidden = !match;
      if (match) shown++;
    }
    let label = "";
    for (const button of buttons) {
      const active = (button.dataset.filterValue ?? "") === area;
      button.setAttribute("aria-pressed", String(active));
      if (active && area) label = button.textContent ?? "";
    }
    if (status) {
      const text = `Showing ${shown} of ${cases.length} case notes${label ? ` in ${label}` : ""}.`;
      // Only announce changes the visitor caused; the initial state is read normally.
      status.textContent = announce ? text : "";
      status.dataset.summary = text;
    }
  };

  bar.hidden = false;

  // A deep link to a specific note wins over a filter that would hide it.
  let initial = readArea();
  const target = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
  if (initial && target && cases.includes(target) && target.dataset.area !== initial) {
    initial = "";
    const url = new URL(window.location.href);
    url.searchParams.delete(PARAM);
    window.history.replaceState({ area: "" }, "", url);
  }
  apply(initial, false);
  if (target && cases.includes(target)) target.scrollIntoView({ block: "start", behavior: "instant" });

  for (const button of buttons) {
    button.addEventListener("click", () => {
      const area = button.dataset.filterValue ?? "";
      if (area === readArea()) return;
      const url = new URL(window.location.href);
      if (area) url.searchParams.set(PARAM, area);
      else url.searchParams.delete(PARAM);
      url.hash = "";
      window.history.pushState({ area }, "", url);
      apply(area, true);
    });
  }

  window.addEventListener("popstate", () => apply(readArea(), true));

  // Following an in-page link to a note the filter is hiding: show everything
  // again so the target is visible, and drop the filter from the address.
  window.addEventListener("hashchange", () => {
    const hashTarget = document.getElementById(window.location.hash.slice(1));
    if (!hashTarget || !cases.includes(hashTarget) || !hashTarget.hidden) return;
    const url = new URL(window.location.href);
    url.searchParams.delete(PARAM);
    window.history.replaceState({ area: "" }, "", url);
    apply("", true);
    hashTarget.scrollIntoView({ block: "start", behavior: "instant" });
  });
}
