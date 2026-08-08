# plan-a-fix — agent & LLM-loop gate

Part of `plan-a-fix` (`../SKILL.md`), gate 7. **Read only when the change touches an agent loop, system prompt, tool definition, or model-call path.** Most plans never open this file.

## Design rules

- Ship a control-flow change (a new pause, refusal, or gate) with the instrumentation that would catch its own overcorrection — log the _reason_, not just that it fired. _(A pause added for one bad calculation later needed a `pause_reason` field threaded through specifically to catch it over-firing on ordinary edits.)_
- Split "I don't recognize this" from "I recognize it but don't know the method" into two exits — collapsing them produces either improvisation or over-pausing. Never let the model invent a method it wasn't given; that's the same failure class as inventing a value.
- A new per-turn tool-call round is a cost, not a UX nicety — weigh it against combining calls, gating availability on state already tracked, or pre-resolving what needs no round trip.
- Prefer targeted reads (structural search, narrow record fetches) over full-context dumps; delegate open-ended research so raw exploration doesn't enter the main context.

## Live LLM call budget — hard stop, no exceptions without explicit confirmation

1. State the expected call/turn volume before any batch and get explicit confirmation. Never launch silently.
2. Never run two batches concurrently.
3. On 429 / RESOURCE_EXHAUSTED: stop immediately, never retry in a loop, report plainly.
4. Check cumulative usage first: `cd backend && python scripts/agent_report.py`.

_(30+ live turns across 4 batches ran in one session, two of them concurrent, with no token logging in place — the provider's monthly cap was hit mid-batch, and no estimate had been given before any of it started.)_
