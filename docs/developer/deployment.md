# Deployment

ExamFlow frontend deploys as a **static Vite SPA on Vercel**, separate from the API project.

---

## Vercel configuration

`vercel.json` defines:

| Setting | Value |
| --- | --- |
| Framework | Vite |
| Install | `npm ci` |
| Build | `npm run build` |
| Output | `dist` |
| SPA fallback | non-asset routes → `/index.html` |
| API rewrite | `/api/:path*` → `https://exam-flow-be.vercel.app/api/:path*` |
| Security headers | nosniff, frame deny, referrer, permissions-policy, HSTS |

Same-origin `/api` rewrite enables httpOnly refresh cookies when `VITE_API_BASE_URL` is unset in production.

---

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_API_BASE_URL` | No | Prefer unset (same-origin proxy). If set, must be HTTPS in production and CORS must allow the FE origin |

Coordinate with backend:

- `CORS_ORIGIN` includes every frontend origin (prod + previews as needed)
- `COOKIE_SECURE` / `COOKIE_DOMAIN` appropriate for the deployment topology
- JWT access lifetime understood by FE refresh scheduling

---

## Release checklist

1. `npm ci && npm run typecheck && npm run lint && npm run build`
2. Verify login → refresh → logout on the target environment
3. Spot-check one flow per role (admin user list, lecturer question, student take/submit if safe on staging)
4. Confirm security headers present on HTML responses
5. Confirm `/api/v1` health through the FE origin rewrite
6. Ensure no internal cron URLs are referenced from the client

---

## Preview deployments

Preview URLs need backend CORS (and cookie) alignment. Options:

- Add preview origins to `CORS_ORIGIN`, or
- Point `VITE_API_BASE_URL` at an API that allows that origin (cookie behavior may differ cross-site — prefer same-origin rewrite patterns when possible)

---

## CI suggestions

- Typecheck + lint + build on every PR
- Dependency audit / Dependabot or Renovate
- Optional: Playwright smoke (login, role denial, start assignment) against staging

---

## Next

- [Getting started](./getting-started.md)
- [Authentication & security](./authentication-security.md)
- [Troubleshooting](./troubleshooting.md)
