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
| `/` | Branded landing + seneste Modern-dæk |
| `/artikler` | Artikelliste fra `content/` |
| `/artikler/[slug]` | Artikel |
| `/deck` | Redirect til Modern format-hub |
| `/deck/f/[format]` | Format-menu, metagame-% og turneringer |
| `/deck/f/[format]/archetype/[id]` | Alle dæk af en type |
| `/deck/f/[format]/event/[eventId]` | Top-dæk fra et event |
| `/deck/[id]` | Detaljevisning (klik kort → billede) |
| `/marked` | Placeholder (kommer snart) |

## Deploy

Push til `main` — Vercel production.
