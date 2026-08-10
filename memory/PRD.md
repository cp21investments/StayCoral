# Stay Coral Collection — PRD

## Original Problem Statement
Premium bilingual (EN/ES) boutique hospitality website for **Stay Coral Collection** — curated vacation homes in Cartagena de Indias. Must feel like an established boutique brand (not a generic Airbnb listing), prioritize direct bookings (BOOK DIRECT), showcase properties, "sell Cartagena", and be scalable for 10–20 future properties. Editorial luxury art direction, palette Warm Ivory/Sand/Soft Coral/Deep Coffee/Charcoal, Cormorant Garamond + Inter.

## Architecture
- **Backend**: FastAPI + MongoDB (motor). Property data stored in DB (5 seeded, idempotent). Endpoints: `/api/properties`, `/api/properties/{slug}`, `/api/inquiries` (save + Resend email to owner), `/api/auth/login|me`, `/api/admin/properties` CRUD + `/api/admin/inquiries` (JWT Bearer protected).
- **Frontend**: React + react-router, framer-motion (reveals/parallax/marquee), lenis smooth scroll, Tailwind. i18n via LanguageContext (localStorage). Property presentation driven entirely by DB → homepage/stays auto-update on add.
- **Integrations**: Emergent-managed Resend (owner inquiry emails → cp21investments@gmail.com); JWT custom auth for admin.

## User Personas
Couples, first-time international tourists, digital nomads (long stays), families/groups, repeat Cartagena visitors. Markets: US, CA, DE, UK, ES, FR, MX, LATAM.

## Core Requirements (static)
Brand → Experience → Trust → Direct Booking. Bilingual EN default. Subtle premium motion (restraint). Mobile-first. SEO-ready. Scalable property architecture. No invented reviews/pricing/amenities/SIRE.

## Implemented (2026-06)
- Homepage: hero (kinetic masked reveal + parallax), brand intro, marquee, collection (tabbed Historic/Manga), premium parallax feature, Why (Stay Coral Standard), Cartagena editorial (4 categories), reviews carousel (marked placeholders), direct-booking band, journal cards, final CTA, footer with giant wordmark.
- Pages: /stays (category tabs), /stays/:slug (gallery + lightbox, booking widget, amenities, sleeping, Google map, FAQ, sticky mobile CTA, Airbnb link), /cartagena, /about, /journal, /contact (DB + email).
- Nav: sticky glass on scroll, EN|ES switcher, BOOK DIRECT, mobile hamburger. Floating WhatsApp. SEO meta/OG/schema in index.html.
- Admin: /admin/login (JWT), /admin dashboard — property CRUD + inquiries inbox.
- 5 properties seeded: Joya de Cartagena, Mirador del Caribe, Entre Mar y Reloj (Historic); Brisa de Manga I, Brisas de Manga II (Manga).
- Tested: backend 26/26 pass; frontend ~95% (navbar overlap bug fixed post-test).

## Backlog
- **P1**: Real property photography (owner to upload via admin), real guest reviews wiring (Airbnb/Google), booking engine (PMS/channel manager — Lodgify/Smoobu/Hostaway), Booking.com URLs.
- **P2**: Journal article detail pages + SEO content, Cartagena guide sub-pages, CRM/email automation, digital check-in/SIRE via PMS, payments.
- **Security polish**: brute-force lockout on login, httpOnly cookie session, explicit CORS origins.

## Next Tasks
Owner to upload real images + confirm amenities per property; then connect a booking engine.

## Update — Junio 2026: Cargador de Fotos (Admin)
- Integración de Emergent Object Storage (EMERGENT_LLM_KEY en backend/.env).
- Backend: POST /api/admin/upload (JWT, valida JPG/PNG/WEBP/GIF/HEIC, máx 15MB) y GET /api/images/{path} (público, cache 1 año).
- Frontend: componente ImageManager en el formulario de propiedades del admin — drag & drop, multi-subida, eliminar, reordenar (flechas), botón "hacer portada", input opcional de URL.
- Probado: curl e2e (upload 200, serve 200, sin auth 401, tipo inválido 400) + screenshot del panel admin OK.
