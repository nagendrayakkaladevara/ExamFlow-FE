# Getting started

## Prerequisites

- Node.js **20.19+**
- npm (lockfile present: `package-lock.json`)
- Access to the ExamFlow API (local or deployed)
- Frontend origin allowlisted in backend `CORS_ORIGIN` (default local: `http://localhost:5173`)

---

## Install

```bash
git clone <repo-url>
cd <frontend-root>
npm ci
```

---

## Environment

Copy `.env.example` and adjust only if needed:

```bash
# Optional — leave unset to use same-origin API proxy (recommended for session cookies).
# Local direct backend: VITE_API_BASE_URL=http://localhost:3000
# VITE_API_BASE_URL=https://exam-flow-be.vercel.app
```

| Setting | Behavior |
| --- | --- |
| **Unset** | Same-origin requests; Vite/Vercel rewrite `/api` to the backend (best for cookies) |
| **Set to API origin** | Direct calls to that host; CORS + cookie domain must match |

Env is validated with Zod in `src/lib/env.ts`. Production non-localhost URLs must use `https://`.

---

## Run

```bash
npm run dev        # Vite dev server (typically :5173)
npm run build      # tsc -b && vite build
npm run preview    # preview production build
npm run typecheck  # tsc -b --noEmit
npm run lint       # oxlint
```

Ensure the API is reachable:

- Local API (typical): `http://localhost:3000/api/v1`
- Health: `GET /healthz` (no `/api/v1` prefix)

---

## First login checklist

1. Seed or obtain a user for each role you need (`ADMIN`, `LECTURER`, `STUDENT`).
2. Open `/login`.
3. Confirm redirect to role home: `/admin`, `/lecturer`, or `/student`.
4. Confirm refresh works across reload (silent bootstrap via cookie).

---

## Project entry points

| File | Role |
| --- | --- |
| `src/main.tsx` | Vite entry |
| `src/app/App.tsx` | App root |
| `src/app/providers.tsx` | Query, theme, auth bootstrap, toaster |
| `src/app/router.tsx` | Route tree |
| `src/config/navigation.ts` | Role nav items |

---

## Next

- [Architecture](./architecture.md)
- [Local development](./local-development.md)
- [Authentication & security](./authentication-security.md)
