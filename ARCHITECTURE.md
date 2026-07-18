# Frontend Architecture & Folder Structure

# Student Assessment & Learning Management Platform

**Status:** Production-ready design (documentation only — does not scaffold the app)  
**Stack:** Vite · React · TypeScript · Tailwind CSS · **shadcn/ui**  
**Aligned with:** [`../prd.md`](../prd.md) · [`../API_DOCS.md`](../API_DOCS.md) · [`../backend/ARCHITECTURE.md`](../backend/ARCHITECTURE.md)

---

## 1. Overview

This document defines a **production-grade** frontend architecture: security by default, shadcn/ui as the component system, and a feature-first layout that maps cleanly to Admin / Lecturer / Student roles.

| Layer | Choice |
| --- | --- |
| Build tool | **Vite** (production build + Vercel static deploy) |
| UI library | **React 18+** (function components) |
| Language | **TypeScript** (`strict`, `noUncheckedIndexedAccess`) |
| Styling | **Tailwind CSS** + CSS variables (shadcn theme tokens) |
| Component system | **shadcn/ui** (Radix primitives + Tailwind; owned source in repo) |
| Routing | **React Router** (data routers / nested layouts) |
| Server state | **TanStack Query** |
| Auth / UI session | **Zustand** (access token + user **in memory only**) |
| Forms | **React Hook Form** + **Zod** (+ `@hookform/resolvers`) |
| HTTP | Typed `fetch` or Axios wrapper with interceptors |
| Icons | **lucide-react** (shadcn default) |
| Deploy | **Vercel** SPA (separate project from API) |

### Design goals

- Production security: auth, CSRF posture, XSS hardening, headers, least privilege UI
- shadcn-native folder aliases and theme so `npx shadcn@latest add …` works without rework
- Feature modules aligned to PRD domains
- Client never trusted for authorization — UI guards + backend RBAC
- Observable, typed, and deployable with CI

---

## 2. High-Level Architecture

```text
+------------------------------------------------------------------+
|  Browser (SPA) — HTTPS only                                      |
|  Vite + React + TS + Tailwind + shadcn/ui                        |
|  CSP / security headers (Vercel) · no secrets in bundle          |
+-------------------------------+----------------------------------+
                                |
        +-----------------------+-----------------------+
        v                       v                       v
+---------------+     +-----------------+     +-----------------+
| App shell     |     | Feature modules |     | Shared          |
| Router        |     | auth, users,    |     | components/ui   |
| Role layouts  |     | questions,      |     | (shadcn)        |
| Auth/RBAC     |     | assignments...  |     | lib/, types/    |
| guards        |     |                 |     | hooks/          |
+-------+-------+     +--------+--------+     +--------+--------+
        |                      |                       |
        +----------------------+-----------------------+
                               |
                               v
                    +---------------------------+
                    | Secure API client         |
                    | Authorization: Bearer     |
                    | credentials: 'include'    |
                    | X-Requested-With (CSRF)   |
                    | -> API /api/v1            |
                    +---------------------------+
```

### Request / UI flow

1. Route match → **Guest / Auth / Role** guards.
2. Feature page renders; data via TanStack Query → API client.
3. Client attaches Bearer access JWT; cookie refresh uses `credentials: 'include'`.
4. On `401`: single refresh attempt → retry; else hard logout.
5. Mutations invalidate queries; errors mapped from API envelope (never raw stack traces).
6. UI built from **shadcn** primitives (`Button`, `Form`, `Dialog`, …) composed in features.

---

## 3. Production Tech Stack

| Concern | Package / approach | Production note |
| --- | --- | --- |
| Bundler | Vite | `NODE_ENV=production` builds; asset hashing |
| Components | React + shadcn/ui | Source owned under `src/components/ui` |
| Primitives | Radix (via shadcn) | A11y focus traps, dialogs, menus |
| Styling | Tailwind + `class-variance-authority` | shadcn variants; `cn()` merge |
| Utils | `clsx` + `tailwind-merge` | Required by shadcn `lib/utils.ts` |
| Routing | `react-router-dom` | Nested role layouts; lazy routes |
| Data | `@tanstack/react-query` | Sensible staleTime; no cache of secrets |
| Forms | RHF + Zod | Client validation; server remains source of truth |
| Dates | `date-fns` | Assignment windows / timers |
| Toasts | shadcn `sonner` | User feedback without leaking internals |
| Path alias | `@/*` → `src/*` | Must match `components.json` |
| Env | Zod-validated `import.meta.env` | Fail fast if `VITE_API_BASE_URL` missing |

