# Authentication & security

Backend RBAC is authoritative. The frontend reduces attack surface and never treats UI role checks as security boundaries.

---

## Session model

| Token | Storage | Typical lifetime | Use |
| --- | --- | --- | --- |
| Access JWT | Zustand memory | ~15m | `Authorization: Bearer` |
| Refresh | httpOnly cookie `refreshToken` (path `/api/v1/auth`) | ~7d | `POST /auth/refresh` only |

### Hard rules

1. Never persist access or refresh tokens in `localStorage`, `sessionStorage`, or IndexedDB.
2. Never put tokens in URLs, query strings, or analytics payloads.
3. Treat decoded JWT claims as **UX hints** until `/auth/me` confirms identity.
4. All cookie-auth requests use `credentials: 'include'`.
5. Send CSRF helper header `X-Requested-With: XMLHttpRequest` via `lib/csrf.ts`.

---

## Flows

### Login

```text
POST /auth/login (credentials: include)
  → store accessToken + user in Zustand
  → schedule proactive refresh from expiresIn
  → navigate to sanitized `next` or role home
```

Failed logins: after **5** failures in **15** minutes, API returns `ACCOUNT_LOCKED`.

### Bootstrap (app load)

```text
Silent POST /auth/refresh
  → GET /auth/me
  → set session
  → mark isBootstrapped
```

If refresh fails, user remains logged out.

### API 401 handling

```text
401 → single-flight refresh → retry once
    → on failure: clear session + query cache → /login?next=<safe-path>
```

Implemented in `lib/api-client.ts` + `features/auth/refresh.ts`.

### Logout

```text
POST /auth/logout → stop refresh lifecycle → clearSession → queryClient.clear() → /login
```

### Password change

`POST /auth/change-password` invalidates the session server-side; client clears local session and requires re-login. Admin password reset for another user uses `POST /auth/reset-password`.

---

## Guards

| Guard | Behavior |
| --- | --- |
| `GuestGuard` | Authenticated users leave `/login` for role home (or safe `next`) |
| `AuthGuard` | Unauthenticated → `/login?next=<path>` |
| `RoleGuard` | Wrong role → **NotFound** page (avoids leaking protected route shapes). A `/forbidden` route also exists. |

### Open-redirect prevention

Only same-origin **relative** paths are accepted for `next` (must start with `/`, reject `//`, `://`, `javascript:`).

---

## Deploy headers

`vercel.json` sets:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security` (HSTS)

Tighten CSP in staging before enforce (`Content-Security-Policy-Report-Only` first). See `ARCHITECTURE.md` §8.5.

---

## Additional controls

| Area | Practice |
| --- | --- |
| Errors | Map API codes → safe copy (`lib/errors.ts`); never show stack traces |
| Uploads | Client allowlist jpeg/png/webp, max **5 MB**; server re-validates |
| Exam UX | `beforeunload` while in progress; timer from `submission.endsAt` |
| XSS | Prefer React text nodes; avoid unsanitized HTML |
| Theme prefs | Appearance may use localStorage; **auth tokens do not** |

---

## Threat model (summary)

| Threat | Mitigation |
| --- | --- |
| XSS token theft | Memory access token + httpOnly refresh |
| CSRF on cookie routes | SameSite (API) + custom header |
| Privilege escalation | RoleGuard + API RBAC |
| Open redirect | Sanitize `next` |
| Clickjacking | Frame deny header |
| Mixed content | HTTPS API base in production |

---

## Next

- [API integration](./api-integration.md)
- [Routing & guards](./routing-and-guards.md)
- [Troubleshooting](./troubleshooting.md)
