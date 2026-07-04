# DiscVault.EU

Marketing website for [DiscVault](https://github.com/helmerzNL/DiscVault),
served via GitHub Pages at **https://discvault.eu**.

## Structure

- `index.html` — main landing page
- `faq.html` — frequently asked questions
- `styles.css` — site styles
- `translations.js`, `translations-extra.js` — i18n strings
- `images/` — screenshots and assets
- `legacy/` — older assets
- `CNAME` — custom domain (`discvault.eu`)
- `.nojekyll` — disables Jekyll processing

## Deployment

Pushing to `master` triggers the workflow in
`.github/workflows/pages.yml`, which uploads the repository root and deploys it
to GitHub Pages.
