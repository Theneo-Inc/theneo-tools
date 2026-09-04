---
'@theneo/cli': minor
---

Add malformed-tag detection to `theneo audit` (Tier 3 follow-up). A new `mdx-malformed-tag` rule flags broken Theneo tag syntax in each section's `index.md`, each an error with a line number: an opening tag that never closes its `>` before the next `<` or end of line (`<table-cell<p …>`), a closing tag missing its `>` (`</Callout` …), and an `attributes` value with an unterminated quote. Detection is limited to recognized Theneo tags (the widgets plus structural tags `table-row`, `table-cell`, `title`, `description`) and skips fenced code blocks and `<CodeLine>` bodies, so `<`/`>` in code (`Map<String>`), math (`a<b`), and prose are never flagged. Out of scope (documented): general HTML well-formedness, malformed tags inside code blocks, and a missing `>` that merges the tag name into adjacent text (`<CodeLinecurl…`) — all of which would reintroduce false positives.
