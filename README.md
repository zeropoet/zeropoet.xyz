# zeropoet.xyz

Static source for the `zeropoet.xyz` site.

## What is in this repo

- `docs/index.html` - main page markup
- `docs/styles.css` - site styles
- `docs/og-image.svg` - social preview image
- `docs/ovel-geometry-logo.*` - site logo assets
- `docs/CNAME` - custom domain for GitHub Pages
- `docs/robots.txt` and `docs/sitemap.xml` - crawler metadata

## Local preview

Run a simple static server from the `docs` directory:

```bash
cd docs
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy

This repository is set up for GitHub Pages using `docs/` as the publish folder and `zeropoet.xyz` as the custom domain.
