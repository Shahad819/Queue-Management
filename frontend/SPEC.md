# Smart Queue Management — Frontend Spec

> Frontend that consumes the Express + MongoDB + Socket.IO backend on the
> `backend-setup` branch. Built with Next.js 16 (App Router), TypeScript,
> Tailwind v4, and shadcn/ui.

---

## 1. Scope

The frontend covers all backend endpoints exposed by the upstream API and
implements the user-visible features from the Sprint 2 / 3 / 4 brief:

- Sprint 2 — login/register, navbar, services, join queue, dummy token,
  responsive layout.
- Sprint 3 — real (server-issued) token, persisted session, status page with
  position + ETA + cancel, multi-token survival across refreshes.
- Sprint 4 — live realtime updates (WebSocket + 5 s polling fallback), admin
  control (call next, skip, blacklist, daily stats), animated token reveal,
  toast notifications, feedback + rating system.

Out of scope: signup OTP, payment/billing (the existing UI mock referenced
"billing" — replaced with feedback per `UI designs/Readit.txt`).

---

## 2. System map

```
+-----------------------+           +-----------------------------+
|     Next.js 16 app    |  HTTPS    |  Express 5 + Mongoose API   |
|  (frontend/, this PR) | <-------> |  /api/users  /api/queue     |
|                       |  WS       |  /api/admin  /api/feedback  |
|  Tailwind v4 + shadcn | <-------> |  Socket.IO room: <queueId>  |
+-----------------------+           +-----------------------------+
```

- API base: `process.env.NEXT_PUBLIC_API_URL` (default `http://localhost:3000`).
- Socket base: `process.env.NEXT_PUBLIC_SOCKET_URL` (same default).
- Optional preset: `NEXT_PUBLIC_DEFAULT_QUEUE_ID` populates one saved queue
  on first load (handy when you just ran `node seed.js` and want a one-click
  demo).

Auth: JWT bearer token. Stored in `localStorage` under `qm_token`; user
profile cached under `qm_user`. Axios interceptor injects the header on every
request. There is no refresh token — token TTL is 1 day per the backend.

---

## 3. Backend contract

| Method | Path                          | Auth   | Body / Params                                            | Used by              |
| ------ | ----------------------------- | ------ | -------------------------------------------------------- | -------------------- |
| POST   | `/api/users/register`         | —      | `{ name, email, password }`                              | `/register`          |
| POST   | `/api/users/login`            | —      | `{ email, password }` → `{ token, user }`                | `/login`             |
| GET    | `/api/queue/list`             | —      | → `{ queues: [{ _id, service, current_token, waiting_count }] }` | `/services`, `/admin`|
| POST   | `/api/queue/join`             | user   | `{ queueId }` → `{ token }`                              | `/services`          |
| GET    | `/api/queue/track`            | user   | → `{ token, people_ahead, real_time_estimated_wait }`    | `/status`            |
| DELETE | `/api/queue/cancel/:id`       | user   | path: `tokenId`                                          | `/status`            |
| POST   | `/api/admin/call-next`        | admin  | `{ queueId }` → emits `queue_updated`                    | `/admin`             |
| POST   | `/api/admin/skip`             | admin  | `{ queueId }` → emits `queue_updated`                    | `/admin`             |
| POST   | `/api/admin/reset/:queueId`   | admin  | cancels waiting/serving tokens, current_token = 0        | `/admin`             |
| POST   | `/api/admin/blacklist`        | admin  | `{ userId }`                                             | `/admin`             |
| GET    | `/api/admin/stats/:queueId`   | admin  | → `{ totalServed, avgWaitTimeMins }`                     | `/admin`             |
| GET    | `/api/admin/history/:queueId` | admin  | → `{ history: [...100 tokens] }`                         | `/admin`             |
| POST   | `/api/feedback/submit`        | user   | `{ tokenId, rating, comment?, isAnonymous? }`            | `/feedback`          |

Socket events (client → server): `join_queue_room <queueId>`.
Server → client: `queue_updated { message, current_token }` per room.

Token statuses: `waiting | serving | done | cancelled | skipped`.
Roles: `customer | admin`.

---

## 4. Routes (App Router)

```
src/app/
├── layout.tsx          # html shell, fonts, Providers, Navbar
├── page.tsx            # marketing landing
├── login/page.tsx      # sign in
├── register/page.tsx   # sign up (auto login)
├── services/page.tsx   # service presets + join queue + saved queue list
├── status/page.tsx     # live token (polling 5s + socket)
├── feedback/page.tsx   # 5-star rating + optional anon comment
└── admin/page.tsx      # admin tabs: control / users / stats
```

All pages outside `/login` and `/register` either render gracefully when the
user is anonymous (home, services) or redirect to `/login` (status, admin).

`/admin` additionally checks `user.role === 'admin'` and bounces non-admins
back to `/`.

---

## 5. State / persistence

| Key (localStorage) | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| `qm_token`         | JWT bearer                                           |
| `qm_user`          | Cached `User` (id, name, email, role)                |
| `qm_saved_queues`  | Up to 10 `{ queueId, label }` for one-click rejoin   |
| `qm_admin_queue_id`| Last queue ID the admin operated on                  |

