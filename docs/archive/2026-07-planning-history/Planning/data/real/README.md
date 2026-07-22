# Real transcripts go here

Drop your own exported Cursor chat sessions in this folder as `.md` files.
They'll be picked up automatically alongside the synthetic examples in
`data/synthetic/`.

## Format

Each file should look like:

```
---
project: my-project-name
date: 2026-06-01
---

User: your first message

Agent: the agent's reply

User: your next message

Agent: the agent's reply
```

- The frontmatter block is optional but useful for context.
- Each turn must start with `User:` or `Agent:` (or `**User:**` / `**Agent:**`)
  at the start of a line.
- If you're copy-pasting from the Cursor chat panel, just add those prefixes
  manually -- it only takes a minute per session and the parser is
  intentionally forgiving about everything else.

## A privacy note

These are your own real working sessions. Before sharing this repo
publicly (e.g. linking it from a portfolio site), check the transcripts
in this folder for anything you don't want public -- API keys, client
names, proprietary logic -- and either redact it or keep those specific
files local and out of git (this folder is *not* gitignored by default,
so that's on you to handle before pushing).
