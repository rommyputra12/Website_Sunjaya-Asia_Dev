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

## Update 2026-06 (Partners section di Home)
- Section baru Home setelah Global Presence (components/home/PartnersSection.jsx, id #partners): 3 baris logo marquee berjalan (Strategic Partners / Vendors / Customers, arah selang-seling, grayscale → warna asli saat hover, pause saat hover, kategori kosong disembunyikan) + kotak Strategic Partnership Access di bawahnya (dipindah dari About; tombol → dialog → link ke /contact; email jadi mailto)
- Logo dikelola di tab Images section "Home — Partners, Vendors & Customers Logos": pilih kategori (assets.meta.category) + nama (alt), key otomatis bila kosong, drag sort, thumbnail object-contain
- 9 logo CONTOH (sample_logo_*) di-upload sebagai placeholder — hapus via tab Images setelah logo asli di-upload
- CMS Content → Home: "Partners, Vendors & Customers (Logo)" (home.partners.*) + "Strategic Partnership Access (CTA)" (about.partner.*)
- Revisi: kategori logo (CMS only): partner = Partners (Affiliates/JO Company, Investors, Government, Departments, Organizations), vendor = Brand (Producer/Produsen, Principals, Supplier, Distributor), customer = Customers/Clients. Form upload menampilkan Kategori + Nama saat section Partners dipilih. Publik: tanpa label kategori, 3 baris full-width selang-seling, tiap logo + nama (alt) di bawahnya. Field label kategori dihapus dari tab Content

## Update 2026-06 (bulk logo + auto-contrast)
- Tab Images → section Partners: BulkLogoUpload (components/admin/BulkLogoUpload.jsx) — pilih/drop banyak file, tiap baris: preview, nama (default dari nama file), kategori, tampilan; kategori default; progress upload
- Auto-contrast: detectTone (canvas) saat pilih file → transparan = "white" (siluet putih), latar terang = "invert" (grayscale+invert+screen blend), latar gelap = "gray"; disimpan di assets.meta.tone, bisa diganti per logo (white/invert/gray/dark/original). File asli tetap disimpan; konversi via CSS filter, warna asli muncul saat hover
- Tile logo kini warna solid (#0c2635) agar blend invert menyatu
- Partnership box redesign (2026-06): layout 2 kolom (teks kiri, CTA + email kanan), aksen garis copper kiri, glow & grid halus, font lebih kecil; RichText baris baru hanya di md+
- Footer offices (2026-06): field baru `country` per kantor, tampil di baris sendiri di Footer, Contact & preview; data DB dimigrasi (koma sebelum negara dihapus); CMS: kolom 'Negara (baris sendiri)'
- Fix (2026-06): label kantor footer tidak lagi turun baris (sm:whitespace-nowrap, tracking dikurangi di tablet) — diverifikasi testing agent iteration_11
- Fix (2026-06): hero subtitle min-h 4 baris agar tinggi banner tidak berubah saat ganti EN/ID (iteration_12 lulus); angka stat mobile sedikit diperkecil agar tidak mepet tepi

## Update 2026-06 (fix upload logo & crop carousel) — iteration_13
- Bug: Replace gambar memindahkan aset ke section "other" (lookup existing salah: eq.eq.) → diperbaiki: upload mempertahankan section/alt/sort_order lama bila tidak dikirim
- Bulk uploader logo kini ada langsung di dalam grup "Home — Partners…" (tanpa pilih section); opsi partners dihapus dari form atas; dropdown section disembunyikan di kartu logo
- Carousel: tile lebih besar (aspect 13:6, w-44/56), LogoImg mengisi kotak (object-contain) + menerapkan focal & zoom crop CMS; modal crop punya preview "Kotak logo carousel"
- Upload ke section partners: margin transparan logo otomatis dipangkas (Pillow) agar logo penuh
- Nama file storage unik (stem-uuid8) agar tidak saling menimpa / cache basi; input replace punya data-testid asset-replace-{key}

## Update 2026-06 (logo carousel v3) — iteration_14
- CMS Partners dibagi sub-grup: Kelompok 1 Brand (vendor), 2 Partners, 3 Customers; drag hanya dalam grup; judul kartu "#N · NAMA" (dari nama logo); input nama otomatis kapital (CSS uppercase + disimpan uppercase)
- Home: logo dicampur tanpa label, urut Brand→Partners→Customers lalu nomor CMS (tie-break key), dibagi max 3 baris (≥9:3, ≥4:2), arah selang-seling
- Tile 2:1 lebih besar, inset kecil; marquee GPU (.logo-track translate3d, will-change) kecepatan konstan 40px/s semua baris (desktop & mobile)
- sort_order logo dinormalisasi 1..n per kategori; alt di-uppercase

## 2026-06 Partner logo tiles v2
- Tile radius 10px, tile lebih besar (md 224px / mobile 192px), padding 3px, logo center (ikut focal/zoom CMS)
- Hover/klik/tap: latar putih gading #F5EFE0 + warna asli logo
- Tone baru "light" (Logo asli putih/terang): tampil putih di latar gelap, jadi gelap di latar gading; auto-detect saat bulk upload; 6 logo contoh SVG di-set light

## 2026-06 Content CMS preview fix (Partners)
- Root cause: section partners & about_partner tidak punya mock preview; hanya iframe live yang refresh setelah tersimpan, sehingga teks yang sedang diketik tidak tampil
- Ditambah mock Partners + Strategic Partnership CTA; preview otomatis pindah ke "Highlight edit" saat mengetik di field section tsb

## 2026-06 CMS Preview Mobile
- Tombol ikon Desktop/HP di Preview "Tampilan asli" (ContentPreview.jsx useDevice); HP = iframe 390x844 dalam bingkai ponsel; pilihan disimpan localStorage (cms-preview-device) & berlaku semua section

## 2026-06 Fix: teks kartu Subsidiaries dari CMS tidak tampil
- Root cause: LanguageProvider berada di luar AssetProvider (App.jsx) sehingga t() tidak bisa membaca assets.meta; urutan provider dibalik
- Daftar per-negara di halaman Subsidiaries kini memakai nama/kota/negara CMS & urutan CMS
- Audit: semua content_blocks + meta subsidiaries terverifikasi tampil di Home/Subsidiaries/About/Pillars/Contact

## 2026-06 Home Pillar 01-03 background
- Gambar bg opacity 0.6 -> 0.5, overlay putih/40 diganti gading #F5EFE0/55

## 2026-06 Ivory light sections
- --light-bg -> #F7F2E6, --light-bg-2 -> #F5EFE0 (index.css) berlaku semua .section-light; Global Presence (bg-bone) & kartu kaca putih/80 diganti gading

## 2026-06 Ivory warmth turun 7% -> 5.5%
- #F7F2E6 -> #F9F5EB (dasar), #F5EFE0 -> #F7F2E7 (band, overlay Pillar, hover kotak logo)

- Overlay Pillar & hover kotak logo disamakan ke #F9F5EB

- Tombol "View All Subsidiaries" Home: dari biru ke outline copper + isi gading, hover fill copper

## 2026-06 CMS Background Subsidiaries Home
- Slot Images "Home — Subsidiaries Background" (key home_subsidiaries_bg, opsional, bisa dihapus); empty-state uploader SubsBgUpload di Admin.jsx
- Home: gambar opacity 0.5 + overlay gading #F9F5EB/55 (sama dgn Pillar); tanpa gambar = warna gading

- Overlay gading Pillar 01-03 & Subsidiaries bg: 55% -> 60%

## 2026-06 Logo tone "Monokrom (detail tetap)"
- LOGO_TONES.mono: grayscale(1) contrast(1.25) brightness(1.75) untuk logo ikon padat/3D (mis. Hyperione); hover = warna asli di latar gading. Hyperione di-set mono

## 2026-06 Monokrom putih (detail tetap) v2
- Diproses di canvas (PartnersSection toMono, cache per URL): area berwarna -> putih solid, gradasi abu -> putih dgn opacity sesuai, detail putih asli -> cut-out; hover = warna asli di latar gading; fallback warna asli bila gagal
- Hyperione & FPT Software pakai mono

## 2026-06 Monokrom putih v3
- Aturan seragam: warna -> putih; abu netral dipisah ambang otomatis (Otsu): lebih terang -> transparan, lebih gelap -> putih (flat 2D). meta.mono_adj (-30..30) slider "Ambang putih" di CMS; thumbnail CMS logo kini pakai LogoImg (sama dgn situs)

## 2026-06 Logo optical sizing
- LogoImg: trim margin transparan otomatis (canvas, cache), ukuran optik h=0.62*ratio^-0.4 dari tinggi kotak, maks 78% kotak, selalu center; zoom Edit Crop partners 0.5x-2.5x (focal tidak dipakai utk partners)

## 2026-06 Hero tanpa efek zoom saat loading
- heroFadeIn kini fade saja (tanpa scale 1.08); AssetImg menunggu data CMS (ready) sebelum render sehingga crop/zoom berlaku sejak frame pertama (tidak ada lompatan fallback->crop) di semua gambar CMS

- Nama di bawah logo partner: hover/klik -> oranye (copper) + semibold

## 2026-06 Cloudflare Worker CDN untuk media
- frontend/.env VITE_CDN_URL=https://website-sunjayaasia.rommy-putra12.workers.dev
- src/lib/media.js: getPublicImageUrl(bucket,path) & toCdnUrl(url) (rewrite URL Supabase public -> CDN/{bucket}/{path}); DB tetap menyimpan URL Supabase
- Diterapkan: data/content.js (fallback), AssetContext (semua AssetImg), PartnersSection (logo+canvas), News cover, Admin thumbnails/crop editor. Upload tetap langsung ke Supabase
- Verifikasi: 62 request gambar via workers.dev, 0 ke supabase.co, 0 broken

## 2026-06 Responsive images (srcset)
- Backend: upload membuat varian WebP @640/@1280/@2560 (logo partners hanya @640) disimpan di meta._variants (dipertahankan saat PUT meta, ikut dihapus saat delete). Original berat non-WebP di-encode ulang di ukuran asli sbg varian teratas
- POST /api/assets/backfill-variants?force=true (admin) untuk migrasi; sudah dijalankan utk 35 aset
- Frontend: lib/media.js buildSrcSet/variantUrl; AssetImg srcset + sizes (default 100vw; kartu/logo nav/footer punya sizes sendiri); LogoImg memproses varian 640
- Hasil Home: HP ~1.2MB, desktop ~3.8MB (sebelumnya ~40MB desktop)
- News cover (URL teks) belum memakai varian

## 2026-06 Audit CDN final
- Runtime audit 8 halaman publik + semua tab Admin + crop editor: 150 request gambar, 0 langsung ke Supabase Storage; host gambar hanya workers.dev + tile.openstreetmap.org (peta lokasi)
- News cover via toCdnUrl (belum ada berita utk uji runtime); Contact hanya memakai gambar footer (AssetImg)

## 2026-06 About hero layout
- Desktop: foto aboutBanner di setengah kiri (w-1/2), kanan bg obsidian solid di belakang teks; mobile: foto square. Asset about_banner di-set focal_x=0, zoom=1.14 (file asli komposit foto kiri + area gelap kanan)

- About foto desktop dilebarkan ke 55%; Edit Crop about_banner punya preview khusus Desktop (foto 55% + mock teks) & Mobile (1:1). Foto baru user 1024x1024, crop di-reset focal 55/50 zoom 1

## 2026-06 Rich text toolbar CMS
- components/FormattedText.jsx (Fmt, splitAlign): **bold**, _italic_, ++underline++, [c=copper|ivory|sky|gray]..[/c], *accent*, prefix [align=left|center|right|justify]
- components/admin/RichToolbar.jsx: B/I/U, 4 warna tema, 4 perataan; dipasang di semua kolom paragraf (rf() di ContentPanel SCHEMA, pointer desc, timeline body). Berlaku utk kolom EN & ID yg sedang fokus
- Render Fmt di Home (hero.sub, pillars intro, pillar body, subs desc), Pillars, Contact, Subsidiaries, Footer, About (body, timeline, edge desc), preview CMS
- Fix dari iteration_15: loading state Content CMS (cegah tulis ke field kosong), live iframe preview hanya dimount saat terlihat (IntersectionObserver, cegah 429), para2 align di parent, label warna gading/abu "untuk latar gelap"

- Toolbar: tombol "Lainnya" color picker (semua warna, [c=#RRGGBB]); warna baru menggantikan warna lama (tidak nested); seleksi tidak memotong marker/prefix align; parser warna mendukung nesting. Data about.body1 rusak "[/c_]" diperbaiki

## 2026-06 Fix: paragraf About lambat muncul
- Root cause: /api/content 1.3-2.4s (selalu ke Supabase) + paragraf tampil teks default lama dulu lalu berganti
- Backend: cache baca in-memory sb_select (TTL 60s, dibersihkan tiap insert/update/delete & upsert asset)
- Frontend: LanguageContext cache localStorage sunjaya_content_v1 + contentReady; About body hanya dirender saat contentReady
- Verified iteration_16: paragraf muncul ~0.8-1.2s, tanpa flash teks lama; API cache 0.09-0.13s

- Reveal: prop duration & blur; paragraf About body kini durasi 0.3s, geser 8px, blur 2px, jeda 0.04s (sebelumnya 0.9s/40px/10px/0.1s)

## 2026-06 About paragraf tanpa animasi
- Paragraf & judul About tanpa animasi (plain); axios timeout 6s pada /api/content agar contentReady selalu true; default EN about.title/body1/body2 di translations.js disamakan dgn CMS; justify hanya md+ (mobile rata kiri). Verified iteration_17/18

## 2026-06 Pillars page redesign
- Header besar (nomor + kicker oranye + judul 48px) > judul divisi 20px; body rata kiri max-w-3xl; foto landscape full width (21:9 desktop, 16:10 mobile) di bawah body; grid divisi 2 kolom (item ganjil terakhir full); tanpa animasi. Hash scroll offset mengikuti tinggi header. Verified iteration_19. Menunggu user upload foto landscape

- Edit Crop: preview khusus Pillar (foundation/core/future_slide) Desktop 21:9 & Mobile 16:10 + peringatan jika gambar belum landscape; preview crop modal memakai varian 1280 (lebih cepat)

- Frame foto Pillar diubah ke 16:9 (aspect-video) desktop & mobile + preview Edit Crop 16:9; peringatan jika rasio < 1.7

## 2026-06 Pisah foto Pillar Home vs halaman Pillars
- Home (portrait): foundation_slide/core_slide/future_slide di section CMS home_pillar_sections; foundation & core dikembalikan ke portrait asli (pillar_foundation.jpg / pillar_core.png)
- Halaman Pillars (landscape 16:9): aset baru pillars_page_01/02/03 (section pillars_page), 01 & 02 = foto landscape user, 03 sementara portrait lama; Pillars.jsx pakai pillarsPageXX; preview crop 16:9 utk key baru; safe-delete keys ditambah

- Modal Edit Crop bisa ditutup dgn Escape; cookie banner tidak tampil di /admin. Verified iteration_20

- CMS Images: Home Pillar dipisah jadi "Home — Pillar 01–03 · Foto Pillar (portrait)" (home_pillar_sections: foundation/core/future_slide) dan "Home — Pillar 01–03 · Background" (home_pillar_bg: home_pillar_0X_bg)

## 2026-06 Company History image quality
- Frame tetap 16:9 (aspect-video), tanpa animasi Reveal (blur), sizes 80vw
- Backend: varian kini WebP q88 (VARIANT_QUALITY); re-encode ukuran asli hanya jika original >1MB (JPG kecil disajikan asli); backfill-variants dapat param key. about_company_history di-backfill: 640/1280 + original 1920 JPG

## 2026-06 Fix: foto Subsidiaries lama muncul
- Kartu tanpa Reveal; 2 kartu teratas loading eager + fetchPriority high, sizes 50vw; AssetContext cache localStorage sunjaya_assets_v1 + timeout 6s; heading Subsidiaries tanpa LineReveal. Verified iteration_21 (first 1.2-1.5s, refresh ~0.7s)

- 2026-06: /pillars intro + pillar 01/02/03 body paragraphs now full-width & justified (text-justify, hyphens-auto); screenshot-verified desktop/mobile.
- 2026-06: /pillars full-bleed header banner 16:3 (asset pillars_page_banner, section pillars_page, CMS focal preview 16:3; temp image = pillars_page_01). Intro text reduced to text-base/md:text-lg.
- 2026-06: CMS Images grouped per page (Brand/Home/Pillars/Subsidiaries/About/Footer/Lainnya) -> collapsible sections (all closed), search box; Pillars banner split into own section pillars_page_banner. Tested iteration_22 (100%).
- 2026-06: Home hero "Discover Our Journey" -> /about#company-history. About Company History section sized (.history-fit in index.css) so kicker + full 16:9 image + caption fit one desktop screen. Screenshot-verified 1920x800.
- 2026-06: /pillars spacing tightened (header mt-8/10, mb-10/14; pillar sections mb-16/24) + copper fading line under intro paragraph.
- 2026-06: /pillars sub-activities (01.1…) now vertical rows: number | title | justified desc (desktop 3 cols; mobile number + stacked, left-aligned).
- 2026-06: About Competitive Edge redesigned: title one sentence one color (edge.title + edge.highlight joined), full-width desc + copper fade line, 3 modern white cards with lucide icons, big faint number, copper top bar on hover, dash bullets (.edge-card in index.css).
- 2026-06: Edge list items hover = copper + semibold. About The Group header modernised: overline + fading line, subtitle with copper left bar, diamond + copper fade divider, first paragraph brighter (desktop & mobile).
- 2026-06: About Company History redesigned high-tech: dark azure band w/ masked copper grid, header row (kicker + pulsing since + fade line + journey right), image up to 1440px (min 1120 desktop) with copper corner brackets, animated scan line, tick ruler. CSS .history-* in index.css.
- 2026-06: Company History image now full content width (1440px), thin glowing copper gradient frame (.history-glow), scan line + ruler removed. Certifications moved from Subsidiaries to bottom of About (#certifications, ShieldCheck badge grid).
- 2026-06: About identity panel (Established/Restructured/Category/UEN) redesigned as frosted glass panel (.identity-glass) with copper icon circles, thin vertical dividers, copper top line, hover icon fill; mobile 2x2.
