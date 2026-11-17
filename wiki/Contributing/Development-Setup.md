# Development Setup

Complete guide to setting up your development environment for Theneo Tools.

## Prerequisites

### Required

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: For version control

### Recommended

- **nvm**: Node Version Manager for easy Node.js version switching
- **VS Code**: With TypeScript and ESLint extensions

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Theneo-Inc/theneo-tools.git
cd theneo-tools
```

Or if you've forked:

```bash
git clone https://github.com/YOUR_USERNAME/theneo-tools.git
cd theneo-tools
git remote add upstream https://github.com/Theneo-Inc/theneo-tools.git
```

### 2. Use Correct Node Version

The repository includes an `.nvmrc` file:

```bash
nvm use
# or if Node 18+ not installed:
nvm install
```

Verify:
```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
```

### 3. Install Dependencies

```bash
npm install
```

This installs dependencies for all packages in the monorepo.

### 4. Build All Packages

```bash
npm run build
```

This builds:
1. `@theneo/sdk` first
2. `@theneo/cli` second (depends on SDK)

### 5. Install CLI Globally

```bash
npm run cli
```

This builds, lints, and installs the CLI globally for testing.

### 6. Verify Installation

```bash
theneo --version
theneo help
```

## Project Structure Overview

```
theneo-tools/
├── packages/
│   ├── theneo-cli/    # CLI package
│   │   ├── src/       # Source code
│   │   ├── dist/      # Build output
│   │   └── bin/       # CLI entry point
│   └── theneo-sdk/    # SDK package
│       ├── src/       # Source code
│       └── dist/      # Build output
├── package.json       # Root config
└── turbo.json         # Build orchestration
```

## Development Workflow

### Watch Mode

For active development, use watch mode:

```bash
npm run dev
```

This watches both packages and rebuilds on changes.

### Working on CLI

```bash
cd packages/theneo-cli

# Build only CLI
npm run build

# Watch mode
npm run dev

# Run linting
npm run lint

# Type checking
npm run typecheck
```

After making changes, reinstall globally:

```bash
# From root
npm run cli

# Or from CLI package
npm run install-locally
```

### Working on SDK

```bash
cd packages/theneo-sdk

# Build SDK
npm run build

# Watch mode
npm run dev

# Run linting
npm run lint
```

After SDK changes, rebuild CLI if it uses the changed code:

```bash
# From root
npm run build
```

### Testing SDK Examples

```bash
cd packages/theneo-sdk/examples/theneo-sdk-test
npm install
npm start
```

## IDE Setup

### VS Code

Recommended extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features

Recommended settings (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "eslint.workingDirectories": [
    "packages/theneo-cli",
    "packages/theneo-sdk"
  ]
}
```

### WebStorm / IntelliJ

1. Open the root folder
2. Enable ESLint integration
3. Set Prettier as default formatter
4. Configure TypeScript to use workspace version

## Common Development Tasks

### Adding a New CLI Command

1. Create command file in `packages/theneo-cli/src/commands/`:

```typescript
// packages/theneo-cli/src/commands/mycommand.ts
import { Command } from 'commander';

export function initMyCommand(program: Command): Command {
  return program
    .command('mycommand')
    .description('My new command')
    .action(async () => {
      console.log('Hello from my command!');
    });
}
```

2. Register in `packages/theneo-cli/src/commands/index.ts`:

```typescript
import { initMyCommand } from './mycommand';

export function initializeProgram(): Command {
  const program = createProgram();
  // ... existing commands
  initMyCommand(program);
  return program;
}
```

3. Rebuild and test:

```bash
npm run cli
theneo mycommand
```

### Adding a New SDK Method

1. Add method to `packages/theneo-sdk/src/theneo.ts`:

```typescript
export class Theneo {
  // ... existing methods

  public async myNewMethod(): Promise<Result<SomeType>> {
    return callMyApi(this.baseApiUrl, this.getHeaders());
  }
}
```

2. Add API request in `packages/theneo-sdk/src/requests/`:

```typescript
// packages/theneo-sdk/src/requests/myapi.ts
export async function callMyApi(
  baseUrl: string,
  headers: ApiHeaders
): Promise<Result<SomeType>> {
  // implementation
}
```

3. Export types from `packages/theneo-sdk/src/schema/`:

```typescript
export interface SomeType {
  // ...
}
```

4. Export from `packages/theneo-sdk/src/index.ts` if public.

### Running Tests

Currently, the project has Jest configured:

```bash
cd packages/theneo-cli
npm run test
```

### Creating a Changeset

For any user-facing change:

```bash
npm run changeset
```

Follow the prompts to describe your change.

## Troubleshooting

### "Cannot find module" Errors

```bash
npm run build
# or
npm install && npm run build
```

### Type Errors After SDK Changes

```bash
# Rebuild everything
npm run clean
npm run build
```

### CLI Not Updating After Changes

```bash
# Reinstall globally
npm run cli
```

### Lint Errors

```bash
# Auto-fix
npm run lint

# Check specific file
cd packages/theneo-cli
npx eslint src/commands/myfile.ts --fix
```

## Environment Variables

For development with a Theneo account:

```bash
export THENEO_API_KEY=your_dev_api_key

# Optional: use staging
export THENEO_API_URL=https://staging-api.theneo.io
export THENEO_APP_URL=https://staging.theneo.io
```

## Git Workflow

### Keep Your Fork Updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### Working on Features

```bash
git checkout main
git pull upstream main
git checkout -b feature/my-feature
# Make changes
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
# Open PR on GitHub
```

## Next Steps

- Read [Code Style](./Code-Style.md) guidelines
- Review [Contributing Guide](./Guide.md)
- Check [Architecture](../Architecture/Project-Structure.md) documentation
