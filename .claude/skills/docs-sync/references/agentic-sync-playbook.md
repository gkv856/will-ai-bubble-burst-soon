---
name: agentic-sync-playbook
description: Detailed how-to for the "does docs/agentic/ need updating" half of the docs-sync skill, with a worked example.
---

# The `docs/agentic/` sync playbook

This is the depth version of SKILL.md's step 2. Read that first for the
summary; come here when you're actually doing the edit.

## Step 1 — Read the current banner, not your memory

Every file in `docs/agentic/` opens with a `> Updated YYYY-MM-DD against the
real code (...)` banner naming what was reconciled and often what the
PREVIOUS version got wrong. This tells you the baseline you're working from
— don't assume the docs are stale everywhere just because you're about to
touch them; most of the file is probably still accurate.

## Step 2 — Find every affected claim, don't guess

`grep` the exact function/behavior names your session's change touched,
across all of `docs/agentic/*.md` at once:

```bash
grep -rn "the_function_or_tool_name\|the_old_behavior_phrase" docs/agentic/
```

A change can surface in more than one file — README.md's overview, the
architecture diagram, a numbered example walkthrough, AND
05-tools-reference.md's own per-tool section can all describe the same
mechanism from different angles. Missing one leaves a real inconsistency
between two files a reader might compare.

## Step 3 — Classify, don't blanket-rewrite

For each hit:

| Classification | What to do |
|---|---|
| **Now false** | The claim is actively wrong after this session's change. Fix it — this is never optional, and it's the highest-priority edit (a wrong claim is worse than a missing one). |
| **Now incomplete** | Still true, but missing the new nuance. Extend it — add a sentence/section, don't delete what's still accurate. |
| **Unaffected** | Genuinely untouched by this session. Leave it alone. Resist the urge to "clean up while you're in the file" — an edit with no reason invites a reviewer to wonder what changed and why. |

A full-file rewrite is justified only when drift is severe across MOST of a
file's claims (not one section) — this should be rare. The 2026-07-19 pass on
`docs/agentic/` was a rewrite because the prior version was silent on whole
subsystems (the fast path, pre-injection, the balance backstop, escalation)
— that's a different situation from a single claim going stale.

## Step 4 — Update the banner, honestly

```markdown
> Updated 2026-07-20 against the real code (backend/llm/, backend/api/routes/chat.py) —
> the previous version had drifted: [...]. This pass (Phase 2.5, docs/steps/48) fixed
> a real gap the 2026-07-19 pass's own "tool gating" description overstated: see
> "Dispatch-Level Enforcement" below.
```

If this pass corrects something a PRIOR pass got wrong, say so explicitly
(as above) — a silent "Updated" with no note of what changed makes it look
like routine maintenance instead of a real correction, and a future reader
loses the "why did this change" signal.

## Step 5 — Check the "at a glance" sections specifically

These three are read in isolation more than any other section (a developer
skimming, not reading start to end) and are therefore the highest-cost place
for a stale claim to hide:

- **Quick Facts** (bulleted, end of README.md) — each bullet is a factual
  claim about current behavior; verify against the code, not memory.
- **The architecture-layers diagram** (the box-and-arrow text diagram in
  README.md) — a new mechanism (a new guard, a new gate) belongs as an
  annotation on the relevant box, not just prose elsewhere.
- **Key Design Principles** (numbered list, README.md) — these are the
  claims most likely to get QUOTED elsewhere; a wrong one propagates.

## Step 6 — Verify links

After editing, re-check every `[text](0N-file.md)` / `[text](README.md)` /
`[text](../interim/*.md)` link in every file you touched still resolves —
a rename or a moved anchor breaks silently otherwise.

## Worked example (docs/steps/48)

**The change**: `dispatch()` in `orchestrator.py` gained a defense-in-depth
check — a call to a tool NOT on the current turn's offered list is now
rejected, because a live run showed `find_node` getting genuinely dispatched
despite `_tool_list` excluding it from the declared schema.

**Step 2 (grep)**: `grep -rn "find_node" docs/agentic/` surfaced hits in
README.md (the Core Loop diagram, the "Search the Model" bullet, the
architecture diagram, Key Design Principles #3, Quick Facts) and
05-tools-reference.md (Tool 3's own section, the Quick Reference table).

**Step 3 (classify)**: README.md's "Tool Gating" section claimed *"the
tool's absence is the enforcement, so it can't be disobeyed"* — this was
**now false**: the live run proved a schema exclusion alone wasn't
sufficient. Everything else describing WHEN `find_node` is offered (the
`all_nodes_visible` condition itself) was still accurate — **unaffected**,
left alone.

**Step 4 (fix)**: added a new "Dispatch-Level Enforcement" subsection
explaining the two-layer defense (schema exclusion + dispatch-level guard),
corrected the one now-false sentence, and added one line to Quick Facts. Did
NOT rewrite the surrounding "Tool Gating" prose, which was still correct
about the schema-exclusion half.

**Step 6 (links)**: confirmed `README.md#dispatch-level-enforcement` (the new
anchor) wasn't referenced elsewhere yet, so no link updates needed; verified
the existing `README.md#tool-gating-find_node-is-now-conditionally-offered`
anchor 05-tools-reference.md links to still resolved (the heading text
wasn't changed, only content added under it).
