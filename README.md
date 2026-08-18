<div align="center">

# 🧠 Agent Skills That Boost Productivity

**Skills that make coding agents do real work — not demos.**

[![Validate skills](https://github.com/NathanTarbert/agent-skills-that-boost-productivity/actions/workflows/validate.yml/badge.svg)](https://github.com/NathanTarbert/agent-skills-that-boost-productivity/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Skills](https://img.shields.io/badge/skills-1-blueviolet.svg)](#-the-skills)

[The skills](#-the-skills) · [Install](#-install) · [What is a skill?](#-what-is-a-skill) · [Contribute](CONTRIBUTING.md)

</div>

---

## ✨ The skills

| Skill | Reach for it when | Works without |
|---|---|---|
| 🗺️ **[build-plan](skills/build-plan)** | You want a plan before implementation — delivered as two linked pages: one a human reads to **decide**, one an agent reads to **execute** | Notion (falls back to files) |

> More landing soon. Got one that earns its place? → **[CONTRIBUTING.md](CONTRIBUTING.md)**

---

## 🚀 Install

Copy the skill folder into your agent's skills directory. That's the whole install.

<table>
<tr><th align="left">Agent</th><th align="left">Command</th></tr>
<tr><td>

**Claude Code** *(everywhere)*

</td><td>

```bash
cp -r skills/build-plan ~/.claude/skills/
```

</td></tr>
<tr><td>

**Claude Code** *(this project only)*

</td><td>

```bash
mkdir -p .claude/skills
cp -r skills/build-plan .claude/skills/
```

</td></tr>
<tr><td>

**Codex · Gemini CLI · Copilot CLI**

</td><td>

```bash
mkdir -p ~/.agents/skills
cp -r skills/build-plan ~/.agents/skills/
```

</td></tr>
</table>

Then just ask for what you want:

> *"Plan out how we'd add password reset."*

The agent matches the request against the skill's description and loads it on its own. **You don't invoke it by name.** If it didn't fire, the description is the thing to fix — not your prompt.

---

## 🧩 What is a skill?

A folder with a `SKILL.md` in it. That's it.

```
skills/build-plan/
├── SKILL.md          # the workflow — loads whenever the skill triggers
├── evals/            # optional — prompts that must trigger it, and what it must then do
├── references/       # schemas, API sequences — loaded only when needed
└── examples/         # worked examples the agent can pattern-match against
```

The frontmatter is what makes it work:

```yaml
---
name: build-plan
description: Use when the user asks for a plan, roadmap, spec, or "figure out how we'd do X"...
---
```

Your agent reads **only the description** to decide whether to open the skill. So the description states *when to use it* — never *what it does*. A description that summarizes the workflow becomes a shortcut the agent takes **instead of** reading the skill.

That's the whole trick, and it's why `references/` exists: an installed skill costs you almost nothing until the moment it actually fires.

---

## ✅ Every skill is validated

```bash
pnpm test
```

```
Validating 1 skill

  ✓ build-plan (1020 words)

All 1 skill valid.
```

One Node file, zero dependencies, no install step. It checks frontmatter limits, name/directory agreement, description form, dead links, leftover `TODO`s, and whether the skill made it into the table above — and it runs on every PR.

**But a skill is a prompt, not code**, so structure is only half of it. The other half is an optional eval — prompts that must load the skill, prompts that must *not*, and what the agent must then do:

```jsonc
{
  "should_trigger":     [ "prompts that must load this skill" ],
  "should_not_trigger": [ "nearby prompts that must NOT" ],
  "behaviors":          [ { "given": "…", "expect": [ "observable things the agent must do" ] } ]
}
```

CI lints its shape; you run it yourself in a fresh session. It exists because the two ways a skill dies are both silent: it never fires, or it fires and the agent improvises around it.

Full details: **[CONTRIBUTING.md](CONTRIBUTING.md)**

---

## 🤝 Contributing

Got a skill that saves you time? Send it. One skill per PR — the bar is "this earned its place in my workflow," not "this is polished enough to publish."

```bash
cp -r skills/build-plan skills/your-skill   # start from a working one
# rewrite SKILL.md
pnpm test                                    # ~1 second, no install
```

Then open the PR and say what you used it for. That's the review.

Only one rule really matters: **the description says *when* to reach for the skill, never *what it does*.** It's the only thing your agent reads when deciding whether to load it — [CONTRIBUTING.md](CONTRIBUTING.md) explains why that distinction decides whether your skill ever runs.

---

<div align="center">

**MIT** · Built by [Nathan Tarbert](https://github.com/NathanTarbert)

⭐ Star it if a skill here saved you time.

</div>
