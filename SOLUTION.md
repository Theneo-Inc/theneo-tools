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

This document covers **Tier 1 (structure)**, **Tier 2 (tabs)**, and
**Tier 3 (MDX widgets)** — all complete.

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
  marker.ts      parse an index.md tab marker          (pure, no I/O)
  mdx.ts         parse index.md widget tags + nesting  (pure, no I/O)
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

## Key decisions (Tier 2 — tabs)

10. **The tab rules run on the content model, not the disk layout.** Four of the
    five tab rules are `needsDisk: false` — they read only `theneo.json`. This is
    the reuse seam the ticket asked for: a future server-side pre-save checker can
    run them against an in-memory project with no filesystem. Only
    `index-tab-marker` is `needsDisk: true`, because it must read `index.md`
    content; even so, the *parsing* is isolated in a pure `marker.ts`, so the rule
    itself stays a pure function of the model.

11. **"Exactly one tab" applies to top-level sections only.** Tabs group top-level
    sections (`getting-started`); children (`getting-started/introduction`) inherit
    their parent's tab and are never listed in a tab's `sections`. Applying the
    membership rule to every declared section would flag every child as "in zero
    tabs" — a flood of false positives. So the rule iterates only sections marked
    `topLevel` (declared directly in the root `sections` array), a flag the loader
    now records. This is the single most important semantic call in Tier 2.

12. **Tab rules are gated on `tabs` being non-empty.** A project may legitimately
    have no tabs (`"tabs": []`). The membership and marker rules only run when at
    least one tab is declared — otherwise a tab-less project (and the existing
    Tier-1 `valid`/`valid-nested` fixtures, which have empty tabs and no markers)
    would be flagged. This is what keeps Tier 2 from producing false positives on
    the pre-existing valid fixtures.

13. **`title`/`slug` are normalized to "present only when a non-empty string".**
    The loader stores a tab's `title`/`slug` only when they are non-empty strings,
    so `undefined` is exactly the "missing or empty" case `tab-fields-required`
    flags — the rule needs no re-validation of the raw JSON.

14. **The icon rule checks presence, not validity.** `tab-icon-xor-svg` warns when
    a tab has both `iconUrl` and `svgCode`, or neither — it does **not** verify the
    URL points at a real image or that the SVG is well-formed. **Trade-off:** this
    keeps the rule cheap and offline (no network), at the cost of passing a tab
    whose `iconUrl` is a non-image link. A stricter "looks like an image URL" check
    is a possible future enhancement (noted below).

15. **The marker "at top" check ignores leading blank lines.** A marker is "at the
    top" when it is the *first non-blank line* — so a file that opens with a blank
    line then the marker still passes, but a heading or prose before the marker is
    a warning. Missing marker or a slug that matches no declared tab is an error.

---

## Key decisions (Tier 3 — MDX widgets)

16. **A small purpose-built tag scanner, not a full MDX/AST parser.** Real Theneo
    `index.md` bodies are HTML-ish, not clean JSX: Callouts wrap raw `<p>`, code
    lines contain literal `<`/`{`/quotes, and an `attributes` value can contain
    `>` (e.g. a Mermaid `-->`). A pure `mdx.ts` scans tags **quote-aware** (a `>`
    inside a quoted prop does not end the tag) and **skips fenced code blocks**, so
    it handles the real content without pulling in an MDX toolchain. Tag openers
    are assumed single-line (true across all real exports).

17. **The parser matches a known set of Theneo widget names, not "any capitalized
    tag."** This started out generic (any `<Capitalized>` tag), but real API docs
    contain literal prose like `Authorization: <Bearer Token>` inside a `<span>` —
    which a generic parser reads as an unclosed `<Bearer>` widget and then cascades
    into bogus nesting warnings. So `mdx.ts` only treats a curated `WIDGET_NAMES`
    set as widgets; unknown `<Capitalized>` text is ignored. **Trade-off:** a
    brand-new Theneo widget is skipped until added to the set — but that is a false
    *negative* (miss), which is far safer for a validator than a false *positive*
    (crying wolf on valid content). Lowercase tags (`<p>`, `<table-row>`) are
    content, never widgets.

18. **`attributes` is a single-quoted JSON string, and `dataType` lives inside it.**
    Confirmed from real exports: `attributes='{"dataType":"info",…}'`. So the JSON
    rule parses the quoted string, and the Callout rule reads `dataType` out of the
    parsed object (not a separate prop).

19. **Valid Callout `dataType` = `info`, `warning`, `error`, `success`.** Real data
    proves the first three; `success` was added as a known valid green style. The
    platform does not expose the list in this repo, so — like the HTTP-verb set in
    Tier 1 — this is a curated constant to revisit if the platform adds types.

