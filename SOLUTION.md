# SOLUTION — `theneo audit`

A CLI command that validates a Theneo documentation project on disk and exits
non-zero when it finds errors, so structural mistakes are caught locally / in CI
instead of at import or publish time.

```
theneo audit [--dir <path>] [--json]
```

- Exits `1` if any **error**-level finding exists; `0` otherwise (warnings alone
  still exit `0`).
- Human output names each file, states what is wrong and how to fix it.
- `--json` prints only a findings array (`{ severity, file, line?, rule, message }`),
  so it is pipeable.
- No Theneo account / API key required.

This document covers **Tier 1 (structure)**, which is complete. Tier 2 (tabs) and
Tier 3 (MDX) are follow-ups.

---

## Architecture

Validation logic is kept **separate from the CLI and the output layer** so it is
unit-testable and reusable:

```
src/core/audit/
  finding.ts     Finding model + hasErrors() / exitCode()
  model.ts       ProjectModel (the in-memory shape rules read)
  rule.ts        Rule interface (id, needsDisk, run(model))
  engine.ts      runRules(model, rules) -> Finding[]   (pure, no I/O)
  rules/         one file per rule
  loader.ts      filesystem -> ProjectModel            (the fs adapter)
  report.ts      Finding[] -> human text / JSON        (the output adapter)
  runAudit.ts    loadProject + runRules convenience
commands/audit/  Commander command (thin wrapper)
```

- **The engine and rules are pure** — they import no `fs`, `commander`, or
  `chalk`. They validate an in-memory `ProjectModel` and return findings.
- **`loader.ts` is the only place that touches disk** when run from the CLI.
- Every rule is tagged `needsDisk` (`true` = needs the on-disk layout, `false` =
  a content check). This is deliberate: a future non-filesystem caller (e.g. a
  server-side pre-save check) can reuse the content rules and skip the disk-only
  ones.

---

## Key decisions

1. **Rules live in the CLI monorepo as a pure, I/O-agnostic core.** The command
   must run offline with no API key, so the logic has to be importable without
   the platform. Keeping it pure means it can later be extracted to a shared
   package the platform consumes (mirroring the existing `@Theneo-Inc/theneo-parser`
   publish pattern).

2. **A broken `theneo.json` short-circuits the section rules.** `theneo.json` is
   the declared list of sections; without a valid one, the section/orphan/slug
   rules have nothing to compare against. When `theneo.json` is missing or not a
   valid JSON object, those rules return no findings, so the user sees the single
   root cause (`theneo-json-exists`) instead of a cascade of confusing follow-on
   errors. Fix that first, re-run, and the rest surface.

3. **Required top-level fields = `name` + `sections`.** The exporter also writes
   `id`, `baseUrl`, `lastExport`, etc., but those are export-generated and a
   hand-authored project need not have them. `name` and `sections` are the
   minimum that make a project meaningful.

4. **Parent/container sections are exempt from the `index.md`/`section.json`
   requirement.** Real Theneo exports make a section *with children* a bare
   directory that only holds its child folders — it has no `index.md`/`section.json`
   of its own. Requiring files on every declared section produced **33 false
   positives on the official sample project**. The fix: only *leaf* sections
   (no children) must have both files; parents may be bare containers. The
   exemption is **narrow** — if a parent *does* have a `section.json`, its JSON
   validity and HTTP verb are still checked. (Verified: deleting a parent's
   `section.json` is not flagged, but corrupting it or giving it a bad verb is.)

5. **An empty `endpoints.method` (`""`) means "not an API endpoint" and is
   ignored.** Real non-API sections carry `{"method":"","path":""}`. Treating
   `""` as an invalid verb produced dozens of false positives. Only a *non-empty*
   invalid method is flagged.

