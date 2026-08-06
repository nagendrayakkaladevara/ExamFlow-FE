# Feature modules

Each domain lives under `src/features/<domain>/` with a typical shape:

```text
features/<domain>/
  api.ts           # typed API wrappers
  pages/           # route-level screens
  components/      # domain UI
  schemas.ts       # Zod (when forms exist)
  hooks/ | utils/  # optional
```

Pages are often re-exported from `src/pages/index.tsx` for the router.

---

## Auth (`features/auth`)

| Concern | Location |
| --- | --- |
| Login / change password pages | `pages/` |
| Zustand store | `store.ts` |
| Token expiry + proactive refresh | `token.ts`, `refresh.ts` |
| API | `api.ts` (`login`, `refresh`, `logout`, `me`, passwords) |

---

## Users (`features/users`) — Admin

- List, create, detail
- Soft-delete / deactivate flows via API
- **Bulk student import**: spreadsheet parse (`xlsx`) → `POST /users/bulk`
- Create role limited to `LECTURER` | `STUDENT` in UI

---

## Classes (`features/classes`)

- List + detail with information and members panels
- Admin: assign lecturers / enroll students
- Lecturer / student: assigned or enrolled views

---

## Tags (`features/tags`)

- API helpers only; no dedicated sidebar route
- Consumed by question bank filters and create/edit forms

---

## Questions (`features/questions`) — Lecturer

- Question bank grid (AG Grid), filters, create/edit
- Types: `SINGLE_CHOICE` | `MULTIPLE_CHOICE` | `FILL_BLANK`
- Difficulty: `EASY` | `MEDIUM` | `HARD`
- Optional images via uploads module

---

## Assignments (`features/assignments`)

### Lecturer

- Create / edit (basics, question selection, schedule, publish)
- Detail + results roster (`…/results`)

### Student

- List / detail
- **Take**: `/student/assignments/:id/take` under `ExamLayout`
- Autosave (debounced), submit with confirmation
- Result + review routes (gated by `ResultPolicy`)

`ResultPolicy`: `IMMEDIATE` | `AFTER_COMPLETION` | `SCHEDULED`  
`SubmissionStatus`: `IN_PROGRESS` | `SUBMITTED` | `AUTO_SUBMITTED`

---

## Analytics (`features/analytics`)

Role-specific dashboards, charts (Recharts), and CSV helpers.

| Role | Typical views |
| --- | --- |
| Admin | Institution overview, trends, alerts, activity, exports |
| Lecturer | Class/assignment summaries, question breakdown, CSV |
| Student | “My Performance”, tag / weak-topic insights |

The FE analytics surface may call endpoints beyond the short table in `API_DOCS.md` — keep `features/analytics/api.ts` as the practical inventory.

---

## Circulars (`features/circulars`)

- List / form / detail
- Audience targeting via shared `AudiencePicker`
- Cover images via uploads
- `publishAt` for immediate or scheduled publish

**Lecturer restriction (API):** cannot use `ALL_LECTURERS` / `ALL_STUDENTS`; only `USER` / `CLASS` in scope.

---

## Polls (`features/polls`)

- Create (≥2 options), expire/publish windows, `resultVisibility`
- Vote once per user (`ALREADY_VOTED` on duplicate)
- List UX tags: `active` | `expired` | `participated`

`PollResultVisibility`: `AFTER_VOTE` | `AFTER_EXPIRY` | `NEVER`

---

## Uploads (`features/uploads`)

- `POST /uploads` with validated image payload
- Returns URL / blob key for questions and circulars
- Client constants: `UPLOAD_MAX_SIZE_BYTES`, `ALLOWED_IMAGE_TYPES`

---

## Dashboard (`features/dashboard`)

- `RoleDashboardPage` + metric cards, panels, quick actions
- Content differs by role (upcoming assignments, activity, institution KPIs)

---

## Settings (`features/settings`)

- Appearance: light/dark + color themes (`default` | `claude` | `tangerine`)
- Account password change lives under `/account/password` (auth feature)

---

## Capabilities matrix

| Capability | Admin | Lecturer | Student |
| --- | --- | --- | --- |
| Users CRUD + bulk import + password reset | Yes | — | — |
| Classes create / members | Yes | View assigned | View enrolled |
| Question bank + tags | — | Yes | — |
| Create / publish assignments | — | Yes | — |
| Take / autosave / submit | — | — | Yes |
| Analytics | Institution | Class / assignment | Personal |
| Circulars / polls create | Broad audiences | Scoped | — (read/vote) |
| Image uploads | Yes | Yes | — |

---

## Next

- [Routing & guards](./routing-and-guards.md)
- [API integration](./api-integration.md)
