/**
 * Home artwork plate.
 *
 * 1. Artwork failure: if the SVG cannot load, the plate switches to a CSS stand-in.
 * 2. Sweep: a slow rotating line with a fading trail, drawn on a Canvas above the
 *    artwork. It is decorative and bounded:
 *    - never starts under reduced motion or forced colors;
 *    - runs only while the plate is on screen, the tab is visible, and the visitor
 *      has not pressed "Pause motion";
 *    - is capped at 30 frames per second, device pixel ratio 2, and 1 megapixel of
 *      backing store;
 *    - is left intact for the back/forward cache and destroyed on a real unload.
 */

import { watchMedia } from "./media.ts";

const PERIOD_MS = 9000;
const FRAME_MS = 1000 / 30;
const MAX_DPR = 2;
const MAX_BACKING_PIXELS = 1_000_000;
const TRAIL_STEPS = 28;
const TRAIL_RADIANS = Math.PI * 0.55;

export function initPlate(root: ParentNode = document): void {
  const plate = root.querySelector<HTMLElement>("[data-plate]");
  if (!plate) return;
  watchArtwork(plate);
  initSweep(plate);
}

function watchArtwork(plate: HTMLElement): void {
  const img = plate.querySelector<HTMLImageElement>("[data-plate-art]");
  if (!img) return;
  const fail = (): void => {
    plate.dataset.artState = "failed";
  };
  if (img.complete && img.naturalWidth === 0) fail();
  img.addEventListener("error", fail, { once: true });
}

function initSweep(plate: HTMLElement): void {
  const stage = plate.querySelector<HTMLElement>("[data-plate-stage]");
  const toggle = plate.querySelector<HTMLButtonElement>("[data-motion-toggle]");
  if (!stage || !toggle) return;

  const canvas = document.createElement("canvas");
  let ctx: CanvasRenderingContext2D | null = null;
  try {
    ctx = canvas.getContext("2d");
  } catch {
    ctx = null;
  }
  if (!ctx) return;
  const g = ctx;

  canvas.className = "plate__sweep";
  canvas.setAttribute("aria-hidden", "true");

  let reducedMotion = false;
  let forcedColors = false;
  let onScreen = false;
  let paused = false;
  let frame = 0;
  let lastDraw = 0;
  let angle = -Math.PI / 2;
  let lastTime = 0;
  let color = "#a83d18";
  let mounted = false;

  const allowed = (): boolean => !reducedMotion && !forcedColors;
  const shouldRun = (): boolean => allowed() && onScreen && !paused && document.visibilityState === "visible";

  const readColor = (): void => {
    color = getComputedStyle(plate).getPropertyValue("--accent").trim() || color;
  };

  const resize = (): void => {
    const rect = stage.getBoundingClientRect();
    let dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const area = rect.width * rect.height * dpr * dpr;
    if (area > MAX_BACKING_PIXELS) dpr *= Math.sqrt(MAX_BACKING_PIXELS / area);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    draw();
  };

  const draw = (): void => {
    const { width: w, height: h } = canvas;
    g.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h * 0.515;
    const r = Math.hypot(w, h) / 2;
    g.lineCap = "round";
    for (let i = TRAIL_STEPS; i >= 0; i--) {
      const a = angle - (i / TRAIL_STEPS) * TRAIL_RADIANS;
      const alpha = i === 0 ? 0.75 : 0.18 * (1 - i / TRAIL_STEPS) ** 2;
      g.globalAlpha = alpha;
      g.strokeStyle = color;
      g.lineWidth = i === 0 ? Math.max(1.5, w / 400) : Math.max(1, w / 90);
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      g.stroke();
    }
    g.globalAlpha = 1;
  };

  const tick = (now: number): void => {
    frame = 0;
    if (!shouldRun()) return;
    if (lastTime === 0) lastTime = now;
    if (now - lastDraw >= FRAME_MS) {
      angle = (angle + ((now - lastTime) / PERIOD_MS) * Math.PI * 2) % (Math.PI * 2);
      lastTime = now;
      lastDraw = now;
      draw();
    }
    frame = requestAnimationFrame(tick);
  };

  const update = (): void => {
    if (shouldRun()) {
      if (!frame) {
        lastTime = 0;
        frame = requestAnimationFrame(tick);
      }
    } else if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };

  const mount = (): void => {
    if (mounted) return;
    mounted = true;
    stage.append(canvas);
    toggle.hidden = false;
    readColor();
    resize();
  };

  const unmount = (): void => {
    if (!mounted) return;
    mounted = false;
    canvas.remove();
    toggle.hidden = true;
  };

  const applyPreferences = (): void => {
    if (allowed()) mount();
    else unmount();
    update();
  };

  toggle.addEventListener("click", () => {
    paused = !paused;
    toggle.setAttribute("aria-pressed", String(paused));
    update();
  });

  const intersection =
    "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
          onScreen = entries.some((e) => e.isIntersecting);
          update();
        })
      : null;
  if (intersection) intersection.observe(stage);
  else onScreen = true;

  const sizing = "ResizeObserver" in window ? new ResizeObserver(() => mounted && resize()) : null;
  sizing?.observe(stage);

  const stopReduced = watchMedia("(prefers-reduced-motion: reduce)", (m) => {
    reducedMotion = m;
    applyPreferences();
  });
  const stopForced = watchMedia("(forced-colors: active)", (m) => {
    forcedColors = m;
    applyPreferences();
  });
  const stopScheme = watchMedia("(prefers-color-scheme: dark)", () => {
    readColor();
    if (mounted) draw();
  });

  document.addEventListener("visibilitychange", update);

  // A persisted pagehide means the page is entering the back/forward cache: keep
  // everything, the browser freezes it and visibilitychange resumes it. Otherwise
  // the document is going away, so release observers and the frame loop.
  window.addEventListener("pagehide", (event) => {
    if (event.persisted) return;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    intersection?.disconnect();
    sizing?.disconnect();
    stopReduced();
    stopForced();
    stopScheme();
    document.removeEventListener("visibilitychange", update);
  });
}
