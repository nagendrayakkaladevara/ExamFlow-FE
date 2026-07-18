# UI/UX Design System

# Student Assessment & Examination Platform

**Status:** Authoritative design reference for frontend implementation  
**Stack:** React · TypeScript · Tailwind CSS v4 · shadcn/ui (New York)  
**Aligned with:** [`../prd.md`](../prd.md) · [`ARCHITECTURE.md`](./ARCHITECTURE.md) · Product Owner UI/UX guidance

---

## 1. Design Intent

This platform is a **college examination and assessment system**, not a traditional learning management system. The interface should feel **calm, professional, and distraction-free** — closer to Apple, Notion, Linear, and Stripe Dashboard than to colorful academic portals.

### What users should feel

| Audience | Emotional goal |
| --- | --- |
| **Students** | Focus, clarity, reduced anxiety, trust that progress is saved |
| **Lecturers** | Productivity, control, efficiency without cognitive overload |
| **Administrators** | Confidence, oversight, quick access to institutional data |

### Design principles

1. **Purpose over decoration** — Every visual element earns its place. No ornamental gradients, glass effects, or decorative icons.
2. **Whitespace is structure** — Generous spacing creates hierarchy and reduces fatigue during long exam sessions.
3. **Predictable interactions** — Navigation, forms, and tables behave consistently across roles.
4. **Fast and lightweight** — The UI should feel instant. Prefer skeleton loaders over spinners; avoid heavy animation.
5. **Accessible by default** — High contrast, readable type, keyboard support, and clear focus states.
6. **Enterprise-ready, student-friendly** — Professional enough for administrators; approachable enough for first-year students.

### What to avoid

- Excessive gradients, colorful cards, or rainbow status indicators
- Unnecessary icons (use only when they aid scanning or recognition)
- Heavy borders, glassmorphism, skeuomorphism
- Flashy or looping animations
- Dense, single-page forms for complex workflows
- Visual patterns that resemble generic LMS dashboards

---

## 2. Visual Language

### Aesthetic direction

**Refined minimalism** — neutral surfaces, sharp typography, subtle elevation, and restrained accent color. The product should feel like a focused productivity tool, not a marketing site.

### Reference qualities (not copies)

| Reference | Borrow |
| --- | --- |
| **Apple** | Clarity, generous spacing, restrained color, polished defaults |
| **Notion** | Calm hierarchy, readable content blocks, subtle hover states |
| **Linear** | Dense-but-clear tables, fast UI, minimal chrome |
| **Stripe Dashboard** | Structured data views, trustworthy analytics, clean forms |

---

## 3. Design Tokens

Tokens are implemented via **CSS variables** in `src/index.css` and consumed through Tailwind utility classes. Extend shadcn's neutral theme — do not introduce parallel color systems.

### 3.1 Spacing (8px grid)

All layout spacing must align to an **8px base grid**.

| Token | Value | Tailwind | Usage |
| --- | --- | --- | --- |
| `space-1` | 4px | `p-1`, `gap-1` | Tight inline gaps (icon + label) |
| `space-2` | 8px | `p-2`, `gap-2` | Component internal padding |
| `space-3` | 12px | `p-3`, `gap-3` | Compact groups |
| `space-4` | 16px | `p-4`, `gap-4` | Standard padding |
| `space-6` | 24px | `p-6`, `gap-6` | Section spacing |
| `space-8` | 32px | `p-8`, `gap-8` | Page section breaks |
| `space-12` | 48px | `p-12`, `gap-12` | Major layout separation |
| `space-16` | 64px | `p-16` | Hero / empty state vertical rhythm |

**Rules:**

- Page content max width: `max-w-7xl` (1280px) for dashboards; `max-w-3xl` (768px) for focused forms and exam content.
- Page horizontal padding: `px-4 md:px-6 lg:px-8`.
- Vertical page padding: `py-6 md:py-8`.
- Stack related fields with `gap-4`; separate form sections with `gap-8`.

### 3.2 Typography

