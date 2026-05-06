# Smart Queue Management — Frontend

Next.js 16 + Tailwind v4 + shadcn/ui frontend for the
[Smart Queue Management API](../README.md). See [SPEC.md](./SPEC.md) for the
full feature spec, endpoint contract, and route map.

## Quick start

The frontend talks to the Express API on the `backend-setup` branch. Run the
backend first.

```bash
# 1. Backend (repo root, on backend-setup branch)
echo 'MONGO_URI=mongodb://localhost:27017/smart_queue
JWT_SECRET=replace-me' > .env
node seed.js          # seeds admin@smartqueue.com / admin123 + 1 queue
node server.js        # http://localhost:3000

# 2. Frontend
cd frontend
cp .env.local.example .env.local
# (optional) paste the QUEUE_ID printed by seed.js into NEXT_PUBLIC_DEFAULT_QUEUE_ID
pnpm install
pnpm dev -- -p 3001   # avoid colliding with the API on :3000
```

Open <http://localhost:3001>.

## Demo accounts

| Role     | Email                   | Password   |
| -------- | ----------------------- | ---------- |
| Admin    | admin@smartqueue.com    | admin123   |
| Customer | (register from the UI)  | —          |

## Features

- JWT auth (login, register, role-aware navbar, blacklist enforcement).
- Service / saved queue picker → `POST /api/queue/join`.
- Live status page: token + position + ETA + cancel + animated reveal,
  WebSocket + 5 s polling, "your turn is next" toast.
- Admin console: call next, skip, blacklist user, daily stats, live "now
  serving" via Socket.IO.
- Feedback: 5-star rating + optional anonymous comment for completed tokens.

## Tech

- Next.js 16 (App Router, Turbopack, React 19.2)
- TypeScript 5
- Tailwind CSS v4
- shadcn/ui (base-ui flavour) + lucide-react icons
- axios (REST), socket.io-client (realtime)
- react-hook-form + zod (forms)
- sonner (toasts)

## Project layout

```
src/
├── app/
│   ├── layout.tsx           # html shell + Providers + Navbar
│   ├── page.tsx             # landing
│   ├── login/, register/    # auth
│   ├── services/            # service cards + join + saved queues
│   ├── status/              # live token tracker
│   ├── admin/               # admin console (control / users / stats)
│   └── feedback/            # rating + comment
├── components/
│   ├── navbar.tsx
│   ├── providers.tsx        # AuthProvider + Toaster
│   └── ui/                  # shadcn components
└── lib/
    ├── api.ts               # axios + token helpers
    ├── auth-context.tsx     # current user + login/register/logout
    ├── queue-api.ts         # typed wrappers for /queue, /admin, /feedback
    ├── socket.ts            # singleton socket + useQueueSocket hook
    ├── saved-queues.ts      # localStorage saved queue list
    └── types.ts             # shared TypeScript types
```

## Environment variables

| Name                            | Default                  | Notes                              |
| ------------------------------- | ------------------------ | ---------------------------------- |
| `NEXT_PUBLIC_API_URL`           | `http://localhost:3000`  | REST base URL                      |
| `NEXT_PUBLIC_SOCKET_URL`        | `http://localhost:3000`  | Socket.IO base URL                 |
| `NEXT_PUBLIC_DEFAULT_QUEUE_ID`  | _(empty)_                | Auto-saved on first /services load |

## Scripts

```bash
pnpm dev      # start dev server (Turbopack)
pnpm build    # production build
pnpm start    # production server
pnpm lint     # eslint
```

## Known gaps (need backend endpoints)

- `GET /api/queue/active` — list real services / queues so the customer no
  longer pastes Mongo IDs.
- `POST /api/admin/reset/:queueId` — Sprint 4.4.
- `GET /api/admin/history/:queueId` — Sprint 4.5.

These are tracked in [SPEC.md §11](./SPEC.md#11-open-follow-ups).
