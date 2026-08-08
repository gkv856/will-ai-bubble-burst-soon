# The "Depth" design system

A shared visual/motion language for full-page, single-focus screens — currently the standalone `/start` splash and the model **setup wizard** (`/models/[modelId]/setup/[field]`). Everything lives under `components/depth/`; a screen composes those pieces rather than hand-rolling its own card/background/motion.

## Where it's used

| Screen       | Route                             | Purpose                                                                                                                                                                           |
| ------------ | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name splash  | `/start`                          | Standalone, not wired to the backend — a big textbox, Enter routes to `/`. See `app/start/page.tsx`.                                                                              |
| Setup wizard | `/models/[modelId]/setup/[field]` | The real scope-bootstrap flow, one full page per question (`modelType`, `modelName`, `currency`, `startDate`, `frequency`, `horizonYears`). See `components/setup/SetupStep.tsx`. |

Both are a `DepthStage` → one `DepthCard` → brand `DepthEyebrow` + question content + `DepthHint`/`SetupNav`. The wizard additionally reuses `SCOPE_QUESTIONS` (`lib/scope/questions.ts`) as its only source of truth for question order/content — there is one `SetupStep` component, not six near-duplicate files; the six URLs come from the dynamic `[field]` route segment.

## Design philosophy

Two of this project's design skills were applied deliberately, not just for vibe:

- **apple-design** — translucent materials (`backdrop-filter`) that convey hierarchy without a hard opaque bar; the card **materializes** on entry (blur + scale + opacity animate together — never a plain fade, never `scale(0)`); size-specific type tracking (negative letter-spacing on the giant headline text, positive on the small eyebrow); response-on-press, not response-on-release.
- **emil-design-eng** — a strong custom `cubic-bezier` ease-out instead of the weak built-in CSS easings; short stagger (30–80ms) on grouped elements; `active:scale-[0.97]` press feedback on everything clickable; **never animate a keyboard-initiated commit** (pressing Enter to submit never has a transition on it — see `SetupStep.handleKeyDown` / `StartPage.handleKeyDown`); full `prefers-reduced-motion` support everywhere, not bolted on after.

"Premium" here means restraint, not decoration: one filled button in the whole language (`DepthButton`, reserved for the primary "Continue" action), no bounce, no color for color's sake — the aurora background and frosted card are the only two visual moves; everything else is spacing, weight, and precisely-timed motion.

## Theme tokens (`components/depth/depthTheme.ts`)

