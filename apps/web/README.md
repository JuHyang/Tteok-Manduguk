# web app

## Local development

```bash
pnpm --filter web dev
```

## Build for GitHub Pages

This app is configured for static export in `apps/web/next.config.js`.

- Default build (no base path):

```bash
pnpm --filter web build
```

- GitHub project page build (repo path `/Tteok-Manduguk`):

```bash
pnpm --filter web build:pages
```

Static files are generated in `apps/web/out`.

## Publish without GitHub Actions

1. Build for Pages:

```bash
pnpm --filter web build:pages
```

2. Push only the static output to `gh-pages` branch:

```bash
git subtree push --prefix apps/web/out origin gh-pages
```

3. In GitHub repository settings, set Pages source to:

- Branch: `gh-pages`
- Folder: `/ (root)`
