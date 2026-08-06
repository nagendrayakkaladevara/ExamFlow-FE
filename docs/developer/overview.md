# Overview

## Product

**ExamFlow** is a college **examination and assessment** web application. The frontend in this repository is a single-page app (SPA) that serves three roles:

- **Admin** — institutional users, classes, analytics, circulars, polls
- **Lecturer** — question bank, assignments, results, scoped communications
- **Student** — take timed assignments, view policy-gated results, circulars, polls, personal performance

### In scope

- Role-scoped dashboards and navigation
- Auth session (JWT access + httpOnly refresh cookie)
- Users, classes, questions, tags, assignments (start → autosave → submit)
- Circulars, polls, image uploads
- Role-scoped analytics and CSV exports where implemented
- Calm, distraction-free exam layout for students

### Out of scope (v1)

- Full LMS (courses, forums, content libraries)
- Browser lockdown / remote proctoring
- Offline-first usage
- Native mobile apps
- Descriptive/essay question grading in the API (schema may exist; FE/API expose objective types only)

---

## Stack (as implemented)

| Concern | Choice |
| --- | --- |
| Package | `examflow-frontend` `0.1.0` |
| Runtime | Node `>=20.19.0` |
| Bundler | Vite 8 |
| UI | React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (New York) |
| Routing | React Router 7 (`createBrowserRouter`) |
| Server state | TanStack Query v5 |
| Session UI state | Zustand (memory-only access token + user) |
| Forms | React Hook Form + Zod |
| HTTP | Custom typed `fetch` (`src/lib/api-client.ts`) |
| Tables | AG Grid |
| Charts | Recharts |
| Deploy | Vercel SPA (`vercel.json`) |

Brand constant: `APP_NAME = 'ExamFlow'` in `src/config/constants.ts`.

---

## High-level request flow

```text
Browser (HTTPS SPA)
  → Route match → Guest / Auth / Role guards
  → Feature page → TanStack Query → api-client
  → Authorization: Bearer <accessToken>
  → credentials: 'include' (refresh cookie)
  → API /api/v1
```

On `401`, the client attempts a single refresh, retries once, then hard-logs out to `/login`.

---

## Documentation sources used

This guide synthesizes:

- Application source under `src/`
- `ARCHITECTURE.md`, `design.md`, `API_DOCS.md`
- Inferred PRD capabilities from domain modules and role matrices (parent `prd.md` is referenced but not present in this package)

---

## Next

- New to the repo → [Getting started](./getting-started.md)
- Need system shape → [Architecture](./architecture.md)
