# UI/UX Principles

> **Status**: Standing reference, written 2026-08-06. Supersedes `docs/fe-revamp.md`.
> **Scope**: The main workspace — dashboard, statements, entity-canvas, control-accounts,
> drilldown, audit, calc, chat, admin. Onboarding (`/start`, the setup wizard) is a
> separate, already-good, deliberately different system ("Depth," `frontend/fe-design.md`)
> and is out of scope here — don't apply these rules to it.
> **Used by**: the plan-then-approve design skill reads this before planning any screen.
> If a plan would contradict something here, the plan is wrong, or this document needs to
> change first — never both silently diverging.

## The one risk that matters more than any visual choice

This tool competes with Excel. Excel's real moat isn't the grid, it's freedom — a modeler
can scratch a broken formula in column Z, sketch a deal structure with shapes, think out
loud in the medium itself. Every principle below has to be checked against one question:
**does this make a correct model faster to build, or does it just make the screen prettier
while making the tool more rigid?** A beautiful cage is still a cage. If a design choice
adds polish but subtracts flexibility, it loses.

## The standard: Don't Make Me Think

Every screen should be obvious enough that using it takes no thought. Concretely, for this
app:

- **Follow the convention over the clever idea.** If Excel, or any other pro tool the
  user already knows, has a pattern for this, use it unless there's a proven reason not
  to. Novel interactions cost the user learning time they didn't sign up to spend.
- **One obvious next action per screen.** If a screen has two things that both look like
  the primary action, it has zero primary actions.
- **Say less.** Labels, empty states, error messages, helper text — shortest version that
  is still unambiguous. Every extra word is something to read before acting.
- **Answer four questions at a glance, always:** where am I, what can I do here, what
  matters most on this screen right now, how do I get back.
- **Don't make the user remember state.** If it matters, show it — don't require holding
  it in your head (e.g. which tags are filtered, which density is active, whether this
  number is stale).

## Modes

Name what a screen is *for* before touching it — density, restraint, and motion budget
all follow from this call.

| Mode | This screen's job | Where |
|---|---|---|
| **Operate** (this doc) | Help someone complete a task, fast, repeatedly, often for hours at a stretch | Dashboard, statements, entity-canvas, control-accounts, drilldown, audit, calc, chat, admin |
| **Read / Decide** (Depth, separate doc) | One focused decision, full attention, low frequency | `/start`, setup wizard |

Getting the mode wrong is the most common failure: Depth's translucent, full-bleed
materials look expensive but slow someone down who's auditing 40 line items for the
fifth time today. Operate-mode screens want density, speed, and restraint — motion that
confirms an action landed, not motion that delights.

## Color — reserved for meaning, not decoration

The current token system (`frontend/src/app/globals.css`) is achromatic by design: every
semantic token (`background`, `card`, `border`, `muted`, `accent`, chart colors) is pure
gray (`oklch` chroma `0`) in both themes. The only real hues in the whole system are
`--destructive` (errors, negative values) and the ad hoc `emerald-600` used for positive
trend indicators. Keep it that way:

- **Color always means something specific** (error, negative, positive, warning). It is
  never used to differentiate sections, brand a card, or add visual interest. This is a
  Don't-Make-Me-Think win — the moment the user sees color, they know it's meaningful
  without having to check.
- **Red = negative/error, green = positive**, consistently, everywhere. Don't introduce a
  second meaning for either.
- **New chart series** should default to the grayscale chart tokens (`--chart-1`
  through `--chart-5`) unless distinguishing series by color is the actual point (e.g.
  farm comparison) — in which case, use the minimum number of hues that keeps series
  distinguishable, not a decorative palette.
- One known inconsistency to fix, not copy: dark mode's `--sidebar-primary` is a real
  blue (`oklch(0.488 0.243 264.376)`) while every other token in both themes is gray —
  looks like an unswept default, not a decision. Flag it when touched, don't propagate it.

## Density — respect the existing compact scale

