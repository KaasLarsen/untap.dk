# untap.dk

Dansk Magic: The Gathering-hub — **Untap, Upkeep, Draw.**

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Markdown under `content/` (ingen CMS endnu)
- Scryfall til kortdata, Spicerack til turneringsdæklister
- Dark mode som default (`lang="da"`)

## Udvikling

```bash
npm install
cp .env.example .env.local
# Sæt SPICERACK_API_KEY (gratis fra spicerack.gg)
npm run dev
```

## Miljøvariabler

| Variabel | Formål |
|----------|--------|
| `SPICERACK_API_KEY` | Henter live turneringsdæk fra Spicerack til forsiden og `/deck` |

Uden nøglen viser siden curated sample-dæk (stadig med Scryfall-tooltips).

### Sådan får du Spicerack-nøglen

1. Opret / log ind på en organisation på [spicerack.gg](https://spicerack.gg) (store/admin)
2. Gå til organisationens **Admin → API Keys**
3. **Create API Key** → navn + access level → kopier `sk_…`-nøglen (vises kun én gang)
4. Sæt den i Vercel: Project → Settings → Environment Variables → `SPICERACK_API_KEY` (Production)
5. Redeploy

Docs: [Spicerack API introduction](https://docs.spicerack.gg/api-reference/introduction) · [Public decklist export](https://docs.spicerack.gg/api-reference/public-decklist-database)

## Ruter

| Rute | Indhold |
|------|---------|
| `/` | Branded landing + seneste Modern-turneringsdæk |
| `/artikler` | Artikelliste fra `content/` |
| `/artikler/[slug]` | Artikel |
| `/deck` | Turneringsdæk + Scryfall-demo |
| `/deck/[id]` | Detaljevisning af et turneringsdæk |
| `/marked` | Placeholder (kommer snart) |

## Deploy

Push til `main` — Vercel production. Husk at sætte `SPICERACK_API_KEY` i Vercel.