| Constant                        | Value                                                                     | Used for                                                                                                             |
| ------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `DEPTH_EASE_OUT`                | `cubic-bezier(0.23, 1, 0.32, 1)`                                          | The one easing curve for every Depth transition — card entrance, pill entrance, hover, focus glow.                   |
| `DEPTH_AURORA_BACKGROUND_STYLE` | three soft radial gradients (blue/pink/mint) over `#FBFBFD`               | The full-bleed stage background (`DepthStage`).                                                                      |
| `DEPTH_SYSTEM_FONT_STACK`       | `-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif` | Prefer the platform font over a custom face (apple-design's own guidance) — applied once, at the `DepthStage` level. |
| `DEPTH_CARD_SHADOW`             | inset top highlight + soft outer drop shadow                              | The "light catching the material" edge on `DepthCard`, plus depth separation from the stage.                         |

Changing any of these changes every Depth screen at once — that's the point of centralizing them here instead of inlining hex/gradient strings per page.

## Motion system (`components/depth/useReducedMotion.ts`, `useEntranceMotion.ts`)

- **`useReducedMotion()`** — subscribes to `(prefers-reduced-motion: reduce)` via `useSyncExternalStore` (the React-recommended way to read a browser API without a `setState`-in-effect lint violation — see `react-hooks/set-state-in-effect`). Returns a plain `boolean`.
- **`useEntranceMotion(staggeredItemCount)`** — returns `{ isMounted, hasStaggerSettled }`.
  - `isMounted` flips true one `requestAnimationFrame` after mount, so the card animates in rather than rendering already-solid.
  - `hasStaggerSettled` flips true once the entrance stagger has visibly finished (`120ms base + 40ms × itemCount + 250ms buffer`). **This exists to fix a real bug**: a per-pill `transitionDelay` used only for the entrance animation, left in place indefinitely, would also delay that pill's hover/press feedback forever after — a button that feels laggy for the rest of the session. Once `hasStaggerSettled` is true, `getStaggerDelay` returns `"0ms"` and hover/press go back to being instant.
- **`getStaggerDelay({ index, isMounted, hasStaggerSettled, prefersReducedMotion, baseMs?, stepMs? })`** — the per-item `transitionDelay` string. Returns `"0ms"` immediately if `prefersReducedMotion` is true, or once `hasStaggerSettled`.

Any new element that enters in a staggered group (like `DepthPill`) should thread all three flags through exactly this way — see `DepthPill.tsx` for the reference wiring.

## Components (`components/depth/`)

| Component      | Props                                                                                                   | Notes                                                                                                                                                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DepthStage`   | `children`                                                                                              | The `<main>` — full `h-dvh`, centers content, applies the aurora background + system font stack. One per screen.                                                                                                                              |
| `DepthCard`    | `isMounted`, `children`, `className?`                                                                   | The frosted glass panel. Entrance transition (blur/scale/opacity) is baked in; pass `isMounted` from `useEntranceMotion`. `className` only for width overrides — don't override the material styling per-call-site.                           |
| `DepthEyebrow` | `children`                                                                                              | The small frosted brand pill ("Financial Modeling OS"). Always the first thing in a card.                                                                                                                                                     |
| `DepthPill`    | `index`, `isMounted`, `hasStaggerSettled`, `prefersReducedMotion`, `onClick`, `children`, `isSelected?` | The interactive frosted button — used for `/start`'s name suggestions and the wizard's `select`/`select_or_other` options. `isSelected` adds a persistent (not just hover) highlighted state, for revisiting an already-answered wizard step. |
| `DepthButton`  | `onClick`, `children`, `disabled?`                                                                      | The one filled/primary affordance — dark pill, reserved for "Continue". Don't add a second filled button to a Depth screen; if it needs one, it's competing with this one.                                                                    |
| `DepthHint`    | `keyLabel`, `children` (trailing text)                                                                  | Renders "Press `<kbd>{keyLabel}</kbd>` {children}" — e.g. `<DepthHint keyLabel="Enter">to continue</DepthHint>`.                                                                                                                              |

None of these hold business logic — they're pure presentation. State (`draft`, `name`, the current question) and side effects (routing, persisting an answer) live in the page/feature component that composes them (`StartPage`, `SetupStep`).

## Setup-wizard-specific pieces (`components/setup/`)

Not part of the general Depth theme (only the wizard has a multi-step concept), but built on top of it:

- **`SetupProgress`** — the row of step dots (`stepCount`, `currentIndex`).
- **`SetupNav`** — the Back / Skip text-button row (`onBack`, `onSkip`). Back calls `router.back()` (no separate prev-step index needed — browser history already knows where the user came from). Skip advances to the next question's URL without recording an answer; the existing `ScopeChat` inline flow on `/models/[modelId]` re-asks anything left unanswered, so a skip is a deferral, not data loss.
- **`SetupStep`** — the one component behind all six question URLs. Resolves `field` against `SCOPE_QUESTIONS`, renders the right input for the question's `kind` (`select` → `DepthPill` grid; `text`/`date` → a giant Depth input; `select_or_other` → both), and calls `persistScope()` (`lib/scope/persist.ts`) before navigating to the next step.

## Adding a new Depth screen

1. Add a client component that composes `DepthStage` → `DepthCard` → your content, calling `useReducedMotion()` and `useEntranceMotion(n)` where `n` is however many items you'll stagger (0 if none).
2. Use `DepthEyebrow`/`DepthPill`/`DepthButton`/`DepthHint` for anything that already has a shape here — don't reintroduce a bespoke pill or hint style.
3. If the screen needs a large single input (like `/start`'s name box or the wizard's text/date steps), copy the input's `className`/`style` from `SetupStep.tsx` rather than reinventing the underline-focus-glow treatment.
4. Never animate a keyboard-initiated submit (Enter). Do add `active:scale-[0.97]` (or reuse `DepthPill`/`DepthButton`, which already have it) on anything clickable.
5. Respect `prefersReducedMotion` in any new bespoke transition — the existing components already do, but a raw `transitionDelay`/`transform` you add yourself needs the same guard.
