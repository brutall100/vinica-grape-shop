# Vinica — vynuogių sodinukų parduotuvė

[English](README.md) · **Lietuvių**

Daugiakalbė (LT / EN / RU / PL) vynuogių sodinukų el. parduotuvė su gyvu
„ryto vynuogyne“ fonu, pilnu apmokėjimu, paštomatų pasirinkimu ir administravimo skydu.

**[Gyva demonstracija](https://vinica-grape-shop.vercel.app)** · **[Kodas](https://github.com/brutall100/vinica-grape-shop)**

![Vinica pradinis puslapis šviesiu režimu](docs/screenshot.webp)

<p>
  <img src="docs/screenshot-dark.webp" alt="Vinica pradinis puslapis tamsiu režimu" width="560" height="350">
  <img src="docs/screenshot-mobile.webp" alt="Vinica pradinis puslapis 390 px telefone" width="165" height="357">
</p>

## Apie projektą

Vinica yra nedidelio lietuviško medelyno, auginančio šalčiui atsparias vynuogių veisles,
parduotuvė. Lankytojas gali peržiūrėti 12 veislių ir filtruoti jas pagal paskirtį, uogų spalvą
bei sunokimo laiką. Sodinukus galima dėti į krepšelį ir apmokėti kortele. Užsakymai
pristatomi į Omniva / LP Express paštomatus arba kurjeriu. Savininkas prekes, kategorijas,
užsakymus ir kainas tvarko administravimo skyde.

Dizainas sukurtas pagal vieną idėją: **vėjuotas rytas vynuogyne**. Krenta vynmedžio lapai,
šiltoje saulės šviesoje plaukioja žiedadulkės, o naktį (tamsiu režimu) jos šviečia kaip
jonvabaliai.

## Galimybės

- **Parduotuvė**: pradinis puslapis, katalogas su filtrais ir rikiavimu, prekių puslapiai,
  krepšelis, užsakymo forma, patvirtinimas, informaciniai puslapiai.
- **4 kalbos** su išverstais adresais (`/katalogas` ↔ `/en/catalog` ↔ `/ru/catalog`).
- **Mokėjimai** per Stripe Checkout + webhook. Be Stripe raktų užsakymai išsaugomi su būsena
  „Laukia apmokėjimo“, todėl parduotuvę lengva išbandyti lokaliai.
- **Pristatymas**: tikri Omniva / LP Express paštomatų sąrašai (saugomi parai, yra atsarginis
  sąrašas).
- **Administravimas**: prisijungimas (Auth.js, slaptažodžiai saugomi užšifruoti), suvestinė,
  prekės su nuotraukų įkėlimu, kategorijos, užsakymų būsenos, parduotuvės nustatymai.
- **SEO ir AI randamumas**: sitemap su hreflang, robots.txt, JSON-LD (`Product`,
  `Organization`, `BreadcrumbList`), `llms.txt`, Open Graph.
- **Gyvas fonas**: saulės ir vynuogių švytėjimai, vos matomas vynuogyno vielų tinklelis,
  krentantys lapai ir žiedadulkės. Kiekviena dalelė gauna atsitiktinį dydį, greitį, vėlavimą ir
  nukrypimą. Telefone dalelių dvigubai mažiau, o animuojami tik `transform` ir `opacity`.
- **Mikro-animacijos**: mygtukai pakyla, nusileidžia paspaudus ir paleidžia bangelę.
  Paspaudus „Į krepšelį“ išdygsta lapelis. Kortelės pakyla užvedus pelę, skyriai atsiranda
  slenkant, o skaičiai viršuje „suskaičiuoja“.
- **Šviesus ir tamsus režimai**: pagal sistemos nustatymą, su perjungimo mygtuku, kuris
  įsimena pasirinkimą ir neleidžia puslapiui sumirgėti kraunantis.
- **Prieinamumas**: nuoroda „Pereiti prie turinio“, matomas `:focus-visible`, laukeliai ir
  mygtukai su pavadinimais, WCAG AA kontrastas (patikrintas skaičiais).
  `prefers-reduced-motion` išjungia judėjimą.

## Technologijos

| Sritis | Įrankiai |
| --- | --- |
| Karkasas | Next.js 16 (App Router, React Server Components, TypeScript) |
| Stiliai | Tailwind CSS v4 + paletė CSS kintamuosiuose |
| Duomenų bazė | PostgreSQL + Prisma ORM |
| Kalbos | next-intl |
| Mokėjimai | Stripe (paruošta vieta Montonio / Paysera) |
| Autentifikacija | Auth.js v5 |
| El. laiškai | Resend (be rakto rašo į konsolę) |
| Nuotraukos | lokaliai `public/uploads`, produkcijoje Vercel Blob |

### Spalvų paletė „Vynuogyno aušra“

Visos spalvos surašytos `:root` bloke, failo [`src/app/globals.css`](src/app/globals.css)
viršuje. Tamsus režimas naudoja tos pačios paletės atspalvius.

| Paskirtis | Šviesus | Tamsus |
| --- | --- | --- |
| Fonas | `#FBF6EC` ryto kreminė | `#141910` naktinis vynuogynas |
| Paviršius (kortelės) | `#FFFFFF` | `#20281A` |
| Tekstas | `#2A2118` žemės ruda | `#F1EBDD` |
| Akcentas: mygtukai, nuorodos | `#4F7A2B` vynmedžio žalia | `#9CC46A` |
| Antras akcentas: ženkliukai, skaičiai | `#6B2E5F` vynuogių violetinė | `#D08CC0` |

### Šriftai

- **Fraunces** antraštėms: minkštas „senovinis“ serifinis šriftas, primenantis medelyno etiketę
- **Manrope** tekstui

Abu šriftus pateikia `next/font`, todėl jie laikomi pačioje svetainėje ir puslapis kraunantis
nešokinėja.

## Ko išmokau

- Kaip sukurti vieną spalvų sistemą su CSS kintamaisiais ir nukreipti į ją Tailwind spalvų
  pavadinimus. Tada visa programa (ir admin skydas) persijungia į tamsų režimą vien pakeitus
  kintamuosius.
- Kaip išvengti temos „mirgėjimo“ su mažu scenarijumi, kuris paleidžiamas prieš pirmą
  puslapio piešimą.
- Kodėl `body` fonas uždengia `position: fixed; z-index: -1` sluoksnį ir kodėl puslapio spalva
  turi būti ant `<html>`.
- Kaip išvengti React „hydration“ klaidų: tekstą keičianti animacija turi veikti savo kliento
  komponente, kai šis jau paruoštas.
- Kaip App Router'yje veikia lokalizuoti adresai, JSON-LD ir hreflang.
- Kaip padaryti saugų užsakymą: kainos skaičiuojamos serveryje, duomenys tikrinami su Zod,
  mokėjimai patvirtinami per Stripe webhook.

## Paleidimas lokaliai

Reikia **Node.js 20+** ir **PostgreSQL**.

```bash
# 1. Priklausomybės
npm install

# 2. Duomenų bazė
sudo -u postgres psql -c "CREATE USER vinica WITH PASSWORD 'change_me' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE vinica_shop OWNER vinica;"

# 3. Aplinkos kintamieji
cp .env.example .env
#   Užpildykite bent: DATABASE_URL, AUTH_SECRET (npx auth secret),
#   ADMIN_EMAIL ir ADMIN_PASSWORD. Stripe, Resend ir Blob raktai neprivalomi.

# 4. Lentelės ir pavyzdiniai duomenys (12 veislių, 3 kategorijos, admin vartotojas)
npx prisma migrate dev
npm run db:seed

# 5. Paleidimas
npm run dev
```

Parduotuvė: http://localhost:3000 · Admin: http://localhost:3000/admin (prisijungimas su
`ADMIN_EMAIL` / `ADMIN_PASSWORD` iš `.env`).