6. **HTTP verbs: the 9 standard methods, case-insensitive.**
   `GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS, TRACE, CONNECT`. The platform's
   section validator (`sections.js`) omits `CONNECT`, but its document validator
   (`document.js`) and the HTTP RFC include it; we include it to avoid flagging a
   legitimate `CONNECT` endpoint. Verbs are compared case-insensitively (matching
   the platform's `.insensitive()`), so `get` and `POST` both pass.

7. **Undeclared-folder detection only considers folders that "look like a
   section"** — i.e. contain an `index.md` or `section.json`. Empty folders and
   asset/image folders are ignored. **Trade-off:** this avoids false positives on
   legitimate non-section folders, at the cost of not catching an intended-but-
   empty section (an empty folder is indistinguishable from a legitimate asset
   folder). A future low-severity `empty-folder` info rule could cover that
   without risking false positives on real structure.

8. **Slug/folder matching is by full path, case-sensitive.** A nested section's
   `slug` in `theneo.json` is its full path (`guides/auth`), matching its folder
   at `guides/auth`. A folder that matches a declared slug case-insensitively but
   not exactly is reported as a distinct `section-slug-matches-folder` error
   (not as an orphan), so the finding is precise.

9. **Follows existing CLI patterns.** The command is registered like every other
   (`initAuditCommand`), and its action is wrapped in the shared `tryCatch`
   helper and uses `process.exit(1)` on error, matching the rest of the CLI.

---

## Rules (Tier 1)

| Rule id | Severity | `needsDisk` |
| --- | --- | --- |
| `project-directory-exists` | error | true |
| `theneo-json-exists` | error | true |
| `theneo-json-required-fields` | error | false |
| `section-declaration-valid` | error | false |
| `duplicate-section-slug` | error | false |
| `no-root-index-md` | error | true |
| `section-has-index-md` | error | true |
| `section-has-section-json` | error | true |
| `section-slug-matches-folder` | error | true |
| `orphan-declared-missing` | error | true |
| `orphan-on-disk-undeclared` | warning | true |
| `section-json-valid` | error | true |
| `section-json-http-verb` | error | false |

Findings are sorted deterministically (by `file`, then `line`, `rule`, `message`)
so output order is stable across machines and filesystems.

---

## Known behaviors & limitations

These are deliberate decisions or accepted limitations, surfaced by a critical
review pass:

- **Content rules validate every on-disk `section.json`, declared or not.** An
  undeclared folder is normally a `warning` (exit 0), but if its `section.json`
  is malformed or has a bad verb it also raises an `error` (exit 1). The rationale
  is that a file that looks like a section and is broken is worth failing on; the
  alternative (only content-checking declared sections) is a reasonable future
  change.
- **`section-json-valid` / `section-json-http-verb` are not short-circuited by a
  broken `theneo.json`.** Unlike the declared-tree rules (decision #2 above),
  these run off the on-disk folders, so a broken `theneo.json` plus a corrupt
  `section.json` reports both. Content validity is independent of the declared
  list by design.
- **Empty / asset folders are ignored** (decision #7): only folders containing
  `index.md` or `section.json` are treated as sections, so an intended-but-empty
  section is not caught. A future low-severity `empty-folder` info rule could
  cover it.
- **Directory resolution re-reads directories per declared section** (O(N×D)
  `readdir`) on top of the full disk walk. Fine for typical projects; for very
  large trees the declared resolution could reuse the walk's directory map.
- **Symlinked directories are skipped** (they report as non-directories via
  `withFileTypes`), which prevents walk cycles but means content reached only
  through a symlink is not audited.

---

## How it was verified

- **Automated tests (48).** Engine, loader, and every rule via committed
  fixtures under `tests/audit/fixtures/` (a valid project + one broken case per
  rule + a nested-container regression fixture) plus unit tests for the verb,
  declaration, duplicate-slug, and sorting logic. Exit codes and `--json` output
  are asserted. Tests fail if a rule is broken.
- **Real project data.** Exported the official Theneo sample project and audited
  it. This surfaced the two false positives above (parent containers, empty
  methods), which were then fixed and locked in with a regression fixture.
- **Independent oracle.** A separate script reconciled the audit's output against
  the real project's actual structure (68 declared sections, 63 disk folders) —
  no false positives and no false negatives.
- **Break matrix on the real project.** Every rule was triggered on copies of the
  real project (delete / rename / add / corrupt / edit), including the
  leaf-vs-parent exemption boundaries, case-insensitive and `CONNECT` verbs, and
  a single project that triggers all rules at once.

Quality gates: `tsc --noEmit`, `eslint ./src ./tests`, `npm run build` all pass;
strict TypeScript throughout, no unjustified `any`.

---

## What I'd do with more time

- **Tier 2 (tabs)** and **Tier 3 (MDX)** — the next tickets.
- **Extract `audit-core` into a shared published package** so the platform can
  reuse the content rules for a server-side pre-save / AI-editor guardrail.
- **Optional `empty-folder` info-level rule** (decision #7).
- **Line numbers** for `section.json`/MDX findings where practical.
- **Configurable required fields**, if projects vary.

---

## Open question — should `audit` auto-run before `import` / `create` and block on errors?

My view: **run it automatically, but block only on errors, and make it
overridable.** Before an `import`/`create` that reads a local project, run the
Tier-1 checks; if there are error-level findings, stop and print them (with a
`--no-audit` / `--force` escape hatch), while warnings only print. This catches
broken structure before it reaches the server, where the failure mode is worse
(partial import, confusing server-side errors). It should be a fast, local,
no-API-key pre-flight — which is exactly what this command already is. The
override matters because the audit encodes assumptions (e.g. parent-container
behavior) that should never hard-block a user who knows their project is fine.

---

## AI-usage log

- Used Claude Code to research the on-disk format's source of truth in the
  platform monorepo (`packages/services/api/section.service.js`,
  `packages/validations/sections.js`) rather than guessing the schema.
- Used it to design the pure-core/adapter architecture and the `needsDisk`
  reuse seam, implement the loader, rules, fixtures, and tests, and align the
  command with existing CLI conventions.
- Used it to run a critical test pass against real exported project data, which
  is what surfaced the parent-container and empty-method false positives; those
  were diagnosed with an independent reconciliation oracle and fixed.
