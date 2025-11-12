# Tools

Utility scripts that agents can call via the Bash tool.

## Available Tools

### export_granola_notes.js

Export Granola.ai meeting notes with AI summaries and full transcripts to markdown files.

**Usage:**
```bash
node tools/export_granola_notes.js
```

**Features:**
- Incremental sync (only exports new/updated notes)
- Full transcripts with timestamps and speaker attribution
- AI-generated summaries
- Markdown output with YAML frontmatter
- 1-day overlap to catch stragglers

**Output:** Creates markdown files in `granola-notes/` directory

**Agent Integration:** The `internal-information-researcher` agent automatically calls this when searching for meeting-related information.

## Adding New Tools

Place executable scripts in this directory that agents can call. Update:
1. This README with tool documentation
2. Relevant agent instructions in `.claude/agents/`
3. Main README.md if the tool is user-facing
