# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Arcade Vault: an online platform for playing games and competing for the highest scores. The README (in Spanish) states the project follows Spec Driven Design (`/spec` and `/spec-impl`), using skills from `Klerith/fernando-skills` (`npx skills@latest add Klerith/fernando-skills`). Currently a fresh Create Next App scaffold; no game or scoring code exists yet.

## Commands

- `npm run dev` — dev server (Turbopack)
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- No test runner is configured.

## Next.js version warning

`next` is 16.4.0 with React 19.3 — it has breaking changes from the Next.js in your training data. Per `AGENTS.md`, read the relevant guide in `node_modules/next/dist/docs/` (`01-app/` is the App Router) before writing Next.js code, and heed deprecation notices. `AGENTS.md` is re-added by `next dev`; leave it in place.

## Architecture notes

- App Router only (`app/`); no `pages/`. Path alias `@/*` maps to the repo root.
- `next.config.ts` enables `cacheComponents`, `partialPrefetching`, and `experimental.agentFeedback`. `cacheComponents` changes caching/dynamic-rendering semantics, so check the docs before using data fetching or dynamic APIs.
- Tailwind v4 is wired through Turbopack: a `turbopack.rules` entry in `next.config.ts` runs `@tailwindcss/turbopack` on `*.css`. Theme tokens live in `app/globals.css` (`@theme inline`, with light/dark CSS variables via `prefers-color-scheme`).
- `app/layout.tsx` uses the global `LayoutProps<"/">` type (generated route types) rather than an imported props type, and loads Geist fonts via `next/font/google`.