State is intentionally simple — no Redux / Zustand. React Context (`AuthContext`)
holds the current user; everything else is local component state.

---

## 6. Realtime strategy

Two channels are used together:

1. **Socket.IO** — `getSocket()` lazily opens a WebSocket connection. The
   `useQueueSocket(queueId, cb)` hook joins the queue room and re-runs `cb`
   whenever `queue_updated` fires.
2. **Polling fallback** — `/status` polls `/api/queue/track` every 5 s
   regardless of socket state. This keeps `people_ahead` and ETA fresh even
   when other customers join (the backend only emits on call-next/skip).

When `people_ahead <= 1` for a `waiting` token, a one-shot toast announces
"Your turn is coming up!" — guarded by a ref to avoid retriggering.

---

## 7. UI system

- **Tailwind v4** with the design tokens generated by `shadcn init`.
- **shadcn/ui** (base-ui flavour, Next.js 16 compatible). Components used:
  button, card, input, label, dialog, dropdown-menu, badge, avatar, alert,
  separator, sonner, tabs, textarea, select.
- **lucide-react** icons.
- **sonner** toasts (rich colour, top-right) for all user-facing feedback.
- Animations: Tailwind keyframes (`motion-safe:animate-in`) on token reveal;
  hover lift on service cards.
- Dark mode: inherits the `globals.css` tokens — toggle is not yet wired.

> shadcn note: this version of `Button` does **not** accept `asChild`. To get
> a button-styled link, use `<Link className={buttonVariants({…})}>`.

---

## 8. Error handling

`apiError(err)` normalises Axios errors to a string (prefers `response.data.message`).
All page actions wrap calls in `try/catch` and surface failures via `toast.error`.

Two backend quirks are tolerated client-side:

- Login response uses `massage` (sic) instead of `message` — we don't display
  it, so no issue.
- `protect` middleware can run `next()` then fall through to "no token" 401
  if `req.user` is missing; the client only treats non-2xx as failure.

---

## 9. Mapping from the brief

| Sprint | Task                                              | Where                                  |
| ------ | ------------------------------------------------- | -------------------------------------- |
| 2.1    | Project structure                                 | `frontend/` (Next.js 16 + TS)          |
| 2.2    | Homepage layout                                   | `app/page.tsx`                         |
| 2.3    | Navbar (Home / Services)                          | `components/navbar.tsx`                |
| 2.4    | Service selection cards                           | `app/services/page.tsx`                |
| 2.5    | Join Queue interface                              | `app/services/page.tsx`                |
| 2.6    | Join queue button                                 | `app/services/page.tsx`                |
| 2.7    | Token display                                     | `app/status/page.tsx`                  |
| 2.8/9  | Styling + responsive                              | Tailwind across all pages              |
| —      | Login (admin / customer)                          | `app/login/page.tsx`                   |
| 3.1    | Real, unique token                                | server-issued via `/api/queue/join`    |
| 3.2/3  | Persistent storage / queue                        | `lib/api.ts` + `lib/saved-queues.ts`   |
| 3.4    | Status page                                       | `app/status/page.tsx`                  |
| 3.5    | Token, service, position, ETA                     | `app/status/page.tsx`                  |
| 3.6    | Cancel button                                     | `app/status/page.tsx`                  |
| 3.7    | Persists across refresh                           | localStorage + `/track` round-trip     |
| 3.8    | Queue movement                                    | admin call-next/skip + 5 s polling     |
| 3.9    | "Turn is next" alert                              | `useEffect` toast guard                |
| 3.10   | Multi-token / multi-service                       | saved queues list                      |
| 4.1    | Live update auto refresh 5 s                      | `setInterval(fetchStatus, 5000)`       |
| 4.2/3  | Admin panel + serve-next                          | `app/admin/page.tsx`                   |
| 4.4    | Reset queue                                       | `POST /api/admin/reset/:queueId`       |
| 4.5    | History log                                       | `GET /api/admin/history/:queueId`      |
| 4.6    | Auto "served" status                              | backend transitions to `done`          |
| 4.7    | Toast notifications                               | sonner                                 |
| 4.8    | Animated queue movement                           | token reveal animation in `/status`    |
| 4.9    | Feedback                                          | `app/feedback/page.tsx`                |
| 4.10   | Rating                                            | star picker (1–5)                      |

Items marked `n/a` need backend endpoints before the UI can ship.

---

## 10. Local development

```bash
# 1. Backend
node seed.js              # seeds admin@smartqueue.com / admin123 + one queue
node server.js            # listens on :3000

# 2. Frontend
cd frontend
cp .env.local.example .env.local
# (optional) paste the printed QUEUE_ID into NEXT_PUBLIC_DEFAULT_QUEUE_ID
pnpm install
pnpm dev                  # http://localhost:3001 by default? next will pick
```

If both default to `:3000`, run the frontend on a different port:
`pnpm dev -- -p 3001`.

---

## 11. Open follow-ups

- Refresh-token flow — JWT lifetime is 1 day, after which the user is
  silently logged out on next 401. Should redirect to `/login`.
- Admin user picker — blacklist currently takes a raw Mongo ID; a search
  endpoint would replace the input with a typeahead.
