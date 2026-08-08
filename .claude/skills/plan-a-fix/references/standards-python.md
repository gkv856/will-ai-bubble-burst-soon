# plan-a-fix — Python / FastAPI standards

Part of `plan-a-fix` (`../SKILL.md`), gate 5d. **Read only when the plan writes or edits Python.** A frontend-only plan never opens this file. Stack-agnostic shape rules (DRY, file limits, logging, comments) are in `build-gates.md` gate 5 and apply regardless.

## Language

- Type annotations on every function signature — no exceptions.
- PEP 8. **black** formatting, **isort** imports, **ruff** linting, **bandit** security scanning.
- Prefer immutable structures: `@dataclass(frozen=True)` or `NamedTuple` over a plain mutable class.
- Secrets from `os.environ`, never hardcoded; redact credentials and tokens from logs.

## FastAPI

- Thin routers, business logic in services.
- `async def` plus async clients for I/O endpoints — never a blocking call from one.
- DB and auth via `Depends()`, never `SessionLocal()` inside a handler.
- Never return passwords or tokens in a response model.
- Validate JWT `exp` / `iss` / `aud` / `alg`.

## Tests

- **pytest**, categorized with `pytest.mark`, run with `--cov=src --cov-report=term-missing`.
- Coverage bar 80%. See `build-gates.md` gate 6 for what may and may not be executed — LLM-marked tests are never run.
