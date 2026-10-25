# untap.dk

Dansk Magic: The Gathering-hub — **Untap, Upkeep, Draw.**

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Markdown under `content/` (ingen CMS endnu)
- Scryfall til kortdata
- MTGTop8 til seneste tournament decklists (ingen API-nøgle)
- Light mode som default (`lang="da"`)

## Udvikling

```bash
npm install
npm run dev
```

## Ruter

| Rute | Indhold |
|------|---------|
| `/` | Branded landing + seneste Modern-decks |
| `/artikler` | Artikelliste fra `content/` |
| `/artikler/[slug]` | Artikel |
| `/deck` | Redirect til Modern format-hub |
| `/deck/f/[format]` | Format-menu, metagame-% og turneringer |
| `/deck/f/[format]/archetype/[id]` | Alle decks af en type |
| `/deck/f/[format]/event/[eventId]` | Top-decks fra et event |
| `/deck/[id]` | Detaljevisning (klik kort → billede) |
| `/marked` | Søg kort/serier + aktuelle Scryfall EUR-priser |
| `/marked/kort/[id]` | Kortpris (Scryfall EUR mid) |
| `/marked/serie/[code]` | Kort i en serie med priser |

## Deploy

Push til `main` — Vercel production.
