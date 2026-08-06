# Design system

Authoritative product design reference: [`design.md`](../../design.md)  
Tokens live in `src/index.css` (shadcn CSS variables).

---

## Intent

ExamFlow should feel **calm, professional, and distraction-free** — closer to focused productivity tools than colorful academic portals.

| Audience | Emotional goal |
| --- | --- |
| Students | Focus, clarity, reduced anxiety, trust that progress is saved |
| Lecturers | Productivity without cognitive overload |
| Admins | Confidence and quick institutional oversight |

### Principles

1. Purpose over decoration
2. Whitespace as structure
3. Predictable interactions
4. Fast, lightweight UI (skeletons over heavy motion)
5. Accessible by default (target WCAG 2.1 AA)
6. Enterprise-ready, student-friendly

Avoid ornamental gradients, glassmorphism, rainbow status colors, and dense single-page mega-forms.

---

## Tokens (summary)

| Area | Guidance |
| --- | --- |
| Spacing | 8px grid; page padding `px-4 md:px-6 lg:px-8`, `py-6 md:py-8` |
| Width | Dashboards `max-w-7xl`; focused forms/exams `max-w-3xl` |
| Type | Inter; page title `text-3xl font-semibold tracking-tight`; exam stems `text-base leading-relaxed` |
| Color | Neutral shadcn tokens; restrained primary; status via emerald/amber sparingly |
| Radius | `--radius: 0.625rem` |
| Elevation | Prefer border; `shadow-sm` / `shadow-md` only when needed |

---

## Shells

### App shell

Sidebar (`w-64`) + top bar (`h-14`) + `PageHeader` + scrollable main.

### Exam layout

No sidebar. Sticky timer, save indicator, progress, question navigation, confirm-on-submit. Route: `/student/assignments/:id/take`.

### Wizards

Multi-step creation (assignment, etc.): one job per step, visible step indicator, pinned footer actions on small screens.

---

## Components

| Pattern | Rule |
| --- | --- |
| Buttons | One primary action per section/footer; destructive needs `AlertDialog` |
| Forms | RHF + Zod + shadcn Form; validate on blur; section gaps `gap-8` |
| Tables / grids | Dense but clear; row actions in menus; empty states explicit |
| Cards | Sparingly — not for every block |
| Feedback | sonner toasts, inline `Alert`, skeletons / full-page spinner for bootstrap |

Icons: Lucide only, used when they aid scanning.

---

## Motion

Subtle and functional (`lib/motion.ts`). Respect `prefers-reduced-motion`. No confetti, parallax, or looping decorative motion.

---

## Themes

Settings allow light/dark and color themes (`default`, `claude`, `tangerine`). Prefer light for long exam sessions when advising users.

---

## Implementation checklist

Before shipping a screen:

- [ ] 8px spacing rhythm
- [ ] Semantic color tokens only
- [ ] Loading, empty, and error states
- [ ] Mobile / tablet / desktop
- [ ] Keyboard focus visible
- [ ] Exam routes use `ExamLayout`
- [ ] Mutations show pending + success feedback

---

## Next

- [Architecture](./architecture.md)
- [Feature modules](./feature-modules.md)
