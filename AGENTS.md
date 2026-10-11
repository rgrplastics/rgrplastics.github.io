# Project Agent Guide

## Keep Work Focused

- Start with the file that owns the requested behavior. Read only the relevant section and its direct callers or data; expand scope only when that evidence requires it.
- Avoid broad repository scans, full-file dumps, and unrelated cleanup. Do not inspect product images or enumerate large data files unless the task needs them.
- Preserve existing user changes and keep edits limited to the requested behavior.

## File Map

- `index.html`: main page markup, metadata, and page structure.
- `css/theme.css`: shared site styling.
- `js/app.js`: product rendering, cart behavior, and main-page interactions.
- `js/quotation.js`: quote/enquiry flow.
- `js/firebase-auth.js`: Firebase phone authentication.
- `js/config.js`: shared runtime configuration and displayed version.
- `assets/products.json`, `assets/sizes.json`: product and size data. The app loads `assets/products.json`.
- `brochure.html`, `oil-container-spotlight.html`: standalone content pages; use these for changes specific to those pages.
- `img/`, `assets/`: image and downloadable assets. Inspect only the specific asset needed.
- `robots.txt`, `sitemap.xml`, `CNAME`: crawl and domain configuration.

## Validation

- This is a static website. No package manifest, build command, or test runner is currently defined; do not invent one or add dependencies for a narrow change.
- Validate the touched surface with an available focused check (for example, JavaScript syntax or JSON parsing), and inspect the rendered page when behavior or layout changes. Report checks that could not be run.
- Keep documentation and code changes concise; summarize only the files changed and relevant validation results.
