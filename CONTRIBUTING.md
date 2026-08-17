# Contributing

Got a skill that saves you time? Send it. One skill per PR, and don't overthink it — the bar is "this earned its place in my workflow," not "this is polished enough to publish."

## Add a skill in five minutes

**1. Copy an existing one as a starting point**

```bash
cp -r skills/build-plan skills/your-skill
```

**2. Rewrite `SKILL.md`**

The frontmatter is the only part with rules:

```yaml
---
name: your-skill          # lowercase, hyphens, matches the folder name
description: Use when ... # when to reach for it — see below
---
```

**3. Check it**

```bash
pnpm test
```

**4. Open the PR.** Say what you used it for. That's the review.

## The one thing that actually matters

**The description decides whether your skill ever runs.**

Your agent reads it — and nothing else — to decide whether to open the skill. So it describes *when to use it*, never *what it does*.

```yaml
# ✗ describes the workflow
description: Use when planning — asks scoping questions, then writes two pages

# ✓ describes the moment
description: Use when the user asks for a plan, roadmap, spec, or "figure out how we'd do X" before implementation starts
```

That's not a style preference. If the description explains how the skill works, the agent acts on the description and never opens the file — and whatever didn't fit in those few lines is silently lost.

Write it with the words a real person would type. Their symptoms, their errors, their synonyms. Not your vocabulary.

## Layout

```
skills/your-skill/
  SKILL.md        # required — loads every time the skill fires, so keep it tight
  references/     # optional — schemas, API details, long tables; loads only when needed
  examples/       # optional — one realistic worked example beats five sketches
  evals/          # optional — see below
```

The split exists for one reason: `SKILL.md` costs tokens on every trigger, `references/` costs nothing until the agent needs it. Rough line: over ~50 lines of detail, move it out.

## Evals (optional, but they're how you know it works)

A skill is a prompt, not code, so there's no unit test. What there is:

- `pnpm test` proves your skill is **well-formed**. Fully automatic.
- An eval proves it **works**. You run that one yourself.

If you want one, drop `evals/your-skill.eval.json`:

```json
{
  "skill": "your-skill",
  "should_trigger": ["prompts that must load this skill"],
  "should_not_trigger": ["nearby prompts that must not"],
  "behaviors": [
    { "given": "one of those prompts", "expect": ["something observable the agent must do"] }
  ]
}
```

Then in a fresh session with the skill installed: paste each prompt, confirm it loads without you naming it, and check the `expect` items against what the agent actually did.

Skills die two ways, both silent:

| Symptom | Cause | Fix |
|---|---|---|
| Never fires | Description doesn't match how people phrase it | Rewrite with their words |
| Fires on everything | Description too broad | Narrow it; add the counter-cases to `should_not_trigger` |
| Fires, then the agent improvises | `SKILL.md` too long or too vague | Cut it; move detail to `references/` |

`should_not_trigger` is the field people skip and shouldn't. A skill that loads on everything burns context on unrelated work, and people uninstall it.

## What CI checks

`pnpm test` runs on every PR. It's one Node file, zero dependencies, no install step.

**Fails the build** — the skill is broken:

- No `SKILL.md`, or frontmatter missing / unclosed / over 1024 characters
- Missing `name` or `description`
- `name` doesn't match the folder, or isn't lowercase-with-hyphens
- `description` doesn't start with `Use when`
- A `TODO` / `TBD` / `FIXME` left in `SKILL.md`
- A relative link pointing at a file that doesn't exist
- Skill not linked from the README table
- An eval file that exists but is malformed JSON

**Warns only** — advice, still merges green:

- No `examples/` or no `evals/`
- Thin eval coverage
- `description` over 500 characters, or not in third person
- `SKILL.md` over ~1200 words

Warnings never block you. If CI is red, something is actually broken, and the message says what.

## Checklist

- [ ] `pnpm test` passes
- [ ] Description says **when**, not what
- [ ] Added to the README skills table
- [ ] Mentioned in the PR what you used it for
