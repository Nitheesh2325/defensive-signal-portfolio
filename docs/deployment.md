# Deployment

`npm run build` produces a static site in `dist/`. Any host that serves files
over HTTPS can publish it. This starter deliberately ships no host-specific
configuration.

## Checklist

1. `npm ci && npm run check && npm audit`
2. Upload or point your host at `dist/`.
3. Serve `404.html` for unknown paths.
4. Serve directory routes at clean URLs with a trailing slash: `/profile/`,
   `/work/`, `/guide/`.
5. Configure the response headers below.
6. Visit every route over HTTPS and check the browser console for errors.

## Recommended response headers

The pages already carry a Content Security Policy meta tag. Sending the policy
as a header as well lets you add `frame-ancestors`, which a meta tag cannot set.

| Header | Value |
| --- | --- |
| `Content-Security-Policy` | `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; font-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `no-referrer` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` (only once HTTPS works everywhere on the domain) |
| `Cache-Control` for `/assets/*` | `public, max-age=31536000, immutable` (file names are content-hashed) |
| `Cache-Control` for HTML | `no-cache` |

If you add anything that needs another origin, widen only the directive that
needs it and document why.

## After deploying

- Confirm the headers with your browser's developer tools.
- Confirm there are no requests to other origins in the network panel.
- Confirm `robots` meta matches your intent: demonstration builds are
  `noindex, nofollow`.
