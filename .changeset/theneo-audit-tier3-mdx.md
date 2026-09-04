---
'@theneo/cli': minor
---

Add Tier 3 (MDX) validation to `theneo audit`. Each section's `index.md` is parsed for widget tags (quote-aware, skipping fenced code blocks) and checked: every widget's `attributes` prop is valid JSON (error); paired tags are balanced (error); a `<TabPanel>` sits directly inside a `<Tabs>` and its `tabTitle` matches one of the parent's declared tabs (error); a `<Callout>` `dataType` is one of `info`/`warning`/`error`/`success` (error); and a widget nested more than one level deep is flagged (warning). Findings include a line number. The structural checks (valid JSON, balance, nesting) apply to a known set of Theneo widget names, so prose that happens to contain angle-bracket text (e.g. `<Bearer Token>` in an auth example) is not mistaken for a widget. Parsing lives in a pure `mdx.ts` module, so these content rules can be reused by a future server-side pre-save checker.
