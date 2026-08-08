# React File & Folder Structure

Extends [common/coding-style.md](../common/coding-style.md) with React-specific file organization.

## One Component Per File (CRITICAL)

Every React component gets its own file — never combine components even if "only used here."

## Folder Organization

**Multi-feature apps:** organize by feature (`auth/`, `dashboard/`), each containing its own components, hooks, and types.

**Single-feature apps** (like `modeling/frontend`): organize `components/` directly by concern (`hooks/`, `nav/`, `scope/`, `statements/`, `chat/`, `ui/`, `shared/`).

Standard structure:
- `components/` — UI components (organized by feature or concern)
- `pages/` — Full-page components (Next.js App Router)
- `lib/` — Utilities, formatters, API clients, shared hooks
- `types.ts` — Cross-feature types

## Hooks & Config

- **Feature-specific hooks**: co-locate in the feature folder
- **Cross-feature hooks**: `lib/hooks/`
- **Config/constants**: extract to separate files, never inline in components

## Type/Interface Naming (CRITICAL)

- **`I` prefix mandatory** on all interfaces
- **Max 15 characters** — keep concise
- **No "Props", "Data", "Input"** suffix — these are implied
- **Action-oriented**: `ICreateModel`, `IDeleteUser`, not `IModelProps`

Per-feature types go in `types.ts` in the feature folder; shared types go in `lib/types.ts`.

## File Size Limits

Follows the repo-wide 200-300 line ceiling in [common/coding-style.md](../common/coding-style.md) (PARAMOUNT) — split into smaller components/folders once a file crosses it:
- **Components**: max 300 lines (150–250 typical)
- **Utilities**: max 200 lines
- **Type files**: max 300 lines (split if larger)

## Import Order

1. External libraries (`react`, `next`, etc.)
2. Relative components
3. Relative hooks
4. Relative utilities & types
5. Styles

## Anti-Patterns

**God components** — split if:
- File exceeds 300 lines
- 5+ responsibilities
- Multiple unrelated hooks
- 10+ props
- Multiple state machines

**Scattered config/constants** — extract to their own files.

**Monolithic `hooks/` folder** — co-locate with features; use `lib/hooks/` only for cross-feature utilities.

**Descriptor-only folder names** — use `components/dashboard/`, not `components/utils/` or `components/helpers/`.

## Checklist

- [ ] One component or logical piece per file
- [ ] <300 lines (component) or <200 lines (utility)
- [ ] All interfaces have `I` prefix, <15 chars
- [ ] No hardcoded constants inline
- [ ] Hooks co-located with feature
- [ ] Related files grouped together
