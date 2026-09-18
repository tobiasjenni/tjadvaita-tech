# Website security

This is a public static GitHub Pages repository. Never commit service credentials, environment files, visitor logs, databases, or private user information. The former analytics server is disabled; do not deploy historical versions. A historical credential must be treated as exposed wherever an old copy was used. Removing it from current files does not remove it from Git history.

The active pages have a restrictive Content Security Policy in HTML. Cloudflare also supplies HTTP security headers, including frame-ancestor protection, HTTPS enforcement, and restrictions on sensitive browser features. HTTP headers must remain configured at the edge: GitHub Pages does not use a `_headers` file. Keep Cloudflare's active-page CSP allowlist coordinated with new embedded applications.

The Sutra reader, timer, and Lila remain live cross-origin applications. Their frames are sandboxed without top-level navigation permissions, while retaining scripts, their own origin/storage, source links, and downloads. The Sutra frame also permits forms so its local search submit handler works; the timer and Lila do not need form permissions. Backend security remains the responsibility of each original deployment. A frontend cannot keep a secret or enforce API rate limits.

Security checks scan the current tree for credentials on pushes and pull requests using a checksum-verified Gitleaks release and read-only GitHub permissions. Historical scanning is performed separately: a known retired credential remains in history and must never be reused. Enable GitHub secret scanning and push protection in repository settings where available.

When reporting a suspected vulnerability, contact the site owner privately. Do not include credentials or private visitor information in a public issue.
