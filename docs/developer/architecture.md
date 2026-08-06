# Architecture

## Goals

- Production security defaults (auth, CSRF posture, headers, least-privilege UI)
- shadcn-compatible layout so CLI adds stay painless
- Feature modules aligned to product domains
- Typed, observable SPA deployable independently from the API

---

## Layered view

```text
+------------------------------------------------------------------+
|  Browser (SPA) — HTTPS only                                      |
|  Vite + React + TS + Tailwind + shadcn/ui                        |
+-------------------------------+----------------------------------+
                                |
        +-----------------------+-----------------------+
        v                       v                       v
+---------------+     +-----------------+     +-----------------+
| App shell     |     | Feature modules |     | Shared          |
| Router        |     | auth, users,    |     | components/ui   |
| Role layouts  |     | questions,      |     | lib/, types/    |
| Auth/RBAC     |     | assignments...  |     | hooks/          |
| guards        |     |                 |     |                 |
+-------+-------+     +--------+--------+     +--------+--------+
                               |
                               v
                    +---------------------------+
                    | Secure API client         |
                    | Bearer + credentials      |
                    | X-Requested-With (CSRF)   |
                    | -> /api/v1                |
                    +---------------------------+
```

---

## Folder structure

```text
src/
  app/                 # App.tsx, providers, router
  components/
    ui/                # shadcn primitives ONLY
    layout/            # AppShell, ExamLayout, sidebar, header
    guards/            # AuthGuard, RoleGuard, GuestGuard
    feedback/          # spinners, empty/error helpers
    shared/            # AudiencePicker, StatusBadge, …
    data-grid/         # AG Grid wrappers
    theme/             # light/dark + color themes
  features/<domain>/   # api.ts, pages/, components/, schemas…
  config/              # navigation, query-keys, constants, polling
  lib/                 # api-client, env, csrf, errors, dates, utils
  types/               # api, auth, enums, domain, models
  hooks/               # cross-feature hooks only
  pages/               # RootRedirect, errors, barrel re-exports
  styles/themes/       # optional color themes (e.g. claude, tangerine)
```

### Placement rules

| Path | Owns |
| --- | --- |
| `components/ui/*` | shadcn primitives |
| `components/layout/*` | chrome / shells |
| `features/*/…` | domain UI + API wrappers |
| `lib/api-client.ts` | HTTP, refresh retry, envelopes |
| `config/query-keys.ts` | cache identity |

Do **not** fork shadcn primitives into feature folders. Do **not** put secrets in the bundle beyond public `VITE_*` config.

---

## Providers

Typical order in `providers.tsx`:

1. QueryClientProvider
2. Theme / color theme providers
3. Tooltip provider
4. Auth bootstrap
5. Router / app shell
6. Toaster (sonner)

---

## Domain modules

| Module | Actors | Notes |
| --- | --- | --- |
| Auth | All | Login, refresh, logout, password change |
| Users | Admin | Create/update/deactivate; bulk student import |
| Classes | Admin (+ view for others) | Assign lecturers / enroll students |
| Tags | Lecturer | Used inside question bank (no dedicated nav route) |
| Questions | Lecturer | Bank CRUD, filters, images |
| Assignments | Lecturer, Student | Create, schedule, take, results |
| Analytics | All | Role-scoped dashboards / exports |
| Circulars | Admin, Lecturer, Student | Announcements + audiences |
| Polls | Admin, Lecturer, Student | Create / vote / visibility policies |
| Uploads | Admin, Lecturer | Images (jpeg/png/webp, max 5 MB client-side) |
| Dashboard | All | Role home metrics and quick actions |
| Settings | All | Appearance (theme + color) |

---

## State ownership

| Kind | Tool | Notes |
| --- | --- | --- |
| Server data | TanStack Query | staleTime sensible; never cache secrets |
| Auth session | Zustand | access token + user **in memory only** |
| Forms | RHF + Zod | client validation; server remains source of truth |
| Appearance | next-themes / color theme | may use localStorage for theme only |

---

## Next

- [Authentication & security](./authentication-security.md)
- [Feature modules](./feature-modules.md)
- [Routing & guards](./routing-and-guards.md)
