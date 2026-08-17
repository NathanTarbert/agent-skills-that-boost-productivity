# Machine Page — Agent Execution Manifest

The child page an agent reads to execute the plan. It is **not** a summary of the human page and **not** an `llms.txt`.

`llms.txt` is a discovery index — it points at content. This manifest **is** the content and the state: a task graph an agent can resume mid-way without re-reading any prose, plus checkboxes it ticks as it goes.

Success test: **an agent with no memory of the conversation can open this page alone and execute the plan correctly.** If it needs the parent page to understand a task, that task is underspecified.

## Placement

Last child block of the human page. Title it `Agent Execution Manifest` (in the user's language, e.g. `Manifiesto de ejecución`). See `notion.md` for the API calls.

## Format

Markdown with YAML frontmatter. Structural keys in English, all values in the user's language.

Why not a JSON blob: Notion renders a fenced blob as an uneditable code block — you lose the checkboxes, and hand-fixing a typo becomes painful. Markdown gives the agent a stable parse *and* the human a live progress view.

## Frontmatter

```yaml
---
plan_id: reset-password-flow      # kebab-case, stable, never changes
plan_version: 1                    # bump on ANY regeneration
source_page: https://notion.so/... # the parent human page
language: es                       # BCP-47 tag of the human-facing text
created: 2026-08-17                # ISO date
status: not_started                # not_started | in_progress | blocked | done
---
```

## Task blocks

One `##` heading per task. Every field is required — a task missing `acceptance` or `verify` is not a task.

```markdown
## T-003 · Rechazar tokens expirados

- depends_on: [T-001, T-002]
- files: src/auth/token.ts, src/auth/token.test.ts
- acceptance: un token de más de 30 minutos devuelve 401 con el código `token_expired`, no un 500
- verify: pnpm test src/auth/token.test.ts
- notes: la comparación actual usa `<`, debe ser `<=`
- [ ] status
```

| Field | Required | Rules |
|---|---|---|
| `T-NNN` | yes | Zero-padded, sequential, **never renumbered**. Removing a task leaves a gap — gaps are fine, renumbering breaks resume. |
| heading text | yes | Imperative, one line, user's language |
| `depends_on` | yes | List of task IDs, or `[]`. Must be acyclic. |
| `files` | yes | Concrete paths. `[]` only for non-code tasks (a decision, an email). |
| `acceptance` | yes | Observable pass/fail condition. Not "works correctly". |
| `verify` | yes | A command to run, or an explicit manual check. Never blank. |
| `notes` | no | Anything the agent would otherwise have to re-derive |
| `- [ ] status` | yes | The checkbox. Agent ticks it on completion. |

## Rules

1. **Task IDs are immutable.** Regenerating a plan keeps existing IDs for tasks that still exist. New tasks get new numbers. This is what makes resume work.
2. **One task = one verifiable outcome.** If `verify` needs two unrelated commands, it's two tasks.
3. **`depends_on` must be acyclic**, and every referenced ID must exist. Check before writing.
4. **No prose paragraphs.** If the agent must interpret narrative to know what to do, specify it instead.
5. **No task without `verify`.** An agent that can't check its own work will report success either way. This is the single highest-value field on the page.
6. **Values localized, keys never.** `acceptance:` stays `acceptance:` in every language.

## Executing an existing manifest

1. Read `plan_version` and `source_page`. If the parent page has changed since, **stop** — tell the user and regenerate both pages.
2. Set frontmatter `status: in_progress`.
3. Pick the lowest-numbered unchecked task whose `depends_on` are all checked.
4. Do it. Run `verify`. Only if it passes, tick the checkbox.
5. `verify` fails → leave unchecked, set `status: blocked`, report which task and the actual output. Do not move on.
6. All tasks checked → `status: done`.

## Regenerating

Any change to intent regenerates both pages:

- Bump `plan_version`.
- Keep IDs and checkboxes for surviving tasks — **never reset completed work to unchecked.**
- Removed tasks: delete the block, leave the ID gap.
- Tell the user exactly what changed between versions.
