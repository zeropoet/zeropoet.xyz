# docs/

This folder contains the published static site for `https://zeropoet.xyz`.

## Contents

- `index.html` - top-level page
- `styles.css` - page styling
- `og-image.svg` - Open Graph image
- `ovel-geometry-logo.svg` and `ovel-geometry-logo.jpg` - brand assets
- `robots.txt` - crawler rules
- `sitemap.xml` - sitemap
- `CNAME` - custom domain config

## Local development

Serve this folder locally with any static server. Example:

```bash
cd docs
python3 -m http.server 8080
```

Visit `http://localhost:8080`.

## Notes

- Keep paths relative so the site works both locally and on GitHub Pages.
- If page metadata changes, update both social tags in `index.html` and `og-image.svg` if needed.
