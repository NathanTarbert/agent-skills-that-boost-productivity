# Example — Technical plan (English)

Request: *"Plan out password reset for our app."* Classified **medium**, 4 questions asked.

---

## Page 1 — Human page (parent)

# Password reset

## Goal
People who forget their password can get back into their account without emailing support.

## Why now
Password resets are the single largest category of support email. Every one is handled by hand, and users wait hours. It also blocks self-serve signup — we can't let people in the door if we can't let them back in.

## What we're building
A "forgot password?" link on the login screen. You enter your email, we send you a link, the link opens a page where you pick a new password. The link stops working after 30 minutes and after one use.

## Approach
**Chosen — signed expiring email links.** Standard, no new dependency, no per-message cost.

**Rejected — security questions.** Phishable, and users forget their own answers more often than their passwords.

**Rejected — SMS codes.** Costs money per message and permanently locks out anyone who changed their phone number.

## Phases

| Phase | What's true when it's done | Rough effort |
|---|---|---|
| 1. Issue links | Requesting a reset sends an email containing a link that expires in 30 minutes | ~half a day |
| 2. Reset screen | The link opens a form that sets a new password and signs the user in | ~1 day |
| 3. Hardening | Reused and expired links fail with a clear message; requests are rate-limited | ~half a day |

## Risks & unknowns
- Email delivery could be slow enough that links expire before they arrive → measure real delivery time in phase 1 before locking in 30 minutes.
- We don't yet know whether the current session layer can sign a user in mid-request → confirm in phase 2 before building the screen.

## Done means
- [ ] A user can reset their password without contacting support
- [ ] A used link cannot be used a second time
- [ ] An expired link shows a message explaining what happened, not an error page
- [ ] Reset requests are rate-limited per account

## Open questions
- Should resetting a password sign out other active sessions? — needs a product call.

---

## Page 2 — Machine page (child, appended at the bottom)

# Agent Execution Manifest

```yaml
---
plan_id: password-reset
plan_version: 1
source_page: https://www.notion.so/Password-reset-abc123
language: en
created: 2026-08-17
status: not_started
---
```

## T-001 · Add reset_tokens table

- depends_on: []
- files: migrations/0042_reset_tokens.sql
- acceptance: table exists with columns id, user_id, token_hash, expires_at, used_at; unique index on token_hash
- verify: pnpm migrate && pnpm test migrations
- notes: store the hash, never the raw token
- [ ] status

## T-002 · Issue a reset token on request

- depends_on: [T-001]
- files: src/auth/reset.ts, src/auth/reset.test.ts
- acceptance: POST /auth/reset with a known email creates one row with expires_at 30 minutes out; an unknown email returns 200 with no row created
- verify: pnpm test src/auth/reset.test.ts
- notes: identical response for known and unknown emails — do not leak which addresses exist
- [ ] status

## T-003 · Send the reset email

- depends_on: [T-002]
- files: src/email/reset-template.tsx, src/auth/reset.ts
- acceptance: a reset request produces one queued email whose link contains the raw token
- verify: pnpm test src/email
- [ ] status

## T-004 · Measure delivery time

- depends_on: [T-003]
- files: []
- acceptance: median delivery time over 20 test sends is recorded and is under 5 minutes
- verify: manual — send 20, record timestamps, report median to the user before starting T-005
- notes: gates the 30-minute expiry decision; if median exceeds 5 minutes, stop and revise the plan
- [ ] status

## T-005 · Build the reset screen

- depends_on: [T-004]
- files: src/pages/reset/[token].tsx
- acceptance: a valid token renders the form; submitting a valid password updates the hash and signs the user in
- verify: pnpm test:e2e reset
- [ ] status

## T-006 · Reject expired and reused tokens

- depends_on: [T-005]
- files: src/auth/token.ts, src/auth/token.test.ts
- acceptance: a token older than 30 minutes or with used_at set returns 401 and the message "This link has expired", not a 500
- verify: pnpm test src/auth/token.test.ts
- [ ] status

## T-007 · Rate-limit reset requests

- depends_on: [T-002]
- files: src/auth/reset.ts, src/middleware/rate-limit.ts
- acceptance: the 6th reset request for one account within an hour returns 429
- verify: pnpm test src/auth/reset.test.ts
- [ ] status
