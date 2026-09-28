/**
 * Content contract for Defensive Signal.
 *
 * Every word a visitor reads on Home, Profile, and Work comes from one object that
 * satisfies `PortfolioContent`. Replace `profile.ts` with your own facts and the
 * whole site re-renders at build time. Nothing here is fetched at runtime.
 */

/** A short identifier used in URLs (`/work/?area=…`) and element ids. */
export type Slug = string;

export interface Person {
  /** Display name. The demo uses an obviously fictional name. */
  readonly name: string;
  /** One-line role, written in plain words. */
  readonly role: string;
  /** Where you work from, at whatever precision you are comfortable publishing. */
  readonly base: string;
  /** Two or three sentences shown on Home. */
  readonly statement: string;
  /** A longer introduction for the Profile route, one string per paragraph. */
  readonly introduction: readonly string[];
}

export interface ContactLink {
  readonly label: string;
  /** `mailto:` or `https:` only. The demo uses the reserved `example.invalid` domain. */
  readonly href: string;
  /** Visible text for the link, e.g. the address itself. */
  readonly text: string;
}

export interface PracticeArea {
  readonly slug: Slug;
  readonly title: string;
  readonly summary: string;
  /** What you actually do in this area. Describe activities, never proficiency scores. */
  readonly activities: readonly string[];
  /** Tools or methods you use, named generically or by their public project names. */
  readonly methods: readonly string[];
}

export interface Principle {
  readonly title: string;
  readonly detail: string;
}

export interface CaseNote {
  readonly slug: Slug;
  readonly title: string;
  /** Must match a `PracticeArea.slug`. Used by the Work filter. */
  readonly area: Slug;
  /** Short framing shown in lists and on Home. */
  readonly teaser: string;
  readonly context: string;
  readonly approach: readonly string[];
  /** Qualitative result. Do not invent numbers you cannot evidence. */
  readonly result: string;
  /** What you would check or improve next. Shows judgement without overclaiming. */
  readonly nextQuestions: readonly string[];
}

export interface LearningEntry {
  readonly title: string;
  readonly detail: string;
}

export interface SiteSettings {
  /** Product name shown in the header and page titles. */
  readonly siteName: string;
  /** Language tag for `<html lang>`. */
  readonly lang: string;
  /**
   * When true, every page carries a visible banner stating the content is fictional.
   * Set it to false only after replacing all demonstration content.
   */
  readonly demonstration: boolean;
  /** When false, pages ship `<meta name="robots" content="noindex, nofollow">`. */
  readonly indexable: boolean;
  /** Absolute origin such as `https://portfolio.example`. Leave empty to omit canonical links. */
  readonly origin: string;
  /** Short credit line in the footer. Plain text, never a link. */
  readonly credit: string;
}

export interface PortfolioContent {
  readonly site: SiteSettings;
  readonly person: Person;
  readonly contact: readonly ContactLink[];
  readonly principles: readonly Principle[];
  readonly practice: readonly PracticeArea[];
  readonly work: readonly CaseNote[];
  readonly learning: readonly LearningEntry[];
  /** How this person likes to be contacted and what they are open to. */
  readonly availability: string;
}
