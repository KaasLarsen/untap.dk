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
| `SPICERACK_API_KEY` | Henter seneste turneringsdæk til forsiden og `/deck` |

Uden nøglen viser siden en tom state i stedet for at crashe.

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
