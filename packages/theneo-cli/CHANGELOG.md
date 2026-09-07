# @theneo/cli

## 0.23.0

### Minor Changes

- fe66bc1: Add malformed-tag detection to `theneo audit` (Tier 3 follow-up). A new `mdx-malformed-tag` rule flags broken Theneo tag syntax in each section's `index.md`, each an error with a line number: an opening tag that never closes its `>` before the next `<` or end of line (`<table-cell<p …>`), a closing tag missing its `>` (`</Callout` …), and an `attributes` value with an unterminated quote. Detection is limited to recognized Theneo tags (the widgets plus structural tags `table-row`, `table-cell`, `title`, `description`) and skips fenced code blocks and `<CodeLine>` bodies, so `<`/`>` in code (`Map<String>`), math (`a<b`), and prose are never flagged. Out of scope (documented): general HTML well-formedness, malformed tags inside code blocks, and a missing `>` that merges the tag name into adjacent text (`<CodeLinecurl…`) — all of which would reintroduce false positives.

## 0.22.0

### Minor Changes

- a6f3d82: Add Tier 3 (MDX) validation to `theneo audit`. Each section's `index.md` is parsed for widget tags (quote-aware, skipping fenced code blocks) and checked: every widget's `attributes` prop is valid JSON (error); paired tags are balanced (error); a `<TabPanel>` sits directly inside a `<Tabs>` and its `tabTitle` matches one of the parent's declared tabs (error); a `<Callout>` `dataType` is one of `info`/`warning`/`error`/`success` (error); and a widget nested more than one level deep is flagged (warning). Findings include a line number. The structural checks (valid JSON, balance, nesting) apply to a known set of Theneo widget names, so prose that happens to contain angle-bracket text (e.g. `<Bearer Token>` in an auth example) is not mistaken for a widget. Parsing lives in a pure `mdx.ts` module, so these content rules can be reused by a future server-side pre-save checker.

## 0.21.0

### Minor Changes

- f7b5c44: Add a `theneo audit` command that validates a Theneo documentation project on disk and exits non-zero when it finds errors, so structural mistakes are caught locally or in CI instead of at import or publish time.

  Tier 1 (structure) rules: `theneo.json` exists at the root, is valid JSON, and has the required top-level fields; every declared section folder has both `index.md` and `section.json`; folder path matches its `slug` (case-sensitive); orphan detection in both directions (declared-but-missing = error, on-disk-but-undeclared = warning); no `index.md` at the project root; and each `section.json` is valid JSON with a valid HTTP verb when `endpoints.method` is set. Supports `--dir` and a pipeable `--json` output; exits `1` on any error-level finding.

- d29de6c: Add Tier 2 (tabs) validation to `theneo audit`. The command now checks tab-level consistency in `theneo.json`: `tabs` is an array (error); every tab has a non-empty `title` and `slug` (error); tab slugs are unique (error); a tab sets exactly one of `iconUrl` or `svgCode` (warning on both or neither); every top-level section is claimed by exactly one tab (error on zero or two-plus when tabs exist); each slug listed under a tab's `sections` resolves to a real section (error); and each section's `index.md` starts with a `<!-- tab:slug -->` marker that matches a declared tab (error if missing or unknown, warning if present but not at the very top, with a line number). The marker scan skips YAML frontmatter and fenced code blocks so example markers in docs are not mistaken for the real one. These are content rules (`needsDisk: false`, except the marker check) so they can be reused by a future server-side pre-save checker.

## 0.19.0

### Minor Changes

- a23ed39: new --tabs flag; ui enhancements

### Patch Changes

- Updated dependencies [a23ed39]
  - @theneo/sdk@0.16.0

## 0.18.0

### Minor Changes

- CLI export feature improvements

### Patch Changes

- Updated dependencies
  - @theneo/sdk@0.15.1

## 0.17.0

### Minor Changes

- a8cdc5d: Add OpenAPI export function

### Patch Changes

- Updated dependencies [a8cdc5d]
  - @theneo/sdk@0.15.0

## 0.16.1

