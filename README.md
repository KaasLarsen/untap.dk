# untap.dk

Dansk Magic: The Gathering-hub — **Untap, Upkeep, Draw.**

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Markdown under `content/` (ingen CMS endnu)
- Dark mode som default (`lang="da"`)

## Udvikling

```bash
npm install
npm run dev
```

## Ruter

| Rute | Indhold |
|------|---------|
| `/` | Branded landing |
| `/artikler` | Artikelliste fra `content/` |
| `/artikler/[slug]` | Artikel |
| `/deck` | Placeholder (kommer snart) |
| `/marked` | Placeholder (kommer snart) |

## Deploy

Push til `main` — Vercel production.
