# Routing & guards

Route tree: `src/app/router.tsx`  
Nav config: `src/config/navigation.ts`

---

## Layouts

| Layout | Use |
| --- | --- |
| `PublicLayout` | Login |
| `AppShell` | Authenticated role chrome (sidebar + header) |
| `ExamLayout` | Student take-assignment — no sidebar, distraction-free |

---

## Route map

```text
/                              → RootRedirect (role home or /login)
/login                         → GuestGuard + LoginPage (lazy)
/forbidden                     → ForbiddenPage
/account/password              → AuthGuard + AppShell
/account/settings              → AuthGuard + AppShell (appearance)

/admin/*                       → AuthGuard + RoleGuard(ADMIN) + AppShell
/lecturer/*                    → AuthGuard + RoleGuard(LECTURER) + AppShell
/student/*                     → AuthGuard + RoleGuard(STUDENT) + AppShell
/student/assignments/:id/take  → ExamLayout (still under student RoleGuard)

*                              → NotFoundPage
```

### Admin children (representative)

`/admin`, `users`, `users/new`, `users/:id`, `classes`, `classes/:id`, `analytics`, `circulars` (+ new/edit/detail), `polls` (+ new/edit/detail)

### Lecturer children (representative)

Dashboard, classes, questions (+ new/edit), assignments (+ new/edit/detail/results), analytics, circulars, polls

### Student children (representative)

Dashboard, classes, assignments (+ detail/result/review/take), analytics, circulars, polls

---

## Role base paths

```ts
ADMIN    → /admin
LECTURER → /lecturer
STUDENT  → /student
```

`getNavItemsForRole(role)` filters `navigationItems`. Sidebar never grants access — it only hides irrelevant links.

---

## Guard behavior

| Guard | Pass | Fail |
| --- | --- | --- |
| Guest | Unauthenticated | Redirect authenticated users to home / safe `next` |
| Auth | Session present | `/login?next=<current path>` |
| Role | `user.role` in `allowedRoles` | Render not-found (implementation) |

Always handle API `403` on privileged actions even when the route is correct.

---

## Lazy loading

Login is lazy-loaded with Suspense + `FullPageSpinner`. Prefer the same pattern for heavy feature pages when splitting further.

---

## Adding a route (checklist)

1. Implement feature page under `features/<domain>/pages/`.
2. Export via `pages/index.tsx` if using the barrel.
3. Add path under the correct role segment in `router.tsx`.
4. Update `navigation.ts` if it belongs in the sidebar.
5. Wire query keys + API module.
6. Verify wrong-role users cannot navigate successfully (guard + API).

---

## Next

- [Feature modules](./feature-modules.md)
- [Authentication & security](./authentication-security.md)
