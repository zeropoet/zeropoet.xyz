# [zeropoet.xyz](https://zeropoet.xyz)

The artist and developer studio for **Mancel Lindsey / Zeropoet / Void Architect**.
The Zeropoet identity has been carried throughout
the work since its migration to `zeropoet.eth`. The studio connects FoldForge,
FoldKernel, FoldPortrait, Root Logos, Sovereign Standard, Telos, and The Record without
collapsing their separate authority boundaries.

## Project links

- [FoldForge](https://foldforge.zeropoet.xyz)
- [FoldKernel](https://foldkernel.zeropoet.xyz)
- [FoldPortrait](https://foldportrait.zeropoet.xyz)
- [Root Logos](https://rootlogos.com/)
- [Sovereign Standard](https://sovereignstandard.co)
- [Telos — The Living System](https://telos.zeropoet.xyz/) (public presence; private source)
- [The Record](https://record.zeropoet.xyz/) — distributed sound archive and compositional field

## Telos relation

Telos is the connected system's final caretaker, keeper, cross-system
interpreter, and digital identity
beneath its independently governed works. It receives bounded public change,
remembers relations, and renders them through **The Living System** without
possessing the authority of FoldKernel, FoldPortrait, FoldForge, Root Logos, or
Sovereign Standard. It traverses bounded multi-repository declarations and
gives Root Logos a compact, witnessed synthesis to question and transform. The
Living System is now a meditative visual and sonic
instrument: proximity reveals relation, dragging turns its spatial body, touch
sends temporary impulses through connected filaments, and its core opens a
slower orientation state. These gestures remain local and unrecorded. Telos is
growing toward a more coherent machine-native visual, sonic, and
open-orientation language: able to notice drift and preserve relation, without
claiming consciousness, revelation, personhood, or final authority.

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