### Testing & quality (required for production readiness)

| Layer | Tool |
| --- | --- |
| Unit / component | Vitest + Testing Library |
| E2E critical paths | Playwright (login, take assignment, role denial) |
| Lint | ESLint (typescript-eslint) + eslint-plugin-react-hooks |
| Format | Prettier |
| Types | `tsc --noEmit` in CI |
| Deps | `npm audit` / Dependabot (or Renovate) |
| Bundle | Rollup visualizer optional; watch for accidental secret leaks |

---

## 4. shadcn/ui Compatibility (mandatory layout)

The tree below is **intentionally shadcn-compatible**. After Vite + Tailwind scaffold, run `npx shadcn@latest init` so generated paths match this document.

### 4.1 Required config files

```text
frontend/
├── components.json          # shadcn CLI config (aliases, style, rsc: false)
├── tailwind.config.ts       # content globs + shadcn theme extension
├── postcss.config.js
├── vite.config.ts           # resolve.alias: { '@': path.resolve(__dirname, './src') }
├── tsconfig.json            # paths: { "@/*": ["./src/*"] }
└── src/
    ├── index.css            # or styles/globals.css — Tailwind + shadcn CSS variables
    ├── lib/
    │   └── utils.ts         # export function cn(...)  ← shadcn default name
    └── components/
        └── ui/              # ONLY shadcn-generated / maintained primitives
```

### 4.2 `components.json` contract (illustrative)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

Rules:

- **Vite SPA:** `"rsc": false` (no Next.js App Router).
- **Do not rename** `src/components/ui` or `src/lib/utils.ts` — CLI expects them.
- **Do not wrap** every shadcn file in custom re-exports that break CLI updates; compose in `components/layout` and `features/*/components`.
- Theme via **CSS variables** in `src/index.css` (`--background`, `--primary`, `--destructive`, …) so shadcn variants stay consistent.
- Prefer adding components with CLI: `npx shadcn@latest add button form dialog table …`

### 4.3 Recommended shadcn starter set (by domain)

| Area | Components |
| --- | --- |
| Core | `button`, `input`, `label`, `textarea`, `checkbox`, `radio-group`, `select`, `switch` |
| Forms | `form` (RHF integration), `calendar`, `popover` |
| Feedback | `alert`, `alert-dialog`, `sonner`, `skeleton`, `progress` |
| Overlay | `dialog`, `sheet`, `dropdown-menu`, `tooltip` |
| Data | `table`, `badge`, `separator`, `tabs`, `card` |
| Nav / shell | `sidebar` (or custom shell using `button` + `sheet` for mobile), `avatar`, `breadcrumb` |
| Misc | `scroll-area`, `command` (command palette optional) |

Feature UIs compose these; they do **not** fork copies of primitives into feature folders.

### 4.4 What lives where (shadcn vs app)

| Path | Contents | Editable? |
| --- | --- | --- |
| `components/ui/*` | shadcn primitives | Yes (owned), but keep close to upstream |
| `components/layout/*` | AppShell, Sidebar, Topbar | App-owned |
| `components/feedback/*` | ErrorBoundary, EmptyState wrappers | App-owned |
| `components/guards/*` | Auth/Role guards | App-owned |
| `features/*/components` | Domain forms, tables, wizards | App-owned |

---

## 5. Recommended Folder Structure

