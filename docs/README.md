# ExamFlow Documentation

**Product:** ExamFlow — Student Assessment & Examination Platform  
**Audience:** Developers and application users (Admin · Lecturer · Student)  
**Version:** Frontend `0.1.0` · API `v1`

---

## What is ExamFlow?

ExamFlow is a **college examination and assessment platform**. Institutions use it to manage users and classes, build question banks, run timed assignments, publish circulars and polls, and review role-scoped analytics.

It is **not** a full learning management system (no course content libraries, forums, or LMS-style gradebooks). It is also not a proctoring or lockdown-browser product.

---

## Documentation map

| Section | Audience | Purpose |
| --- | --- | --- |
| [Developer Documentation](./developer/README.md) | Engineers | Architecture, setup, auth, modules, API integration, deploy |
| [User Guide](./user/README.md) | Admins, lecturers, students | How to use ExamFlow day to day |

### Developer pages

1. [Overview](./developer/overview.md)
2. [Getting started](./developer/getting-started.md)
3. [Architecture](./developer/architecture.md)
4. [Authentication & security](./developer/authentication-security.md)
5. [Feature modules](./developer/feature-modules.md)
6. [Routing & guards](./developer/routing-and-guards.md)
7. [API integration](./developer/api-integration.md)
8. [Design system](./developer/design-system.md)
9. [Local development](./developer/local-development.md)
10. [Deployment](./developer/deployment.md)
11. [Troubleshooting](./developer/troubleshooting.md)

### User guide pages

1. [Overview](./user/overview.md)
2. [Getting started](./user/getting-started.md)
3. [Administrator guide](./user/admin-guide.md)
4. [Lecturer guide](./user/lecturer-guide.md)
5. [Student guide](./user/student-guide.md)
6. [Circulars & polls](./user/circulars-and-polls.md)
7. [Account & settings](./user/settings-and-account.md)
8. [FAQ](./user/faq.md)

---

## Source of truth in the repo

| File | Scope |
| --- | --- |
| `ARCHITECTURE.md` | Frontend folder structure, security, stack |
| `design.md` | UI/UX tokens, layouts, role experiences |
| `API_DOCS.md` | Backend contracts for the SPA |
| `src/` | Implemented application |

Parent-repo `prd.md` (product requirements) is referenced by architecture docs but is not shipped inside this frontend package.

---

## Roles at a glance

| Role | Primary job |
| --- | --- |
| **Admin** | Users, classes, institution analytics, circulars, polls |
| **Lecturer** | Question bank, assignments, class analytics, scoped circulars/polls |
| **Student** | Take assignments, view results (when allowed), circulars, polls, own performance |

---

*Keep this hub updated when pages are added or renamed.*
