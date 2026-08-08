---
name: docs-sync
description: Write .agents/docs/steps/ build records, keep .agents/docs/agentic/ in sync, maintain .agents/docs/features/ (plain-language, problem/solution/impact write-ups, one file per user-facing feature plus an index), and correct AGENT.md's project map at the end of any working session that made a change worth recording. Use PROACTIVELY after ANY session that touched meaningful functionality — not just agent code. Writes one .agents/docs/steps/NN-*.md entry (following .agents/docs/steps/README.md exactly); when the session touched agent behavior, surgically corrects .agents/docs/agentic/*.md for stale claims; when the session shipped or changed a user-facing feature, creates or updates the matching .agents/docs/features/*.md and its README.md index; when the session changed the project's architecture, invariants, foundational docs, or dev commands, surgically corrects AGENT.md. Also triggers when the user explicitly asks "write the step file," "document this session," or "update the docs."
metadata:
  type: process
---

# Docs Sync

## What this keeps in sync

Four living documents need updating when a session lands real changes:

- `.agents/docs/steps/*.md` — the **build record**: what got built and why, one file per step, in order. Covers any change significant enough that a future developer would need context to understand it.
- `.agents/docs/agentic/*.md` — the **agent product docs**: how the modeling agent currently works. Only relevant when the session changed agent behavior.
- `.agents/docs/features/*.md` — the **feature docs**: plain-language problem/solution/impact write-ups, one file per user-facing feature (not per session), plus a `README.md` index. Only relevant when the session shipped or meaningfully changed a user-facing feature.
- `AGENT.md` (repo root, also read as `CLAUDE.md`) — the **project map**: architecture layer descriptions, key invariants, the documentation map table, and dev commands. Only relevant when the session changed one of those things, not for routine feature work.

## Procedure

### Step 1 — .agents/docs/steps/

Read [`.agents/docs/steps/README.md`](../../../.agents/docs/steps/README.md) live — it is the canonical, always-current guide. Do not rely on memory of it.

It specifies:

- **Whether a step file is needed at all** — routine renames, typo fixes, and test-only changes don't warrant one; only changes a future reader would need context to understand.
- **Numbering** — list the folder, take the highest `NN` + 1. Numbers are sequential across the whole project, not per-topic.
- **Filename** — `NN-kebab-case-title.md`, short and specific to the change.
- **Frontmatter** — required on every file; exact format is in the README. The `description` field should be dense enough to judge relevance without reading the body.
- **Two body styles** — choose one per file based on audience and nature of the change:
  - **A. Technical build-record** — for routine feature/fix builds where the reader is a developer about to work in the same code. Sections: `## Why`, `## What we built`, `## Verified`, `## Not built (this step)`, `## What's next`.
  - **B. Plain-language problem/situation/solution/impact** — for investigation-and-fix narratives or when the audience doesn't need file/symbol-level detail. Sections: `## The problem`, `## The situation`, `## The solution`, `## Verified`, `## The impact`, `## What's next`.
- **`## Verified`** — cite real test/run output, never an expectation. This is what makes it a build *record*, not a plan.
- **`## Not built (this step)`** (style A only) — name scope cuts explicitly so a gap isn't mistaken for an oversight later.

### Step 2 — .agents/docs/agentic/ (only when agent behavior changed)

Skip entirely if the session didn't touch `backend/llm/ops_chat/`, `backend/llm/google_client/`, `backend/domain/knowledge/`, or their tool/dispatch/prompt/grounding behavior.

When it did, follow [`references/agentic-sync-playbook.md`](references/agentic-sync-playbook.md). Short version:

