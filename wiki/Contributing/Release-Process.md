# Release Process

How Theneo Tools packages are versioned and released.

## Overview

Theneo Tools uses [Changesets](https://github.com/changesets/changesets) for version management and automated releases via GitHub Actions.

## Versioning Strategy

Both packages follow [Semantic Versioning](https://semver.org/):

- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): New features, backward compatible
- **Patch** (0.0.X): Bug fixes, backward compatible

## Release Workflow

### 1. Make Changes

Develop your feature or fix in a branch.

### 2. Create a Changeset

Before creating a PR, add a changeset:

```bash
npm run changeset
```

This interactive command asks:
1. Which packages changed? (select with space)
2. What type of change? (major/minor/patch)
3. Summary of changes

This creates a file in `.changeset/`:

```markdown
---
"@theneo/cli": minor
"@theneo/sdk": patch
---

Added new export format option and fixed SDK type issue.
```

### 3. Submit PR

Push your branch and create a PR. Include the changeset file.

### 4. PR Review and Merge

After review, the PR is merged to `main`.

### 5. Automated Release

When merged to `main`, the release workflow:

1. Collects all changesets
2. Creates a "Version Packages" PR with:
   - Updated package versions
   - Updated CHANGELOG.md files
3. When "Version Packages" PR is merged:
   - Packages are published to npm
   - Git tags are created

## Manual Steps

### Creating a Changeset

```bash
# Interactive mode
npm run changeset

# Output example:
# 🦋 Which packages would you like to include?
# ◯ @theneo/cli
# ◯ @theneo/sdk
#
# 🦋 Which packages should have a major bump?
# 🦋 Which packages should have a minor bump?
# 🦋 Please enter a summary for this change:
```

### Viewing Pending Changes

```bash
# List pending changesets
ls .changeset/*.md

# View specific changeset
cat .changeset/fuzzy-lions-dance.md
```

### Removing a Changeset

If you need to undo a changeset:

```bash
rm .changeset/fuzzy-lions-dance.md
```

## Changeset Guidelines

### When to Create a Changeset

**Do create:**
- New features
- Bug fixes
- Breaking changes
- Documentation improvements that affect usage

**Don't create:**
- Internal refactoring
- Test changes
- CI/CD changes
- Development tooling changes

### Writing Good Summaries

```markdown
---
"@theneo/cli": minor
---

Added `--tab` flag to export and import commands for targeting specific tabs.
```

Keep summaries:
- Concise but descriptive
- User-focused (what changed for them)
- Written in past tense

### Multiple Package Changes

```markdown
---
"@theneo/cli": minor
"@theneo/sdk": minor
---

Added project version management with new CLI commands and SDK methods.
```

## CI/CD Pipeline

### PR Workflow (`.github/workflows/pr.yml`)

Runs on every PR:

```yaml
- npm ci
- npm run build
- npm run lint
```

Tests on Node 18.x and 20.x.

### Release Workflow (`.github/workflows/release.yml`)

Runs on push to `main`:

```yaml
- npm ci
- npm run build
- npm run lint
- changesets/action (publish)
```

### Required Secrets

| Secret | Purpose |
|--------|---------|
| `PAT` | GitHub token for creating releases |
| `NPM_TOKEN` | npm token for publishing |

## Package Publication

### npm Registry

Both packages are published to npm:

- [@theneo/cli](https://www.npmjs.com/package/@theneo/cli)
- [@theneo/sdk](https://www.npmjs.com/package/@theneo/sdk)

### Access Level

```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

Both packages are publicly accessible.

## Changelog

Each package maintains a CHANGELOG.md:

```markdown
# @theneo/cli

## 0.19.0

### Minor Changes

- Added `--tab` flag for export/import

### Patch Changes

- Fixed error handling in login command
```

Changesets automatically maintains this.

## Emergency Hotfix

For urgent fixes:

1. Create fix branch from `main`
2. Make minimal fix
3. Create changeset (usually `patch`)
4. Create PR with `[HOTFIX]` prefix
5. After fast review, merge to `main`
6. Monitor release workflow

## Rollback

If a bad release goes out:

### npm Deprecation

```bash
npm deprecate @theneo/cli@0.19.0 "Critical bug, please use 0.19.1"
```

### Unpublish (within 72 hours)

```bash
npm unpublish @theneo/cli@0.19.0
```

**Note**: Unpublish is discouraged. Prefer deprecation and quick patch.

## Version Checking

### Check Current Versions

```bash
# From package.json
cat packages/theneo-cli/package.json | grep version
cat packages/theneo-sdk/package.json | grep version

# From npm
npm view @theneo/cli version
npm view @theneo/sdk version
```

### Check Pending Changesets

```bash
# See what version bumps are pending
npx changeset status
```

## Troubleshooting

### Release Workflow Failed

1. Check GitHub Actions logs
2. Common issues:
   - npm token expired
   - Build failure
   - Lint errors

### Package Not Published

1. Check if changeset was included in PR
2. Check release workflow logs
3. Verify npm token is valid

### Wrong Version Published

1. Create immediate patch release
2. Deprecate bad version
3. Communicate to users if breaking
