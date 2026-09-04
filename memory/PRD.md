# Sunjaya Asia Group — Corporate Website

## Original Problem Statement
"Create modern and powerful website for my holding company, and all material can get from my pdf file, you can improve also if there are some weakness in the material."

User later requested (Awwwards-level directive from platform): "Award-worthy — Site-of-the-Day level. Bold and cohesive. Large kinetic hero with masked line-by-line reveal, real product photography with clipped frames, numbered manifesto chapters, one slow editorial marquee, framer-motion + lenis smooth momentum scrolling, one parallax/3D hero moment."

## User Choices
- Multi-page marketing site + DB-backed contact + admin CMS module for news (English + Indonesian)
- Contact form → Resend email to info@sunjayaasia.com in real-time
- Visual direction: user delegated ("you decide")

## Personas
- **Sovereign / institutional investor** researching a partner holding company
- **Government / procurement** evaluating defense, waste-tech, energy, agri capacity
- **Media & analyst** seeking corporate news and structure
- **Content owner (admin)** publishing news via CMS

## Architecture
- **Backend**: FastAPI + Motor (MongoDB) — `/app/backend/server.py`
  - Public: `GET /api/health`, `POST /api/contact`, `GET /api/news`, `GET /api/news/{slug}`
  - Admin (X-Admin-Token header): `GET /api/contact`, `POST/PUT/DELETE /api/news`, `POST /api/admin/verify`
  - Email via Emergent-managed Resend proxy (EMERGENT_EMAIL_KEY + from_name)
- **Frontend**: React 19 + React Router 7, Framer Motion 11, Lenis smooth-scroll, react-fast-marquee, Sonner (toast), Tailwind 3
  - Routes: `/`, `/about`, `/pillars`, `/subsidiaries`, `/global-presence`, `/news`, `/contact`, `/admin`
- **i18n**: EN / ID toggle persisted in `localStorage` (`sunjaya_lang`)
- **Design system**: obsidian `#050505` / burnt copper `#C86230`, EB Garamond serif + IBM Plex Mono, sharp edges, hair borders, grain overlay, spotlight parallax, numbered chapter markers

## Implemented (Dec 2025)
- Kinetic hero: masked word-by-word `LineReveal` (framer-motion) on "The power / of innovations" with live SGT clock and parallax metal-texture background
- Slow editorial marquee ("The Power of Innovations · Singapore · Jakarta · Delaware · Dubai · Beijing")
- Numbered Manifesto (01/02/03) with clipped-frame photography, alternating asymmetric grids
- Nine-company Subsidiaries bento (asymmetric spans)
- Global Presence interactive list (Singapore/Jakarta/Delaware/Dubai/Beijing/Batam) with click-to-preview
- About: masked line hero + boardroom photo + decade timeline
- Pillars deep-dive: 13 divisions grouped by pillar with sticky photography
- Contact form (validates + persists in Mongo + sends styled HTML email via Resend)
- News list + article detail (public), filtered by language
- Admin CMS at `/admin` (token-gated): create/edit/delete/publish articles, per-language, EN/ID
- Certifications strip (ISO 9001/14001/45001/27001/14067, APEA 2025, LBMA)
- Sticky nav with EN/ID toggle, mobile menu, scroll-blur backdrop
- Footer with dual HQ addresses (Singapore + Jakarta) and contact links

## Test Credentials
See `/app/memory/test_credentials.md` — Admin token `sunjaya-admin-2026-secret` (X-Admin-Token header) → `/admin` route.

## Test Status
- Iteration 1: 100% pass (backend + frontend end-to-end via `testing_agent_v3`)

## Backlog (P1 / P2)
- P1: Admin `DELETE /api/contact/{id}` + admin inbox view UI
- P1: Rate-limit + honeypot/captcha on public contact endpoint
- P2: Interactive world map on Global Presence (Mapbox/D3)
- P2: News detail public URL (`/news/:slug`) with SSR/OG meta
- P2: Investor deck PDF download + press-kit page
- P2: Sitemap.xml, structured data (schema.org Organization), analytics
- P2: OG images / Twitter cards
- P2: Leadership team page (photos + bios) when user provides content
