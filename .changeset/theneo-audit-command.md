---
'@theneo/cli': minor
---

Add a `theneo audit` command that validates a Theneo documentation project on disk and exits non-zero when it finds errors, so structural mistakes are caught locally or in CI instead of at import or publish time.

Tier 1 (structure) rules: `theneo.json` exists at the root, is valid JSON, and has the required top-level fields; every declared section folder has both `index.md` and `section.json`; folder path matches its `slug` (case-sensitive); orphan detection in both directions (declared-but-missing = error, on-disk-but-undeclared = warning); no `index.md` at the project root; and each `section.json` is valid JSON with a valid HTTP verb when `endpoints.method` is set. Supports `--dir` and a pipeable `--json` output; exits `1` on any error-level finding.
