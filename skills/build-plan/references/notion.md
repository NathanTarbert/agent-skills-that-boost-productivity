# Destinations

## Notion (via MCP)

Tool names below are from Notion's official MCP server. Other servers name things differently — the shape of the flow is what matters, not the exact tool names.

### 1. Find the parent

Never guess. In order of preference:

- User gave a URL → `notion-fetch` it. Confirm it's a page, not a database.
- User gave a name → `notion-search`, show what you found, confirm before writing.
- Nothing → ask. Offer `notion-list-recent-pages` as a shortcut.

If the URL is a **database**, `notion-fetch` it first to get its data sources — a database with multiple data sources needs a specific `data_source_id`, and `page_id` won't work.

### 2. Create the human page

```
notion-create-pages
  parent: { type: "page_id", page_id: "<parent>" }
  pages: [{
    properties: { title: "<plan title in the user's language>" },
    icon: "🗺️",
    content: "<human page, Notion-flavored Markdown>"
  }]
```

Don't repeat the title inside `content` — it comes from `properties.title`.

Read the MCP resource `notion://docs/enhanced-markdown-spec` before writing content if you're unsure of the Markdown dialect. Do not guess syntax — Notion's flavor differs from GitHub's, especially for callouts, toggles, and columns.

### 3. Create the machine page as its child

```
notion-create-pages
  parent: { type: "page_id", page_id: "<the page you just created>" }
  pages: [{
    properties: { title: "Agent Execution Manifest" },
    icon: "🤖",
    content: "<manifest>"
  }]
```

A page created with a `page_id` parent appears as a child-page block **appended to the end** of the parent — which is exactly the placement you want. Verify by fetching the parent; if the block landed elsewhere, `notion-update-page` with `command: "insert_content"` and `position: {type: "end"}`.

Title the manifest in the user's language (`Manifiesto de ejecución`, `実行マニフェスト`). The *keys inside it* stay English.

**Optional:** `notion-update-page` accepts `is_skill: true`, which marks a page as an AI skill in Notion. Worth setting on the manifest if the workspace uses that feature. Ask first — it changes how the page surfaces to other people.

### 4. Report

Return both URLs. Say which is which.

### Updating an existing plan

- Human page: `notion-update-page` with `command: "update_content"` and targeted `content_updates`. Send the smallest edit region that's unambiguous, not the whole page.
- Manifest: same, or `replace_content` on a full regeneration. Bump `plan_version`.
- Ticking a checkbox mid-execution: `update_content`, replacing `- [ ] status` within that one task block. Match on enough surrounding text to be unique — `old_str` must match exactly once, or the call fails.

### Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| Tool not found | No Notion MCP connected | Fall back to files |
| 401 / unauthorized | Integration lacks access to that page | Tell the user to share the page with the integration |
| Content renders wrong | Guessed Markdown syntax | Read `notion://docs/enhanced-markdown-spec` |
| `old_str` matched multiple times | Edit region too small | Include more surrounding text |

Never silently retry into a different page. If you can't write where the user asked, stop and say so.

## File fallback

No Notion, or the user prefers files:

```
PLAN.md          # human page
PLAN.agent.md    # manifest; frontmatter source_page: ./PLAN.md
```

Repo root unless the project keeps docs elsewhere — check for `docs/` first. Report both paths.

## Other destinations

The two-page split is destination-agnostic. Anywhere that supports nesting works: Linear (document + sub-document), Obsidian (note + linked note), Google Docs (doc + doc, cross-linked). Keep the same rule — the manifest links back via `source_page`, and both regenerate together.
