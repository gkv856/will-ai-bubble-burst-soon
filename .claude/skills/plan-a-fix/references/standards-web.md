# plan-a-fix — TypeScript / React / web standards

Part of `plan-a-fix` (`../SKILL.md`), gate 5d. **Read only when the plan writes or edits TypeScript, React, Next.js or CSS.** A backend-only plan never opens this file. Stack-agnostic shape rules (DRY, file limits, logging, comments) are in `build-gates.md` gate 5 and apply regardless.

## TypeScript & React

- 2+ function/component params → one typed object, destructured with defaults in the body, signature never broken across lines. Single-arg functions and React event handlers are exempt.
- Declare as a `const` arrow function; default export on its own line at the bottom — never `export default function ...` inline. Applies to Next.js `page.tsx` / `layout.tsx` too (the required lowercase filename is unaffected).
- **Interfaces are mid-transition (per `AGENT.md`) — this supersedes any older doc:** backend registration APIs and _existing_ frontend interfaces keep their `I` prefix; _new_ frontend interfaces use plain PascalCase (`UserCardProps`, not `IUserCardProps`); never mass-rename existing ones to match.
- Avoid `any` — use `unknown` and narrow it, or a generic.
- One component per file; one statement per line; pre-build a data object before passing it to a call or a log line.
- Server Component by default in the App Router; add `"use client"` (line 1, before imports) only when the file uses state, effects, refs, browser APIs, or event handlers.
- Hooks only at the top level, never conditional or in a loop. `useEffect` syncs with an external system only — never derived state, which is computed during render. Every subscription, interval and in-flight request cleans up. Don't memoize by default — only when the value goes to a memoized child, feeds another hook's deps, or is measurably expensive.
- List `key`s are stable identifiers, never the array index, for anything that can reorder.
- Testing: React Testing Library + Vitest/Jest, query by role first, `userEvent` over `fireEvent`, MSW for network mocks, no snapshot tests for components.
- No `console.log` in production code.

## Naming & files

- `camelCase` variables/functions · `PascalCase` types/components · `UPPER_SNAKE_CASE` constants · `use`-prefixed hooks · `is`/`has`/`should`/`can`-prefixed booleans.
- `PascalCase.tsx` components · `camelCase.ts` hooks and utilities · `UPPER_SNAKE_CASE.ts` or `constants.ts` for constants.

## Security

- Never `dangerouslySetInnerHTML` on unsanitized input; validate URL schemes before they reach `href`/`src`; `target="_blank"` always pairs with `rel="noopener noreferrer"`.
- A Server Action carries the same trust level as a public endpoint — validate every input, authenticate and authorize inside the action itself.
- Framework "public" env prefixes (`NEXT_PUBLIC_*`) are bundled to the client — never put a secret behind one.
- CSP with per-request nonces; avoid `unsafe-inline` / `unsafe-eval` in `script-src`.

## Performance & UI

- Explicit width/height on images, lazy-load below the fold, cap at two font families, animate only compositor-friendly properties (`transform`, `opacity`, `clip-path`).
- Core Web Vitals bar: LCP < 2.5s, INP < 200ms, CLS < 0.1.
- Visual work needs 4+ of: real hierarchy, intentional spacing rhythm, depth/layering, a deliberate type pairing, semantic (not decorative) color, designed hover/focus/active states, editorial or bento composition where it fits, texture/atmosphere where it fits, motion that clarifies flow, data-viz as part of the design system. No generic card grids, no stock centered-headline hero, no unmodified library defaults passed off as finished.
