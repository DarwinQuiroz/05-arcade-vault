# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Arcade Vault: an online platform for playing games and competing for the highest scores. The README (in Spanish) states the project follows Spec Driven Design (`/spec` and `/spec-impl`), using skills from `Klerith/fernando-skills` (`npx skills@latest add Klerith/fernando-skills`). Currently a visual-only MVP (spec 01): the 5 screens from `references/templates/` ported with mock data; no real games, backend or auth yet. Specs live in `specs/`.

## Skills

- `/frontend-design`: Use this skill to design the frontend (UI/UX) of the application. This includes creating mockups, prototypes, and design specifications.

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
- Tailwind v4 is wired through Turbopack: a `turbopack.rules` entry in `next.config.ts` runs `@tailwindcss/turbopack` on `*.css`. The visual design is dark-only and lives in `app/globals.css` as `av-*` classes ported from the template (not Tailwind utilities). Home-specific styles live in `app/home.css` (imported in `app/layout.tsx` after `globals.css`), including the `.reveal` animation and a `prefers-reduced-motion` rule.
- `app/layout.tsx` uses the global `LayoutProps<"/">` type (generated route types) rather than an imported props type, and loads Press Start 2P, JetBrains Mono and Courier Prime via `next/font/google`.

## App structure

- Single route `/`: `app/page.tsx` is a Server Component that renders `components/app-shell.tsx` (`"use client"`). Navigation is hash-based SPA with readable hashes: `#/` (home), `#/biblioteca`, `#/juego/<id>`, `#/jugar/<id>`, `#/acceso`, `#/salon`. Old JSON-encoded hashes (`#%7B...`) are still read. Empty or invalid hashes (and `juego/`/`jugar/` without id) resolve to home. No real App Router routes per screen.
- `AppShell` holds `route` and `user` state. The first render is always `home` with no user; hash and `localStorage` are read in a `useEffect` after mount to avoid hydration mismatch.
- Screens in `components/`: `home` (landing: hero, features, games, stats, activity, pricing, final CTA; `useReveal` hook), `library`, `game-detail`, `game-player`, `auth`, `hall-of-fame`, plus `nav`. Each receives `navigate(route)` from the shell.
- `lib/types.ts` (Game, Route, User, HomeFeature, ...) and `lib/data.ts` (`GAMES`, `CATS`, `seededScores`, `HOME_FEATURES`, `HOME_STATS`, `RECENT_SCORES`, `TOP_TODAY`, `PRICE_PERKS`, `HOME_FAQ`) hold the typed mock data.
- `localStorage`: `av_user` (mock session, `{name}`) and `av_scores` (append-only saved scores, never read in the UI). Wrap every access in `try/catch`.
- `references/templates/` is the original HTML/CDN prototype; it is excluded from ESLint.
