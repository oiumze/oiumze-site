# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal/artist site for "Umzé" (UI copy in Portuguese, `lang="pt-BR"`). Astro 7 static site, early stage — `src/pages/index.astro` still renders the starter `Welcome` component. Planned sections (from `src/components/Menu.astro`): Sobre, Meu Som, Galeria, Imprensa.

## Commands

Package manager: **pnpm** (Node >= 22.12.0).

- `pnpm install` — install deps
- `pnpm build` — production build to `dist/`
- `pnpm preview` — serve the build
- `pnpm astro check` — type-check `.astro`/TS (strict tsconfig)

No lint or test setup exists.

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Architecture

- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite` (configured in `astro.config.mjs`, no `tailwind.config.js`) plus daisyUI v5 as a Tailwind plugin. Both are wired in `src/styles/app.css` (`@import "tailwindcss"; @plugin "daisyui";`), which is imported once in `src/layouts/Layout.astro`. Use daisyUI component classes (`navbar`, `btn`, `menu`, …) for UI. Brand colors live in the `@theme` block of `app.css` (`--color-yellow-strong`, `--color-blue-dark`, `--color-red`, `--color-yellow-light`, `--color-orange`, `--color-blue-light`, plus white/black), so they're usable as Tailwind utilities (`bg-blue-dark`) and as CSS vars (`var(--color-red)`). The block is `@theme static` because the custom daisyUI theme `umze` (default, same file) maps its semantic colors (`primary`, `base-100`, …) to those vars — prefer daisyUI semantic classes (`btn-primary`, `bg-base-100`) in components. Fonts (Righteous, Reddit Sans) load via Google Fonts `<link>` in `Layout.astro`; `@theme` exposes them as `font-righteous` / `font-reddit-sans`, and `--font-sans` points to Reddit Sans so it's the default body font. No Sass — plain CSS only.
- **Layout / semantics:** `Layout.astro` renders `<Menu />` (a `<header>`) then `<main><slot /></main>` with the page sections; a `<footer>` goes after `<main>` (planned). In `Menu.astro` the page's only `<h1>` is a visually hidden `<h1 class="sr-only">Umzé</h1>` next to the logo; the logo link's image has `alt="Ir para o início"`, links sit in `<nav aria-label="Menu principal">` (desktop bar and mobile drawer). Sections use `<h2>`.
- **Menu / scrollspy:** single-page nav. `Menu.astro` holds a `links` array of `/#id` anchors; its inline script observes every element whose `id` matches a link hash and sets `aria-current="location"` on the active link (styled via `aria-[current=location]:`). Adding a section = add a `<section id>` in `index.astro` (with `min-h-section` — `@utility` in `app.css`, viewport height minus the navbar — and `scroll-mt-14` for the fixed 56px navbar — `min-h-14` in `Menu.astro`; `<main>` has `pt-14` for the same reason) plus an entry in `links`.
- **CMS:** Sveltia CMS (Decap-compatible) served statically from `public/admin/` (`/admin` route), loaded from unpkg, GitHub backend on repo `oiumze/oiumze-site`. `public/admin/config.yml` defines collections `posts` (title, date, richtext body) and `gallery` (title, image), written to `/content/posts` and `/content/gallery` at the **repo root** (not `src/content`); media goes to `public/uploads`. No Astro content collection (`src/content.config.ts`) consumes these yet — when adding one, point its loader at those folders and keep field names in sync with `config.yml`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