**Primary typeface:** [Inter](https://fonts.google.com/specimen/Inter) — clean, highly legible, excellent at small sizes.

Load via `@fontsource/inter` or Google Fonts in `index.html`. Apply globally on `body`.

| Role | Size | Weight | Line height | Tailwind |
| --- | --- | --- | --- | --- |
| Page title | 30px | 600 | 1.2 | `text-3xl font-semibold tracking-tight` |
| Section title | 20px | 600 | 1.3 | `text-xl font-semibold` |
| Card / panel title | 16px | 600 | 1.4 | `text-base font-semibold` |
| Body | 14px | 400 | 1.5 | `text-sm` |
| Body large (exam questions) | 16px | 400 | 1.6 | `text-base leading-relaxed` |
| Label | 14px | 500 | 1.4 | `text-sm font-medium` |
| Caption / meta | 12px | 400 | 1.4 | `text-xs text-muted-foreground` |
| Table header | 12px | 500 | 1.4 | `text-xs font-medium uppercase tracking-wide text-muted-foreground` |

**Rules:**

- Prefer **sentence case** for headings and buttons (not ALL CAPS except table headers).
- Limit to **two weights** in most views: 400 (body) and 600 (headings/emphasis).
- Exam question text uses `text-base leading-relaxed` minimum for readability.
- Never go below 12px for meaningful content.

### 3.3 Color palette

Use shadcn semantic tokens. Keep the palette **mostly neutral** with one primary accent and functional status colors.

#### Light mode (default)

| Token | Purpose | Guidance |
| --- | --- | --- |
| `--background` | Page surface | Pure or near-white (`oklch(1 0 0)`) |
| `--foreground` | Primary text | Near-black (`oklch(0.145 0 0)`) |
| `--muted` / `--muted-foreground` | Secondary surfaces & helper text | Soft gray backgrounds, medium gray text |
| `--primary` | Primary actions, active nav | Deep neutral or restrained blue-black |
| `--border` | Dividers, inputs | Light gray (`oklch(0.922 0 0)`) |
| `--destructive` | Errors, destructive actions | Red — use sparingly |

#### Semantic status colors (functional only)

| Status | Usage | Implementation |
| --- | --- | --- |
| **Success** | Saved, submitted, passed | `text-emerald-600` / subtle `bg-emerald-50` badge |
| **Warning** | Time running low, draft | `text-amber-600` / `bg-amber-50` |
| **Error** | Validation, failed submit | `--destructive` |
| **Info** | Neutral notices | `text-muted-foreground` + icon, not bright blue boxes |

Do **not** assign a unique color to every entity type (class, tag, assignment). Use **badges with neutral backgrounds** and text labels instead.

#### Dark mode

Optional for v1. If enabled, follow the same restraint: muted surfaces, no neon accents. Exam mode should default to **light mode** to reduce eye strain conventions conflict.

### 3.4 Radius & elevation

| Token | Value | Usage |
| --- | --- | --- |
| `--radius` | `0.625rem` (10px) | Default corner radius (shadcn default) |
| Small | `rounded-md` (6px) | Buttons, inputs, nav items |
| Large | `rounded-lg` (10px) | Cards, dialogs, panels |
| Full | `rounded-full` | Avatars, status dots only |

**Shadows** — subtle only:

| Level | Tailwind | Usage |
| --- | --- | --- |
| None | — | Default surfaces; use border instead |
| Low | `shadow-sm` | Cards, dropdowns, popovers |
| Medium | `shadow-md` | Modals, sheets (mobile nav) |

Never use colored shadows or large `shadow-xl` drops.

### 3.5 Borders

- Default divider: `border-border` (1px solid).
- Prefer **spacing and background contrast** over borders to separate sections.
- Tables: horizontal row dividers only (`border-b`), no full grid borders.
- Inputs: single `border-input` ring; focus via `ring-2 ring-ring ring-offset-2`.

---

## 4. Component Guidelines

Build on **shadcn/ui** primitives in `src/components/ui/`. Compose domain UI in `features/*/components` and `components/layout`.

### 4.1 Buttons

| Variant | When to use |
| --- | --- |
| `default` (primary) | One primary action per view/section |
| `secondary` | Secondary actions (Cancel, Back) |
| `outline` | Tertiary actions in toolbars |
| `ghost` | Icon-only, table row actions, nav overflow |
| `destructive` | Delete, irreversible actions (always confirm) |

- Maximum **one primary button** per form footer or dialog.
- Destructive actions require `AlertDialog` confirmation.
- Loading state: disable button + optional spinner icon; never leave clickable during mutation.

### 4.2 Forms

- Use **React Hook Form + Zod + shadcn Form** (see ARCHITECTURE.md §11).
- Break complex flows into **multi-step wizards** with a visible step indicator.
- Labels above inputs; helper text below in `text-muted-foreground`.
- Inline validation on blur; summary alert on submit failure.
- Field groups: `gap-4` within, `gap-8` between sections.

### 4.3 Tables

Primary pattern for admin and lecturer list views.

- Sticky header on long lists.
- Row height: minimum 48px (`h-12`) for touch targets.
- Actions: right-aligned `DropdownMenu` (ghost trigger), not a row of icon buttons.
- Bulk selection: checkbox column + floating action bar when items selected.
- Empty state: centered `EmptyState` component, not an empty table shell.
- Pagination: bottom-aligned, show "Showing X–Y of Z".

### 4.4 Cards

Use sparingly. Prefer flat sections on `bg-background` with `border` and `rounded-lg`.

- Dashboard stat cards: number + label + optional trend; no illustration.
- Do not nest cards inside cards.

### 4.5 Navigation

Implemented in `AppShell` + `config/navigation.ts`.

- Sidebar width: `256px` (`w-64`).
- Active item: `bg-primary text-primary-foreground` (current pattern).
- Inactive: `text-muted-foreground` with subtle hover.
- Icons: `size-4`, Lucide only, one per nav item.
- Mobile: `Sheet` slide-over; desktop: persistent sidebar.

### 4.6 Feedback

| Pattern | Component | When |
| --- | --- | --- |
| Toast | `sonner` | Save success, copy confirmation, non-blocking info |
| Inline alert | `Alert` | Form-level or page-level errors |
| Confirm | `AlertDialog` | Destructive or irreversible actions |
| Loading | `Skeleton` | Content placeholders |
| Full page load | `FullPageSpinner` | Auth bootstrap only |

Messages must be **human-readable**, never expose stack traces or API internals.

### 4.7 Icons

- Library: **Lucide React** (shadcn default).
- Size: `size-4` inline, `size-5` standalone.
- Use icons only when they **speed recognition** (nav, status, empty states).
- Do not prefix every label with an icon.

---

## 5. Layout System

### 5.1 App shell (Admin, Lecturer, Student)

```text
+------------------------------------------------------------------+
| Sidebar (256px)  |  Top bar (56px) — user menu, optional actions |
|                  +------------------------------------------------+
|  Nav items       |  PageHeader — title, description, actions     |
|                  +------------------------------------------------+
|                  |  Main content (max-w-7xl, padded)             |
|                  |                                                |
+------------------------------------------------------------------+
```

| Element | Spec |
| --- | --- |
| Sidebar | `w-64`, `border-r`, `bg-sidebar` |
| Top bar | `h-14`, `border-b`, app name + user avatar dropdown |
| Page header | Title + optional description + right-aligned action buttons |
| Content area | `flex-1 overflow-auto p-4 md:p-6 lg:p-8` |

### 5.2 Exam layout (Student — assignment take)

**Distraction-free fullscreen mode.** No sidebar. No global nav. Only exam essentials.

```text
+------------------------------------------------------------------+
|  Assignment title          Timer (mm:ss)    Saved indicator       |
+------------------------------------------------------------------+
|  Progress bar + "Question 4 of 25"                                |
+------------------------------------------------------------------+
|                                                                   |
|  Question stem (text-base, leading-relaxed)                       |
|  Answer options / input                                           |
|                                                                   |
+------------------------------------------------------------------+
|  [← Previous]   Question palette (compact)   [Next →] [Submit]   |
+------------------------------------------------------------------+
```

| Element | Behavior |
| --- | --- |
| Timer | Prominent but calm; switch to warning color below 5 minutes |
| Save indicator | "Saving…" → "Saved" with subtle text, not a modal |
| Progress | Thin bar + fraction; optional question grid jump |
| Question nav | Previous/Next + numbered palette for review |
| Submit | Requires confirmation dialog summarizing unanswered count |

Route: `/student/assignments/:id/take` — uses dedicated `ExamLayout` (see ARCHITECTURE.md §7.4).

### 5.3 Wizard layout (Lecturer — create assignment/exam)

Multi-step flows for complex creation:

1. **Basics** — title, description, duration, schedule
2. **Questions** — select from bank or add new
3. **Assign** — pick classes / students
4. **Review** — summary before publish

- Horizontal step indicator at top.
- Back/Continue footer pinned to bottom on mobile.
- Each step is a single focused task — never all fields on one page.

### 5.4 Dashboard layout

- Top row: 3–4 key metrics in a responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
- Below: primary content (recent activity, charts, quick actions).
- Charts: minimal styling, neutral grid lines, no 3D effects.

---

## 6. Role-Based Experience

### 6.1 Student

**Goal:** Focus and clarity. Reduce exam anxiety through predictable UI.

#### Primary journeys

| Journey | UX priority |
| --- | --- |
| View upcoming assignments | Scannable list with date, status badge, duration |
| Take exam | Distraction-free `ExamLayout`, autosave feedback |
| View results | Clear score, per-question review, no clutter |
| Practice tests | Same exam UI with relaxed timer styling |
| Profile / password | Simple single-column form |

#### Dashboard contents

- **Upcoming** — next assignments with countdown or date
- **Recent results** — last 3–5 scores with link to detail
- **Announcements** — compact circular feed
- **Quick links** — Assignments, Results, Profile

#### Exam UX details

- Auto-save indicator always visible during attempt.
- Warn before leaving page (`beforeunload`) when in progress.
- Question palette shows answered / unanswered / flagged states with neutral dots.
- No celebratory animations on submit — calm confirmation screen.
- Post-submit: clear "Submitted" state; disable further edits.

### 6.2 Lecturer

**Goal:** Productivity. Streamline content creation and result analysis.

#### Primary journeys

| Journey | UX priority |
| --- | --- |
| Manage question bank | Filterable table, tag chips, bulk import/export (future) |
| Create assignment | Multi-step wizard |
| Schedule & assign | Date pickers, class multi-select, clear timezone display |
| Analyze results | Sortable table, export, per-question breakdown |
| Circulars & polls | Simple compose + publish |

#### Question bank

- Table with columns: stem preview, type, tags, updated date, actions.
- Filters: search, tag, question type — horizontal filter bar, not a sidebar maze.
- Create/edit: slide-over panel or dedicated page — not a tiny modal for long content.

#### Analytics (lecturer scope)

- Class-level performance summary.
- Assignment completion rate, average score, question difficulty hints.
- Charts: bar/line only; label axes clearly.

### 6.3 Administrator

**Goal:** Institutional oversight and efficient management.

#### Primary journeys

| Journey | UX priority |
| --- | --- |
| User management | CRUD tables for lecturers/students, status toggle |
| Class management | Assign lecturers/students with clear relationship view |
| Platform analytics | Institution-wide KPIs |
| Permissions & config | Structured settings pages |
| Reports | Exportable, filterable summaries |

#### Dashboard contents

- Total users (students, lecturers), active classes, assignments this term.
- Recent activity feed (registrations, assignment publishes).
- Quick actions: Add user, Create class, View reports.

#### User management table

- Columns: name, email, role, status, last active, actions.
- Bulk actions: deactivate, export.
- Create user: modal or short form — minimum required fields upfront.

---

## 7. Screen Inventory

Maps PRD features to expected pages. Use `PlaceholderPage` until implemented.

### Shared

| Screen | Route | Layout |
| --- | --- | --- |
| Login | `/login` | Centered card, no sidebar |
| Change password | `/account/password` | App shell |
| 403 Forbidden | `/forbidden` | Minimal |
| 404 Not Found | `*` | Minimal |

### Admin

| Screen | Route |
| --- | --- |
| Dashboard | `/admin` |
| Users list | `/admin/users` |
| User create/edit | `/admin/users/new`, `/admin/users/:id` |
| Classes list | `/admin/classes` |
| Class detail | `/admin/classes/:id` |
| Analytics | `/admin/analytics` |
| Circulars | `/admin/circulars` |
| Polls | `/admin/polls` |

### Lecturer

| Screen | Route |
| --- | --- |
| Dashboard | `/lecturer` |
| Question bank | `/lecturer/questions` |
| Question create/edit | `/lecturer/questions/new`, `/lecturer/questions/:id` |
| Tags | `/lecturer/tags` |
| Assignments list | `/lecturer/assignments` |
| Assignment wizard | `/lecturer/assignments/new`, `/lecturer/assignments/:id/edit` |
| Assignment results | `/lecturer/assignments/:id/results` |
| Analytics | `/lecturer/analytics` |
| Circulars | `/lecturer/circulars` |
| Polls | `/lecturer/polls` |

### Student

| Screen | Route |
| --- | --- |
| Dashboard | `/student` |
| Assignments list | `/student/assignments` |
| Take assignment | `/student/assignments/:id/take` |
| Assignment result | `/student/assignments/:id/result` |
| Answer review | `/student/assignments/:id/review` |
| Circulars | `/student/circulars` |
| Polls | `/student/polls` |

---

## 8. Motion & Interaction

Animations must be **subtle, smooth, and functional** — never decorative.

| Interaction | Duration | Easing | Implementation |
| --- | --- | --- | --- |
| Hover color | 150ms | ease | `transition-colors` |
| Button press | 150ms | ease | opacity or scale max `0.98` |
| Dialog open | 200ms | ease-out | shadcn/Radix default |
| Sheet slide | 250ms | ease-out | shadcn default |
| Skeleton pulse | — | — | shadcn `Skeleton` |
| Page transition | — | — | None (instant route change) |

**Do not use:** parallax, bounce, staggered page reveals, confetti, or looping background motion.

### Focus states

- All interactive elements must show visible focus: `ring-2 ring-ring ring-offset-2`.
- Never remove outline without a replacement.
- Skip links for keyboard users on exam and dashboard pages.

---

## 9. Responsive Behavior

Mobile-first. Tailwind breakpoints: `sm` 640, `md` 768, `lg` 1024, `xl` 1280.

| Breakpoint | Behavior |
| --- | --- |
| **Mobile** (`< md`) | Sidebar → Sheet; stack dashboard cards; table → card list or horizontal scroll |
| **Tablet** (`md`) | Sidebar visible; two-column dashboards |
| **Desktop** (`lg+`) | Full layout; multi-column tables comfortable |

### Exam mode on mobile

- Timer and save indicator remain in sticky top bar.
- Question palette collapses to dropdown or bottom sheet.
- Primary nav: large touch targets (min 44px height).

---

## 10. Accessibility

Target **WCAG 2.1 AA** minimum.

| Requirement | Implementation |
| --- | --- |
| Color contrast | 4.5:1 body text; 3:1 large text and UI components |
| Keyboard | All actions reachable; logical tab order |
| Screen readers | `aria-label` on icon buttons; live region for save status |
| Forms | `<Label>` linked to inputs; error announced |
| Motion | Respect `prefers-reduced-motion` — disable transitions |
| Timer | Announce time warnings via `aria-live="polite"` |

---

## 11. Content & Copy Tone

- **Clear and direct** — "Submit assignment" not "Complete your journey".
- **Calm error messages** — "Unable to save. Check your connection and try again."
- **Exam copy** — neutral, instructional; avoid gamified language during tests.
- **Empty states** — explain what to do next with a single CTA.

---

## 12. Implementation Checklist

When building or reviewing a screen:

- [ ] Spacing follows 8px grid
- [ ] Typography uses Inter with defined scale
- [ ] Colors use semantic tokens only (no hardcoded hex in components)
- [ ] One primary action per section
- [ ] Loading, empty, and error states implemented
- [ ] Responsive at mobile, tablet, desktop
- [ ] Keyboard and focus accessible
- [ ] Exam screens use `ExamLayout` without sidebar chrome
- [ ] Complex forms use wizard pattern
- [ ] Tables include search/filter where list exceeds ~10 items
- [ ] Mutations show pending state and toast on success
- [ ] No decorative gradients, glass effects, or unnecessary icons

---

## 13. File & Token Maintenance

| Concern | Location |
| --- | --- |
| CSS variables / theme | `src/index.css` |
| shadcn components | `src/components/ui/` |
| App layouts | `src/components/layout/` |
| Role navigation | `src/config/navigation.ts` |
| Shared feedback | `src/components/feedback/` |

When adjusting brand tokens, update **`src/index.css` only** — do not scatter color overrides in feature components. Use `cn()` from `@/lib/utils` for conditional classes.

### Recommended font setup

```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
```

```css
/* src/index.css — in @layer base */
body {
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
}
```

---

## 14. Relationship to Other Docs

| Document | Scope |
| --- | --- |
| [`../prd.md`](../prd.md) | Product features and role capabilities |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Folder structure, routing, security, shadcn setup |
| **`design.md` (this file)** | Visual language, UX patterns, component behavior |
| [`../API_DOCS.md`](../API_DOCS.md) | Data shapes feeding tables and forms |

When product and design conflict, **clarify with PO** — then update this document.

---

## 15. Future Considerations

Designed to scale without visual rework:

- **Dark mode** — token-ready via shadcn `.dark` class; exam mode may stay light-only.
- **AI features** — inline assist panels as subtle side sheets, not chat bubbles over exam content.
- **i18n** — keep copy in constants or a future `locales/` directory; avoid hardcoded strings in deeply nested components.
- **Branding** — institution logo slot in sidebar header (`AppShell`); keep height fixed at 56px.
