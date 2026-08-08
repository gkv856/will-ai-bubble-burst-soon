# Design System — not yet generated

This file previously contained a corrupted, wrong-context design system (an
"Automotive Silicon Story" landing-page theme — dark OLED, Fira Code, scroll
storytelling) left over from an earlier/unrelated ui-ux-pro-max run. It did
not describe this project. The corrupted content and a UTF-16 encoding bug
(the file was saved as UTF-16LE, one null byte after every character) were
both cleared 2026-08-06.

This project has no persisted MASTER design system yet. The only deliberate,
documented visual language that exists today is "Depth" (../fe-design.md),
and it explicitly scopes itself to full-page, single-focus screens (/start,
the setup wizard) — not dashboards or data-dense surfaces.

## When you're ready to generate a real one

Most of this product (dashboard, statements, entity-canvas, control-accounts,
drilldown, audit, calc, chat) is "Operate" mode — dense, task-focused,
frequent-use — a different design problem than Depth solved. Run:

```bash
python3 .agents/skills/plan-ui-change/ui-ux-pro-max/scripts/search.py \
  "financial modeling audit-ready dashboard fintech professional dense-data" \
  --design-system --persist -p "Financial Modeling OS" --stack shadcn
```

with real project language (not generic placeholders), then sanity-check the
output against ../fe-design.md and .agents/rules/web/design-quality.md
before treating it as authoritative. Don't run this speculatively — per this
project's ship-fast convention, generate it when an actual surface is being
redesigned, not ahead of need.

Verify the file stays UTF-8 after any future write here — check with
`file <path>` or `xxd <path> | head` before trusting it; this file was
previously silently re-saved as UTF-16LE (readable in an editor, garbled
everywhere else) and it's not obvious from a normal Read.
