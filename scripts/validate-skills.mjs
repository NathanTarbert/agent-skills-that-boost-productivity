#!/usr/bin/env node
// Validates every skill in skills/ against the contract documented in CONTRIBUTING.md.
// Zero dependencies. Run: pnpm test
//
// Exit 0 = all skills valid. Exit 1 = at least one error. Warnings never fail the build.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SKILLS_DIR = join(ROOT, 'skills')

// Thresholds. SKILL.md loads on every trigger, so its length is a real cost.
const FRONTMATTER_MAX_CHARS = 1024
const DESCRIPTION_MAX_CHARS = 500
const SKILL_WARN_WORDS = 1200
const PLACEHOLDERS = /\b(TBD|TODO|FIXME|XXX|COMING SOON|LOREM IPSUM)\b/i

const c = process.env.NO_COLOR || !process.stdout.isTTY
  ? new Proxy({}, { get: () => (s) => s })
  : {
      red: (s) => `\x1b[31m${s}\x1b[0m`,
      green: (s) => `\x1b[32m${s}\x1b[0m`,
      yellow: (s) => `\x1b[33m${s}\x1b[0m`,
      cyan: (s) => `\x1b[36m${s}\x1b[0m`,
      dim: (s) => `\x1b[2m${s}\x1b[0m`,
      bold: (s) => `\x1b[1m${s}\x1b[0m`,
    }

const errors = []
const warnings = []
const fail = (skill, msg) => errors.push(`${skill}: ${msg}`)
const warn = (skill, msg) => warnings.push(`${skill}: ${msg}`)

/** Minimal YAML front-matter reader. Only handles the flat `key: value` pairs a skill needs. */
function parseFrontmatter(raw) {
  if (!raw.startsWith('---\n')) return { error: 'missing YAML frontmatter (file must start with `---`)' }
  const end = raw.indexOf('\n---', 3)
  if (end === -1) return { error: 'frontmatter is not closed with `---`' }

  const block = raw.slice(4, end)
  const fields = {}
  let currentKey = null

  for (const line of block.split('\n')) {
    const match = /^([A-Za-z0-9_-]+):\s?(.*)$/.exec(line)
    if (match) {
      currentKey = match[1]
      fields[currentKey] = match[2].trim()
    } else if (currentKey && line.trim()) {
      // folded continuation line
      fields[currentKey] += ' ' + line.trim()
    }
  }
  // +8 for the two `---` delimiters and their newlines
  return { fields, chars: block.length + 8, body: raw.slice(end + 4) }
}

