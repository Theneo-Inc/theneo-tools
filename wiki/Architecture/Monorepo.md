# Monorepo Setup

Theneo Tools uses a monorepo architecture managed with npm workspaces and TurboRepo.

## Overview

```
theneo-tools/
├── packages/
│   ├── theneo-cli/     # @theneo/cli
│   └── theneo-sdk/     # @theneo/sdk
├── package.json        # Root workspace config
└── turbo.json          # TurboRepo config
```

## npm Workspaces

Workspaces are defined in the root `package.json`:

```json
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

This enables:
- Single `npm install` for all packages
- Cross-package dependencies
- Shared node_modules with hoisting

## Package Dependencies

The CLI depends on the SDK:

```json
// packages/theneo-cli/package.json
{
  "dependencies": {
    "@theneo/sdk": "*"
  }
}
```

The `*` means "use the local workspace version."

## TurboRepo

TurboRepo orchestrates builds and other tasks across packages.

### Configuration

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "outputs": ["dist/**", "build/**", "public/build/**"],
      "dependsOn": ["^build"]
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

### Task Dependencies

- `^build`: Build dependencies first (SDK before CLI)
- `lint` depends on `^build`: Lint after dependencies are built
- `dev`: No caching, persistent for watch mode

### Running Tasks

```bash
# Build all packages (SDK first, then CLI)
npm run build

# Build is equivalent to:
turbo run build

# Lint all packages
npm run lint

# Dev mode (watch)
npm run dev
```

## Development Workflow

### 1. Install Dependencies

```bash
npm install
```

This installs dependencies for all packages.

### 2. Build All Packages

```bash
npm run build
```

Builds in dependency order:
1. `@theneo/sdk` (no dependencies)
2. `@theneo/cli` (depends on SDK)

### 3. Development Mode

```bash
npm run dev
```

Watches all packages and rebuilds on changes.

### 4. Install CLI Locally

```bash
npm run cli
```

This runs `turbo build lint && npm i -g ./packages/theneo-cli`.

## Package Versioning

Theneo Tools uses [Changesets](https://github.com/changesets/changesets) for versioning.

### Creating a Changeset

```bash
npm run changeset
```

This interactive command:
1. Asks which packages changed
2. Asks for version bump type (patch/minor/major)
3. Asks for a summary
4. Creates a changeset file in `.changeset/`

### Changeset Configuration

```json
// .changeset/config.json
{
  "$schema": "https://github.com/changesets/changesets/blob/main/packages/config/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

### Version Bumps

When merging to main, the release workflow:
1. Collects all changesets
2. Updates package versions
3. Updates changelogs
4. Publishes to npm

## Cross-Package Development

### Using SDK in CLI

The CLI imports SDK directly:

```typescript
// packages/theneo-cli/src/...
import { Theneo, Result } from '@theneo/sdk';
```

Changes to SDK are immediately available in CLI after rebuild.

### Path Aliases

The SDK uses path aliases for cleaner imports:

```json
// packages/theneo-sdk/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "theneo/*": ["./src/*"],
      "theneo": ["./src/index.ts"]
    }
  }
}
```

This allows:
```typescript
import { ApiHeaders } from 'theneo/requests/base';
```

## Adding a New Package

1. Create package directory:
   ```bash
   mkdir packages/new-package
   cd packages/new-package
   ```

2. Initialize package:
   ```bash
   npm init
   ```

3. Add to workspace (automatic via `packages/*` glob)

4. Add build scripts matching turbo tasks:
   ```json
   {
     "scripts": {
       "build": "...",
       "lint": "...",
       "dev": "..."
     }
   }
   ```

5. Install and build:
   ```bash
   cd ../..
   npm install
   npm run build
   ```

## CI/CD Integration

The monorepo CI runs on all packages:

```yaml
# .github/workflows/pr.yml
- run: npm ci          # Install all
- run: npm run build   # Build all (via Turbo)
- run: npm run lint    # Lint all (via Turbo)
```

TurboRepo provides:
- Parallel execution where possible
- Caching of unchanged packages
- Correct dependency ordering

## Best Practices

1. **Keep SDK independent**: SDK should not depend on CLI
2. **Shared configs at root**: ESLint, Prettier, TypeScript base configs
3. **Use changesets**: For proper versioning and changelogs
4. **Test changes across packages**: Rebuild and test CLI when SDK changes
5. **Use turbo for tasks**: Ensures correct ordering and caching
