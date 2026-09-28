/**
 * Progressive enhancement for Defensive Signal.
 *
 * Every page is complete HTML before this file runs. Each enhancement below is
 * optional and isolated: if one throws, the page and the others keep working.
 */

import { initPlate } from "./enhance/plate.ts";
import { initWorkFilter } from "./enhance/work-filter.ts";

document.documentElement.dataset.js = "on";

const enhancements: ReadonlyArray<readonly [string, () => void]> = [
  ["artwork plate", () => initPlate()],
  ["work filter", () => initWorkFilter()],
];

for (const [name, run] of enhancements) {
  try {
    run();
  } catch (error) {
    console.warn(`[defensive-signal] ${name} disabled`, error);
  }
}
