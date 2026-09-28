import type { CaseNote, PortfolioContent, PracticeArea } from "../content/schema.ts";
import type { GuideSection } from "../content/guide.ts";
import { esc, join, safeHref } from "./escape.ts";
import type { PageSpec } from "./layout.ts";

const list = (items: readonly string[], tag: "ul" | "ol", cls: string): string =>
  `<${tag} class="${cls}">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</${tag}>`;

const areaTitle = (c: PortfolioContent, slug: string): string => {
  const area = c.practice.find((p) => p.slug === slug);
  if (!area) throw new Error(`Case note refers to unknown practice area "${slug}"`);
  return area.title;
};

const contactBlock = (c: PortfolioContent, headingId: string, level: "h2" | "h3" = "h2"): string => `
<section class="reach" aria-labelledby="${headingId}">
  <${level} id="${headingId}" class="section-title">Get in touch</${level}>
  <p class="reach__note">${esc(c.availability)}</p>
  <dl class="reach__list">
    ${c.contact
      .map(
        (link) =>
          `<div class="reach__row"><dt>${esc(link.label)}</dt><dd><a href="${safeHref(link.href)}">${esc(link.text)}</a></dd></div>`,
      )
      .join("")}
  </dl>
</section>`;

/* ------------------------------------------------------------------ Home */

const artwork = `
<figure class="plate" data-plate>
  <div class="plate__stage" data-plate-stage>
    <picture>
      <source srcset="/artwork/signal-contours-dark.svg" media="(prefers-color-scheme: dark)">
      <img class="plate__art" src="/artwork/signal-contours-light.svg" alt="" width="640" height="640" decoding="async" data-plate-art>
    </picture>
  </div>
  <figcaption class="plate__caption">
    <span>Original abstract artwork: contour lines around a quiet center.</span>
    <button class="plate__toggle" type="button" aria-pressed="false" data-motion-toggle hidden>Pause motion</button>
  </figcaption>
</figure>`;

const home = (c: PortfolioContent): PageSpec => {
  const featured = c.work.slice(0, 3);
  return {
    route: "home",
    path: "/",
    title: `${c.person.name} — ${c.site.siteName}${c.site.demonstration ? " demo" : ""}`,
    description: `Security portfolio of ${c.person.name}: working principles, practice areas, and case notes.`,
    main: join([
      `<section class="lede" aria-labelledby="lede-title">
  <div class="lede__text">
    <p class="kicker">Security portfolio</p>
    <h1 id="lede-title" class="lede__name">${esc(c.person.name)}</h1>
    <p class="lede__role">${esc(c.person.role)} <span class="lede__base">${esc(c.person.base)}</span></p>
    <p class="lede__statement">${esc(c.person.statement)}</p>
    <ul class="actions" aria-label="Explore">
      <li><a class="button button--solid" href="/work/">Read the case notes</a></li>
      <li><a class="button" href="/profile/">View the profile</a></li>
    </ul>
  </div>
  ${artwork}
</section>`,
      `<section class="ledger" aria-labelledby="principles-title">
  <h2 id="principles-title" class="section-title">How ${esc(c.person.name.split(" ")[0] ?? c.person.name)} works</h2>
  <ol class="ledger__list">
    ${c.principles
      .map(
        (p) =>
          `<li class="ledger__item"><h3 class="ledger__title">${esc(p.title)}</h3><p>${esc(p.detail)}</p></li>`,
      )
      .join("")}
  </ol>
</section>`,
      `<section class="shelf" aria-labelledby="notes-title">
  <div class="shelf__head">
    <h2 id="notes-title" class="section-title">Case notes</h2>
    <a class="text-link" href="/work/">All ${c.work.length} case notes</a>
  </div>
  <ul class="shelf__list">
    ${featured
      .map(
        (n) => `<li class="note-card">
      <p class="tag">${esc(areaTitle(c, n.area))}</p>
      <h3 class="note-card__title"><a href="/work/#${esc(n.slug)}">${esc(n.title)}</a></h3>
      <p>${esc(n.teaser)}</p>
    </li>`,
      )
      .join("")}
  </ul>
</section>`,
      `<section class="areas" aria-labelledby="areas-title">
  <h2 id="areas-title" class="section-title">Practice areas</h2>
  <ul class="areas__list">
    ${c.practice
      .map(
        (p) =>
          `<li><a class="area-link" href="/profile/#${esc(p.slug)}"><span class="area-link__title">${esc(p.title)}</span><span class="area-link__summary">${esc(p.summary)}</span></a></li>`,
      )
      .join("")}
  </ul>
</section>`,
      contactBlock(c, "reach-title"),
    ]),
  };
};