Naudingos komandos:

```bash
npm run build       # produkcinis build
npm run lint        # ESLint
npm run typecheck   # TypeScript patikra
npm run format      # Prettier
npm run test:e2e    # Playwright testas (serveris turi veikti)
```

### Kodėl demonstracija Vercel'yje, o ne GitHub Pages

Tai pilna programa: jai reikia Node.js serverio ir PostgreSQL duomenų bazės. GitHub Pages moka
rodyti tik statinius failus, todėl gyva versija veikia **Vercel** (nemokamas planas) su
nemokama **Neon** duomenų baze:

1. Sukurkite PostgreSQL duomenų bazę [neon.tech](https://neon.tech) ir nusikopijuokite
   prisijungimo eilutę (connection string).
2. Importuokite šią repozitoriją [vercel.com](https://vercel.com).
3. **Project → Settings → Environment Variables** įrašykite visus kintamuosius iš
   `.env.example` (`NEXT_PUBLIC_SITE_URL` = jūsų Vercel adresas).
4. Vieną kartą paleiskite migracijas ir pradinius duomenis:
   `DATABASE_URL=... npx prisma migrate deploy` ir `DATABASE_URL=... npx prisma db seed`.
5. Nebūtina: Stripe skydelyje pridėkite webhook `https://<jūsų-domenas>/api/webhooks/stripe`
   (įvykiai `checkout.session.completed`, `checkout.session.expired`) ir jo raktą įrašykite į
   `STRIPE_WEBHOOK_SECRET`.

## Projekto struktūra

```
src/
  app/
    (store)/[locale]/      vieša parduotuvė (4 kalbos, išversti adresai)
    (admin)/admin/         administravimas (lietuviškai, apsaugota Auth.js)
    api/                   Stripe webhook, paštomatai, prisijungimas
    globals.css            paletė (CSS kintamieji) + Tailwind tema
    icon.svg               favicon paletės spalvomis
    sitemap.ts, robots.ts, llms.txt/
  components/
    effects/               gyvas fonas, bangelė/atsiradimas, skaičiai, temos jungiklis
    store/  admin/  ui/
  styles/
    living-background.css  švytėjimai, tinklelis, lapai, žiedadulkės
    effects.css            mygtukai, kortelės, fokusas, sumažintas judėjimas
  lib/                     mokėjimai, pristatymas, prisma, seo, el. laiškai, krepšelis
  i18n/                    maršrutai ir išversti adresai
messages/                  lt.json, en.json, ru.json, pl.json
prisma/                    schema, migracijos, pradiniai duomenys
public/products/           vynuogių iliustracijos (SVG, ~4 KB)
docs/                      README ekrano nuotraukos (WebP)
scripts/                   iliustracijų generatorius, e2e testas
```

## Padėkos

- Šriftai: [Fraunces](https://fonts.google.com/specimen/Fraunces) ir
  [Manrope](https://fonts.google.com/specimen/Manrope), SIL Open Font License.
- Ikonos: [Lucide](https://lucide.dev), ISC licencija.
- Vynuogių iliustracijas sugeneruoja `scripts/generate-placeholder-images.mjs`.
- Pradiniuose duomenyse esantys kontaktai ir admin paskyra yra išgalvoti (`example.com`).

## Licencija

[MIT](LICENSE) © 2026 brutall100