```text
frontend/
├── public/
│   ├── favicon.svg
│   └── robots.txt
│
├── src/
│   ├── main.tsx                         # Vite entry
│   ├── index.css                        # Tailwind + shadcn CSS variables
│   │
│   ├── app/
│   │   ├── App.tsx                      # Providers + RouterProvider
│   │   ├── providers.tsx                # QueryClient, Theme, Toaster, ErrorBoundary
│   │   └── router.tsx                   # Route tree, lazy imports
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── ui/                          # shadcn/ui (CLI-managed)
│   │   ├── layout/                      # AppShell, RoleSidebar, Topbar, PageHeader
│   │   ├── feedback/                    # EmptyState, QueryError, FullPageSpinner
│   │   └── guards/                      # GuestGuard, AuthGuard, RoleGuard
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts
│   │   │   ├── store.ts                 # memory-only accessToken + user
│   │   │   ├── schemas.ts
│   │   │   ├── components/
│   │   │   └── pages/
│   │   ├── users/
│   │   ├── classes/
│   │   ├── tags/
│   │   ├── questions/
│   │   ├── assignments/
│   │   ├── analytics/
│   │   ├── circulars/
│   │   └── polls/
│   │
│   ├── lib/
│   │   ├── utils.ts                     # cn() — shadcn required
│   │   ├── api-client.ts                # secure HTTP client
│   │   ├── query-client.ts
│   │   ├── env.ts                       # Zod env
│   │   ├── errors.ts                    # map API codes → safe messages
│   │   ├── csrf.ts                      # custom header helper if required by API
│   │   └── dates.ts
│   │
│   ├── types/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── enums.ts
│   │   └── models.ts
│   │
│   ├── hooks/                           # cross-feature only
│   │   ├── useDebounce.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── config/
│   │   ├── navigation.ts                # nav items per role
│   │   ├── query-keys.ts                # centralized query keys
│   │   └── constants.ts
│   │
│   └── pages/
│       └── errors/                      # 403, 404, 500 route pages
│
├── .env.example
├── .gitignore
├── components.json                      # shadcn
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── vercel.json                          # security headers + SPA rewrites
└── ARCHITECTURE.md
```

### Structure rules

| Rule | Detail |
| --- | --- |
| Feature-first | Domain logic in `features/<domain>/` |
| shadcn isolation | Only primitives in `components/ui` |
| Thin pages | Routes compose feature pages; no fat route files |
| No secrets | Never commit `.env`; only `VITE_*` public config |
| Query keys | Centralize in `config/query-keys.ts` for invalidation safety |

---

## 6. Domain Modules (PRD)

| Module | Actors | Notes |
| --- | --- | --- |
| Auth | All | Login, refresh, logout, password change |
| Users | Admin | Create/deactivate lecturers & students |
| Classes | Admin | Assign lecturers/students |
| Question Bank | Lecturer | Tags, CRUD, image upload |
| Assignments | Lecturer, Student | Create/assign/take/results/auto-submit |
| Analytics | All | Role-scoped dashboards |
| Circulars | Admin, Lecturer, Student | Announcements |
| Polls | Admin, Lecturer, Student | Create / vote |
| Uploads | Lecturer, Admin | Images only; validated client + server |

---

## 7. Routing, Layouts & Guards

### 7.1 Route map

```text
/                          → role home or /login
/login                     → GuestGuard

/admin/*                   → AuthGuard + RoleGuard(ADMIN)
/lecturer/*                → AuthGuard + RoleGuard(LECTURER)
/student/*                 → AuthGuard + RoleGuard(STUDENT)

/student/assignments/:id/take  → focused layout (no sidebar)
/account/password              → AuthGuard (any role)

*                          → 404
forbidden                  → 403
```

### 7.2 Guard matrix

| Guard | Behavior |
| --- | --- |
| `GuestGuard` | Authenticated users redirected to role home (prevent login loop) |
| `AuthGuard` | No session → `/login?next=<safe-path>` |
| `RoleGuard` | Wrong role → `/forbidden` (403), do not flash protected data |

### 7.3 Open-redirect prevention

`next` / return URLs must be **same-origin relative paths** only:

- Allow: `/lecturer/questions`
- Reject: `https://evil.com`, `//evil.com`, `javascript:…`

Validate with a small allowlist helper before `navigate(next)`.

### 7.4 Layout nesting

```text
App
 └─ Providers (Query, Theme, Toaster, ErrorBoundary)
     └─ Router
         ├─ PublicLayout
         └─ AuthenticatedLayout
              ├─ AdminShell
              ├─ LecturerShell
              └─ StudentShell
                   └─ ExamLayout (take assignment — fullscreen)
```

Shells share shadcn-based chrome; nav from `config/navigation.ts` filtered by role.

---

## 8. Security Architecture (production mandatory)

Frontend security is **defense in depth**. Backend remains authoritative; the SPA reduces attack surface and avoids common footguns.

### 8.1 Threat model (SPA)

