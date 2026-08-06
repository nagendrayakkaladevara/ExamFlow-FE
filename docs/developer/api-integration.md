# API integration

Canonical contract: [`API_DOCS.md`](../../API_DOCS.md)  
Client implementation: `src/lib/api-client.ts`, `src/lib/api-base-url.ts`

---

## Base URL & prefix

| Environment | Notes |
| --- | --- |
| Local API | `http://localhost:3000` + `/api/v1` |
| Production FE (recommended) | Leave `VITE_API_BASE_URL` unset; same-origin `/api/*` rewrite to backend |
| Health | `GET /healthz` (no `/api/v1`) |

`buildApiUrl` prefixes `/api/v1` for application paths.

---

## Client conventions

Authenticated requests send:

```http
Content-Type: application/json
Authorization: Bearer <accessToken>
X-Requested-With: XMLHttpRequest
```

Cookie-aware calls (login, refresh, logout, and default client) use `credentials: 'include'`.

Helpers: `api.get`, `getList`, `post`, `patch`, `delete`, `downloadBlob`.

- Default timeout: **30s**
- Pagination: cursor via `meta.nextCursor` (default page size 20)
- Feature modules return typed models from `types/`

---

## Response envelopes

Success:

```json
{
  "success": true,
  "data": {},
  "meta": {},
  "requestId": "abc-123"
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {}
  },
  "requestId": "abc-123"
}
```

Map codes through `lib/errors.ts` for user-facing toasts/alerts.

---

## Important enums

| Enum | Values |
| --- | --- |
| `UserRole` | `ADMIN` \| `LECTURER` \| `STUDENT` |
| `QuestionType` | `SINGLE_CHOICE` \| `MULTIPLE_CHOICE` \| `FILL_BLANK` |
| `DifficultyLevel` | `EASY` \| `MEDIUM` \| `HARD` |
| `ResultPolicy` | `IMMEDIATE` \| `AFTER_COMPLETION` \| `SCHEDULED` |
| `SubmissionStatus` | `IN_PROGRESS` \| `SUBMITTED` \| `AUTO_SUBMITTED` |
| `AudienceTargetType` | `ALL_LECTURERS` \| `ALL_STUDENTS` \| `USER` \| `CLASS` |
| `PollResultVisibility` | `AFTER_VOTE` \| `AFTER_EXPIRY` \| `NEVER` |

IDs are UUID v4 strings. Datetimes are ISO 8601 UTC.

---

## Answer payload (autosave)

**Choice:**

```json
{ "selectedOptionIds": ["uuid-…"] }
```

**Fill blank:**

```json
{ "text": "answer" }
```

Clear: `"answer": null`  
Fill-blank grading is case-insensitive and trimmed on the server.

---

## Core workflows (API)

### Student take assignment

```text
GET /assignments
GET /assignments/:id
POST /assignments/:id/start        → submission.endsAt for timer
POST /assignments/:id/autosave     → debounced
POST /assignments/:id/submit
GET /assignments/:id/result        → when ResultPolicy allows
```

### Lecturer create assignment

```text
GET /questions/search (or list)
POST /assignments
POST /assignments/:id/questions
PATCH /assignments/:id             → schedule / publish
```

### Image upload

```text
POST /uploads → { url, blobKey }
POST /questions or /circulars with imageUrl
```

---

## Rate limits (API defaults)

| Scope | Limit | Window |
| --- | --- | --- |
| Global | 100 | 15 min |
| Login | 8 | 15 min |
| Refresh | 30 | 15 min |
| Autosave | 60 | 1 min / user |
| Upload | 20 | 1 hour / user |

Handle `429` / `RATE_LIMIT_EXCEEDED` calmly in UI.

---

## Query keys & polling

- Central keys: `src/config/query-keys.ts`
- Invalidate on mutations; do not invent ad-hoc string keys
- Active list pages may poll (`config/query-polling.ts`, e.g. 5s for some circular/poll views)

---

## Do not call from the SPA

Internal cron routes:

```text
POST /api/v1/internal/cron/*
```

These require `CRON_SECRET` and are system-only.

---

## Endpoint groups (see API_DOCS for full detail)

Auth · Users · Classes · Tags · Questions · Assignments · Analytics · Circulars · Polls · Uploads · Health

---

## Next

- [Authentication & security](./authentication-security.md)
- [Troubleshooting](./troubleshooting.md)
