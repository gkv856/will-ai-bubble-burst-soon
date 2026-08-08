---
name: plan-ui-change
description: The single entry point for design and UX work in this project. Given one screen or a set of screens (e.g. "the dashboard", "onboarding", "statements and entity-canvas"), reads this project's UI/UX principles, audits what's actually there against this project's design skills, and writes a change plan to a file — then stops. Only edits real component code after the user explicitly approves that plan. Use for "redesign X", "rewamp X", "improve the UX of X", "polish X", "plan changes to X".
---

# Plan a UI Change

Two-phase skill: **plan, then — only after approval — build.** Never skip straight to
editing component code. This exists because unplanned UI work drifts: every screen
re-derives its own answer to spacing/color/motion instead of checking one shared
reference, and the product stops feeling designed by one person.

This is the only design skill meant to be invoked directly for a redesign/audit/polish
request. Everything it reaches for — the standing reference docs and the other design
skills it uses during Phase 1 step 4 or Phase 2 step 3 — lives inside this folder:

- `ui-ux-principles.md` — the Operate-mode standing reference (Phase 1 step 2)
- `fe-design.md` — the onboarding "Depth" reference (Phase 1 step 2)
- `animate/`, `emil-design-eng/`, `apple-design/`, `animation-vocabulary/`,
  `find-animation-opportunities/`, `review-animations/`, `redesign-existing-projects/`,
  `web-design-guidelines/`, `ui-ux-pro-max/`, `improve-animations/`, `pick-ui-library/`
  — each a copy of that design skill's own folder (SKILL.md and any supporting files
  unchanged). The last two aren't reached for directly by this skill, but `animate/`
  hands off to `pick-ui-library/` for component (not animation) tasks and to
  `improve-animations/` for whole-codebase audits, and `find-animation-opportunities/`
  hands off to `improve-animations/` to turn a finding into a plan — so they travel
  with the skills that depend on them.

These are nested here for convenience, not for Claude Code's skill loader — a SKILL.md
two levels deep isn't independently discoverable/invocable via the `Skill` tool
anymore. Use them by reading `<name>/SKILL.md` directly and following its instructions,
not by invoking them as slash commands.

## Phase 1 — Plan

### 1. Resolve the target

The user names one screen or a set of screens. If it's ambiguous which components that
maps to, say so and ask — don't guess at scope for something about to get a written plan.

### 2. Load the standing reference — never skip this

- **Operate-mode screens** (dashboard, statements, entity-canvas, control-accounts,
  drilldown, audit, calc, chat, admin — most of the app): read `ui-ux-principles.md`
  (in this folder) in full. This is the single source of truth for color, density,
  motion, and interaction rules in this project.
- **Onboarding** (`/start`, the setup wizard): read `fe-design.md` (in this folder,
  the "Depth" system) instead — it's a separate, already-good, deliberately different
  system for a different kind of screen. Don't apply Operate-mode density/restraint
  rules to it, and don't apply Depth's spaciousness to Operate-mode screens.
- If the target doesn't clearly map to either doc, say so and ask which principles
  should govern rather than inventing a third system on the spot.

### 3. Read the actual code for the target

Don't plan against a guess. Read the real components for the named screen(s) first.

### 4. Audit against the reference

Pull in whichever of this folder's nested design skills apply to find what's actually
wrong, not just what could theoretically be better — read the relevant `<name>/SKILL.md`
and follow it:

- `redesign-existing-projects/` — the generic/AI-slop audit, drives the "what's weak
  here" pass. Its 9-category Design Audit + ordered Fix Priority is the detailed
  version of `.agents/rules/web/design-quality.md`'s standing reminder — use this
  skill when actually auditing; don't restate the shorter rule doc against it.
- `find-animation-opportunities/` — where motion is missing or would help.
- `web-design-guidelines/` — accessibility gaps. It live-fetches Vercel's Web Interface
  Guidelines from GitHub, so treat it as more current than any offline a11y notes.
- For motion-heavy targets — this project's flagship strength, per GKV's explicit
  priority — combine 2+ of `animate/` (build one transition), `emil-design-eng/`
  (component-level polish call), `apple-design/` (gesture/spring/materials),
  `animation-vocabulary/` (name an effect) rather than reaching for just one.
- Anything found that isn't covered by `ui-ux-principles.md` yet is a signal the
  principles doc may need a deliberate addition — flag it, don't silently invent a
  one-off rule for this screen alone (that's exactly the drift this skill exists to
  prevent).

**When two skills disagree, these are already decided — don't re-litigate per run:**

- Animation timing/easing/curves: `emil-design-eng/` / `animate/` / `review-animations/`
  are authoritative. If `ui-ux-pro-max/` is consulted, its own Animation section is
  shallow by comparison — already covered, not a second opinion.
- Accessibility: `web-design-guidelines/`'s live fetch beats any offline checklist.
- Stack defaults: this project is Next.js + React + shadcn/ui + Tailwind v4 — if
  `ui-ux-pro-max/` is used, pass `--stack shadcn` explicitly; don't accept its generic
  `html-tailwind` default.

### 5. Write the plan to a file — do not edit component code yet

Ask where to save it if not given; default to `docs/design-plans/<target-slug>.md`.
The plan file must contain:

- **Target** — exact screen(s)/components in scope
- **Mode** — Operate or Read/Decide, and which reference doc governs
- **Current state** — grounded in the code actually read, not assumption
- **Findings** — each one citing the specific principle or rule it violates
- **Proposed changes** — specific and file-by-file, not vague ("tighten the KPI card
  hover state per Motion §respond-on-press", not "improve the dashboard")
- **Explicitly out of scope** — say what you're deliberately not touching and why
- **Open questions** — anything that needs the user's call before or during execution
- **Checklist** — the concrete list Phase 2 will work through and check off

Then **stop.** Tell the user the plan is written, where, and that you're waiting for
approval. Do not start editing components in the same turn unless they explicitly
approve first.

## Phase 2 — Build (only after explicit approval)

Approval means the user references the plan and says to proceed — not silence, not
"looks good" about something else, not moving on to a different topic.

1. Work the plan's checklist in order, checking off items in the plan file as they're
   completed — the file stays the live record of what's done.
2. Follow `ui-ux-principles.md` (or `fe-design.md` for onboarding), both in this
   folder, throughout. If something in the plan turns out to conflict with the
   reference once you're actually building it, stop and flag it — don't quietly
   improvise.
3. Use this folder's nested design skills as review, not just construction: follow
   `animate/SKILL.md` while building new motion, `review-animations/SKILL.md` on the
   resulting diff if the change touches animation code.
4. Before calling it done, check the change against `ui-ux-principles.md`'s pre-ship
   checklist.
5. If the audit (Phase 1, step 4) surfaced something that belongs in
   `ui-ux-principles.md` itself — a rule this project didn't have written down yet —
   propose the addition explicitly instead of leaving it implicit in this one plan
   file. The principles doc only stays trustworthy if real decisions get written back
   into it.
