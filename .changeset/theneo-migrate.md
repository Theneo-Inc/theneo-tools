---
'@theneo/cli': minor
---

Add `theneo migrate`. Run it in a folder of existing docs (GitBook, Mintlify, Docusaurus, MkDocs, Markdown): it detects the source platform, installs the bundled `docs-to-theneo` skill for your coding agent (Claude Code, Cursor, Codex, Gemini CLI, GitHub Copilot, Windsurf) and hands the agent a prompt to convert the docs into a Theneo project in `converted_for_theneo/`. When the conversion passes `theneo audit`, the agent asks which Theneo project to put it in, tries `theneo preview` first and asks before importing if preview is not available.