- Read `.agents/docs/agentic/README.md`'s `> Updated YYYY-MM-DD...` banner first — it says what's already been reconciled.
- `grep` the changed function/behavior names across `.agents/docs/agentic/*.md` — don't guess which files are affected.
- Classify each hit: **now false** (fix immediately, highest priority) / **now incomplete** (extend, keep what's still true) / **unaffected** (leave alone — don't rewrite accurate prose just because you're in the file).
- Prefer surgical edits. A full-file rewrite is only warranted when drift is severe across most of a file's claims — this should be rare.
- Update the `> Updated YYYY-MM-DD...` banner. If this pass corrects something a prior pass got wrong, say so explicitly — a silent "Updated" loses the "why did this change" signal.
- Check Quick Facts, the architecture-layers diagram, and Key Design Principles specifically — these are read in isolation and are the highest-cost place for a stale claim to hide.
- Verify every internal link still resolves after edits.

### Step 3 — .agents/docs/features/ (only when a user-facing feature shipped or changed)

Skip entirely if the session was internal-only: refactors, test-only changes, API/module reshuffles, or a bugfix with no behavior a user would notice. This bar is *higher* than the one for `.agents/docs/steps/` — every meaningful change gets a step file, but only changes to what the product actually does for a user earn a feature doc.

When it did, follow [`references/feature-docs-playbook.md`](references/feature-docs-playbook.md). Short version:

- Read `.agents/docs/features/README.md` first — it's the index of every existing feature file. Check whether this session's change belongs to an existing feature or is genuinely new.
- **Existing feature** — open its file, classify what changed the same way as the agentic-docs step (now false / now incomplete / unaffected), and surgically update `## Solution` and/or `## Impact`. Don't rewrite `## Problem` unless the underlying problem itself changed. Add the new step file to its "Built in" list. Bump the `_Last updated_` line.
- **New feature** — create `.agents/docs/features/<kebab-slug>.md` from the template in the playbook: `## Problem`, `## Solution`, `## Impact`, `## Built in`. Plain language throughout — no file paths, function names, or code symbols; a non-technical reader is the audience. Add a row to the index table in `.agents/docs/features/README.md`.
- Keep `.agents/docs/features/README.md` itself non-technical — it's an index for humans deciding what to read, not a spec.

### Step 4 — AGENT.md (only when the project map itself changed)

Skip entirely unless this session did one of these — most sessions don't:

- Added, removed, or renamed a top-level module (a new `backend/xxx/` layer, a new frontend surface with its own README, etc.) that the `## Architecture` bullets don't yet describe.
- Changed which layer owns a piece of logic (e.g., something moved out of `backend/domain/` into a new package) such that an existing `## Architecture` bullet is now wrong.
- Added, removed, or changed a `## Key invariants` guarantee.
- Created a new **foundational** doc that a future session would need to be pointed at before touching an area — the kind of doc that belongs in the `## Documentation map` table (architecture notes, hard rules, scope specs). A `.agents/docs/steps/` entry or a `.agents/docs/features/` entry does **not** qualify; those are covered by Steps 1 and 3 and must never be added to this table.
- Changed how local dev is run (`start-dev.bat` behavior, ports, a new frontend-only or backend-only command) such that `## Commands` is now wrong.

When one of these applies:

- Read `AGENT.md` live (repo root) — don't rely on the cached copy from context, and don't edit `CLAUDE.md` (it's just an `@AGENT.md` import).
- Make surgical, single-line edits matching the file's existing terseness — this file is deliberately short (~80 lines) as a fast orientation map, not a spec. Don't pad it with prose explaining what the code already says.
- **Never restate milestone status here.** The `## Scope gate` section is explicit that `.agents/docs/milestones/milestones.md` is the only status authority — if the session closed a blocker or finished a milestone, that update belongs there, not in AGENT.md.
- If adding a `## Documentation map` row, keep it to the existing two-column style: doc link, and a short "when to read" hook — not a description of the doc's contents.
- Leave `## Rules` alone unless the user explicitly changed one of those constraints (git/LLM-call/pytest rules) — those are workflow guardrails, not something a feature session should touch.

### Step 5 — Report

State plainly: which step file was written (or why none was needed), which `.agents/docs/agentic/` files were touched and what specifically was corrected, which `.agents/docs/features/` file was created or updated (or why neither applied), whether `AGENT.md` was touched and what specifically changed (or why it didn't apply), and confirm all links resolve.

## When NOT to trigger

- A change with no developer-visible behavior difference (comment fix, rename, test-only change).
- Mid-session, before the change has landed and been verified — run at the END of a working session, against what was ACTUALLY built and tested, never against a plan still in flight.

## References

- [`.agents/docs/steps/README.md`](../../../.agents/docs/steps/README.md) — always read live; authoritative on step format, numbering, and both body styles. Deliberately not duplicated here.
- [`.agents/docs/agentic/README.md`](../../../.agents/docs/agentic/README.md) — current agent product docs; the `> Updated` banner is the fastest orientation for what's already reconciled.
- [`references/agentic-sync-playbook.md`](references/agentic-sync-playbook.md) — depth guide for the agentic docs half (step 2 above), with a worked example.
- [`.agents/docs/features/README.md`](../../../.agents/docs/features/README.md) — the feature index; read live before deciding new-vs-existing.
- [`references/feature-docs-playbook.md`](references/feature-docs-playbook.md) — depth guide for the feature docs half (step 3 above), with the file template and a worked example.
- [`AGENT.md`](../../../AGENT.md) — the project map; read live before editing (step 4 above). Edits here should be rare and surgical.
