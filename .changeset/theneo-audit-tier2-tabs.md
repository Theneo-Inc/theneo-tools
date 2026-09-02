---
'@theneo/cli': minor
---

Add Tier 2 (tabs) validation to `theneo audit`. The command now checks tab-level consistency in `theneo.json`: `tabs` is an array (error); every tab has a non-empty `title` and `slug` (error); tab slugs are unique (error); a tab sets exactly one of `iconUrl` or `svgCode` (warning on both or neither); every top-level section is claimed by exactly one tab (error on zero or two-plus when tabs exist); each slug listed under a tab's `sections` resolves to a real section (error); and each section's `index.md` starts with a `<!-- tab:slug -->` marker that matches a declared tab (error if missing or unknown, warning if present but not at the very top, with a line number). The marker scan skips YAML frontmatter and fenced code blocks so example markers in docs are not mistaken for the real one. These are content rules (`needsDisk: false`, except the marker check) so they can be reused by a future server-side pre-save checker.