20. **`TabPanel` is checked two ways.** It must sit *directly* inside a `<Tabs>`,
    and its `tabTitle` must be one of the titles the parent Tabs declares in its
    `attributes.tabs` array (real syntax: `<Tabs attributes='{"tabs":["Tab 1",…]}'>`
    with `<TabPanel tabTitle="Tab 1">`). Both are errors.

21. **Nesting depth is generic and a warning.** Depth counts only widget ancestors;
    one level of widget-in-widget is allowed (this covers every real pattern —
    `CardGroup>Card`, `Tabs>TabPanel`, `CodeBlock>CodeLine`), and a widget two or
    more deep is a `warning` (never blocks CI). This needs no widget classification
    and produced **zero findings on a real 15-widget document**. **Trade-off:** a
    legitimately deep-but-intentional structure (say a CodeBlock inside a TabPanel)
    is warned about; a warning, not an error, is the deliberately soft answer.
    The rule also **stands down entirely for a file with unbalanced tags** — an
    unclosed tag makes every downstream depth wrong, so it would otherwise flood a
    single balance error with dozens of bogus nesting warnings. Fix the balance,
    re-run, and real nesting surfaces (same "root cause, not cascade" principle as
    the `theneo.json` short-circuit).

22. **Code-widget bodies are opaque.** `<CodeBlock>` and `<CodeLine>` hold literal
    code, and API docs routinely show widget syntax there as examples
    (`<CodeLine>Use <Callout> like this</CodeLine>`). Scanning that content would
    read the example `<Callout>` as a real (unclosed) widget and cascade into fake
    balance errors, so the scanner treats everything between a code-widget open and
    its matching close as raw text — no tags parsed inside (the same way HTML
    parsers treat `<script>`). The code widget's own `attributes` and balance are
    still checked.

23. **Remaining scanner blind spots** (accepted for a bonus tier, not seen in real
    exports): a widget tag that spans multiple lines is not recognized, a single
    quote inside an `attributes` value (`"it's"`) breaks the quoted-string parse,
    and a *known* widget name typed as prose in angle brackets outside any code is
    read as a tag. A full AST-based MDX parser would close these if Tier 3
    graduates from bonus; they are documented rather than papered over.

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

## Rules (Tier 2 — tabs)

| Rule id | Severity | `needsDisk` |
| --- | --- | --- |
| `tabs-declaration-valid` | error | false |
| `tab-fields-required` | error | false |
| `duplicate-tab-slug` | error | false |
| `tab-icon-xor-svg` | warning | false |
| `section-in-exactly-one-tab` | error (zero or two-plus) | false |
| `tab-sections-resolve` | error | false |
| `index-tab-marker` | error (missing/unknown) · warning (not at top) | true |

The marker scan (`marker.ts`) skips leading YAML frontmatter and fenced code
blocks, so a marker shown as example content inside a code block is not mistaken
for the section's real marker, and a marker placed right after frontmatter still
counts as "at the top".

## Rules (Tier 3 — MDX widgets)

| Rule id | Severity | `needsDisk` |
| --- | --- | --- |
| `mdx-attributes-json` | error | true |
| `mdx-tags-balanced` | error | true |
| `mdx-tabpanel-parent` | error | true |
| `mdx-callout-datatype` | error | true |
| `mdx-nesting-depth` | warning | true |
| `mdx-malformed-tag` | error | true |

All carry a **line number**. They are `needsDisk: true` only because they read
`index.md` content; the parsing itself is a pure function (`mdx.ts`), so a future
content-model caller can reuse the rules by supplying a parsed document.

`mdx-malformed-tag` (a Tier 3 follow-up) flags broken tag *syntax* — an opening
tag missing its `>` (`<table-cell<p …>`), a closing tag missing its `>`, or an
unterminated `attributes` quote. It runs as a **separate, additive scan**
(`scanMalformed`) with its own finding list, so the existing balance/nesting logic
is untouched. Recognized tags for this rule are the widgets **plus** the structural
sub-tags (`table-row`, `table-cell`, `title`, `description`) — kept in a
detection-only set so they never enter the balance/nesting stacks (which would
false-flag nesting on a normal `<Table>`/`<Card>`). Because several recognized
names are ordinary words (`title`, `description`, `Table`, `Card`, `Step`…), a
malformation is only reported when the text between the tag name and the
terminator is genuinely **tag-like** — whitespace plus real `key="value"`
attributes. This is what keeps prose such as "the `<title` element and
`<description` field" or "use the `<Table` below" from being read as broken tags,
while a real `<table-cell<p …>` or `<Callout attributes='…'` (missing `>`) is
still flagged. **Out of scope** (documented to
avoid false positives): general HTML well-formedness; malformed tags inside code
blocks / `<CodeLine>` bodies; a missing `>` that merges the tag name into
adjacent text (`<CodeLinecurl…`), which is unsafe to detect because prefix-matching
would misfire on real widgets sharing a prefix (`Step`/`Steps`, `Card`/`CardGroup`);
and a single recognized tag deliberately split across multiple lines (not produced
by the exporter), which is read as unterminated on its first line.

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

