# API Documentation — Frontend Integration Guide

**Student Assessment & Learning Management Platform**

This document describes every public API endpoint the frontend should call. It covers authentication, request/response formats, roles, errors, and common workflows.

---

## Table of Contents

1. [Base URLs](#base-urls)
2. [Quick Start for Frontend](#quick-start-for-frontend)
3. [Authentication](#authentication)
4. [Request & Response Conventions](#request--response-conventions)
5. [Pagination](#pagination)
6. [Roles & Access Control](#roles--access-control)
7. [Rate Limits](#rate-limits)
8. [Error Codes](#error-codes)
9. [Enums & Shared Types](#enums--shared-types)
10. [Endpoints](#endpoints)
    - [Health](#health)
    - [Auth](#auth)
    - [Users (Admin)](#users-admin)
    - [Classes (Admin)](#classes-admin)
    - [Tags (Lecturer)](#tags-lecturer)
    - [Questions (Lecturer)](#questions-lecturer)
    - [Assignments](#assignments)
    - [Analytics](#analytics)
    - [Circulars](#circulars)
    - [Polls](#polls)
    - [Uploads](#uploads)
11. [Frontend Workflows](#frontend-workflows)
12. [Environment Notes](#environment-notes)

---

## Base URLs

| Environment | Base URL |
|-------------|----------|
| Local dev | `http://localhost:3000` |
| API prefix | `/api/v1` |
| Health check | `/healthz` (no `/api/v1` prefix) |

**Full local API root:** `http://localhost:3000/api/v1`

**Production:** Use your deployed Vercel API URL (same path structure).

---

## Quick Start for Frontend

### 1. Configure your HTTP client

All authenticated requests need:

```http
Content-Type: application/json
Authorization: Bearer <accessToken>
```

Cookie-aware requests (login, refresh, logout) need:

```javascript
fetch(`${API_BASE}/api/v1/auth/login`, {
  method: 'POST',
  credentials: 'include',  // required for refresh cookie
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
```

### 2. Recommended auth flow

```
Login → store accessToken in memory (or secure storage)
     → refresh token stored automatically in httpOnly cookie

Before each API call → attach Bearer token

On 401 → POST /auth/refresh (with credentials: 'include')
       → update accessToken
       → retry original request

On refresh failure → redirect to login

Logout → POST /auth/logout (credentials: 'include') → clear local token
```

### 3. Axios example

```javascript
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken(); // your app state
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

**CORS:** Backend allows origins listed in `CORS_ORIGIN` (default `http://localhost:5173` for Vite). Your frontend origin must be in that list.

---

## Authentication

The API uses **JWT access tokens** (short-lived) plus **httpOnly refresh cookies** (long-lived).

| Token | Where stored | Lifetime (default) | Used for |
|-------|--------------|-------------------|----------|
| Access token | Frontend (memory/state) | `15m` | `Authorization: Bearer` on API calls |
| Refresh token | httpOnly cookie `refreshToken` | `7d` | `POST /auth/refresh` only |

### Refresh cookie details

| Property | Value |
|----------|-------|
| Cookie name | `refreshToken` |
| Path | `/api/v1/auth` |
| HttpOnly | `true` |
| Secure | `true` in production (`COOKIE_SECURE=true`) |
| SameSite | `none` when secure, `lax` in local dev |

**Important:** Refresh and logout must hit paths under `/api/v1/auth/*` with `credentials: 'include'`.

### Login lockout

After **5 failed login attempts** within **15 minutes**, login returns `401` with code `ACCOUNT_LOCKED`.

### Session invalidation

Access tokens are invalidated when:

- User changes password (`POST /auth/change-password`)
- Admin resets user password (`POST /auth/reset-password`)
- `tokenVersion` on the user record changes (handled server-side)

After password change, the refresh cookie is cleared — user must log in again.

---

## Request & Response Conventions

### Content type

- Request bodies: `application/json`
- Max body size: `100kb` (configurable via `BODY_SIZE_LIMIT`)

### Date/time format

All datetime fields use **ISO 8601** strings in UTC, e.g. `"2026-07-18T10:30:00.000Z"`.

Send datetimes in request bodies as ISO strings. Responses return JavaScript `Date` serialized as ISO strings.

### UUIDs

All resource IDs are UUID v4 strings, e.g. `"550e8400-e29b-41d4-a716-446655440000"`.

### Success response envelope

```json
{
  "success": true,
  "data": { },
  "meta": { },
  "requestId": "abc-123"
}
```

- `data` — payload (object or array)
- `meta` — optional (pagination cursors, etc.)
- `requestId` — echo of `x-request-id` header if sent; useful for support/debugging

### Error response envelope

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": { }
  },
  "requestId": "abc-123"
}
```

### HTTP status codes

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Validation error (Zod) or bad request |
| `401` | Not authenticated / invalid credentials |
| `403` | Authenticated but not allowed |
| `404` | Resource not found |
| `409` | Conflict (duplicate, already submitted, etc.) |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## Pagination

List endpoints that support cursor pagination return:

```json
{
  "success": true,
  "data": [ /* items */ ],
  "meta": {
    "nextCursor": "encoded-string-or-null"
  },
  "requestId": "..."
}
```

Pass `cursor` query param with the value from `meta.nextCursor` to fetch the next page.

When `nextCursor` is `null`, there are no more pages.

**Default page size:** `20` (max `100` where supported).

---

## Roles & Access Control

| Role | Description |
|------|-------------|
| `ADMIN` | User/class management, institution analytics, circulars, polls, password reset |
| `LECTURER` | Question bank, assignments for assigned classes, class analytics, circulars/polls for their scope |
| `STUDENT` | Take assignments, view results (policy-gated), circulars, polls, change own password |

Endpoints document required role(s) per route. The server always derives identity from the JWT — **never send `userId` or `role` in the body to impersonate another user** (except admin reset-password which targets another user by ID).

---

## Rate Limits

| Scope | Limit | Window |
|-------|-------|--------|
| Global (all routes) | 100 requests | 15 min |
| Login | 8 requests | 15 min |
| Refresh | 30 requests | 15 min |
| Assignment autosave | 60 requests | 1 min (per user) |
| Image upload | 20 requests | 1 hour (per user) |

Rate-limited responses return `429` with:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests..."
  }
}
```

Standard rate-limit headers (`RateLimit-*`) are included when applicable.

---

## Error Codes

Common `error.code` values the frontend should handle:

| Code | Typical HTTP | When |
|------|--------------|------|
| `VALIDATION_ERROR` | 400 | Invalid body/query/params |
| `UNAUTHORIZED` | 401 | Missing/invalid token |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `ACCOUNT_LOCKED` | 401 | Too many failed logins |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh cookie invalid |
| `REFRESH_TOKEN_REUSE` | 401 | Possible token theft — force re-login |
| `FORBIDDEN` | 403 | Wrong role |
| `CORS_DENIED` | 403 | Origin not allowed |
| `NOT_FOUND` | 404 | Resource missing |
| `EMAIL_EXISTS` | 409 | Duplicate email |
| `ALREADY_SUBMITTED` | 409 | Assignment attempt already finished |
| `ALREADY_VOTED` | 409 | Poll vote already cast |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `ASSIGNMENT_NOT_STARTED` | 403 | Before `startAt` |
| `ASSIGNMENT_CLOSED` | 403 | After `endAt` |
| `DEADLINE_PASSED` | 403 | Personal timer expired |
| `RESULTS_NOT_AVAILABLE` | 403 | Result policy blocks view |
| `IN_PROGRESS` | 403 | Results requested while attempt active |
| `INVALID_QUESTION` | 400 | Question validation failed |
| `INVALID_AUDIENCE` | 400/403 | Circular/poll audience rules |
| `CLASS_ACCESS_DENIED` | 403 | Not enrolled / not assigned to class |

---

## Enums & Shared Types

### UserRole

`ADMIN` | `LECTURER` | `STUDENT`

### QuestionType

`SINGLE_CHOICE` | `MULTIPLE_CHOICE` | `FILL_BLANK`

> Note: `DESCRIPTIVE` exists in the database schema but is **not** exposed via the API yet.

### DifficultyLevel

`EASY` | `MEDIUM` | `HARD`

### ResultPolicy (assignments)

| Value | Results visible when |
|-------|---------------------|
| `IMMEDIATE` | Right after submission |
| `AFTER_COMPLETION` | After assignment `endAt` |
| `SCHEDULED` | After `resultDeclareAt` |

### SubmissionStatus

`IN_PROGRESS` | `SUBMITTED` | `AUTO_SUBMITTED`

### AudienceTargetType (circulars & polls)

| Value | `targetId` required? | Meaning |
|-------|---------------------|---------|
| `ALL_LECTURERS` | No | All lecturers (+ admin sees all) |
| `ALL_STUDENTS` | No | All students |
| `USER` | Yes (user UUID) | Single user |
| `CLASS` | Yes (class UUID) | All members of a class |

**Lecturer restriction:** Lecturers cannot use `ALL_LECTURERS` or `ALL_STUDENTS`. They may only target `USER` or `CLASS` (classes they teach).

### PollResultVisibility

| Value | Results visible when |
|-------|---------------------|
| `AFTER_VOTE` | User has voted |
| `AFTER_EXPIRY` | After poll `expireAt` |
| `NEVER` | Only admin can see results |

### PublicUser object

Returned on login and user endpoints:

```typescript
{
  id: string;
  email: string;
  role: "ADMIN" | "LECTURER" | "STUDENT";
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Answer JSON (assignment autosave)

Stored per question in `answer` field:

**Single / Multiple choice:**

```json
{
  "selectedOptionIds": ["uuid-of-option-1", "uuid-of-option-2"]
}
```

**Fill in the blank:**

```json
{
  "text": "student answer text"
}
```

**Clear an answer:** send `"answer": null`

Grading is case-insensitive and trimmed for fill-in-the-blank.

---

## Endpoints

### Health

#### `GET /healthz`

No authentication. Use for uptime checks.

**Response `200`:**

```json
{
  "ok": true,
  "requestId": "..."
}
```

---

#### `GET /api/v1`

API version probe.

**Response `200`:**

```json
{
  "success": true,
  "data": { "name": "pranu-api", "version": "v1" }
}
```

---

### Auth

Base path: `/api/v1/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/login` | No | Login |
| POST | `/refresh` | Cookie | New access token |
| POST | `/logout` | Cookie | Revoke session |
| POST | `/change-password` | Bearer | Change own password |
| POST | `/reset-password` | Bearer (Admin) | Reset another user's password |

---

#### `POST /auth/login`

**Body:**

```json
{
  "email": "student@example.com",
  "password": "your-password"
}
```

| Field | Rules |
|-------|-------|
| `email` | Valid email, max 255, lowercased server-side |
| `password` | Required, max 128 |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "expiresIn": "15m",
    "user": { /* PublicUser */ }
  },
  "requestId": "..."
}
```

Also sets `refreshToken` httpOnly cookie.

---

#### `POST /auth/refresh`

No body. Requires refresh cookie + `credentials: 'include'`.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "expiresIn": "15m"
  }
}
```

Rotates refresh cookie.

**Response `401`:** Missing refresh cookie or invalid token — redirect to login.

---

#### `POST /auth/logout`

No body. Clears refresh cookie and revokes token family.

**Response `200`:**

```json
{
  "success": true,
  "data": { "message": "Logged out" }
}
```

---

#### `POST /auth/change-password`

**Auth:** Any logged-in user.

**Body:**

```json
{
  "currentPassword": "old-password",
  "newPassword": "new-password-min-8-chars"
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": { "message": "Password changed successfully" }
}
```

Clears refresh cookie — user must log in again.

---

#### `POST /auth/reset-password`

**Auth:** `ADMIN` only.

**Body:**

```json
{
  "userId": "uuid-of-user",
  "newPassword": "new-password-min-8-chars"
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": { "message": "Password reset successfully" }
}
```

Invalidates all refresh tokens for that user.

---

### Users (Admin)

Base path: `/api/v1/users`  
**Auth:** `ADMIN` only.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List users |
| POST | `/` | Create lecturer/student |
| GET | `/:id` | Get user |
| PATCH | `/:id` | Update user |
| DELETE | `/:id` | Soft-delete user |

---

#### `GET /users`

**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `role` | `ADMIN` \| `LECTURER` \| `STUDENT` | — | Filter by role |
| `isActive` | `true` \| `false` | — | Filter active state |
| `limit` | 1–100 | 20 | Page size |
| `cursor` | string | — | Pagination cursor |

**Response `200`:** `data` = `PublicUser[]`, `meta.nextCursor`

---

#### `POST /users`

**Body:**

```json
{
  "email": "lecturer@school.edu",
  "password": "min-8-chars",
  "role": "LECTURER",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

| Field | Rules |
|-------|-------|
| `role` | `LECTURER` or `STUDENT` only (not `ADMIN`) |

**Response `201`:** `data` = `PublicUser`

---

#### `PATCH /users/:id`

**Body (at least one field):**

```json
{
  "email": "new@email.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "isActive": false,
  "password": "new-password"
}
```

**Response `200`:** `data` = `PublicUser`

---

#### `DELETE /users/:id`

Soft-deletes user. Cannot delete admin accounts (`ADMIN_PROTECTED`).

**Response `200`:**

```json
{
  "success": true,
  "data": { "deleted": true }
}
```

---

### Classes (Admin)

Base path: `/api/v1/classes`  
**Auth:** `ADMIN` only.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List classes |
| POST | `/` | Create class |
| GET | `/:id` | Get class |
| PATCH | `/:id` | Update class |
| DELETE | `/:id` | Soft-delete class |
| POST | `/:id/lecturers` | Assign lecturer |
| POST | `/:id/students` | Enroll student |

---

#### `GET /classes`

**Query:** `isActive`, `limit`, `cursor` (same pattern as users).

**Response `200`:** Array of:

```typescript
{
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

#### `POST /classes`

**Body:**

```json
{
  "name": "CS101 — Intro to Programming",
  "code": "CS101",
  "description": "Optional description"
}
```

**Response `201`:** Class object.

---

#### `PATCH /classes/:id`

**Body (at least one):**

```json
{
  "name": "Updated name",
  "code": "CS101-A",
  "description": "Updated",
  "isActive": true
}
```

Set `code` or `description` to `null` to clear.

---

#### `POST /classes/:id/lecturers`

**Body:**

```json
{ "userId": "lecturer-uuid" }
```

**Response `200`:**

```json
{ "success": true, "data": { "assigned": true } }
```

Errors: `INVALID_LECTURER`, `ALREADY_ASSIGNED`

---

#### `POST /classes/:id/students`

**Body:**

```json
{ "userId": "student-uuid" }
```

**Response `200`:**

```json
{ "success": true, "data": { "enrolled": true } }
```

Errors: `INVALID_STUDENT`, `ALREADY_ENROLLED`

---

### Tags (Lecturer)

Base path: `/api/v1/tags`  
**Auth:** `LECTURER` only.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List own tags |
| POST | `/` | Create tag |
| PATCH | `/:id` | Rename tag |
| DELETE | `/:id` | Soft-delete tag |

---

#### `POST /tags`

**Body:**

```json
{ "name": "JavaScript" }
```

**Response `201`:**

```typescript
{ id: string; name: string; createdAt: string }
```

---

### Questions (Lecturer)

Base path: `/api/v1/questions`  
**Auth:** `LECTURER` only.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/search` | Search/filter questions |
| GET | `/` | List questions (paginated) |
| POST | `/` | Create question |
| GET | `/:id` | Get question |
| PATCH | `/:id` | Update question |
| DELETE | `/:id` | Soft-delete question |

---

#### Question object (response)

```typescript
{
  id: string;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "FILL_BLANK";
  title: string;
  description: string;
  explanation: string | null;
  defaultMarks: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  subject: string | null;
  topic: string | null;
  imageUrl: string | null;
  imageBlobKey: string | null;
  createdAt: string;
  updatedAt: string;
  options?: {
    id: string;
    optionText: string;
    isCorrect: boolean;  // omitted when stripped for students in assignments
    sortOrder: number;
  }[];
  tags?: { id: string; name: string }[];
  correctText?: string | null;  // FILL_BLANK only; hidden from students in assignments
}
```

---

#### `POST /questions`

**Body:**

```json
{
  "type": "SINGLE_CHOICE",
  "title": "What is 2 + 2?",
  "description": "Choose the correct answer.",
  "explanation": "Basic arithmetic.",
  "defaultMarks": 1,
  "difficulty": "EASY",
  "subject": "Math",
  "topic": "Addition",
  "correctText": null,
  "imageUrl": "https://...",
  "imageBlobKey": "optional-blob-path",
  "tagIds": ["tag-uuid-1"],
  "options": [
    { "optionText": "3", "isCorrect": false, "sortOrder": 0 },
    { "optionText": "4", "isCorrect": true, "sortOrder": 1 }
  ]
}
```

**Validation rules:**

| Type | Requirements |
|------|--------------|
| `SINGLE_CHOICE` | `options` required; exactly **one** `isCorrect: true` |
| `MULTIPLE_CHOICE` | `options` required; **at least one** correct |
| `FILL_BLANK` | `correctText` required; no options needed |

**Response `201`:** Full question object.

---

#### `GET /questions/search`

**Query params:**

| Param | Description |
|-------|-------------|
| `q` | Text search (title/description) |
| `tagIds` | Comma-separated tag UUIDs, e.g. `id1,id2` |
| `difficulty` | `EASY` \| `MEDIUM` \| `HARD` |
| `type` | Question type |
| `subject` | Subject filter |
| `topic` | Topic filter |
| `limit` | 1–100, default 20 |
| `cursor` | Pagination |

**Response `200`:** Question array + `meta.nextCursor`

---

#### `GET /questions`

**Query:** `limit` (optional, default 20), `cursor`

Lists all questions for the logged-in lecturer, newest first.

---

### Assignments

Base path: `/api/v1/assignments`  
**Auth:** Bearer required; role checks per route.

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/` | All | List assignments |
| GET | `/:id` | All* | Get assignment + questions |
| GET | `/:id/result` | Student | View graded result |
| POST | `/` | Lecturer | Create assignment |
| PATCH | `/:id` | Lecturer | Update assignment |
| DELETE | `/:id` | Lecturer | Soft-delete |
| POST | `/:id/questions` | Lecturer | Import questions from bank |
| POST | `/:id/start` | Student | Start attempt |
| POST | `/:id/autosave` | Student | Save answers |
| POST | `/:id/submit` | Student | Submit attempt |

\*Access scoped by role (lecturer owns it, student enrolled in class, admin sees all).

---

#### Assignment object

```typescript
{
  id: string;
  classId: string;
  lecturerId: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  resultPolicy: "IMMEDIATE" | "AFTER_COMPLETION" | "SCHEDULED";
  resultDeclareAt: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

#### List behavior by role

| Role | Sees |
|------|------|
| `LECTURER` | Own published assignments |
| `STUDENT` | Published assignments for enrolled classes |
| `ADMIN` | All published assignments |

---

#### `GET /assignments/:id`

Returns assignment + `questions` array:

```typescript
{
  /* assignment fields */,
  questions: [{
    id: string;              // assignmentQuestionId — use for autosave
    questionId: string;
    marks: number;
    sortOrder: number;
    question: {
      id: string;
      type: string;
      title: string;
      description: string;
      difficulty: string;
      subject: string | null;
      topic: string | null;
      imageUrl: string | null;
      options: { id: string; optionText: string; sortOrder: number }[];
      // Students do NOT receive isCorrect or correctText
    }
  }]
}
```

---

#### `POST /assignments`

**Body:**

```json
{
  "classId": "class-uuid",
  "title": "Midterm Quiz",
  "description": "Chapter 1–3",
  "startAt": "2026-07-20T09:00:00.000Z",
  "endAt": "2026-07-20T11:00:00.000Z",
  "durationMinutes": 60,
  "resultPolicy": "IMMEDIATE",
  "resultDeclareAt": null,
  "isPublished": true
}
```

| Rule | Detail |
|------|--------|
| `endAt` | Must be after `startAt` |
| `resultPolicy: "SCHEDULED"` | Requires `resultDeclareAt` |
| `durationMinutes` | Personal timer cap; actual deadline = min(personal end, assignment `endAt`) |

**Response `201`:** Assignment object.

---

#### `POST /assignments/:id/questions`

Import questions from the lecturer's question bank.

**Body:**

```json
{
  "questions": [
    {
      "questionId": "question-uuid",
      "marks": 2,
      "sortOrder": 0
    }
  ]
}
```

- `marks` optional — defaults to question's `defaultMarks`
- Returns full assignment with questions (same as `GET /:id`)

---

#### `POST /assignments/:id/start`

Starts or resumes an in-progress attempt.

**Body:** `{}` (empty object)

**Response `201`:** Submission object:

```typescript
{
  id: string;
  assignmentId: string;
  studentId: string;
  status: "IN_PROGRESS";
  startedAt: string;
  endsAt: string;        // personal deadline
  submittedAt: null;
  score: null;
  maxScore: number;
  correctCount: null;
  incorrectCount: null;
  createdAt: string;
  updatedAt: string;
}
```

**Errors:**

| Code | When |
|------|------|
| `ASSIGNMENT_NOT_STARTED` | Before `startAt` |
| `ASSIGNMENT_CLOSED` | After `endAt` |
| `ALREADY_SUBMITTED` | Previous attempt finished |

If attempt is `IN_PROGRESS`, returns existing submission (`200` semantics via returning existing row).

---

#### `POST /assignments/:id/autosave`

**Body:**

```json
{
  "answers": [
    {
      "assignmentQuestionId": "aq-uuid",
      "answer": { "selectedOptionIds": ["option-uuid"] }
    },
    {
      "assignmentQuestionId": "aq-uuid-2",
      "answer": { "text": "Paris" }
    },
    {
      "assignmentQuestionId": "aq-uuid-3",
      "answer": null
    }
  ]
}
```

**Response `200`:**

```json
{ "success": true, "data": { "saved": true } }
```

Must have started attempt (`IN_PROGRESS`). Blocked after deadline.

---

#### `POST /assignments/:id/submit`

**Body:** `{}`

Finalizes grading for objective questions. Returns updated submission with score.

**Response `200`:** Submission with `status: "SUBMITTED"`, `score`, `correctCount`, etc.

---

#### `GET /assignments/:id/result`

**Auth:** `STUDENT` only (own results).

**Response `200`:**

```typescript
{
  submissionId: string;
  status: "SUBMITTED" | "AUTO_SUBMITTED";
  score: number;
  maxScore: number;
  correctCount: number;
  incorrectCount: number;
  submittedAt: string;
  answers: [{
    assignmentQuestionId: string;
    answer: object | null;
    isCorrect: boolean;
    marksAwarded: number;
    explanation: string | null;
    correctText: string | null;
    options: { id: string; optionText: string; isCorrect: boolean }[];
  }]
}
```

Blocked by `resultPolicy` → `RESULTS_NOT_AVAILABLE`.

---

### Analytics

Base path: `/api/v1/analytics`  
**Auth:** Bearer + role per route.

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/student/me` | Student | Own performance summary |
| GET | `/lecturer/classes/:classId` | Lecturer | Class stats |
| GET | `/lecturer/assignments/:assignmentId` | Lecturer | Assignment rankings |
| GET | `/admin/overview` | Admin | Institution overview |

---

#### `GET /analytics/student/me`

```typescript
{
  totalAttempts: number;
  averageScore: number | null;
  recent: [{
    assignmentId: string;
    title: string;
    score: number | null;
    maxScore: number | null;
    submittedAt: string | null;
    status: string;
  }]
}
```

---

#### `GET /analytics/lecturer/classes/:classId`

```typescript
{
  classId: string;
  studentCount: number;
  assignmentCount: number;
  completedSubmissions: number;
  completionRate: number;  // 0–1, rounded to 2 decimals
}
```

---

#### `GET /analytics/lecturer/assignments/:assignmentId`

```typescript
{
  assignmentId: string;
  title: string;
  enrolled: number;
  submitted: number;
  completionRate: number;
  rankings: [{
    rank: number;
    studentId: string;
    score: number | null;
    maxScore: number | null;
    submittedAt: string | null;
  }]
}
```

---

#### `GET /analytics/admin/overview`

```typescript
{
  usersByRole: { ADMIN?: number; LECTURER?: number; STUDENT?: number };
  activeClasses: number;
  totalAssignments: number;
  completedSubmissions: number;
}
```

---

### Circulars

Base path: `/api/v1/circulars`  
**Auth:** Bearer required.

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/` | All | List circulars |
| GET | `/:id` | All | Get one |
| POST | `/` | Admin, Lecturer | Create |
| PATCH | `/:id` | Admin, Lecturer* | Update |
| DELETE | `/:id` | Admin, Lecturer* | Delete |

\*Lecturers can only modify circulars they created.

---

#### Circular object

```typescript
{
  id: string;
  title: string;
  description: string;
  coverImageUrl: string | null;
  publishAt: string;
  isPublished: boolean;
  createdAt: string;
  lastEditedBy: { id: string; name: string } | null;
  lastEditedAt: string | null;
  audiences: {
    targetType: "ALL_LECTURERS" | "ALL_STUDENTS" | "USER" | "CLASS";
    targetId: string | null;
  }[];
}
```

`lastEditedBy` and `lastEditedAt` are `null` until the circular is edited via `PATCH`. Scheduled auto-publish does not update these fields.

---

#### `POST /circulars`

**Body:**

```json
{
  "title": "Exam schedule update",
  "description": "Full details here...",
  "coverImageUrl": "https://...",
  "coverImageBlobKey": "optional",
  "publishAt": "2026-07-19T08:00:00.000Z",
  "audiences": [
    { "targetType": "CLASS", "targetId": "class-uuid" }
  ]
}
```

- If `publishAt` ≤ now → `isPublished: true` immediately
- Otherwise scheduled; cron publishes when time arrives

---

#### List behavior

| Role | Sees |
|------|------|
| `ADMIN` | All circulars (paginated with cursor) |
| Others | Published circulars where `publishAt ≤ now` and user matches audience |

---

### Polls

Base path: `/api/v1/polls`  
**Auth:** Bearer required.

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/` | All | List active/visible polls |
| GET | `/:id` | All | Get poll |
| GET | `/:id/results` | All* | Vote counts |
| POST | `/` | Admin, Lecturer | Create |
| PATCH | `/:id` | Admin, Lecturer* | Update |
| DELETE | `/:id` | Admin, Lecturer* | Delete |
| POST | `/:id/vote` | All** | Cast vote |

\*Lecturers only own polls. Results visibility depends on `resultVisibility`.  
\*\*Must be in poll audience and poll must be active.

---

#### Poll object

```typescript
{
  id: string;
  title: string;
  description: string | null;
  publishAt: string;
  expireAt: string;
  resultVisibility: "AFTER_VOTE" | "AFTER_EXPIRY" | "NEVER";
  isPublished: boolean;
  createdAt: string;
  options: { id: string; optionText: string; sortOrder: number }[];
  audiences: { targetType: string; targetId: string | null }[];
}
```

---

#### `POST /polls`

**Body:**

```json
{
  "title": "Preferred lab time",
  "description": "Choose one",
  "publishAt": "2026-07-18T10:00:00.000Z",
  "expireAt": "2026-07-25T10:00:00.000Z",
  "resultVisibility": "AFTER_VOTE",
  "audiences": [
    { "targetType": "CLASS", "targetId": "class-uuid" }
  ],
  "options": [
    { "optionText": "Monday 2pm", "sortOrder": 0 },
    { "optionText": "Wednesday 2pm", "sortOrder": 1 }
  ]
}
```

- Minimum **2 options**
- `expireAt` must be after `publishAt`

---

#### `POST /polls/:id/vote`

**Body:**

```json
{ "optionId": "poll-option-uuid" }
```

**Response `200`:**

```json
{ "success": true, "data": { "voted": true } }
```

One vote per user (`ALREADY_VOTED` on duplicate).

---

#### `GET /polls/:id/results`

**Response `200`:**

```typescript
{
  pollId: string;
  totalVotes: number;
  options: [{
    optionId: string;
    optionText: string;
    votes: number;
  }]
}
```

---

### Uploads

Base path: `/api/v1/uploads`  
**Auth:** `ADMIN` or `LECTURER`

#### `POST /uploads`

Upload an image to Vercel Blob (for question/circular images).

**Body:**

```json
{
  "filename": "diagram.png",
  "contentType": "image/png",
  "dataBase64": "<base64-encoded file bytes>"
}
```

| Field | Allowed values |
|-------|----------------|
| `contentType` | `image/png`, `image/jpeg`, `image/webp` |

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "url": "https://....public.blob.vercel-storage.com/...",
    "blobKey": "pathname-in-blob-store"
  }
}
```

Use `url` as `imageUrl` / `coverImageUrl` when creating questions or circulars. Optionally store `blobKey` as `imageBlobKey` / `coverImageBlobKey`.

---

## Frontend Workflows

### Student: take an assignment

```
1. GET  /assignments              → pick assignment
2. GET  /assignments/:id          → load questions (no correct answers)
3. POST /assignments/:id/start    → get submission.endsAt for timer UI
4. POST /assignments/:id/autosave → debounced save on answer change
5. POST /assignments/:id/submit   → finalize
6. GET  /assignments/:id/result   → when resultPolicy allows
```

**Timer UI:** Show countdown to `submission.endsAt`. Server auto-submits expired attempts via cron (`AUTO_SUBMITTED`).

---

### Lecturer: create assignment from question bank

```
1. GET  /questions/search         → find questions
2. POST /assignments              → create shell assignment
3. POST /assignments/:id/questions → attach questions + marks
4. PATCH /assignments/:id         → adjust schedule/publish if needed
```

---

### Image upload flow

```
1. POST /uploads                  → get url + blobKey
2. POST /questions or /circulars  → include imageUrl (and optional blobKey)
```

---

### Auth token refresh interceptor (pseudo-code)

```javascript
async function apiFetch(url, options = {}) {
  let res = await fetch(url, { ...options, credentials: 'include' });

  if (res.status === 401 && !options._retried) {
    const refresh = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!refresh.ok) throw new Error('Session expired');

    const { data } = await refresh.json();
    setAccessToken(data.accessToken);

    return apiFetch(url, {
      ...options,
      _retried: true,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${data.accessToken}`,
      },
    });
  }

  return res;
}
```

---

## Environment Notes

| Variable | Frontend impact |
|----------|-----------------|
| `CORS_ORIGIN` | Your dev server origin must match (default `http://localhost:5173`) |
| `COOKIE_SECURE` | When `true`, frontend must be HTTPS for cookies to work |
| `COOKIE_DOMAIN` | Set in production if API and app share parent domain |
| `JWT_ACCESS_EXPIRES_IN` | Default `15m` — refresh before expiry or on 401 |

### Local development

```bash
cd backend
npm install
npm run dev
# API at http://localhost:3000/api/v1
# Health at http://localhost:3000/healthz
```

Seed admin (if configured in `.env`):

```bash
npm run prisma:seed
```

---

## Internal Routes (Not for Frontend)

These routes are for Vercel Cron / system use only — **do not call from the frontend**:

- `POST /api/v1/internal/cron/*` — requires `Authorization: Bearer <CRON_SECRET>`

---

*Last updated from backend source — API version `v1`.*
