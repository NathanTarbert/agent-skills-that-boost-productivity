# Human Page

The page a person reads to decide whether this plan is right. Written entirely in the user's language.

Success test: **a smart person who doesn't work on this project can read it in under three minutes and tell you what's being built, why, and what could go wrong.**

## Structure

Use these sections, in this order. Skip a section only when it would be empty — never pad it.

### Title
What's being built, as a noun phrase. Not "Plan for X" — just "X".

### Goal
One sentence. What is true after this ships that isn't true now. Written from the user's or business's point of view, not the code's.

> ✅ People who forget their password can get back in without emailing support.
> ❌ Implement a password reset flow with token expiry.

### Why now
Two or three sentences. What's costing us today. If you can't name a cost, the plan may not be worth doing — say so.

### What we're building
Plain-language description. A reader with no context should picture the end state. Code only where the code *is* the deliverable (a library's API, a config format).

### Approach
The chosen approach, then **what we rejected and why** — one line each. This is the section that survives longest; six months later it's the only record of why the obvious-looking alternative was wrong.

> **Chosen:** signed expiring links by email.
> **Rejected — security questions:** phishable, and users forget the answers.
> **Rejected — SMS codes:** costs per message and locks out users who changed numbers.

### Phases
A table. One row per phase. Every phase names an **observable outcome**, not an activity.

| Phase | What's true when it's done | Rough effort |
|---|---|---|
| 1. Token issuing | A reset request emails a link that expires in 30 min | ~half a day |
| 2. Reset screen | The link opens a form that sets a new password | ~1 day |
| 3. Hardening | Reused and expired links fail loudly; attempts are rate-limited | ~half a day |

Effort is **rough and relative** — "half a day", "about a week". Never invent precise estimates.

### Risks & unknowns
Bullets. Each names the risk *and* what we'd do about it. A risk with no response is just anxiety.

> - Email delivery may be slow enough that links expire before arrival → measure delivery time in phase 1 before committing to 30 min.

### Done means
Checkable statements. If someone can argue about whether it's true, rewrite it.

> - [ ] A user can reset their password without contacting support
> - [ ] A used link cannot be used again
> - [ ] Reset attempts are rate-limited per account

### Open questions
Anything you couldn't resolve, with who should answer it. Empty is fine — an empty section beats a fabricated answer.

## Hard rules

1. **No unexplained acronyms.** First use gets a plain-language gloss, or gets cut.
2. **No implementation detail that doesn't change the decision.** File names, function names, and library versions belong on the machine page.
3. **Every phase states an outcome, not an activity.** "Implement X" is banned. "X works such that Y" is required.
4. **No invented numbers.** No fake estimates, no fake percentages, no fake benchmarks.
5. **State uncertainty as uncertainty.** "We don't know yet whether the email provider supports this" is a legitimate sentence. Guessing isn't.
6. **The user's language throughout** — including the section headings above.

## Length

Small scope: half a page. Medium: one page. Large: two pages, and consider splitting the plan instead.

If it's longer than two pages, the plan is too big to approve in one decision. Split it.