Tier 2 specific (surfaced by an adversarial review pass; the first two below were
fixed, the rest are accepted limitations):

- **Fixed — malformed `tabs` reports clean.** A `tabs` value that is not an array
  used to be silently ignored (exit 0 on a broken project). Now
  `tabs-declaration-valid` flags it.
- **Fixed — example markers in code blocks / frontmatter.** The context-free
  marker scan used to treat a `<!-- tab:… -->` inside a code fence as the real
  marker and to warn when YAML frontmatter preceded the marker. The scanner now
  skips fences and frontmatter.
- **A malformed tab cascades into the marker rule.** A tab missing its `slug`
  produces the correct `tab-fields-required` error *and* an `index-tab-marker`
  error on every section whose marker referenced the intended slug. The root
  cause is reported; the extra errors are noise. Not short-circuited (unlike the
  `theneo.json` case) to avoid hiding a genuine marker typo.
- **`tab-icon-xor-svg` checks presence, not validity** (decision #14): any
  non-empty `iconUrl` passes, even a non-image link.
- **`isSinglePage` is not consulted.** A single-page project that still carries a
  `tabs` array would be held to the tab/marker rules.
- **Tab membership assumes tabs list top-level slugs.** Putting a child slug in a
  tab's `sections` passes `tab-sections-resolve` but does not satisfy the parent's
  membership, so the two rules can disagree on unusual configs.

---

## How it was verified

- **Automated tests (116).** Engine, loader, and every rule via committed
  fixtures under `tests/audit/fixtures/` (a valid project + one broken case per
  rule + a nested-container regression fixture) plus unit tests for the verb,
  declaration, duplicate-slug, and sorting logic. Exit codes and `--json` output
  are asserted. Tests fail if a rule is broken (proven by breaking a rule and
  watching the matching test go red).
- **Tier 2 specifically.** The shared `valid` fixture was *extended* (not
  duplicated) with real tabs + `<!-- tab:docs -->` markers and still produces zero
  findings — the no-false-positives guarantee. Six broken tab fixtures
  (`tab-marker-bad`, `slug-in-two-tabs`, `tab-missing-section`, `tab-icon-xor`,
  `tabs-not-array`, `duplicate-tab-slug`) each assert their one expected finding.
  The pure `marker.ts` parser (including the frontmatter and code-fence cases) and
  every tab rule branch not covered by a fixture (empty title/slug, both-icons,
  zero-tab membership, missing marker, marker-not-at-top warning) are unit-tested
  against hand-built models. A single combined project was also audited by hand to
  confirm Tier 1 and Tier 2 rules fire together in one pass.
- **Tier 3 specifically.** The **valid fixture is a real, widget-rich exported
  page** (`valid-widgets`, all 15 widget types) and produces **zero findings** —
  the strongest no-false-positives check. Five broken fixtures (`mdx-bad-json`,
  `mdx-unbalanced`, `mdx-tabpanel-orphan`, `mdx-callout-datatype`, `mdx-nesting`)
  each assert their one expected finding and line number. The pure `mdx.ts` parser
  is unit-tested for the hard cases (a `>` inside an `attributes` value, self-
  closing tags, fenced-code skipping, nesting depth, parent linking, unbalanced
  detection), and every MDX rule branch has a hand-built-model unit test.
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

- **Extract `audit-core` into a shared published package** so the platform can
  reuse the content rules for a server-side pre-save / AI-editor guardrail.
- **Confirm the MDX blind spots** (decision #22) with a real AST-based MDX parser
  if Tier 3 graduates from bonus — multi-line tags and `<Capitalized>` tokens in
  code text.
- **Verify the full Callout `dataType` set** (decision #19) against the platform.
- **Optional `empty-folder` info-level rule** (decision #7).
- **Stricter tab-icon check** (decision #14): warn when `iconUrl` is not a
  plausible image URL, so a non-image link like a chat-app URL is caught.
- **Line numbers** for `section.json`/MDX findings where practical (the marker
  rule already reports one).
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
- For Tier 2, used it to extend the model/loader with tabs + marker parsing,
  implement the five tab rules, and build the fixtures and unit tests. Validated
  end-to-end against real exported projects (`diva`, `diva2`) — including watching
  the icon warning clear once a real `iconUrl` was added — and against a purpose-
  built broken project that fires all five tab rules plus Tier 1 rules in one run.
- For Tier 3, used it to research the real widget/MDX format from exported pages
  (the `attributes='…JSON…'` shape, `dataType` inside it, the real `Tabs`/`TabPanel`
  syntax), design the quote- and fence-aware `mdx.ts` scanner, implement the five
  rules, and build fixtures from a real 15-widget page plus broken variants.
  Validated that the real page produces zero findings and each broken case fires
  with the right line number.
