---
name: plan-a-fix
description: Engineering gate for this repo — run before code is written, and before any analysis or recommendation is finalized. Classifies the request (bug fix / feature / refactor / exempt), routes on what is actually missing, and answers in 1-7 sentences plus an everyday example, never writing a full plan unless the user asks for one in words ("plan it end to end", "draft a plan", "build it"). Asking how something would be fixed is not a plan request. Runs 7 repo-tuned checks including milestone and value-statement alignment. Use for "should I build X", "how would you approach X", any bug fix, any new component/utility/feature, any refactor, or a new gate placed in front of existing logic. Not for typos, dependency bumps, already-approved work, or throwaway spikes. SCOPE — code about to be written in this repo. A non-engineering choice between options belongs to strategic-thinking-frameworks; a broken system needing diagnosis belongs to question-os; open-ended exploration belongs to mental-models.
metadata:
  type: process
  status: active
  last_reviewed: 2026-08-05
---

# plan-a-fix

Plans and advises. Output is a classification, a short answer, or a plan — never a diff. Supersedes `think-fix`, retired 2026-08-05.

Most bad engineering isn't wrong, it's premature: a fix sized to the bug report instead of the mechanism, a feature sized to what's easy to build instead of what's on the roadmap, code sized to what's fast to type instead of what already exists. Every gate here exists because that already happened in this project.

**Boundaries.** This skill owns engineering work in this repo, because its gates are repo-specific — milestones, value-statement, the coding standards. It does not own general decision-making. A choice between options with no code attached → `strategic-thinking-frameworks`. A system misbehaving where the diagnosis, not the patch, is the hard part → `question-os` (then come back here to plan the fix). Open-ended "what am I missing" → `mental-models`. Name the handoff rather than half-running the other skill's job.

## Step 0 — Exempt, classify, route

**Exempt:** typo, copy, comment, formatting · dependency bump with no API change · work the user already scoped and approved · a one-time data correction (the root-cause gate targets recurring logic, not one bad record) · a spike, said out loud to be a spike.

**Override:** if running a gate costs more than the change, and the change is reversible with a small blast radius, skip it and say so. A silent skip reads as an oversight later.

**Gameability check — every gate below is self-scored by the same party that wants to write the code.** Before accepting an exemption: _if I wanted to skip the work, which label would let me — and is that the label I just picked?_ "It's only a spike" and "they already approved it" are the two that get abused. Name the exemption you're claiming; an unnamed exemption is an evasion.

**Route on what is actually missing**, not on what the request is about:

| Missing         | What it means                                       | Route                                                                  |
| --------------- | --------------------------------------------------- | ---------------------------------------------------------------------- |
| **Information** | You don't know how the code actually behaves        | Read it first. Say so and stop — never plan on unknown ground.         |
| **Options**     | No approach comes to mind                           | Gate 3 (reuse). The approach almost always already exists in the repo. |
| **Judgment**    | Approaches exist, you can't rank them               | Draft-a-plan, 3 candidates ranked.                                     |
| **Nerve**       | You know it isn't on the roadmap and want it anyway | No gate fixes this. Say the honest answer: don't build it.             |

**Then classify, which decides what to read:**

| Intent                                                                      | Read in `references/`               |
| --------------------------------------------------------------------------- | ----------------------------------- |
| **BUG FIX** — something is broken                                           | `build-gates.md` → gates 4, 5, 6    |
| **NEW FEATURE** — something new is added                                    | `build-gates.md` → gates 2, 3, 5, 6 |
| **REFACTOR** — shape changes, behavior doesn't                              | `build-gates.md` → gates 2, 5, 6    |
| _+ the plan writes Python / FastAPI_                                        | `standards-python.md`               |
| _+ the plan writes TS / React / Next / CSS_                                 | `standards-web.md`                  |
| _+ it touches an agent loop, system prompt, tool definition, or model call_ | `agent-loop.md`                     |

Read only the rows that apply. A backend bug fix has no reason to load the React hook rules; a plan that touches no agent loop has no reason to load the LLM call budget. Step 8 always runs and needs none of these files.

## Step 1 — Mode

### The hard cap — read this before writing anything

**Every answer is 1-7 sentences.** One budget, all modes, no exceptions. Not 8. Not "7 sentences plus a short list". Not "7 sentences plus a code block". The only thing that lifts this cap is the user asking, in words, for a full plan — see mode 3's trigger list, which is deliberately narrow. Use as few of the 7 as the answer needs; a good answer in 2 sentences beats a padded one in 7.

