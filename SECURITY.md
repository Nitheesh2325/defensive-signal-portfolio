# Security Policy

## Supported versions

Security fixes are made on the default branch only. There are no separately
maintained release branches.

## Reporting a vulnerability

Please report vulnerabilities **privately**. Do not open a public issue.

Use the repository's private vulnerability reporting: open the **Security** tab
and choose **Report a vulnerability**. If that option is not available, open an
issue that asks for a private contact and contains no details of the
vulnerability. Include in your private report:

- what the issue is and where it occurs (file, route, or build step);
- steps to reproduce, or a minimal proof of concept;
- the impact you believe it has.

The maintainers aim to acknowledge reports, assess them, and coordinate a fix
and disclosure where one is needed. Response times are best effort and not
guaranteed. Please give the maintainers reasonable time to release a fix before
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
- Content is escaped when rendered, and only `https:`, `mailto:`, root-relative,
  and in-page links are accepted.

These measures reduce risk; they do not make a site built from the starter
secure by themselves. Review your own content, hosting, and headers before
publishing.
- The CI workflow uses a read-only token, pins every action to a full commit
  SHA, and never deploys or commits.
