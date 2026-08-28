# [zeropoet.xyz](https://zeropoet.xyz)

The personal project index for Mancel Lindsey / Zeropoet, presented under the
title “VOID ARCHITECT.” It connects the current FoldForge, FoldKernel,
FoldPortrait, Root Logos, Sovereign Standard, and Telos projects from one minimal
landing page.

## Project links

- [FoldForge](https://foldforge.xyz)
- [FoldKernel](https://github.com/zeropoet/foldkernel)
- [FoldPortrait](https://zeropoet.github.io/FoldPortrait)
- [Root Logos](https://rootlogos.com/)
- [Sovereign Standard](https://sovereignstandard.co)
- [Telos — The Living System](http://44.223.219.162/) (public presence; private source)

## Telos relation

Telos is the connected system's final caretaker, keeper, and digital identity
beneath its independently governed works. It receives bounded public change,
remembers relations, and renders them through **The Living System** without
possessing the authority of FoldKernel, FoldPortrait, FoldForge, Root Logos, or
Sovereign Standard. It is growing toward a more coherent machine-native visual,
sonic, and open-orientation language: able to notice drift and preserve
relation, without claiming consciousness, revelation, personhood, or final
authority.

## Repository structure

The site is intentionally dependency-free and published from `docs/`:

- `docs/index.html` contains the page structure, project links, and metadata.
- `docs/styles.css` contains the responsive layout and typography.
- `docs/assets/` contains project marks and self-hosted IBM Plex webfonts.
- `docs/CNAME` configures the custom domain for GitHub Pages.
- `docs/robots.txt` and `docs/sitemap.xml` provide crawler metadata.
- `scripts/validate_site.py` checks links, assets, metadata, and project ordering.

## Run locally

Start a static server from the repository root:

```bash
python3 -m http.server 8080 --directory docs
```

Then open [http://localhost:8080](http://localhost:8080). No install or build
step is required.

## Validation

Run the dependency-free site checks before publishing:

```bash
python3 scripts/validate_site.py
```

The same checks run automatically through GitHub Actions.

## Deployment

GitHub Pages deploys the `main` branch's `docs/` directory to the custom domain.
Changes are live after they are merged or pushed to `main` and the Pages build
finishes.