**Asking *how* is not asking for a plan.** These all stay under the cap: "how would you fix it", "how exactly would you do it", "what's the fix", "I think you need to do X — is that right?", "what would you change". A user naming the mechanism themselves is not permission to write a work order; it means they're thinking out loud with you. If it genuinely reads like they want the full thing, **answer inside the cap and ask** — one line: _"want the full plan?"_ — rather than assuming and spending 800 words.

**Mode is sticky.** Brainstorm is the default and it *stays* the default across follow-ups. A follow-up, a challenge, a "why", a "what about X", agreeing with you, or restating your suggestion in their own words — none of these are exit triggers. Drifting into a full plan because the topic got interesting, or because the user sounded ready, is how this skill fails in practice.

**1. Brainstorm — the default.** For "should I", "what do you think", "is X a good idea", "how would you approach this", or anything where nothing is being built yet.

Output: **1-7 sentences, plus one everyday example.** Commit to one answer — don't lay out options and let the user pick. Fold in only the Step 8 checks that actually tripped; if none did, say so in a clause. **No headers, no bullet lists, no ceremony, no padding to look thorough. This file is all this mode needs — open nothing in `references/`.**

**Write it the way you'd say it out loud to a friend who doesn't code.** The rest of this file is written in dense technical prose. Do not copy that voice into the answer — it is the single most likely reason this mode comes out too complicated. Three rules, all checkable:

- **Short words, short sentences.** Most sentences under 20 words. If a plainer word exists, use it: use (not utilize/leverage), show (not surface), the one we already have (not canonical), what's actually causing it (not the mechanism), too early (not premature), what breaks if it goes wrong (not blast radius), safe to run twice (not idempotent), unrelated (not orthogonal), what it knocks over next (not second-order effect), add logging (not instrument).
- **The example comes from outside software** — kitchens, cars, post, shops, weather, queues. If understanding it requires knowing how code works, it isn't an example, it's the same sentence again in different clothes.
- **Name the thing, don't label it.** "Nothing on the roadmap asks for this" beats "gate 2 fails". Say what's true, not which gate said it.

Two worked answers, for calibration:

> **Q: "Should I add a cache in front of the model list endpoint?"**
> ✗ _Too complex:_ "NEW FEATURE with no named commitment — gate 2 fails. The necessity check flags this as infrastructure ahead of its problem; there's no measured latency issue, and caching introduces invalidation coupling between the store and the endpoint."
> ✓ **Plain:** "I'd skip it for now — nothing on the roadmap asks for it, and it isn't actually slow yet. A cache is like keeping a photocopy of a form on your desk: fast, until someone updates the original and you don't notice. Add it when you see it running slow."

> **Q: "Can I fix this by checking if the message contains 'convert'?"**
> ✗ _Too complex:_ "That's a keyword patch against one phrasing rather than the underlying mechanism. The classifier has no visibility into model state; the generalizing fix inverts push to pull."
> ✓ **Plain:** "That catches this one wording, and the next wording breaks it again. The part making the decision is guessing before it can see what's there — like a bouncer checking IDs with his eyes shut. Better to let the part that already knows ask for what it needs."

**2. Explain — only when the user asks for detail. Maximum 7 sentences.** Triggered by "more detail", "explain that", "why do you say that", "walk me through it", "go deeper", "how exactly". Same analysis as brainstorm and **the same plain voice — more room is not permission to get technical**; the reasoning behind the recommendation, and which Step 8 checks were considered and passed quietly. Count the sentences before sending. **Still no file plan, no sequence, no implementation detail** — those are the next mode's job, and producing them here is the failure this mode exists to prevent. Open a `references/` file only if a specific gate is what the user asked about.

**3. Draft-a-plan — the only mode without a length cap, so the trigger is deliberately narrow.** The user must ask for a plan **in words**: "plan it end to end", "draft a plan", "write the full plan", "detailed plan", "build it", "implement it", "ship it".

Not triggers, no matter how ready they sound: asking how you'd fix it · naming the mechanism themselves · agreeing with your recommendation · "makes sense, do that" · a long or detailed question · you feeling confident about the answer. **When in doubt, stay capped and ask.** An unwanted plan wastes the user's time and buries the answer they actually wanted; a one-line offer costs nothing.

Read the files Step 0 routed you to, then output:

1. **Commitment.** The gate 2 citation (`"serves M20"` / `"closes B3"`), or the statement that it maps to nothing — which is a stop, not a footnote.
2. **Reuse.** What gate 3 searched, and why it didn't fit.
3. **Three candidate approaches, ranked.** Exactly three — one is a guess, ten is a brainstorm dump. Per candidate: the shape of it, and its main tradeoff. Recommend **one** and commit; say in a sentence each why the other two are weaker. Those two are the rejected-approach record — a plausible-but-wrong path, unsaid, gets re-proposed next month.
4. **File plan** (recommended candidate only). Per file: path, purpose, one line on why it's shaped that way, line estimate against gate 5b's limits, typing approach.
5. **Sequence.** What is built in what order, and why that order.
6. **Verification.** What fails if this is wrong; which checks this skill may run itself, which are handed over with the exact command; and the **kill criterion** — the observation that means the approach was wrong and the answer is to go back to diagnosis rather than push harder. A plan without one is a belief.
7. **All 7 of Step 8**, one line minimum each.

