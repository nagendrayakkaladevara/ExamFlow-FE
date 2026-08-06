# Troubleshooting

## Auth & session

| Symptom | Likely cause | What to check |
| --- | --- | --- |
| Login succeeds then immediate logout | Refresh cookie not stored / not sent | `credentials: 'include'`, cookie path `/api/v1/auth`, Secure/SameSite, CORS |
| Reload always lands on login | Silent refresh failing | Network tab `POST /auth/refresh`; API cookie flags; FE using same-origin `/api` |
| `ACCOUNT_LOCKED` | Too many failed logins | Wait for lockout window (~15 min) or admin unlock process |
| Stuck after password change | Expected re-auth | User must log in again |
| Cross-origin cookies missing | FE calling API host directly | Prefer unset `VITE_API_BASE_URL` + rewrite |

---

## CORS / network

| Symptom | Likely cause | What to check |
| --- | --- | --- |
| Browser CORS errors | Origin not allowlisted | Backend `CORS_ORIGIN` includes Vite/Vercel origin |
| Mixed content | HTTP API from HTTPS FE | Use HTTPS API base |
| `429` responses | Rate limit | Back off; respect autosave/upload limits |

---

## Assignments / exams

| Symptom | Likely cause | What to check |
| --- | --- | --- |
| Cannot start | Outside window | `ASSIGNMENT_NOT_STARTED` / `ASSIGNMENT_CLOSED` |
| Cannot submit | Timer expired | `DEADLINE_PASSED`; server may `AUTO_SUBMITTED` |
| No results | Policy gate | `RESULTS_NOT_AVAILABLE`, `IN_PROGRESS`, `ResultPolicy` |
| Answers not saving | Autosave errors / offline | Offline alert; network; debounce errors in console |

---

## Roles & routing

| Symptom | Likely cause | What to check |
| --- | --- | --- |
| Blank / 404 on known URL | Wrong role shell | User role vs `/admin` `/lecturer` `/student` prefix |
| Button visible but API 403 | UI hint ≠ permission | Expected — handle gracefully |
| Redirect to external site after login | Blocked by sanitizer | `next` must be relative same-origin path |

---

## Uploads

| Symptom | Likely cause | What to check |
| --- | --- | --- |
| Rejected file | Type/size | jpeg/png/webp only; ≤ 5 MB client constant |
| Upload rate limited | API quota | 20 / hour / user default |

---

## Build / tooling

| Symptom | Likely cause | What to check |
| --- | --- | --- |
| Env validation fail | Bad `VITE_API_BASE_URL` | Zod rules in `lib/env.ts` |
| Type errors in CI | Strict TS | `npm run typecheck` locally |
| shadcn add path issues | Alias mismatch | `components.json` + `vite`/`tsconfig` `@/*` |

---

## Support data

When escalating, include:

- Approximate time (UTC)
- Role and whether reproducible in private window
- `requestId` from API error envelope (if shown in network panel)
- Route path (not credentials)

Never send passwords, access tokens, or refresh cookies in tickets.

---

## Next

- [Authentication & security](./authentication-security.md)
- [API integration](./api-integration.md)
- [Deployment](./deployment.md)
