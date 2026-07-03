# Vinica — vynuogių sodinukų el. parduotuvė

Moderni, daugiakalbė (LT / EN / RU / PL) elektroninė parduotuvė vynuogių sodinukams,
sukurta su Next.js 16, PostgreSQL ir Stripe. Mobile-first dizainas, pilna SEO
optimizacija ir AI randamumas (llms.txt, JSON-LD).

## Technologijos

| Sritis | Sprendimas |
|---|---|
| Karkasas | Next.js 16 (App Router, RSC, TypeScript) |
| Stiliai | Tailwind CSS v4 |
| Duomenų bazė | PostgreSQL + Prisma ORM |
| Daugiakalbystė | next-intl (lokalizuoti URL: `/katalogas` ↔ `/en/catalog`) |
| Mokėjimai | Stripe Checkout (+ paruošta vieta Montonio/Paysera) |
| Autentifikacija | Auth.js v5 (admin prisijungimas) |
| El. laiškai | Resend (be rakto — log į konsolę) |
| Nuotraukos | Lokaliai `public/uploads`, produkcijoje Vercel Blob |

## Paleidimas lokaliai

```bash
# 1. Priklausomybės
npm install

# 2. PostgreSQL (turi veikti lokaliai) — sukurkite DB
sudo -u postgres psql -c "CREATE USER vinica WITH PASSWORD 'vinica_dev' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE vinica_shop OWNER vinica;"

# 3. Aplinkos kintamieji
cp .env.example .env
# užpildykite .env (žr. komentarus faile)

# 4. Migracijos ir pradiniai duomenys (12 veislių, 3 kategorijos, admin vartotojas)
npx prisma migrate dev
npm run db:seed

# 5. Serveris
npm run dev
```

Parduotuvė: http://localhost:3000 · Admin: http://localhost:3000/admin
(prisijungimas — `ADMIN_EMAIL` / `ADMIN_PASSWORD` iš `.env`, seed sukuria šį vartotoją).

## Struktūra

```
src/
  app/
    (store)/[locale]/     # vieša parduotuvė (4 kalbos, lokalizuoti URL)
    (admin)/admin/        # valdymo skydas (tik LT, apsaugotas Auth.js)
    api/                  # webhooks, pickup-points, auth
    sitemap.ts, robots.ts, llms.txt/
  components/  store/ | admin/ | ui/
  lib/         payments/ | shipping/ | prisma, seo, email, cart-store...
  i18n/        routing (lokalizuoti pathnames), request
messages/      lt.json, en.json, ru.json, pl.json
prisma/        schema.prisma, migrations/, seed.ts
```

## Mokėjimai

**Stripe** — įrašykite `STRIPE_SECRET_KEY` ir `STRIPE_WEBHOOK_SECRET` į `.env`.
Webhook endpoint: `POST /api/webhooks/stripe` (įvykiai: `checkout.session.completed`,
`checkout.session.expired`). Lokaliai testuokite su `stripe listen --forward-to
localhost:3000/api/webhooks/stripe`. Kol raktų nėra, užsakymai kuriami be apmokėjimo
(būsena „Laukia apmokėjimo“) — patogu testuoti.

**Montonio / Paysera (lietuviški bankai)** — architektūra paruošta:
žr. `src/lib/payments/montonio.ts` su žingsnis-po-žingsnio instrukcija.

## Pristatymas

- Omniva ir LP Express paštomatų sąrašai traukiami iš viešų API ir cache'uojami parai
  (`src/lib/shipping/pickup-points.ts`). Jei tinklas nepasiekiamas, naudojamas
  įdėtas atsarginis sąrašas (`src/data/pickup-points-fallback.json`).
- Kainos ir nemokamo pristatymo riba keičiamos admin'e (Nustatymai).
- Siuntų etikečių generavimas (Omniva/LP API integracija su sutartimi) — ateities darbas.

## SEO ir AI randamumas

- `sitemap.xml` su hreflang visoms 4 kalboms, `robots.txt`
- Kanoniniai URL + hreflang alternates kiekviename puslapyje
- JSON-LD: `Product`, `Organization`, `WebSite`, `BreadcrumbList`
- `llms.txt` — svetainės santrauka AI asistentams (llmstxt.org standartas)
- OpenGraph / Twitter kortelės, `next/image` optimizacija

## Deployment (rekomenduojama: Vercel + Neon)

1. **DB**: sukurkite nemokamą PostgreSQL duomenų bazę [neon.tech](https://neon.tech)
   (arba Supabase) ir nusikopijuokite connection string.
2. **Vercel**: importuokite šią GitHub repozitoriją į [vercel.com](https://vercel.com).
3. Vercel projekto **Environment Variables** įrašykite visus kintamuosius iš
   `.env.example` (`DATABASE_URL`, `AUTH_SECRET` — sugeneruokite `npx auth secret`,
   `NEXT_PUBLIC_SITE_URL` — jūsų domenas, Stripe raktai, `RESEND_API_KEY`,
   `BLOB_READ_WRITE_TOKEN` — sukūrus Vercel Blob saugyklą).
4. Migracijos produkcinei DB: `DATABASE_URL=... npx prisma migrate deploy`,
   tada `DATABASE_URL=... npx prisma db seed`.
5. Stripe dashboard'e pridėkite webhook `https://jusu-domenas.lt/api/webhooks/stripe`
   ir įrašykite jo signing secret į `STRIPE_WEBHOOK_SECRET`.

## Naudingos komandos

```bash
npm run dev          # dev serveris
npm run build        # produkcinis build
npm run lint         # ESLint
npm run typecheck    # TypeScript patikra
npm run db:migrate   # prisma migrate dev
npm run db:seed      # pradiniai duomenys
```