A plan is not code. Implementing it is a separate, later action.

## Step 8 — The 7 checks `ALWAYS`

Brainstorm surfaces only what trips, inside the sentence budget. Explain names the ones that were considered and passed. Draft-a-plan states all 7. None of these need a `references/` file. Applied generically they're worthless — every line must name something specific to this change.

1. **Inversion.** Not how it succeeds — what would guarantee it fails, then confirm none of it holds. A new gate fails by over-firing on trivial work until it's ignored; Step 0's exemptions exist for exactly that.
2. **6-month survival.** With the original pressure gone, is this still right, or a patch becoming debt? It earns a permanent place only if the condition that justified it can recur.
3. **Vision / mission / value.** Serves "fast to build, impossible to get wrong, full Excel export" and "correct by construction"? Check `value-statement.md`'s claims and its "what NOT to say yet" list — never imply a claim the code doesn't back.
4. **Milestone flag.** No named commitment in `milestones.md` and no blocker in `value-statement.md` §5 → **advise against building it**, before any implementation detail.
5. **Innovation.** Moves the differentiator (deterministic engine, Excel parity, audit trail) forward, or is it table stakes? Not feeling novel usually means it already exists — re-run gate 3.
6. **Cheapest.** Smaller, simpler route to the same outcome? Re-check gates 3 and 5a; the cheapest version almost always extends something rather than adding beside it.
7. **Necessity.** Needed, or infrastructure built ahead of its problem — a multi-agent system where one agent and a tool call already does it? An empty gate 2 already answered this: no.

## Step 9 — Close out

- **Name what you did NOT do**, so a scope cut isn't read as an oversight.
- **Report faithfully.** Failing tests get the actual output; a skipped step gets named with its reason; done and verified is said plainly, unhedged.
- **When the stakes are high and the answer already feels settled**, say the one useful sentence a self-run checklist can't replace: get a second pair of eyes with standing to disagree. Every gate here is self-scored; that's the only thing that closes the loop.

## The run has FAILED if

- **The answer ran past 7 sentences without the user having asked for a plan in words.** This is the top failure. Count before sending.
- A plan was written because the user asked *how*, named the mechanism, or agreed with a recommendation — none of which are plan requests.
- The answer used headers, bullet lists, or implementation detail nobody asked for. Escalation happens on the user's trigger, never on the model's enthusiasm.
- All 7 sentences were spent when 2 would have done. The cap is a ceiling, not a target.
- A brainstorm or explain answer landed without an everyday example, or the example needed knowledge of the codebase to make sense.
- The answer named a gate number, quoted the skill's own vocabulary back at the user, or used a word from the replace-list above.
- Any sentence would survive being pasted into a different problem unchanged.
- An exemption was taken without naming which one.
- The 7 checks were recited as a list rather than applied — or a check produced no specific claim about this change.
- A plan offered one approach with no ranked alternatives, or three that are the same approach reworded.
- A bug fix was proposed without a causal chain.
- The recommendation intervenes on the symptom the bug report named.
- The user's framing was wrong and the answer went along with it anyway. Correct diagnosis outranks agreement.

## Checklist

- [ ] **0** Not exempt (exemption named if claimed) · gameability check run · bottleneck routed · classified · read only the routed files
- [ ] **1** Sentences counted — ≤7 always, uncapped only if the user asked for a plan in words
- [ ] **2-7** _(draft-a-plan only)_ commitment named · reuse searched · mechanism not symptom · canonical implementation checked · 3 candidates ranked, 1 recommended · verification run or its absence stated · kill criterion given
- [ ] **8** All 7 run; flags surfaced, not smoothed over
- [ ] **9** Scope cuts named; outcome reported unhedged
- [ ] Read back against "the run has FAILED if"

## Project anchors

Live pointers, never copied inline — a copy goes stale the moment the original changes. Paths from repo root:

- `AGENT.md` — architecture invariants, hard operational rules, root scope gate
- `.agents/docs/strategy/vision.md` — the north star
- `.agents/docs/strategy/mission.md` — how the vision gets delivered
- `.agents/docs/strategy/value-statement.md` — differentiator, evidence per claim, what not to say yet, blockers, the stop line (renamed from `positioning.md` 2026-08-05, content unchanged)
- `.agents/docs/milestones/milestones.md` — the only status authority
