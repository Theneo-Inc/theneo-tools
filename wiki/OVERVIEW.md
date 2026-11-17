# Theneo Tools Overview

A complete guide to Theneo CLI and SDK for managing API documentation.

---

## What is Theneo Tools?

Theneo Tools is a monorepo containing two npm packages for the [Theneo](https://theneo.io) platform:

| Package | Description |
|---------|-------------|
| **@theneo/cli** | Command-line interface for managing Theneo projects |
| **@theneo/sdk** | TypeScript SDK for programmatic API access |

**Key Capabilities:**
- Create and manage API documentation projects
- Import from OpenAPI specs, Postman collections, or URLs
- AI-powered description generation
- Export/import documentation as Markdown
- Version management and publishing
- CI/CD integration

---

## Installation

**Requirements:** Node.js >= 18

```bash
# CLI (global)
npm install -g @theneo/cli@latest

# SDK
npm install @theneo/sdk
```

---

## Authentication

Get your API key from [app.theneo.io](https://app.theneo.io) → Account Settings.

```bash
# Interactive login
theneo login

# With token
theneo login --token YOUR_API_KEY

# Environment variable
export THENEO_API_KEY=your_api_key
```

**Config file:** `~/.config/theneo/config`

**Profiles** for multiple accounts:
```bash
theneo login --profile production --token PROD_KEY
theneo project list --profile production
```

---

## CLI Commands

### Login & Workspaces

```bash
theneo login                           # Authenticate
theneo workspace list                  # List workspaces
```

### Projects

```bash
theneo project list                    # List all projects
theneo project create --name "My API" --file ./openapi.yaml
theneo project import --project my-api --file ./updated.yaml --publish
theneo project publish --project my-api
theneo project delete --project my-api
```

### Versions

```bash
theneo version list --project my-api
theneo version create --project my-api --name "v2"
theneo version delete --version v2 --project my-api
```

### Export/Import (Markdown)

```bash
# Export as Markdown
theneo export --project my-api --dir ./docs

# Export as OpenAPI
theneo export --project my-api --openapi --format yaml

# Import Markdown back
theneo import --project my-api --dir ./docs --publish

# Create new project from Markdown
theneo create --dir ./docs --name "New API"
```

### Common Options

| Option | Description |
|--------|-------------|
| `--workspace <slug>` | Target workspace |
| `--profile <name>` | Use specific profile |
| `--publish` | Publish after operation |
| `--generate-description <type>` | AI generation: `fill`, `overwrite`, `no_generation` |

---

## SDK Usage

### Basic Setup

```typescript
import { Theneo } from '@theneo/sdk';

const theneo = new Theneo({
  apiKey: process.env.THENEO_API_KEY
});
```

### Common Operations

```typescript
// List projects
const projects = await theneo.listProjects();
if (projects.ok) {
  console.log(projects.value);
}

// Create project
const result = await theneo.createProject({
  name: 'My API',
  data: { file: './openapi.yaml' },
  publish: true
});

// Import to existing project
await theneo.importProjectDocument({
  projectId: 'project-id',
  publish: true,
  data: { file: './updated.yaml' }
});

// Publish
await theneo.publishProject('project-id');
```

### Result Type Pattern

All SDK methods return `Result<T, Error>`:

```typescript
const result = await theneo.listProjects();

if (result.ok) {
  const projects = result.value;  // Success
} else {
  console.error(result.error);    // Error
}
```

### Key Types

```typescript
import {
  Theneo,
  CreateProjectOptions,
  ImportProjectOptions,
  ImportOption,           // OVERWRITE, MERGE, APPEND
  DescriptionGenerationType,  // FILL, OVERWRITE, NO_GENERATION
  Result
} from '@theneo/sdk';
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Update Docs
on:
  push:
    paths: ['api/openapi.yaml']

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g @theneo/cli
      - name: Update Documentation
        env:
          THENEO_API_KEY: ${{ secrets.THENEO_API_KEY }}
        run: theneo project import --project my-api --file ./api/openapi.yaml --publish
```

---

## Project Architecture

```
theneo-tools/
├── packages/
│   ├── theneo-cli/          # CLI package
│   │   ├── src/commands/    # Command implementations
│   │   ├── src/core/        # Business logic
│   │   └── src/config-manager/
│   └── theneo-sdk/          # SDK package
│       ├── src/theneo.ts    # Main class
│       ├── src/requests/    # API calls
│       ├── src/schema/      # Types
│       └── src/results/     # Result type
├── turbo.json               # TurboRepo config
└── package.json             # Workspace root
```

**Build Tools:**
- TurboRepo for monorepo orchestration
- TypeScript for CLI
- tsup for SDK (outputs CJS + ESM)
- Changesets for versioning

---

## Development Setup

```bash
# Clone
git clone https://github.com/Theneo-Inc/theneo-tools.git
cd theneo-tools

# Install
nvm use
npm install

# Build all
npm run build

# Install CLI globally
npm run cli

# Watch mode
npm run dev
```

### Adding Changes

```bash
# Create a changeset (for versioning)
npm run changeset

# Lint
npm run lint

# Format
npm run format
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Command not found: theneo" | `npm install -g @theneo/cli` |
| "No API key provided" | `theneo login` or set `THENEO_API_KEY` |
| "Project not found" | Check slug with `theneo project list` |
| Import fails | Validate OpenAPI spec syntax |
| Config issues | Delete `~/.config/theneo/config` and re-login |

---

## Quick Reference

### Environment Variables

| Variable | Description |
|----------|-------------|
| `THENEO_API_KEY` | API key |
| `THENEO_API_URL` | Custom API endpoint |
| `THENEO_APP_URL` | Custom app endpoint |
| `THENEO_POSTMAN_API_KEY` | Postman API key |

### Import Strategies

| Type | Behavior |
|------|----------|
| `endpoints` | Import only endpoints |
| `overwrite` | Replace everything |
| `append` | Add without changing existing |
| `merge` | Smart merge, preserves descriptions |

### AI Description Generation

| Type | Behavior |
|------|----------|
| `fill` | Generate for empty fields only |
| `overwrite` | Generate for all fields |
| `no_generation` | Skip (default) |

---

## Links

- [GitHub Repository](https://github.com/Theneo-Inc/theneo-tools)
- [npm: @theneo/cli](https://www.npmjs.com/package/@theneo/cli)
- [npm: @theneo/sdk](https://www.npmjs.com/package/@theneo/sdk)
- [Theneo Platform](https://theneo.io)
- [Report Issues](https://github.com/Theneo-Inc/theneo-tools/issues)

---

**License:** MIT