/* --------------------------------------------------------------- Profile */

const practiceSection = (p: PracticeArea): string => `
<section class="practice" id="${esc(p.slug)}" aria-labelledby="${esc(p.slug)}-title">
  <h3 id="${esc(p.slug)}-title" class="practice__title">${esc(p.title)}</h3>
  <p class="practice__summary">${esc(p.summary)}</p>
  <div class="practice__cols">
    <div>
      <h4 class="mini-title">What this looks like</h4>
      ${list(p.activities, "ul", "plain-list")}
    </div>
    <div>
      <h4 class="mini-title">Methods</h4>
      ${list(p.methods, "ul", "token-list")}
    </div>
  </div>
</section>`;

const profile = (c: PortfolioContent): PageSpec => ({
  route: "profile",
  path: "/profile/",
  title: `Profile · ${c.person.name}`,
  description: `Profile of ${c.person.name}: introduction, practice areas, learning notes, and contact details.`,
  main: `
<header class="page-head">
  <p class="kicker">Profile</p>
  <h1 class="page-head__title">${esc(c.person.name)}</h1>
  <p class="page-head__sub">${esc(c.person.role)} · ${esc(c.person.base)}</p>
</header>
<div class="with-toc">
  <nav class="toc" aria-label="On this page">
    <p class="toc__title">On this page</p>
    <ul class="toc__list">
      <li><a href="#introduction">Introduction</a></li>
      <li><a href="#practice">Practice areas</a>
        <ul>${c.practice.map((p) => `<li><a href="#${esc(p.slug)}">${esc(p.title)}</a></li>`).join("")}</ul>
      </li>
      <li><a href="#learning">Learning</a></li>
      <li><a href="#contact">Get in touch</a></li>
    </ul>
  </nav>
  <div class="with-toc__body">
    <section id="introduction" class="prose" aria-labelledby="intro-title">
      <h2 id="intro-title" class="section-title">Introduction</h2>
      ${c.person.introduction.map((para) => `<p>${esc(para)}</p>`).join("")}
    </section>
    <section id="practice" aria-labelledby="practice-title">
      <h2 id="practice-title" class="section-title">Practice areas</h2>
      ${c.practice.map(practiceSection).join("")}
    </section>
    <section id="learning" aria-labelledby="learning-title">
      <h2 id="learning-title" class="section-title">Learning</h2>
      <dl class="learning">
        ${c.learning.map((l) => `<div class="learning__row"><dt>${esc(l.title)}</dt><dd>${esc(l.detail)}</dd></div>`).join("")}
      </dl>
    </section>
    <div id="contact">${contactBlock(c, "profile-reach-title")}</div>
  </div>
</div>`,
});

/* ------------------------------------------------------------------ Work */

const caseNote = (c: PortfolioContent, n: CaseNote): string => `
<article class="case" id="${esc(n.slug)}" data-area="${esc(n.area)}" aria-labelledby="${esc(n.slug)}-title">
  <header class="case__head">
    <p class="tag">${esc(areaTitle(c, n.area))}</p>
    <h2 id="${esc(n.slug)}-title" class="case__title">${esc(n.title)}</h2>
    ${c.site.demonstration ? `<p class="case__flag">Fictional scenario</p>` : ""}
  </header>
  <div class="case__body">
    <section class="case__part"><h3 class="mini-title">Context</h3><p>${esc(n.context)}</p></section>
    <section class="case__part"><h3 class="mini-title">Approach</h3>${list(n.approach, "ol", "step-list")}</section>
    <section class="case__part"><h3 class="mini-title">Result</h3><p>${esc(n.result)}</p></section>
    <section class="case__part case__part--open"><h3 class="mini-title">Still open</h3>${list(n.nextQuestions, "ul", "plain-list")}</section>
  </div>
</article>`;

