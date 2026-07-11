# [zeropoet.xyz](https://zeropoet.xyz)

The personal project index for Mancel Lindsey / Zeropoet, presented under the
title “Void Architect.” It connects the current FoldForge, FoldKernel, Root
Logos, Sovereign Standard, and Telos projects from one minimal landing page.

## Project links

- [FoldForge](https://zeropoet.github.io/FoldForge)
- [FoldKernel](https://github.com/zeropoet/foldkernel)
- [Root Logos](https://rootlogos.com/)
- [Sovereign Standard](https://sovereignstandard.co)
- [Telos](https://github.com/zeropoet/Telos)

## Repository structure

The site is intentionally dependency-free and published from `docs/`:

- `docs/index.html` contains the page structure, project links, and metadata.
- `docs/styles.css` contains the responsive layout and typography.
- `docs/CNAME` configures the custom domain for GitHub Pages.
- `docs/robots.txt` and `docs/sitemap.xml` provide crawler metadata.

## Run locally

Start a static server from the repository root:

```bash
python3 -m http.server 8080 --directory docs
```

Then open [http://localhost:8080](http://localhost:8080). No install or build
step is required.

## Deployment

GitHub Pages deploys the `main` branch's `docs/` directory to the custom domain.
Changes are live after they are merged or pushed to `main` and the Pages build
finishes.
