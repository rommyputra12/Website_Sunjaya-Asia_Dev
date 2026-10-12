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

## Update 2026-06 (fork session)
- Locations CMS v2: `type` column (hq/branch/infra) di Supabase; Panama & Switzerland dipindah ke DB sebagai infra. Form: dropdown Type, Country (semua negara + Custom), City autocomplete (OpenStreetMap Nominatim via `GET /api/geo/search`, admin-only) auto lat/lng, paste koordinat Google Maps, Role dropdown + Custom. File: components/admin/LocationsPanel.jsx
- Hook bersama `hooks/useLocations.js` → Globe3D (pins + arcs), panel lokasi Home (scrollable, stats dinamis), InteractiveWorldMap Subsidiaries (legend scrollable)
- Bilingual CMS: kolom `content_blocks.value_id`; LanguageContext override per bahasa; ContentPanel input EN + ID
- Pillar repeater: "+ Tambah Pointer" / "del pointer" per section pillar_NN
- Home subsidiary cards → Link ke /subsidiaries + hover zoom
- Testing iteration_10: 100% backend & frontend

## Backlog
- P2: Image compression di CMS; Safe-delete flag "used in site" untuk Images
- P2: Refactor Admin.jsx (Users/Content/Images panel ke file terpisah)

## Update 2026-06 (lanjutan)
- Super Admin password di-reset ke default (.env SUPER_ADMIN_PASSWORD)
- Location form: peta mini Leaflet (OSM tiles) — klik peta / drag pin untuk set koordinat (components/admin/LocationMapPicker.jsx)
- Upload gambar: kompresi server (Pillow) → resize max 2560px, WebP q82 (q90 untuk gambar transparan); gambar ≤300KB & ≤2560px tidak diubah; hasil tidak lebih besar dari asli
- Images tab: `in_use` (key dipakai situs / URL dipakai News cover / Location photo) → label "Used on site", DELETE diblokir (409)

## Update 2026-06 (teks kartu pindah ke tab Images)
- Teks kartu subsidiary (tag, kota, negara, role, nama, sector) kini diedit di tab Images per gambar, tersimpan di kolom `assets.meta` (jsonb, {field: {en, id}}). Kolom `meta` butuh SQL: ALTER TABLE assets ADD COLUMN meta jsonb DEFAULT '{}'
- Blok `subsidiary.*` di tabel content_blocks sudah dimigrasikan ke assets.meta lalu dihapus dari tab Content
- LanguageContext.t('subsidiary.x.f') membaca meta via useAssets, split city/country otomatis, fallback ID→EN→default
- Kartu di Home & /subsidiaries kini menampilkan baris "Negara · Role"
- Toggle "+ Terjemahan ID" per kartu untuk kolom Bahasa Indonesia

## Update 2026-06 (slot kartu Subsidiaries)
- Kartu di tab Images (home_subsidiaries) berjudul slot: "Subsidiaries 1-7" (branch→subsidiary, ikut sort_order) lalu "Affiliate 1-2"; nama perusahaan (meta.name.en) tampil di samping judul; kode key disembunyikan; dropdown section dihilangkan (fix di section ini); input Nama Perusahaan auto-kapital
- Urutan kartu di halaman Subsidiaries & teaser Home mengikuti sort_order CMS per tier; nomor kartu 01-09 kontinu (afiliasi lanjut setelah semua branch); sort_order di DB dirapikan: sac,sae,sti,agi,ecs,sm,tsn,san,kgi = 1-9
- Kartu baru di section ini otomatis dapat nomor berikutnya saat CMS menyusun ulang

## Update 2026-06 (drag sorting)
- Tab Images (section home_subsidiaries): kartu bisa di-drag via handle grip (pojok kanan atas) pakai @dnd-kit; urutan disimpan ke sort_order dan langsung memengaruhi urutan di situs; tier tetap dijaga (branch → subsidiary → affiliate) saat penomoran slot

## Update 2026-06 (perbaikan drag)
- Fix: kartu 3↔4 tidak bisa bertukar karena STI bertier "branch" dan AGI "subsidiary" — branch & subsidiary kini satu grup penomoran (urutan murni sort_order); hanya afiliasi yang selalu di akhir
- Fix: susunan ulang dilakukan saat drop (bukan saat drag berjalan) agar target tidak bergeser; autoScroll dimatikan
- Kolom Alt text dihapus dari tab Images; alt kartu subsidiary otomatis = Nama Perusahaan

