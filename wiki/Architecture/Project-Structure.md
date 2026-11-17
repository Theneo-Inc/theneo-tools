# Project Structure

Overview of the Theneo Tools repository structure and organization.

## Repository Layout

```
theneo-tools/
├── .changeset/              # Changeset configuration for versioning
├── .github/                 # GitHub configuration
│   ├── ISSUE_TEMPLATE/      # Issue templates
│   ├── workflows/           # GitHub Actions workflows
│   └── PULL_REQUEST_TEMPLATE.md
├── .husky/                  # Git hooks
├── packages/                # Monorepo packages
│   ├── theneo-cli/          # CLI package
│   └── theneo-sdk/          # SDK package
├── docs/                    # Example documentation (exported)
├── package.json             # Root package.json
├── turbo.json               # TurboRepo configuration
├── tsconfig.json            # Root TypeScript config
└── README.md
```

## Package: @theneo/cli

The CLI package provides the command-line interface.

```
packages/theneo-cli/
├── bin/
│   └── index.js             # CLI entry point
├── src/
│   ├── bin.ts               # Main entry point
│   ├── commands/            # Command implementations
│   │   ├── index.ts         # Command registration
│   │   ├── login.ts         # Login command
│   │   ├── create/          # Create from markdown
│   │   ├── export/          # Export command
│   │   ├── import/          # Import command
│   │   ├── project/         # Project commands
│   │   │   ├── index.ts
│   │   │   ├── create.ts
│   │   │   ├── delete.ts
│   │   │   ├── import.ts
│   │   │   ├── list.ts
│   │   │   ├── preview.ts
│   │   │   └── publish.ts
│   │   ├── version/         # Version commands
│   │   │   ├── index.ts
│   │   │   ├── create.ts
│   │   │   ├── delete.ts
│   │   │   ├── list.ts
│   │   │   └── add-subscriber.ts
│   │   └── workspace/       # Workspace commands
│   │       ├── index.ts
│   │       └── list.ts
│   ├── config/              # Configuration types
│   ├── config-manager/      # Config file management
│   ├── consts.ts            # Constants
│   ├── context/             # Context (auth)
│   ├── core/                # Core logic
│   │   ├── cli/             # CLI-specific logic
│   │   │   ├── export/
│   │   │   ├── project/
│   │   │   ├── version/
│   │   │   └── workspace/
│   │   └── theneo/          # Theneo integration
│   └── utils/               # Utility functions
├── package.json
├── tsconfig.json
└── README.md
```

### Key CLI Components

| Component | Description |
|-----------|-------------|
| `bin/index.js` | Shebang entry point that loads the compiled CLI |
| `src/bin.ts` | TypeScript entry point, initializes and runs the program |
| `src/commands/` | Commander.js command definitions |
| `src/config-manager/` | Handles reading/writing config files |
| `src/core/` | Business logic separate from command handling |
| `src/utils/` | Shared utility functions |

## Package: @theneo/sdk

The SDK package provides programmatic access to Theneo API.

```
packages/theneo-sdk/
├── src/
│   ├── index.ts             # Public exports
│   ├── theneo.ts            # Main Theneo class
│   ├── core/                # Core business logic
│   │   └── project/
│   │       ├── create.ts
│   │       └── import.ts
│   ├── models/              # Input models
│   │   └── inputs/
│   │       ├── export.ts
│   │       ├── project.ts
│   │       └── index.ts
│   ├── requests/            # API request functions
│   │   ├── base/            # Base request utilities
│   │   │   ├── index.ts
│   │   │   └── requests.ts
│   │   ├── export.ts
│   │   ├── postman.ts
│   │   ├── project.ts
│   │   ├── publish.ts
│   │   ├── version.ts
│   │   ├── workspace.ts
│   │   └── index.ts
│   ├── results/             # Result type implementation
│   │   └── index.ts
│   ├── schema/              # Type definitions
│   │   ├── base.ts
│   │   ├── export.ts
│   │   ├── postman.ts
│   │   ├── project.ts
│   │   ├── publish.ts
│   │   ├── version.ts
│   │   ├── workspace.ts
│   │   └── index.ts
│   └── utils/               # Utilities
│       ├── file.ts
│       ├── version.ts
│       └── index.ts
├── examples/                # Example projects
│   └── theneo-sdk-test/
├── package.json
├── tsconfig.json
└── README.md
```

### Key SDK Components

| Component | Description |
|-----------|-------------|
| `src/theneo.ts` | Main `Theneo` class with all public methods |
| `src/results/` | `Result<T, E>` type for error handling |
| `src/schema/` | TypeScript interfaces and types |
| `src/requests/` | HTTP request functions |
| `src/core/` | Complex business logic |

## Configuration Files

### Root Level

| File | Purpose |
|------|---------|
| `package.json` | Root workspace configuration |
| `turbo.json` | TurboRepo build configuration |
| `tsconfig.json` | Base TypeScript configuration |
| `.prettierrc` | Code formatting rules |
| `.editorconfig` | Editor settings |
| `.nvmrc` | Node version specification |

### GitHub Configuration

| File | Purpose |
|------|---------|
| `.github/workflows/pr.yml` | Pull request CI workflow |
| `.github/workflows/release.yml` | Release/publish workflow |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR template |
| `.github/ISSUE_TEMPLATE/` | Issue templates |

### Package Level

Each package has:
- `package.json` - Package configuration
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.js` - ESLint configuration
- `README.md` - Package documentation

## Dependencies

### CLI Dependencies

| Package | Purpose |
|---------|---------|
| `@theneo/sdk` | SDK for API access |
| `commander` | CLI framework |
| `@inquirer/prompts` | Interactive prompts |
| `chalk` | Terminal styling |
| `nanospinner` | Progress spinners |
| `axios` | HTTP client |
| `js-yaml` | YAML parsing |
| `toml` | TOML parsing |

### SDK Dependencies

| Package | Purpose |
|---------|---------|
| `axios` | HTTP client |
| `form-data` | Multipart form handling |
| `fs-extra` | Enhanced file system operations |

## Build Outputs

After building:

```
packages/theneo-cli/dist/    # Compiled CLI
packages/theneo-sdk/dist/    # Compiled SDK (CJS + ESM + types)
```
