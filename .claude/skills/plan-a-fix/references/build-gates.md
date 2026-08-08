# plan-a-fix — build gates

Part of `plan-a-fix` (`../SKILL.md`). **Draft-a-plan mode only** — brainstorm never opens this file, and explain mode opens it only if a specific gate is what the user asked about. Step 0 already told you which gates apply; run those, skip the rest. Stack-specific coding standards are not here — see `standards-python.md` / `standards-web.md`, and `agent-loop.md` for model-call paths. Numbering matches SKILL.md's cross-references.

---

## Gate 2 — Scope `NEW FEATURE, REFACTOR`

> **What named, pre-existing commitment does this serve?**

Answer in one line, before any implementation detail, so it can be vetoed in one word: `"serves <M/R-number>"` or `"closes <B-number>"`. Maps to nothing → **say so and stop.** That is the entire gate.

Source of truth: `docs/milestones/milestones.md` (the only status authority — never restate a milestone's status anywhere else, including here) and `docs/strategy/value-statement.md` §5 for blockers. A commitment marked **Deferred** or **Cut** is a scope-creep signal when re-proposed, not a gap to fill.

**Silence is not permission.** The absence of a named commitment in your own output is the red flag — don't wait to be asked.

_(A complete, on-roadmap-looking recipe system — seed script, schemas, store methods, frontend components, a slash-command picker — was built and reverted the next day, 2026-08-03, because this check sat at the bottom of a file nobody re-read at the moment of deciding. Say the commitment first, out loud, before anything else.)_

---

## Gate 3 — Reuse `NEW FEATURE`, and any new code inside a plan

> **What did I search, and why didn't it fit?**

Can't answer both halves → this gate hasn't happened. Before writing anything new:

1. Existing code in this repo first — grep the pattern, check the neighbouring module.
2. Library and vendor docs second — confirm real API behavior before coding against a remembered signature.
3. Broader web search only after those come up short.
4. Package registries (npm, PyPI) before hand-writing a utility.
5. Anything solving 80%+ of the problem gets adapted or wrapped, not rewritten.

House rule: _"We don't want to reinvent the wheel — there are a lot of out-of-box tools and packages available. Reuse them. Stay up to date."_

**Failure signal:** a hand-rolled date formatter, retry loop, deep-clone, or debounce.

---

## Gate 4 — Root cause `BUG FIX`

> **Does this fix cover the next five phrasings of the same problem, or just this one?**

Just this one → keep digging. You've found a trigger, not a mechanism.

**Write the causal chain before proposing anything** — one line, arrows, root cause to observed symptom:
`pre-turn classifier can't see model state → routes maintenance request as a mutation → confirm dialog fires → user reports "it asks me twice"`
If you can't write that line, you haven't diagnosed it. Go back. The chain is the artifact that proves the mechanism was found; "I looked into it" is not.

**Reject patchwork.** A fix shaped like _"detect this specific phrasing / keyword / example and special-case it"_ gets rejected even when it's small, correct, and low-risk — small and correct is exactly what makes patchwork tempting.

**Signal vs. patch, concretely.** _"This message references an existing, ID-resolved entity"_ is a structural signal already in the system — it generalizes. _"This message contains the word 'convert'"_ is a keyword patch for one phrasing — it needs a sibling next week. Find the signal the system already has and isn't consulting; the generalizing fix is rarely new information.

**Guessing a method is the same failure as guessing a value.** If a rule forbids inventing data the user didn't supply, it extends to inventing logic. A component that classifies or routes _before_ it can observe real state will misroute confidently — prefer pull (the consumer requests capability when it knows it needs it) over push (a gate decides in advance).

**Removal is a legitimate fix shape.** Don't assume the fix must be additive. Ask whether the component should exist at all before designing its safeguard.

_(A plain maintenance request was misrouted by a pre-turn classifier with zero visibility into model state. Two patches were proposed and rejected — a regex, then a confirm-before-mutate gate that was tried and made things worse. The accepted fix deleted the classifier and replaced push with pull.)_

**Failure signal:** the fix names a specific input from the bug report.

---

## Gate 5 — Shape `ALL`

> **Does a canonical implementation already exist, and is the new one built the way this repo builds things?**

### 5a. DRY & architecture

- Same conceptual action implemented differently across files is a bug, not a variation — extend the fuller implementation, thread it everywhere, delete the narrower one. _(Four tabs had each grown their own label-only rename dialog instead of reusing the one full edit dialog that already existed.)_
- Parallel systems solving the same problem get merged, not kept "just in case" — even when each works independently. _(`docker-test.bat` and `start-dev.bat` overlapped; one was deleted, not documented-as-an-alternative.)_
- Check for the canonical implementation before adding one — shared filter, config, component, or helper gets imported, never redeclared.
- A doc restating another doc is the same violation — cite and summarize in one line, never copy the content.
- A domain-agnostic core stays domain-agnostic — no domain vocabulary leaks in from the layer built on top.
- One brain, two faces — when two consumers must agree on a value (a live evaluator and a compiler, a client and a server validator), both read the _same_ structure. Never compute a value in a second place.
- Validate-then-commit — mutating operations validate first and roll back cleanly; never commit partial state.
- KISS: the simplest solution that actually works beats the clever one. YAGNI: don't build for a need that doesn't exist yet.

### 5b. File & function limits

- Utility file ≤200 lines · component ≤400 (150-300 typical) · any file ≤800 · function ≤50.
- **Extract first, then change** — if an edit would push a file past its limit, restructure before adding to it.
- One component (and its own props type) per file — no exception for "it's tiny" or "only used here."
- Hardcoded config/data arrays (tab lists, nav items, option lists) get their own file; the component imports the constant.
- Nesting past 4 levels, or a prop chain 5+ deep → early return, context, or a shared abstraction. Don't extend the chain.

### 5c. Logging & comments `both stacks`

- Logs carry a `[ServiceName]` prefix, no emoji or emotional language, a pre-built data object rather than an inline literal, and a level matching severity.
- Comments explain **why**, never what the code already says — 1-2 lines, no commented-out code left in place.

**Failure signal for this gate:** a new `*Utils` file, or a second component doing 80% of what an existing one already does.

---

## Gate 6 — Verification `ALL`

> **What would fail if I'm wrong, and did I actually run it?**

- A compile check (`tsc --noEmit`, `py_compile`) proves parsing, nothing about whether new logic fires at the right time. Say plainly when behavioral verification hasn't happened — never let a green compile imply it did. _(A prompt edit that "compiled" was once nearly marked done on that basis alone.)_
- Confirm against a second, differently-shaped case, not just the original failure — one passing example proves nothing about the class.
- N booleans feeding a decision → walk all 2^N combinations, confirm each matches prior behavior except the intended delta.
- **Hard-delete retired code immediately; don't orphan it.** The clean type-check after deletion is the proof of completeness, not a courtesy — orphaned code lets a missed reference silently keep working.
- State the estimate — a new file's expected size, a batch's expected call count — before building, so deviation is visible instead of silently absorbed.
- Severity: CRITICAL (security / data loss) blocks, HIGH should block, MEDIUM/LOW informational. Auth, user input, DB queries, file paths, external calls and financial-calculation logic get a dedicated security pass. Coverage bar: 80%.
- **Kill criterion.** Name the observation that means the approach itself was wrong — not that a test failed, but that the diagnosis was. Without it there's nothing to distinguish "needs another iteration" from "go back to gate 4."

**Operational guardrails — read before running anything:**

| Action                   | Rule                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Git                      | **Never** — no commit, reset, rebase, push, pull, merge, checkout, or worktree creation. Read-only `log`/`status`/`diff` is fine. The user owns all git state. |
| LLM tests                | **Never run** `-m llm` or any LLM test file. `--collect-only` is the ceiling.                                                                    |
| Non-LLM `pytest`         | Bare `pytest` is safe (`pytest.ini` defaults to `-m "not llm"`) but is not run proactively — only when asked.                                    |
| Dev servers              | **Never start one.** Ask the user to run `start-dev.bat` — the only launch path — and wait for confirmation before any check that depends on it. |
| Lint / build / typecheck | Not proactive. Make the change, stop, name the command that would verify it; run it only if asked.                                               |
