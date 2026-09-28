# Security Policy

## Supported versions

Only the latest release on the default branch receives security fixes.

## Reporting a vulnerability

Please report vulnerabilities **privately**. Do not open a public issue.

Use the repository's private vulnerability reporting: open the **Security** tab
and choose **Report a vulnerability**. Include:

- what the issue is and where it occurs (file, route, or build step);
- steps to reproduce, or a minimal proof of concept;
- the impact you believe it has.

You can expect an acknowledgement, an assessment, and a coordinated fix and
disclosure. Please give the maintainers reasonable time to release a fix before
sharing details publicly.

## Scope

In scope:

- the starter's source, build configuration, and scripts;
- the generated static output (for example, a way to bypass the Content
  Security Policy or inject markup through the content module);
- the CI workflow configuration.

Out of scope:

- sites that other people have built from this starter and deployed;
- hosting configuration you apply yourself;
- vulnerabilities in upstream tools, which should be reported to those projects.

## Security design

- No runtime dependencies, network requests, cookies, or client-side storage.
- A strict Content Security Policy is added to every built page.
- Content is escaped when rendered, and only `https:`, `mailto:`, and same-site
  links are accepted.
- The CI workflow uses a read-only token, pins every action to a full commit
  SHA, and never deploys or commits.
