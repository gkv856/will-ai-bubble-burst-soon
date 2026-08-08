---
name: feature-docs-playbook
description: Detailed how-to for the "does docs/features/ need a new or updated file" half of the docs-sync skill, with the file template and a worked example.
---

# The `docs/features/` sync playbook

This is the depth version of SKILL.md's step 3. Read that first for the
summary; come here when you're actually writing or updating a feature file.

## What makes this different from docs/steps/

`docs/steps/` is a chronological build log — one entry per session, append-only,
written for a developer about to work in the same code. `docs/features/` is the
opposite axis: one file per **feature**, living and updated in place across
however many sessions touch it, written for someone who wants to know what the
product does and why — a non-technical reader who will never open a code file.

A single feature (e.g. "Playbooks") can be built across many steps (82, 86, 97,
...). It gets ONE feature file that accumulates, not one per step.

## Step 1 — Decide if this session even qualifies

Ask: did a user's experience of the product change, or was this internal?

| Qualifies | Doesn't qualify |
|---|---|
| A new capability a user can now do | A refactor with identical behavior |
| A user-visible fix to something that was broken/confusing | A test-only change |
| A meaningfully different flow for an existing capability | An internal API/module reshuffle |
| An existing feature now covers a new case | A rename, a dependency bump |

If it doesn't qualify, skip Step 3 of SKILL.md entirely and say so in the report.
This bar is intentionally higher than the one for `docs/steps/` — not every
recorded build is a feature-level change.

## Step 2 — Check for an existing feature first

Read `docs/features/README.md`'s index table. Don't assume a new file is
needed — search by keyword, not just by the exact feature name you have in
mind, since the existing file might describe the same user-facing capability
under a different name:

```bash
grep -rln "playbook\|template.*apply" docs/features/
```

If a file already covers this area, you're extending it (Step 3a). If nothing
does, you're creating one (Step 3b).

## Step 3a — Updating an existing feature file

Classify the change the same way as the agentic-docs playbook:

| Classification | What to do |
|---|---|
| **Now false** | `## Solution` or `## Impact` describes behavior that no longer exists. Fix it. |
| **Now incomplete** | Still true, but the feature grew a new case/capability. Extend the relevant section. |
| **Unaffected** | The change was internal to how this feature works, not to what it does. Leave the prose alone. |

`## Problem` almost never changes — it's the reason the feature exists in the
first place. Only touch it if this session revealed the original problem
statement was itself wrong.

Append the new step file to `## Built in`. Update `_Last updated: YYYY-MM-DD_`
at the bottom. If the feature's status changed (e.g. Beta → Live), update both
the file's frontmatter `metadata.status` and its row in the index table.

## Step 3b — Creating a new feature file

Filename: `docs/features/<kebab-slug>.md`, named for the feature itself, not
the session (`playbooks.md`, not `add-playbook-admin-panel.md`).

```markdown
---
name: feature-<kebab-slug>
description: >
  <Feature name> — one dense paragraph covering what it is, the problem it
  solves, and current status. This is what gets scanned to judge relevance
  before reading the body.
metadata:
  type: feature
  status: live   # live | beta | planned | deprecated
---

# <Feature Name>

## Problem

What was hard, slow, error-prone, or impossible before this existed —
plain terms, no jargon, a concrete example if it helps. Write for a reader
who has never seen the codebase.

## Solution

What the feature actually does, described by what a user experiences and
can now do — not by which files or functions implement it.

## Impact

What this unlocked or improved, one level up from the mechanics. Numbers if
you have real ones (from the session's `## Verified`); otherwise describe
the qualitative change.

## Built in

- [Step NN](../steps/NN-slug.md)

_Last updated: YYYY-MM-DD_
```

Then add a row to `docs/features/README.md`'s index table:

```markdown
| [<Feature Name>](<kebab-slug>.md) | <one-line problem, plain language> | Live |
```

## Step 4 — Keep docs/features/README.md non-technical

The index itself is read by people deciding what to open — keep every line in
it jargon-free. If you find yourself wanting to write a file path or a
function name into `README.md`, that detail belongs in `docs/steps/` instead,
linked from the feature file's `## Built in`, not spelled out in the index.

## Step 5 — Verify links

After editing, confirm:
- The feature file's `## Built in` links resolve to real `docs/steps/*.md` files.
- The index row's link resolves to the feature file.
- If you renamed a feature file, grep for old references to it elsewhere in `docs/features/` and `docs/agentic/`.

## Worked example

**The change**: a session added an admin panel for creating, editing, and
deleting Playbooks (pre-built formula templates), building on top of the
existing Playbooks-in-chat capability from earlier steps.

**Step 1 (qualifies?)**: yes — users (admins) can now manage playbooks
themselves instead of them being fixed at deploy time. User-visible.

**Step 2 (existing or new?)**: `grep -rln "playbook" docs/features/` finds
`docs/features/playbooks.md`, created when the original apply-in-chat
capability shipped. This is an extension, not a new feature.

**Step 3a (classify)**: `## Solution` said playbooks are "a fixed library the
agent can apply" — **now incomplete**, since they're no longer fixed. Extended
with a sentence on admin editing. `## Problem` (building common structures by
hand is slow) is unaffected — still the reason the feature exists. `## Impact`
gets one added sentence on faster iteration for whoever curates the library.

**Step 3a (Built in)**: appended the new step file's link.

**Step 5 (links)**: confirmed the appended step link resolves and the index
row's problem-statement blurb still matches the (lightly extended) `## Solution`.