| Threat | Mitigation |
| --- | --- |
| Token theft via XSS | Access token **memory only**; refresh in **httpOnly Secure cookie**; minimize `dangerouslySetInnerHTML` |
| CSRF on cookie refresh | `SameSite` cookie (backend) + send custom header e.g. `X-Requested-With: XMLHttpRequest` on mutating/cookie routes; prefer SameSite=Lax/Strict as configured by API |
| Privilege escalation | RoleGuard + never hide-only UI; API RBAC always |
| Open redirect after login | Sanitize `next` param |
| Sensitive data in storage | No JWT/PII in `localStorage` / `sessionStorage` |
| Clickjacking | `X-Frame-Options: DENY` / CSP `frame-ancestors 'none'` via Vercel headers |
| Mixed content | HTTPS only in production; API base URL must be `https://` |
| Dependency compromise | Lockfile, CI audit, minimal deps |
| Information disclosure | Generic user errors; log detail only in dev |
| Upload abuse | Client MIME/size checks; server validates again |
| Tab hijack / leftover session | Logout clears store + query cache; optional `BroadcastChannel` logout sync |

### 8.2 Authentication & session

```text
Login
  → POST /auth/login (credentials: include)
  → store accessToken + user in Zustand (memory)
  → refresh cookie set by API (httpOnly, Secure, SameSite)

API call
  → Authorization: Bearer <accessToken>
  → credentials: include when needed

401
  → POST /auth/refresh once (cookie + CSRF header)
  → retry original request
  → on failure: logout (clear memory + query cache) → /login

Logout
  → POST /auth/logout
  → clear Zustand
  → queryClient.clear()
  → navigate /login
```

**Hard rules:**

1. Never persist access or refresh tokens in `localStorage` / `sessionStorage` / IndexedDB.
2. Never put tokens in URLs, query strings, or analytics payloads.
3. Do not decode JWT for authorization decisions beyond UX (display name/role); treat role as **hint** until `/auth/me` confirms.
4. On app boot: optional silent refresh; if fail, stay logged out.
5. Password fields: `autoComplete` correct attributes; never log form values.

### 8.3 XSS hardening

| Practice | Detail |
| --- | --- |
| Default React escaping | Prefer text nodes; avoid raw HTML |
| Rich content | If circulars/questions need HTML later, sanitize with a vetted library (e.g. DOMPurify) **before** render |
| `dangerouslySetInnerHTML` | Ban in review unless sanitized + justified |
| User-generated URLs | Validate `http:`/`https:` only for links/images |
| Markdown (future) | Render with sanitizing pipeline |
| Third-party scripts | Avoid; if needed, strict CSP + SRI |

### 8.4 CSRF posture (cookie refresh)

Coordinate with backend (`SameSite` + optional custom header check):

```ts
// lib/api-client.ts (illustrative)
headers: {
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
}
```

All cookie-authenticated requests use `credentials: 'include'`.

### 8.5 Content Security Policy & headers (Vercel)

Ship via `vercel.json` (or Vercel project headers). Example baseline for SPA:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
      ]
    }
  ],
  "rewrites": [{ "source": "/((?!assets/).*)", "destination": "/index.html" }]
}
```

Add a tight **Content-Security-Policy** once final origins are known, e.g.:

- `default-src 'self'`
- `script-src 'self'` (Vite prod hashes/nonces if you tighten further)
- `style-src 'self' 'unsafe-inline'` (Tailwind/shadcn often needs inline for vars; tighten if using build-time extraction)
- `img-src 'self' data: blob: https://*.public.blob.vercel-storage.com` (adjust to real Blob host)
- `connect-src 'self' https://<api-host>`
- `frame-ancestors 'none'`
- `base-uri 'self'`
- `form-action 'self'`

Tune CSP in staging before enforcing in production (`Content-Security-Policy-Report-Only` first).

### 8.6 CORS / cookies (frontend obligations)

| Item | Requirement |
| --- | --- |
| API base | From `VITE_API_BASE_URL` only |
| Credentials | `include` for auth cookie routes |
| Frontend origin | Must be on backend `CORS_ORIGIN` allowlist |
| Local dev | `http://localhost:5173` ↔ `http://localhost:3000` |

### 8.7 Authorization in the UI

- Sidebar links filtered by role (UX only).
- Route-level `RoleGuard` blocks wrong shells.
- Buttons for privileged actions still depend on API; handle `403` gracefully.
- Never gate security on CSS `hidden` / unmounted-only checks without route guards.

### 8.8 Uploads

