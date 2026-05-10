<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:sync-subdomain-rules -->
# SYNC is a Subdomain

The SYNC Marketplace (found in src/app/sync) is designed as an independent subdomain (sync.chameleon.vision).
It uses Next.js Middleware to rewrite URLs.
ALL links inside the SYNC platform MUST use clean URLs (e.g. /checkout, /dashboard, /auth/login) WITHOUT the /sync prefix, so that the URL in the browser remains clean for the end user on the subdomain.
Local testing for SYNC must be done via http://sync.localhost:3000 to trigger the middleware correctly.
Do NOT modify the main Chameleon Vision app routing when working on SYNC.
<!-- END:sync-subdomain-rules -->
