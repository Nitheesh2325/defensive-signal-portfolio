/**
 * DEMONSTRATION CONTENT — FICTIONAL.
 *
 * "Avery Example" is not a real person. Every scenario below is invented to show
 * the shape of a truthful security portfolio. Replace this whole object with your
 * own facts before publishing, then set `site.demonstration` to false.
 *
 * Contact details use `example.invalid`, a domain reserved by RFC 2606 that can
 * never receive mail or resolve.
 */

import type { PortfolioContent } from "./schema.ts";

export const content: PortfolioContent = {
  site: {
    siteName: "Defensive Signal",
    lang: "en",
    demonstration: true,
    indexable: false,
    origin: "",
    credit: "Defensive Signal starter · ASTRAYAN Web Studio",
  },

  person: {
    name: "Avery Example",
    role: "Defensive security practitioner (fictional)",
    base: "Remote · Example Region",
    statement:
      "Avery is a made-up practitioner who cares about quiet, well-evidenced defense: logs that answer real questions, threat models people actually read, and fixes that stay fixed.",
    introduction: [
      "Avery Example exists only to demonstrate this starter. The profile shows how to describe security work honestly: what was done, why, and what is still uncertain.",
      "The imagined practice centers on small teams without a dedicated security function, where the most useful work is often making existing systems observable and making risky changes easier to review.",
    ],
  },

  contact: [
    { label: "Email", href: "mailto:avery@example.invalid", text: "avery@example.invalid" },
    { label: "Professional profile", href: "https://profile.example.invalid/avery", text: "profile.example.invalid/avery" },
  ],

  principles: [
    {
      title: "Evidence before adjectives",
      detail: "Describe what changed and how you know. Leave out impressive words you cannot support.",
    },
    {
      title: "Defaults over heroics",
      detail: "Prefer safe configuration and review habits that keep working when nobody is watching.",
    },
    {
      title: "Say what is still open",
      detail: "Every case note ends with the questions that remain, because security work rarely finishes neatly.",
    },
  ],

  practice: [
    {
      slug: "detection",
      title: "Detection and logging",
      summary: "Making systems explain themselves before an incident, not after it.",
      activities: [
        "Mapping which events a service records and which questions those events can answer",
        "Writing plain-language alert descriptions with an owner and a first response step",
        "Reviewing noisy alerts and retiring the ones nobody acts on",
      ],
      methods: ["Structured logging", "Detection rules written as code", "Alert runbooks"],
    },
    {
      slug: "application",
      title: "Application security",
      summary: "Helping product teams find design risks while they are still cheap to change.",
      activities: [
        "Running short threat-modeling sessions on new features",
        "Reviewing authentication and file-handling code paths",
        "Turning review findings into small, testable tickets",
      ],
      methods: ["Data-flow diagrams", "OWASP guidance", "Peer code review"],
    },
    {
      slug: "platform",
      title: "Platform hardening",
      summary: "Reducing what an attacker can reach by tightening configuration.",
      activities: [
        "Auditing HTTP response headers and content security policies",
        "Removing unused services, ports, and permissions",
        "Documenting a baseline so drift is easy to spot",
      ],
      methods: ["Configuration baselines", "Least-privilege reviews", "Header and TLS checks"],
    },
    {
      slug: "response",
      title: "Incident readiness",
      summary: "Practicing the first hour of an incident before it happens.",
      activities: [
        "Facilitating tabletop exercises with realistic, low-drama scenarios",
        "Keeping contact lists and escalation paths current",
        "Writing blameless reviews that end in owned actions",
      ],
      methods: ["Tabletop exercises", "Escalation playbooks", "Post-incident reviews"],
    },
  ],

  work: [
    {
      slug: "log-coverage",
      title: "Making a small web service answer “who changed this?”",
      area: "detection",
      teaser: "An invented service could not tell who changed account settings. Its logs were extended until it could.",
      context:
        "In this fictional scenario, a small team ran a customer web service whose logs recorded errors but not account changes. A support question about an unexpected email change could not be answered.",
      approach: [
        "Listed the five questions the team most wanted logs to answer",
        "Added structured events for account changes with actor, target, and time",
        "Wrote a short runbook showing how to search for each question",
      ],
      result:
        "The team could trace account changes to a session in the imagined follow-up. The runbook became part of onboarding.",
      nextQuestions: [
        "How long should these events be retained, and who approves that?",
        "Which of these events deserve an alert rather than a search?",
      ],
    },
    {
      slug: "upload-threat-model",
      title: "Threat modeling a file-upload feature",
      area: "application",
      teaser: "A one-hour session on a planned upload feature surfaced three design changes before any code was written.",
      context:
        "A fictional product team planned to let users upload documents. Avery facilitated a one-hour threat-modeling session using a whiteboard data-flow diagram.",
      approach: [
        "Drew the upload path from browser to storage with the team",
        "Asked what could go wrong at each boundary using simple prompts",
        "Agreed which risks to design out and which to monitor",
      ],
      result:
        "The design was changed to store uploads outside the web root, check file types on the server, and serve downloads from a separate origin.",
      nextQuestions: [
        "Is malware scanning proportionate for this product's users?",
        "Who reviews the feature again if file types are expanded?",
      ],
    },
    {
      slug: "header-baseline",
      title: "A response-header baseline for a static site",
      area: "platform",
      teaser: "A static marketing site gained a documented header baseline that later changes are checked against.",
      context:
        "In this invented example, a static site had no content security policy and allowed itself to be framed by any origin.",
      approach: [
        "Inventoried every script, style, and image origin the site used",
        "Introduced a strict content security policy in report-only mode first",
        "Added frame, referrer, and permissions policies and documented each choice",
      ],
      result:
        "The policy moved from report-only to enforced after a quiet observation period, and the baseline was added to the release checklist.",
      nextQuestions: [
        "Should policy violations be collected, and where would that data live?",
        "How will third-party additions be reviewed in future?",
      ],
    },
    {
      slug: "lost-laptop-tabletop",
      title: "Tabletop: the lost laptop",
      area: "response",
      teaser: "A calm, forty-five-minute exercise showed gaps in who could revoke access out of hours.",
      context:
        "A fictional organization had never practiced a device-loss scenario. Avery ran a short tabletop with the people who would really be involved.",
      approach: [
        "Wrote a realistic scenario with three timed injects",
        "Asked participants to talk through actions rather than ideal answers",
        "Captured every “I'm not sure who does that” as an action",
      ],
      result:
        "The imagined team named an out-of-hours owner for access revocation and wrote a one-page checklist for device loss.",
      nextQuestions: [
        "When should the exercise be repeated, and with which new injects?",
        "Can revocation be tested safely without a real incident?",
      ],
    },
  ],

  learning: [
    {
      title: "Reading public incident reviews",
      detail: "Avery keeps notes on published post-incident reviews and what each one teaches about detection gaps.",
    },
    {
      title: "Home lab practice",
      detail: "A small lab of virtual machines is used to try hardening changes before recommending them.",
    },
    {
      title: "Writing for non-specialists",
      detail: "Practicing short explanations of risk that a product manager can act on in one read.",
    },
  ],

  availability:
    "This is where a real profile would say what kind of work the person is open to and how they prefer to be contacted.",
};