| Client check | Server (authoritative) |
| --- | --- |
| Extension + MIME allowlist (e.g. jpeg/png/webp) | Re-validate MIME/size |
| Max size (e.g. 2–5 MB) | Enforce limit |
| Preview via `URL.createObjectURL` | Revoke object URLs on unmount |
| No executable types | Reject |

Do not upload from untrusted clipboard HTML; use file input / drag-drop files only.

### 8.9 Assignment take (integrity-minded UX)

Not full proctoring, but production hygiene:

- Timer synced with server deadlines; trust **server auto-submit**
- Warn on navigation away (`beforeunload`) when attempt in progress
- Disable answer mutation after submit/expiry (UI + API)
- Avoid caching exam answers in durable storage; keep in React state + server autosave endpoints if provided
- Do not expose correct answers in network responses before submit (backend responsibility; FE must not assume)

### 8.10 Secrets & environment

| Allowed in Vite (`VITE_*`) | Never in frontend |
| --- | --- |
| Public API base URL | JWT secrets, DB URLs, cron secrets |
| Public Blob/CDN base if needed | Admin API keys, SMTP, Redis |

`src/lib/env.ts` validates with Zod at boot. Production builds must not embed `.env` secrets beyond `VITE_*`.

### 8.11 Error handling & logging

- Map API error codes → safe copy (`lib/errors.ts`).
- Never render `error.stack` or raw Prisma/server messages.
- Dev: console debug OK. Prod: optional privacy-safe telemetry (no tokens, passwords, answer keys).
- Global `ErrorBoundary` (shadcn-friendly fallback UI).

### 8.12 Rate limits & abuse UX

- Handle HTTP `429` with backoff messaging (backend rate limits / Upstash).
- Disable double-submit on mutations (`isPending`).
- Login form: cooldown UX after repeated failures (API still enforces).

### 8.13 Supply chain & CI security gates

CI should fail on:

- Type errors
- Lint errors
- Unit test failures
- High/critical `npm audit` (policy-tunable)
- Accidental `.env` commit (gitignore + secret scanning)

---

## 9. State Management

| Kind | Store | Rules |
| --- | --- | --- |
| Remote data | TanStack Query | No tokens in query cache; `gcTime` sensible |
| Session | Zustand memory | Cleared on logout; not persisted middleware |
| UI | `useState` / URL params | Filters in URL OK if non-sensitive |
| Forms | RHF + Zod | Validate before submit; re-validate from API errors |

**Do not** enable Zustand `persist` for auth store.

---

## 10. API Client Layer

```text
features/*/api.ts  →  lib/api-client.ts  →  https://<api>/api/v1
```

Production responsibilities:

| Concern | Implementation |
| --- | --- |
| Base URL | `env.VITE_API_BASE_URL` |
| Auth header | Bearer access token from store |
| Cookies | `credentials: 'include'` |
| CSRF header | `X-Requested-With` (or backend-agreed header) |
| 401 pipeline | Single-flight refresh (mutex) to avoid stampede |
| Timeouts | AbortSignal / timeout wrapper |
| Errors | Typed result / thrown `ApiError` with code |
| Idempotency | Optional key header for critical POSTs if API supports |

Illustrative feature API:

```ts
// features/questions/api.ts
export const questionsApi = {
  list: (params: ListParams) => api.get('/questions', { params }),
  create: (body: CreateQuestionDto) => api.post('/questions', body),
};
```

---

## 11. Forms (shadcn + RHF + Zod)

Pattern for production forms:

1. Zod schema in `features/<domain>/schemas.ts` (align field names with API).
2. `useForm` + `zodResolver`.
3. shadcn `<Form>`, `<FormField>`, `<Input>`, `<Button>`.
4. Server field errors mapped into `form.setError`.
5. Disable submit while `mutation.isPending`.
6. Never trust client-only validation for security.

---

