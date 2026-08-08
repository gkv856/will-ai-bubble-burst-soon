# Coding Style

## Immutability (CRITICAL)

ALWAYS create new objects, NEVER mutate existing ones:

```
// Pseudocode
WRONG:  modify(original, field, value) → changes original in-place
CORRECT: update(original, field, value) → returns new copy with change
```

Rationale: Immutable data prevents hidden side effects, makes debugging easier, and enables safe concurrency.

## Core Principles

### KISS (Keep It Simple)

- Prefer the simplest solution that actually works
- Avoid premature optimization
- Optimize for clarity over cleverness

### DRY (Don't Repeat Yourself)

- Extract repeated logic into shared functions or utilities
- Avoid copy-paste implementation drift
- Introduce abstractions when repetition is real, not speculative

### YAGNI (You Aren't Gonna Need It)

- Do not build features or abstractions before they are needed
- Avoid speculative generality
- Start simple, then refactor when the pressure is real

## File Organization

MANY SMALL FILES > FEW LARGE FILES:
- High cohesion, low coupling
- 200-300 lines max, per file (CRITICAL, non-negotiable)
- Extract utilities from large modules
- Organize by feature/domain, not by type

### File Size Limit (PARAMOUNT)

**200-300 lines is the hard ceiling for any source file.** The moment a file
crosses this line, it must be refactored — split into multiple smaller
files, and where a single split isn't enough, into packages/folders
(`feature/` with cohesive submodules, not one flat file). This is not a
style preference to weigh against convenience; treat it as a build-blocking
rule. Do not defer the split to "later" — refactor before adding the next
change to a file that is already over budget.

## Type Safety (PARAMOUNT)

**All code must be type-hint enabled — no exceptions.** Every function,
method, and public value must carry explicit type annotations:
- Python: type annotations on every function signature (see
  [python/coding-style.md](../python/coding-style.md))
- TypeScript: explicit types on every exported function, public API, and
  component prop (see [typescript/coding-style.md](../typescript/coding-style.md));
  `any` is not permitted
- Untyped code is treated the same as a failing check — fix it before
  moving on, don't leave it for a later pass

## Error Handling

ALWAYS handle errors comprehensively:
- Handle errors explicitly at every level
- Provide user-friendly error messages in UI-facing code
- Log detailed error context on the server side
- Never silently swallow errors

## Input Validation

ALWAYS validate at system boundaries:
- Validate all user input before processing
- Use schema-based validation where available
- Fail fast with clear error messages
- Never trust external data (API responses, user input, file content)

## Naming Conventions

- Variables and functions: `camelCase` with descriptive names
- Booleans: prefer `is`, `has`, `should`, or `can` prefixes
- Interfaces, types, and components: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Custom hooks: `camelCase` with a `use` prefix

## Logging

- Prefix log messages with a `[ServiceName]`/`[ModuleName]` tag for context (e.g. `[Model]`, `[API]`)
- No emojis or emotional language in log output
- Pre-build the data object, then pass it to the log call, rather than inlining a long literal — keeps call sites one statement per line
- Use the log level that matches severity (`debug`/`info`/`warn`/`error`), never a single blanket level

```
// WRONG
console.log("🎯 [Service] Starting process, user=" + userId + " action=" + action);

// CORRECT
const data = { userId, action };
console.log("[Service] Starting process", data);
```

## Code Smells to Avoid

### Deep Nesting

Prefer early returns over nested conditionals once the logic starts stacking.

### Magic Numbers

Use named constants for meaningful thresholds, delays, and limits.

### Long Functions

Split large functions into focused pieces with clear responsibilities.

### Inline Complex Expressions

Prefer one statement per line: extract a nested call's arguments into a named variable first, rather than nesting them inline.

```
// WRONG
await SomeService.method(param1, param2, { prop: value, other: data });

// CORRECT
const payload = { prop: value, other: data };
await SomeService.method(param1, param2, payload);
```

## Code Quality Checklist

Before marking work complete:
- [ ] Code is readable and well-named
- [ ] Functions are small (<50 lines)
- [ ] Files are focused (200-300 lines max; refactored into multiple files/packages if exceeded)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling
- [ ] No hardcoded values (use constants or config)
- [ ] No mutation (immutable patterns used)
- [ ] All functions/methods/public values are type-hinted (Python annotations / TypeScript types, no `any`)