### Patch Changes

- 47503a9: versionSlug is undefined for add-subscribers

## 0.16.0

### Minor Changes

- 2943104: \* Revert back to npm
  - Add default project version flag
  - Add subscribe to changelog command

### Patch Changes

- Updated dependencies [2943104]
  - @theneo/sdk@0.14.0

## 0.15.0

### Minor Changes

- dc70020: Change npm with pnpm

### Patch Changes

- Updated dependencies [dc70020]
  - @theneo/sdk@0.13.0

## 0.14.0

### Minor Changes

- b985ba4: - Create new project version when does not exist during import
  - Check if export directory is empty

## 0.13.0

### Minor Changes

- 40da0a5: \* Add version support to export functional
  - Add different api support when using login command
  - Fix version import for cli

### Patch Changes

- Updated dependencies [40da0a5]
  - @theneo/sdk@0.11.0

## 0.12.1

### Patch Changes

- 2d2b1ba: Set specific theneo sdk version instead of asterisk

## 0.12.0

### Minor Changes

- ecefbc9: Deprecate project key flag

## 0.11.0

### Minor Changes

- 4a1c89a: Update minimum node version to 18

### Patch Changes

- a88fc7f: Update version flag
- Updated dependencies [4a1c89a]
  - @theneo/sdk@0.10.0

## 0.10.1

### Patch Changes

- edd69fd: Update CLI documentation

## 0.10.0

### Minor Changes

- 149bb2a: \* Added project version operations
  - Added merge options
  - Update package versions

### Patch Changes

- Updated dependencies [149bb2a]
  - @theneo/sdk@0.9.0

## 0.9.0

### Minor Changes

- 0a4c8c3: Added import option from directory of markdown files

### Patch Changes

- Updated dependencies [0a4c8c3]
  - @theneo/sdk@0.8.0

## 0.8.0

### Minor Changes

- 9f1056b: Added append option for file import type
  Updated cli login flag

### Patch Changes

- Updated dependencies [9f1056b]
  - @theneo/sdk@0.7.0

## 0.7.0

### Minor Changes

- 4f6673b: Updated dependencies and added import metadata for sdk import project function

### Patch Changes

- Updated dependencies [4f6673b]
  - @theneo/sdk@0.6.0

## 0.6.1

### Patch Changes

- eb22d93: Updated create project from local directory
- Updated dependencies [eb22d93]
  - @theneo/sdk@0.5.1

## 0.6.0

### Minor Changes

- 262e9ac: Added experimental commands for creating and exporting theneo documentation with markdown files

### Patch Changes

- Updated dependencies [262e9ac]
  - @theneo/sdk@0.5.0

## 0.5.1

### Patch Changes

- 70703ef: Remove final block from try catch

## 0.5.0

### Minor Changes

- 11bfe22: update preview, linters and added try catches for command functions

### Patch Changes

- Updated dependencies [11bfe22]
  - @theneo/sdk@0.4.0

## 0.4.0

### Minor Changes

- 0ccc9f2: Update project creation and import commands and error messages

### Patch Changes

- Updated dependencies [0ccc9f2]
  - @theneo/sdk@0.3.1

## 0.3.3

### Patch Changes

- Update readme

## 0.3.2

### Patch Changes

- Fix indexes for selecting a project

## 0.3.1

### Patch Changes

- fixed file and link import bug

## 0.3.0

### Minor Changes

- 91e8355: Added postman support

### Patch Changes

- Updated dependencies [91e8355]
  - @theneo/sdk@0.3.0

## 0.2.0

### Minor Changes

- 0fee7d6: Update SDK to new API and added Preview command

### Patch Changes

- Updated dependencies [0fee7d6]
  - @theneo/sdk@0.2.0

## 0.1.1

### Patch Changes

- f68a820: Added npm ignore and updated versioning for sdk package
- Updated dependencies [f68a820]
  - @theneo/sdk@0.1.1

## 0.1.0

### Minor Changes

- initalize theneo sdk

### Patch Changes

- Updated dependencies
  - @theneo/sdk@0.1.0