## 12. Tailwind + shadcn Theming

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: …;
    --foreground: …;
    --primary: …;
    --destructive: …;
    --radius: …;
    /* full shadcn token set from init */
  }
  .dark {
    /* optional dark tokens — only if product requires dark mode */
  }
}
```

Guidelines:

- Extend theme in `tailwind.config.ts` via shadcn’s CSS variable mapping.
- Use `cn()` from `@/lib/utils` everywhere.
- App-specific patterns belong in `components/layout` / features, not by forking every `ui/*` file.
- Mobile-first responsive shells (`Sheet` for nav on small screens).

---

## 13. Role-Based UI Composition

```text
                 +---------- session.user.role ----------+
                 |                   |                   |
                 v                   v                   v
        +----------------+  +------------------+  +----------------+
        | AdminShell     |  | LecturerShell    |  | StudentShell   |
        | users, classes |  | questions, tags  |  | take tests     |
        | org analytics  |  | assignments     |  | results, polls |
        +----------------+  +------------------+  +----------------+
```

- One chrome implementation; role-specific nav config.
- Exam/take view uses `ExamLayout` without distraction chrome.

---

## 14. Feature Module Template

```text
features/<name>/
├── api.ts
├── hooks.ts
├── schemas.ts
├── types.ts          # optional
├── components/       # compose shadcn ui/*
└── pages/
```

Checklist when adding a module:

1. API functions + query keys
2. Zod schemas for mutations
3. Pages + shadcn forms/tables
4. Routes + nav + RoleGuard
5. Error/empty/loading states
6. Tests for critical mutations / guards

---

## 15. Environment & Deploy

| Variable | Purpose | Example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | API origin | `https://api.example.com` |

`.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

### Vercel SPA

- Framework preset: Vite
- Output: `dist`
- Rewrites: SPA fallback to `index.html` (see §8.5)
- Preview vs Production: separate `VITE_API_BASE_URL`
- Backend `CORS_ORIGIN` must include each frontend origin

---

## 16. Cross-Cutting Production Concerns

| Concern | Approach |
| --- | --- |
| Loading | shadcn `Skeleton` / route-level suspense |
| Empty | Shared `EmptyState` |
| Pagination | Match API envelope (`page`, `limit`, `total`) |
| Accessibility | Radix/shadcn defaults; labeled inputs; focus management |
| i18n (future) | Keep copy centralized if expanding later |
| Performance | Lazy route imports; code-split per role shell |
| Offline | Not required for v1; fail clearly if API unreachable |
| Monitoring | Optional Web Vitals; no PII in events |

---

## 17. Suggested Implementation Order

1. Vite React-TS + Tailwind + **shadcn init** (aliases, `utils.ts`, `components/ui`)
2. `env`, secure `api-client`, auth store, login (shadcn Form)
3. Vercel headers + SPA rewrite
4. Guards + role shells (shadcn sidebar/sheet)
5. Admin: users + classes
6. Lecturer: tags + questions + uploads
7. Assignments (create → assign → take → results)
8. Circulars + polls
9. Analytics
10. Hardening: CSP tune, E2E, audit, 429/403 UX, logout sync

---

## 18. Relationship to Backend Security

| Frontend | Backend |
| --- | --- |
| Memory access token | Short-lived JWT |
| Cookie refresh + CSRF header | httpOnly Secure SameSite + header check |
| RoleGuard UX | RBAC middleware |
| Zod forms | Zod request schemas |
| Upload pre-checks | Blob + MIME/size enforcement |
| CSP / frame deny | Helmet, CORS allowlist, rate limits |

---

## 19. Production Readiness Checklist

### Security

- [ ] Access token memory-only; no `localStorage` auth
- [ ] Refresh via httpOnly cookie + `credentials: 'include'`
- [ ] CSRF custom header on cookie routes (aligned with API)
- [ ] Open-redirect protection on `next`
- [ ] Role + Auth guards on all private routes
- [ ] XSS policy (no unsanitized HTML)
- [ ] Security headers on Vercel (CSP staged then enforced)
- [ ] Upload allowlist + size limits
- [ ] Safe error mapping; no stack traces in UI
- [ ] Logout clears store + React Query cache

### shadcn / engineering

- [ ] `components.json` aliases match `@/` paths
- [ ] Primitives only under `components/ui`
- [ ] `lib/utils.ts` exports `cn`
- [ ] Forms use shadcn Form + RHF + Zod
- [ ] CI: typecheck, lint, tests, audit
- [ ] `.env.example` documented; secrets absent from git

### Product

- [ ] Admin / Lecturer / Student shells wired
- [ ] Assignment take layout + timer trust server
- [ ] 403 / 404 / 429 UX

---

## 20. Out of Scope for This Document

- Running `npm create vite` / `shadcn init` (implementation step)
- Visual brand finalization (tokens filled at UI build time)
- Native mobile apps
- Full proctoring / lockdown browser

When implementation starts, scaffold inside `frontend/` so the tree matches **§5** and shadcn **§4** without renaming paths later.
