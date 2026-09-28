# Accessibility

Defensive Signal is designed to meet WCAG 2.2 level AA. This is a design goal,
not a certified conformance claim: the starter has not had an independent
accessibility audit. Automated audits catch structural mistakes, but most of
these commitments need checking by hand after any significant change.

## Commitments

**Structure**
- A skip link is the first focusable element and moves focus to `<main>`.
- One `h1` per page and a heading order without gaps.
- Landmarks: notice (`aside`), `header`, `nav` labeled “Primary”, `main`,
  and `footer`. Pages with a table of contents label it as a second `nav`.
- The current route is marked with `aria-current="page"`.

**Keyboard and pointer**
- Every link and button is reachable with Tab. Links activate with Enter;
  buttons activate with Enter or Space.
- Focus is always visible: a 3px ring with offset, drawn in the system
  highlight color under forced colors.
- Standalone controls (navigation, buttons, filter chips, and contact links)
  are at least 44 CSS pixels tall. Links inside running text are exempt.
- Nothing depends on hover.

**Filter**
- Filter buttons use `aria-pressed`. A polite status message announces the
  result after a visitor changes the filter.
- The choice is stored in the address, so Back and Forward restore it and it
  can be shared.
- Without JavaScript the filter is hidden and every case note is shown.

**Motion**
- The only animation is the artwork sweep. It never starts under reduced
  motion, stops when offscreen or hidden, and has a **Pause motion** button
  (WCAG success criterion 2.2.2, Pause, Stop, Hide).

**Visual**
- Text reflows without horizontal scrolling at 320 CSS pixels and at 400% zoom.
- Light and dark themes follow the system setting.
- Forced-colors mode removes decorative backgrounds and the Canvas, and uses
  system colors for current, pressed, and focus states.
- The artwork is decorative (`alt=""`). If it fails, a CSS stand-in appears.

## Contrast

Ratios measured against the relevant background tokens.

| Pair | Light | Dark |
| --- | --- | --- |
| Body text on page | 14.4 : 1 | 14.6 : 1 |
| Secondary text on page | 8.3 : 1 | 11.0 : 1 |
| Tertiary text on page | 5.7 : 1 | 7.7 : 1 |
| Tertiary text on footer band | 5.0 : 1 | 8.2 : 1 |
| Accent on page | 5.6 : 1 | 8.6 : 1 |
| Link on page | 8.8 : 1 | 9.6 : 1 |
| Notice text on notice strip | 10.7 : 1 | 10.3 : 1 |
| Text on accent button hover | 6.3 : 1 | 9.1 : 1 |
| Control border on panel (non-text) | 3.5 : 1 | 3.6 : 1 |

If you change `tokens.css`, re-measure every pair above.

## Manual test checklist

- [ ] Keyboard only: Tab through every route; skip link, navigation, filter,
      pause button, and all links work and show focus.
- [ ] Screen reader: landmarks, headings, current page, pressed state, and
      filter status are announced sensibly.
- [ ] 320 CSS pixels wide and 400% zoom: no horizontal scrolling or clipped text.
- [ ] Reduced motion on: no sweep, no pause button.
- [ ] Forced colors (for example Windows Contrast themes): everything readable,
      current and pressed states visible.
- [ ] JavaScript off: all content present, filter hidden, no broken controls.
- [ ] Artwork blocked: the plate shows the CSS stand-in, layout unchanged.
- [ ] Back, Forward, and deep links (`/work/?area=platform`, `/work/#header-baseline`).

Record what you tested, on which browser and device, and what you did not test.
