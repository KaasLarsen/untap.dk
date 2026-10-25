# untap.dk

Dansk Magic: The Gathering-hub — **Untap, Upkeep, Draw.**

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Markdown under `content/` (ingen CMS endnu)
- Scryfall til kortdata
- MTGTop8 til seneste turneringsdæklister (ingen API-nøgle)
- Dark mode som default (`lang="da"`)

## Udvikling

```bash
npm install
npm run dev
```

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

Push til `main` — Vercel production.
