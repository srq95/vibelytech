# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Repository layout

- `client/` — the Next.js application (all code lives here; run commands from this directory).
- `design/` — brand assets (logo, business card, letterhead, envelope) as PNGs. Not code.

## Commands

Run all commands from `client/`:

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint (flat config, next core-web-vitals + typescript)
```

There is no test setup in this project yet.

## Critical: this is Next.js 16, not the Next.js in your training data

Per `client/AGENTS.md`: Next.js `16.2.9` has breaking changes to APIs, conventions, and file structure relative to older versions. **Before writing code that touches Next.js APIs, read the relevant guide in `client/node_modules/next/dist/docs/`** rather than relying on memory, and heed deprecation notices.

## Architecture

- **App Router** with the `src/` convention — application code is under `client/src/app/` (`layout.tsx`, `page.tsx`, `globals.css`). React `19.2.4`.
- **Import alias:** `@/*` maps to `client/src/*` (see `tsconfig.json`). Prefer it over deep relative paths.
- **Styling:** Tailwind CSS **v4**, configured via `postcss.config.mjs` (`@tailwindcss/postcss`). There is no `tailwind.config.*`; theme tokens are defined in `src/app/globals.css` using `@import "tailwindcss"` and the `@theme inline` block (`--color-background`, `--color-foreground`, `--font-sans`, `--font-mono`). Add design tokens there, not in a JS config.
- **Fonts:** Geist Sans / Geist Mono loaded via `next/font/google` in `layout.tsx`, exposed as the `--font-geist-sans` / `--font-geist-mono` CSS variables.
- **Theming:** light/dark handled with `prefers-color-scheme` in `globals.css`.
- TypeScript is `strict`; `next.config.ts` is currently empty (defaults only).
