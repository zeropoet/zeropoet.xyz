# [zeropoet.xyz](https://zeropoet.xyz)

The static project index for Mancel Lindsey / Zeropoet. The site links to work
across the Root Logos, Sovereign Standard, FoldKernel, and Node Clusters
ecosystem.

## Repository structure

The site is intentionally dependency-free and published from `docs/`:

- `index.html` contains the page structure and metadata.
- `styles.css` contains the responsive layout and typography.
- `CNAME` configures the custom domain for GitHub Pages.
- `robots.txt` and `sitemap.xml` provide crawler metadata.

## Run locally

Start a static server from the repository root:

```bash
python3 -m http.server 8080 --directory docs
```

Then visit [http://localhost:8080](http://localhost:8080).

## Deployment

GitHub Pages deploys the `main` branch's `docs/` directory to the custom domain.
Changes are live after they are merged or pushed to `main` and the Pages build
finishes.