The root font-size is deliberately set to 90% (`globals.css`, `html`), which scales nearly
the whole UI proportionally to match ~85% browser zoom without zoom's viewport quirks. A
matching `DENSITY_SCALE` constant in `components/shared/tableColumns.ts` covers the raw-px
values that don't ride along automatically (column widths, row height). This is already a
correct, deliberate decision for an Operate-mode, data-dense product:

- Don't add padding/spacing "for breathing room" on these screens — that's a Read/Decide
  instinct. Dense is correct here; Depth's spaciousness is not the model to copy.
- If a new raw-px value needs to scale with density, add it next to `DENSITY_SCALE` and
  keep the two in sync — don't hardcode a value that silently ignores the density setting.
- Row/period density toggles (compact/comfortable, annual/quarterly/monthly) are a
  pattern, not a one-off — new dense views should offer the same kind of user-controlled
  density where it's meaningful, not assume one fixed density is right for everyone.

## Typography

- Tabular figures (`tabular-nums`) on every number that appears in a column or that a
  user might compare against another number — this is already correct in the KPI cards
  and statement tables; keep it universal.
- Numbers are read, not decorated: no gradient text, no display fonts on financial
  figures. Weight and size carry hierarchy, not styling.

## Motion

Motion in Operate mode has one job: confirm that an action landed, or show where
something went. It is not the delight budget — that lives in onboarding.

**Should this animate at all?** Check frequency before anything else:

| How often | Answer |
|---|---|
| 100+ times a day (keyboard shortcuts, row selection, tab switches) | No animation. Instant. |
| Tens of times a day (hover, filter toggle) | Near-imperceptible only, or nothing |
| Occasional (dialogs, drawers, floating action bar) | Standard motion, 150–300ms |
| Rare (first load, a genuinely new state) | More expressive motion is earned here |

- **Keyboard-triggered actions never animate.** Pressing `↓`/`↑`/`E`/`A` or any shortcut
  is instant — this product already gets this right in `StatementTable`; hold the line
  on every new shortcut-driven action.
- **Respond on press, not on release.** Buttons, rows, and toggles show feedback the
  instant they're pressed.
- **Anything the user can grab (resize handles, drawers, the floating action bar) uses a
  spring, not a fixed-duration transition** — springs can be interrupted and reversed
  mid-flight; a CSS transition can't. Everything else (hover, color, opacity) uses a
  plain transition.
- **Popovers, menus, and floating panels originate from what triggered them** — scale
  from the trigger point or slide from the edge they're anchored to, never from the
  screen center unless they truly have no anchor (a plain modal).
- **`prefers-reduced-motion` collapses every spring/transition to an instant or opacity-only
  change**, no exceptions, checked on every new animated element — not just inherited from
  a global CSS block and assumed to cover everything.

## Interaction conventions

- **Keyboard access is not an enhancement, it's a requirement** for anything used
  repeatedly. If a mouse-only flow exists for a frequent action, it's incomplete, not
  done.
- **Contextual actions float near what they act on** (the floating row-action bar
  pattern) rather than requiring a trip to a toolbar or a right-click menu, for
  anything the user does often.
- **Modals are for interruption, not for routine editing.** If something gets opened
  constantly, it should live inline or in a panel, not a dialog.
- **Every empty state says what to do next**, not just that there's nothing here.
  Every error state says what broke and how to recover, not just that something failed.
- **Status is always visible, never something you have to check for.** A busy/stale/synced
  indicator (like the recalculating dot already in `StatementTable`) beats making the user
  wonder if their last action took effect.

## Before shipping a change to any Operate-mode screen

- [ ] Would someone who's never seen this screen know what to do without being told?
- [ ] Is there exactly one obvious primary action, not zero, not two?
- [ ] Does every color mean something specific — none of it decorative?
- [ ] Does every animated thing pass the frequency check above?
- [ ] Does everything reachable by mouse have a keyboard path, if it's used often?
- [ ] Do empty and error states say what to do next?
- [ ] Does this hold up with `prefers-reduced-motion` on, and in both themes?
- [ ] Did this make the tool faster to build a correct model in — or just prettier?