## Update 2026-06 (News texts dipindah)
- Grup "News Page" dihapus dari tab Content; 5 teks halaman News (title, sub, empty, read, back) kini diedit di tab News → panel lipat "Teks Halaman News" (EN + ID). Data tetap di content_blocks (page=news)

## Update 2026-06 (Content tab terstruktur)
- Tab Content ditulis ulang (components/admin/ContentPanel.jsx): accordion Halaman → Section (semua tertutup awal), label ramah, kolom ID opsional per field (+ ID)
- Hanya field di SCHEMA yang tampil; dikunci/disembunyikan: Navbar, label form Contact, jenis Inquiry, Copyright footer, Add custom block, alamat footer lama (addr_*)
- Pillar: field Kicker/Judul/Deskripsi + kartu Pointer (Nama+Deskripsi), tambah/hapus
- Footer: Tagline, Deskripsi (footer.description), Nama perusahaan (footer.company) + editor "Kantor & Kontak" terstruktur (JSON di content_blocks key footer.offices: [{label,line1,line2,phone}]), maks 4; kantor 1 = HQ, sisanya berjajar (grid 1-3 kolom); ikon telepon & link tel: otomatis
- Halaman Contact membaca daftar kantor yang sama (data/offices.js useOffices)

## Update 2026-06 (fix Business Pillars Intro)
- Akar masalah: section Business Pillars Intro di Home di-hardcode, field manifesto.* di CMS tidak dipakai Home (warisan lama, title_pre terpotong karena input 1 baris)
- Home kini memakai key baru home.pillars_intro.{kicker,para1,para2,highlight} (seed = teks yang tampil); 8 blok manifesto.* lama yang tidak dipakai dihapus; Pillars Intro tetap manifesto.overline + manifesto.title
- Pointer pillar di Home kini dibaca dari CMS (sama dengan halaman Pillars)
- Field CMS: teks panjang (>70 char) otomatis textarea dengan tinggi menyesuaikan

## Update 2026-06 (Content preview)
- Tab Content: setiap section punya kartu preview mini (components/admin/ContentPreview.jsx) di kanan (sticky), mockup layout situs; update live saat mengetik; field aktif disorot oranye di preview & border form
- Judul section accordion berwarna biru muda (#7FC8EE) tebal; label field abu-abu — tidak lagi sama-sama putih

## Update 2026-06 (Content: search, unsaved, view on site, teaser)
- Kotak cari di tab Content (label/key/isi EN/ID) → hanya section/field yang cocok, accordion terbuka otomatis, pesan kosong
- Indikator "belum tersimpan" (titik kuning berdenyut) per field & per kantor saat diketik belum di-blur
- Tombol "View on site" per section → buka tab baru ke anchor (id: hero, stats, business-pillars, subsidiaries-teaser, global-presence, pillar-NN, site-footer)
- Teaser Subsidiaries di Home bisa diedit: home.subs.{kicker,title,desc,cta} + preview

## Update 2026-06 (Global Presence angka & preview asli)
- Angka statistik Global Presence otomatis dari tab Locations (HQ+Branch, Infrastructure Hub, negara unik); CMS menampilkan hint "(angka otomatis dari Locations — …: N)" di label; mockup memakai angka asli
- Preview tiap section punya 2 mode: "Tampilan asli" (iframe situs live diskalakan, scroll ke anchor section, reload setelah simpan; default) dan "Highlight edit" (mockup + sorotan field aktif)
- CookieBanner disembunyikan saat situs dimuat di dalam iframe

## Update 2026-06 (About page penuh di CMS)
- About.jsx: semua teks hardcoded kini dari CMS (default di data/aboutDefaults.js, sudah di-seed ke content_blocks): Identitas Perusahaan (list JSON about.identity, maks 4), Company History, Timeline (list about.timeline.items, bisa urut naik/turun), Competitive Edge (judul, deskripsi, 3 kolom + 3 list), Strategic Partnership CTA (teks, tombol, email)
- Penanda warna oranye: tulis *kata* (komponen RichText), Enter = baris baru
- LanguageContext.tl(key, fallback) membaca list JSON (ID dari value_id jika ada)
- ContentPanel: ListEditor generik (tambah/hapus/urut, maks, penanda belum tersimpan) — juga dipakai untuk Kantor & Kontak footer
