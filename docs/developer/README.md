# Developer Documentation

Production engineering docs for the **ExamFlow** frontend (`examflow-frontend`).

The SPA is a Vite + React + TypeScript application that talks to the ExamFlow API (`/api/v1`). Authorization is enforced on the server; the UI applies role shells and guards as defense in depth.

---

## Start here

| If you need to… | Read |
| --- | --- |
| Understand the product and stack | [Overview](./overview.md) |
| Clone, configure, and run locally | [Getting started](./getting-started.md) |
| Learn folder layout and request flow | [Architecture](./architecture.md) |
| Work on login, tokens, or hardening | [Authentication & security](./authentication-security.md) |
| Add or change a domain feature | [Feature modules](./feature-modules.md) |
| Add routes or role access | [Routing & guards](./routing-and-guards.md) |
| Call the backend correctly | [API integration](./api-integration.md) |
| Match UI/UX conventions | [Design system](./design-system.md) |
| Day-to-day scripts and conventions | [Local development](./local-development.md) |
| Ship to Vercel | [Deployment](./deployment.md) |
| Debug common failures | [Troubleshooting](./troubleshooting.md) |

---

## Related repo docs

- [`ARCHITECTURE.md`](../../ARCHITECTURE.md)
- [`design.md`](../../design.md)
- [`API_DOCS.md`](../../API_DOCS.md)

---

## Conventions (non-negotiable)

1. **Feature-first** — domain logic lives under `src/features/<domain>/`.
2. **shadcn primitives only** in `src/components/ui/` — compose elsewhere.
3. **No tokens in storage** — access JWT stays in memory (Zustand); refresh uses httpOnly cookie.
4. **UI never authorizes** — RoleGuard + nav filtering are UX; API RBAC is authoritative.
5. **Centralized query keys** — use `src/config/query-keys.ts`.
6. **Path alias** — `@/*` → `src/*`.
