# Build System

Technical details about the Theneo Tools build system.

## Build Tools

| Package | Build Tool | Output |
|---------|------------|--------|
| @theneo/cli | TypeScript Compiler (tsc) | CommonJS |
| @theneo/sdk | tsup | CommonJS + ESM + Types |

## CLI Build

The CLI uses standard TypeScript compilation.

### Configuration

```json
// packages/theneo-cli/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Build Command

```bash
cd packages/theneo-cli
npm run build
# Runs: tsc
```

### Output Structure

```
packages/theneo-cli/dist/
├── bin.js
├── bin.d.ts
├── commands/
│   ├── index.js
│   ├── login.js
│   └── ...
├── config-manager/
├── core/
└── utils/
```

### Entry Point

```javascript
// packages/theneo-cli/bin/index.js
#!/usr/bin/env node
require('../dist/bin');
```

## SDK Build

The SDK uses [tsup](https://tsup.egoist.dev/) for building.

### Configuration

```json
// packages/theneo-sdk/package.json
{
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts"
  }
}
```

### Build Command

```bash
cd packages/theneo-sdk
npm run build
# Runs: tsup src/index.ts --format cjs,esm --dts
```

### Output Structure

```
packages/theneo-sdk/dist/
├── index.js       # CommonJS
├── index.mjs      # ES Modules
├── index.d.ts     # TypeScript declarations
└── index.d.mts    # ESM declarations
```

### Why tsup?

- **Dual format**: Outputs both CJS and ESM
- **Bundling**: Creates a single output file
- **Fast**: Uses esbuild under the hood
- **DTS**: Generates TypeScript declarations

## TurboRepo Build Pipeline

### Dependency Graph

```
@theneo/sdk (no deps)
      ↓
@theneo/cli (depends on @theneo/sdk)
```

### Build Order

```bash
npm run build
# Equivalent to: turbo run build

# TurboRepo executes:
# 1. Build @theneo/sdk
# 2. Build @theneo/cli (after SDK completes)
```

### Caching

TurboRepo caches build outputs:

```json
// turbo.json
{
  "tasks": {
    "build": {
      "outputs": ["dist/**"]
    }
  }
}
```

If source files haven't changed, cached outputs are used.

### Cache Location

```
node_modules/.cache/turbo/
```

To clear cache:
```bash
rm -rf node_modules/.cache/turbo
```

## Development Mode

### Watch Mode

```bash
npm run dev
# Runs: turbo run dev

# Starts watch mode for all packages
```

Each package runs its own dev script:

```json
// CLI
"dev": "npm run build -- --watch"

// SDK
"dev": "npm run build -- --watch"
```

### Persistent Mode

```json
// turbo.json
{
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

- `cache: false`: Don't cache dev mode
- `persistent: true`: Keep running (watch mode)

## Linting

### ESLint Configuration

Both packages use ESLint with TypeScript support:

```javascript
// packages/*/eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'prettier',
    'security',
    'sonarjs'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ]
};
```

### Lint Command

```bash
npm run lint
# Runs: turbo run lint

# Each package runs:
# eslint ./src/ --fix
```

### Pre-commit Hook

```bash
# .husky/pre-commit
npx lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.ts": "eslint --cache --cache-location .eslintcache --fix"
  }
}
```

## Formatting

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Format Command

```bash
npm run format
# Runs: prettier --write "**/*.{ts,tsx,md}"
```

## Type Checking

### Full Type Check

```bash
# CLI
cd packages/theneo-cli
npm run typecheck
# Runs: tsc --noEmit
```

### Path Aliases

The SDK uses path aliases for internal imports:

```json
// packages/theneo-sdk/tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "theneo/*": ["./src/*"],
      "theneo": ["./src/index.ts"]
    }
  }
}
```

The build config (tsconfig.build.json) may differ for production builds.

## Clean Build

```bash
# Clean all dist folders
npm run clean
# Or manually:
rm -rf packages/*/dist

# Clean and rebuild
npm run clean && npm run build
```

## Production Build

For publishing, the release workflow runs:

```bash
npm run publish-packages
# Runs: turbo run build lint && changeset publish
```

This ensures:
1. All packages build successfully
2. Linting passes
3. Changesets are applied
4. Packages are published to npm

## Build Troubleshooting

### "Cannot find module '@theneo/sdk'"

SDK not built before CLI:
```bash
npm run build  # Builds in correct order
```

### Type errors after SDK changes

Rebuild everything:
```bash
npm run clean
npm run build
```

### Stale cache

Clear TurboRepo cache:
```bash
rm -rf node_modules/.cache/turbo
npm run build
```

### Path alias issues

Check tsconfig paths and ensure build config matches.