/** Every relative markdown link must resolve to a file that exists. */
function checkLinks(skill, filePath, content) {
  const rel = relative(ROOT, filePath)
  for (const [, target] of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    if (/^(https?:|mailto:|#|notion:)/.test(target)) continue
    const path = target.split('#')[0]
    if (!path) continue
    if (!existsSync(resolve(dirname(filePath), path))) {
      fail(skill, `broken link in ${rel}: ${target}`)
    }
  }
}

function validateSkill(name) {
  const dir = join(SKILLS_DIR, name)
  const skillFile = join(dir, 'SKILL.md')

  if (!existsSync(skillFile)) {
    fail(name, 'no SKILL.md — every skill directory must contain one')
    return null
  }

  const raw = readFileSync(skillFile, 'utf8')
  const { error, fields, chars, body } = parseFrontmatter(raw)
  if (error) {
    fail(name, error)
    return null
  }

  // --- frontmatter contract ---
  if (chars > FRONTMATTER_MAX_CHARS) {
    fail(name, `frontmatter is ${chars} chars, limit is ${FRONTMATTER_MAX_CHARS}`)
  }
  if (!fields.name) {
    fail(name, 'frontmatter is missing required field `name`')
  } else {
    if (!/^[a-z0-9-]+$/.test(fields.name)) {
      fail(name, `name "${fields.name}" must be lowercase letters, numbers, and hyphens only`)
    }
    if (fields.name !== name) {
      fail(name, `name "${fields.name}" does not match its directory "${name}"`)
    }
  }

  if (!fields.description) {
    fail(name, 'frontmatter is missing required field `description`')
  } else {
    if (!/^Use when\b/i.test(fields.description)) {
      fail(name, 'description must start with "Use when" — it states when to use the skill, not what it does')
    }
    if (fields.description.length > DESCRIPTION_MAX_CHARS) {
      warn(name, `description is ${fields.description.length} chars; keep it under ${DESCRIPTION_MAX_CHARS}`)
    }
    if (/\bI \b|\bwe \b|\byou should\b/i.test(fields.description)) {
      warn(name, 'description should be third person — it is injected into a system prompt')
    }
  }

  // --- body contract ---
  const words = body.trim().split(/\s+/).filter(Boolean).length
  if (words === 0) fail(name, 'SKILL.md has frontmatter but no body')
  if (words > SKILL_WARN_WORDS) {
    warn(name, `SKILL.md is ${words} words; over ~${SKILL_WARN_WORDS} belongs in references/`)
  }
  if (PLACEHOLDERS.test(body)) {
    fail(name, 'SKILL.md contains a placeholder (TBD/TODO/FIXME) — finish it or cut it')
  }
  if (!existsSync(join(dir, 'examples'))) {
    warn(name, 'no examples/ directory — at least one worked example is strongly recommended')
  }

  validateEval(name, dir)

  // --- links across every markdown file in the skill ---
  for (const file of walk(dir)) {
    if (file.endsWith('.md')) checkLinks(name, file, readFileSync(file, 'utf8'))
  }

  return { name, words, description: fields.description ?? '' }
}

/**
 * An eval declares: prompts that must trigger the skill, prompts that must NOT, and behaviors
 * its output must show. Recommended, not required — a missing eval warns, a broken one fails.
 * We only lint the file's shape; running it needs an agent, not a linter. See CONTRIBUTING.md.
 */
function validateEval(name, dir) {
  const evalDir = join(dir, 'evals')
  if (!existsSync(evalDir)) {
    warn(name, 'no evals/ directory — an eval file is recommended (see CONTRIBUTING.md)')
    return
  }

  const files = readdirSync(evalDir).filter((f) => f.endsWith('.eval.json'))
  if (files.length === 0) {
    warn(name, 'evals/ contains no *.eval.json file')
    return
  }

  for (const file of files) {
    const where = `evals/${file}`
    let spec
    try {
      spec = JSON.parse(readFileSync(join(evalDir, file), 'utf8'))
    } catch (e) {
      fail(name, `${where} is not valid JSON: ${e.message}`)
      continue
    }

    if (spec.skill !== name) {
      fail(name, `${where}: "skill" is "${spec.skill}", expected "${name}"`)
    }

    // Coverage advice, not correctness — under-triggering is the most common skill failure,
    // over-triggering the second. Thin coverage warns; it never blocks a merge.
    const triggers = spec.should_trigger
    if (!Array.isArray(triggers) || triggers.length < 3) {
      warn(name, `${where}: 3+ "should_trigger" prompts give better coverage`)
    }
    const antiTriggers = spec.should_not_trigger
    if (!Array.isArray(antiTriggers) || antiTriggers.length < 2) {
      warn(name, `${where}: 2+ "should_not_trigger" prompts catch over-triggering`)
    }

    // Shape, not coverage: a malformed entry means the eval can't be read or run.
    const behaviors = spec.behaviors
    if (behaviors !== undefined && !Array.isArray(behaviors)) {
      fail(name, `${where}: "behaviors" must be an array`)
      continue
    }
    for (const [i, b] of (behaviors ?? []).entries()) {
      if (!b || typeof b.given !== 'string' || !b.given.trim()) {
        fail(name, `${where}: behaviors[${i}] is missing "given"`)
      }
      if (!Array.isArray(b.expect) || b.expect.length === 0) {
        fail(name, `${where}: behaviors[${i}] is missing "expect" assertions`)
      }
    }
  }
}

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

/** The README table is the front door. Drift there is invisible until someone can't find a skill. */
function checkReadmeIndex(skills) {
  const readmePath = join(ROOT, 'README.md')
  if (!existsSync(readmePath)) {
    errors.push('repo: README.md is missing')
    return
  }
  const readme = readFileSync(readmePath, 'utf8')
  for (const { name } of skills) {
    if (!readme.includes(`skills/${name}`)) {
      errors.push(`repo: README.md does not link skills/${name} — add it to the skills table`)
    }
  }
}

// --- run ---
if (!existsSync(SKILLS_DIR)) {
  console.error(c.red('✗ no skills/ directory found'))
  process.exit(1)
}

const names = readdirSync(SKILLS_DIR).filter((n) => statSync(join(SKILLS_DIR, n)).isDirectory())
if (names.length === 0) {
  console.error(c.red('✗ skills/ is empty'))
  process.exit(1)
}

console.log(c.bold(`\nValidating ${names.length} skill${names.length === 1 ? '' : 's'}\n`))

const validated = names.map(validateSkill).filter(Boolean)
checkReadmeIndex(validated)

for (const { name, words } of validated) {
  const broke = errors.some((e) => e.startsWith(`${name}:`))
  const soft = warnings.some((w) => w.startsWith(`${name}:`))
  const mark = broke ? c.red('✗') : soft ? c.yellow('!') : c.green('✓')
  console.log(`  ${mark} ${c.cyan(name)} ${c.dim(`(${words} words)`)}`)
}

if (warnings.length) {
  console.log(c.yellow(`\n${warnings.length} warning${warnings.length === 1 ? '' : 's'}`))
  for (const w of warnings) console.log(c.yellow(`  ! ${w}`))
}

if (errors.length) {
  console.log(c.red(`\n${errors.length} error${errors.length === 1 ? '' : 's'}`))
  for (const e of errors) console.log(c.red(`  ✗ ${e}`))
  console.log()
  process.exit(1)
}

console.log(c.green(`\nAll ${validated.length} skill${validated.length === 1 ? '' : 's'} valid.\n`))
