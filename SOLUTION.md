# Theneo audit assignment

## Summary

Implemented a top-level `theneo audit` command for validating exported or manually edited Theneo markdown projects before import.

The command supports:

- `theneo audit --dir <directory>`
- `theneo audit --json`
- non-zero exit when any error is found
- human-readable findings with file locations, rule IDs, and remediation text

## Validation coverage

Tier 1:

- verifies `theneo.json` exists at the project root
- validates required root fields: `id`, `name`, `sections`, `tabs`
- rejects root-level `index.md`
- checks every manifest section has a matching folder
- checks every declared section folder contains `index.md` and `section.json`
- warns about section folders on disk that are not declared in `theneo.json`
- validates required `section.json` keys and HTTP method values

Tier 2:

- validates tab title, slug, sections array, and icon conflict metadata
- verifies tab section references resolve to declared sections
- enforces that each section slug belongs to exactly one tab
- validates markdown tab markers and reports missing, invalid, late, or non-top markers

## Files changed

- `packages/theneo-cli/src/commands/audit/auditor.ts`
- `packages/theneo-cli/src/commands/audit/index.ts`
- `packages/theneo-cli/src/commands/index.ts`
- `packages/theneo-cli/tests/audit.spec.ts`
- `packages/theneo-cli/tests/fixtures/audit/**`
- `packages/theneo-cli/README.md`
- `.changeset/silent-cycles-shout.md`

## Verification

Commands run:

```bash
npm install
npm run build -w @theneo/sdk
npm run build -w @theneo/cli
npm test -w @theneo/cli -- --runInBand
```

`npm test -w @theneo/cli -- --runInBand` passes 8 audit tests covering the valid fixture and the requested broken fixture cases.
