---
name: build-plan
description: Use when the user asks for a plan, roadmap, spec, build plan, project plan, or "figure out how we'd do X" before implementation starts — including when they want it written to Notion, a doc, or a file. Also use when a plan already exists but no agent-executable version of it does.
---

# Build Plan

## Overview

Turn a request into **two linked pages**: one a human reads to decide, one an agent reads to execute.

Core principle: **a plan a human loves is usually a plan an agent can't run, and vice versa.** Stop trying to write one document that does both. Write both, generate them together, keep them versioned in lockstep.

| Page | Reader | Job | Optimized for |
|---|---|---|---|
| **Human page** (parent) | People | Decide, approve, share | Clarity, tradeoffs, plain language |
| **Machine page** (child) | Agents | Execute, resume, report | Determinism, task IDs, verifiable state |

The machine page is the **last child block of the human page**, so approving a plan and handing it to an agent are the same click.

## When to Use

- "Write a plan for X" / "how would we build X" / "make me a roadmap"
- "Put a spec in Notion for X"
- A plan exists in prose but an agent keeps drifting when executing it
- Work spans more than one session, or more than one person

**Do NOT use for:** a single obvious edit, a bug with a known fix, or anything you'd finish faster than writing the plan. Say so and just do the work.

## Workflow

Run these in order. Do not skip step 2 or step 3.

### 1. Match the user's language

Detect the language of the user's request. **Every human-facing word — questions, human page, your chat replies — is written in that language.** Never answer a Spanish request with an English plan.

The machine page keeps **English structural keys** (`plan_id`, `depends_on`, `acceptance`, `verify`, `status`) with **localized values**. Models are more reliable on English structural tokens; the user still reads their own language in every value. Do not translate the keys.

### 2. Classify scope, then ask that many questions

Say the classification out loud so the user can override it.

| Scope | Signal | Questions to ask |
|---|---|---|
| **Small** | One component, one session, ≤5 tasks | 0–2 |
| **Medium** | Multiple components or files, one owner | 3–5 |
| **Large** | New system, multiple owners, unknowns | 5+, and propose splitting |

Ask **one question per message**, in this priority order. Stop when the next question wouldn't change the plan:

1. **Goal** — what's true after this ships that isn't true now?
2. **Constraints** — deadline, stack, budget, things that must not break
3. **Done means** — how do we know it worked? (must be observable)
4. **Risks** — what's most likely to go wrong or is still unknown?
5. **Sequencing** — anything that must land first, or can't land yet?

Prefer multiple choice. Never ask a question whose answer you can read from the repo — go read it.

### 3. Confirm the destination before writing anything

In order:

1. **Notion MCP connected?** → ask for the parent page (or search for it by name). Read `references/notion.md` for the exact call sequence and child-block placement.
2. **No Notion?** → ask where. Another doc tool, or two local files.
3. **No answer?** → write `PLAN.md` + `PLAN.agent.md` in the repo and tell the user where they are.

Never invent a location. Never write to a page the user didn't name.

### 4. Write the human page

Structure and hard rules: `references/human-page.md`.

### 5. Write the machine page as the last child of the human page

Schema and full example: `references/machine-page.md`.

### 6. Report

Give both URLs (or paths), the task count, and any open question you couldn't resolve. Do not start executing unless asked.

## The Drift Rule

Two pages can disagree. That's the only way this design fails, and it fails silently — the agent executes yesterday's plan while the human reads today's.

**Any change regenerates both pages and bumps `plan_version`.**

- Never edit one page alone. Not for a typo. Not for "just reordering."
- Before executing an existing manifest, check `plan_version` and `source_page` still match the parent. Mismatch → stop, tell the user, regenerate.
- The human page is the source of truth for *intent*. The machine page is the source of truth for *state* (which tasks are done).

## Quick Reference

| Situation | Do this |
|---|---|
| User writes in Japanese | Human page Japanese, machine keys English, machine values Japanese |
| User says "just a quick plan" | Small scope, 0–2 questions, still write both pages |
| Plan is 30+ tasks | Say it's too large; propose splitting into phased plans, one manifest each |
| No Notion MCP | Two local files, tell the user the paths |
| Asked to execute a plan | Read only the machine page; check off tasks as you finish them |
| Human page edited by someone else | Regenerate machine page, bump version |

## Common Mistakes

- **Writing one page, then "summarizing" it into the other.** Generate both from the same understanding in the same pass. A summary drifts on day one.
- **Phases that name activities, not outcomes.** "Implement auth logic" is unverifiable. "A user with a valid token reaches /dashboard; an expired one gets 401" is.
- **Jargon on the human page.** If a non-engineer stakeholder can't read it, it failed its only job.
- **Prose on the machine page.** If the agent has to interpret a paragraph to know what to do, the task isn't specified yet.
- **Tasks with no `verify`.** An agent that can't check its own work will report success either way.
- **Asking five questions for a three-step plan.** Users abandon skills that interrogate them.

## Red Flags — stop and fix

- You're about to write only one page → both, always
- You're about to write English for a non-English user → match their language
- A task has no `acceptance` or no `verify` → it's not a task yet, it's a wish
- You're editing the machine page without touching the human page → drift; regenerate both
- You don't know where the plan goes → ask, don't guess
