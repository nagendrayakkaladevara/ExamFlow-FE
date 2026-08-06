# Local development

## Scripts

| Script | Command | Purpose |
| --- | --- | --- |
| Dev | `npm run dev` | Vite HMR |
| Build | `npm run build` | `tsc -b && vite build` |
| Preview | `npm run preview` | Serve `dist` |
| Typecheck | `npm run typecheck` | `tsc -b --noEmit` |
| Lint | `npm run lint` | Oxlint |

---

## Working with the API

1. Run backend locally **or** point at the shared deployed API.
2. Prefer unset `VITE_API_BASE_URL` + Vite proxy so cookies stay same-origin during local work when configured.
3. Confirm CORS: frontend origin must appear in backend `CORS_ORIGIN`.
4. For Secure cookies in production-like setups, both apps must be HTTPS.

Default Vite proxy target (when configured): backend host such as `https://exam-flow-be.vercel.app` or local `http://localhost:3000` — see `vite.config.ts`.

---

## Code conventions

1. Feature-first folders; keep pages thin.
2. Add shadcn components with CLI into `components/ui`.
3. Forms: Zod schema co-located in the feature (`schemas.ts`).
4. Shared cross-feature hooks only under `src/hooks/`.
5. Use `cn()` from `@/lib/utils` for class merges.
6. Centralize TanStack Query keys; invalidate deliberately after mutations.
7. Map errors with `lib/errors.ts` — no raw API dumps in toasts.

---

## Quality bar

Before opening a PR:

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] Manual check of role paths you touched (happy path + wrong-role denial)
- [ ] No secrets committed; `.env` ignored

Note: Architecture docs mention Vitest/Playwright/ESLint as a production target; this package currently ships **Oxlint** and does not include test scripts in `package.json`. Prefer adding tests when introducing critical flows (login, take assignment, role denial).

---

## Useful constants

```ts
APP_NAME                    // 'ExamFlow'
UPLOAD_MAX_SIZE_BYTES       // 5 MiB
ALLOWED_IMAGE_TYPES          // jpeg / png / webp
```

---

## Next

- [Getting started](./getting-started.md)
- [Deployment](./deployment.md)
- [Troubleshooting](./troubleshooting.md)