const work = (c: PortfolioContent): PageSpec => {
  const areasInUse = c.practice.filter((p) => c.work.some((n) => n.area === p.slug));
  return {
    route: "work",
    path: "/work/",
    title: `Work · ${c.person.name}`,
    description: `Case notes from ${c.person.name}: context, approach, result, and open questions for each piece of security work.`,
    main: `
<header class="page-head">
  <p class="kicker">Work</p>
  <h1 class="page-head__title">Case notes</h1>
  <p class="page-head__sub">Each note records the context, the approach, a qualitative result, and what is still open.</p>
</header>
<div class="filter" data-filter hidden>
  <p class="filter__label" id="filter-label">Show practice area</p>
  <ul class="filter__list" aria-labelledby="filter-label">
    <li><button class="chip" type="button" data-filter-value="" aria-pressed="true">All</button></li>
    ${areasInUse
      .map(
        (p) =>
          `<li><button class="chip" type="button" data-filter-value="${esc(p.slug)}" aria-pressed="false">${esc(p.title)}</button></li>`,
      )
      .join("")}
  </ul>
  <p class="filter__status" role="status" data-filter-status></p>
</div>
<div class="cases" data-cases>
  ${c.work.map((n) => caseNote(c, n)).join("")}
</div>`,
  };
};

/* ----------------------------------------------------------------- Guide */

const guideSection = (s: GuideSection): string => `
<section class="guide-part" id="${esc(s.id)}" aria-labelledby="${esc(s.id)}-title">
  <h2 id="${esc(s.id)}-title" class="section-title">${esc(s.title)}</h2>
  ${s.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}
  ${s.steps ? list(s.steps, "ol", "step-list") : ""}
  ${s.code ? `<pre class="code" tabindex="0"><code>${esc(s.code)}</code></pre>` : ""}
</section>`;

const guidePage = (c: PortfolioContent, sections: readonly GuideSection[]): PageSpec => ({
  route: "guide",
  path: "/guide/",
  title: `Guide · ${c.site.siteName}`,
  description: `How to adopt ${c.site.siteName}: replace the demonstration identity, keep accessibility, check privacy, and deploy a static build.`,
  main: `
<header class="page-head">
  <p class="kicker">Guide</p>
  <h1 class="page-head__title">Using this starter</h1>
  <p class="page-head__sub">${esc(c.site.siteName)} is a starting point for an honest, accessible security portfolio. This page explains how to make it yours.</p>
</header>
<div class="with-toc">
  <nav class="toc" aria-label="Guide sections">
    <p class="toc__title">Sections</p>
    <ol class="toc__list">${sections.map((s) => `<li><a href="#${esc(s.id)}">${esc(s.title)}</a></li>`).join("")}</ol>
  </nav>
  <div class="with-toc__body prose">
    ${sections.map(guideSection).join("")}
  </div>
</div>`,
});

/* ------------------------------------------------------------------- 404 */

const notFound = (c: PortfolioContent): PageSpec => ({
  route: "not-found",
  title: `Page not found · ${c.site.siteName}`,
  description: "The requested page does not exist. Use the navigation to continue.",
  main: `
<header class="page-head">
  <p class="kicker">404</p>
  <h1 class="page-head__title">Page not found</h1>
  <p class="page-head__sub">That address does not match a page here. Try <a href="/">Home</a>, <a href="/work/">Work</a>, or the <a href="/guide/">Guide</a>.</p>
</header>`,
});

export const pages = (c: PortfolioContent, sections: readonly GuideSection[]): Readonly<Record<string, PageSpec>> => ({
  "/index.html": home(c),
  "/profile/index.html": profile(c),
  "/work/index.html": work(c),
  "/guide/index.html": guidePage(c, sections),
  "/404.html": notFound(c),
});
