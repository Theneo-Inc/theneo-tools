# Code Style Guide

Coding standards and style guidelines for Theneo Tools.

## General Principles

1. **Readability**: Write code that's easy to understand
2. **Consistency**: Follow existing patterns in the codebase
3. **Simplicity**: Prefer simple solutions over clever ones
4. **Type Safety**: Leverage TypeScript's type system

## TypeScript Guidelines

### Type Annotations

```typescript
// Good: Explicit return types for public methods
public async listProjects(): Promise<Result<ProjectSchema[]>> {
  // ...
}

// Good: Interface for complex objects
interface CreateProjectOptions {
  name: string;
  workspace?: WorkspaceOption;
}

// Avoid: any type
function process(data: any) { } // Bad
function process(data: unknown) { } // Better
function process(data: ProjectData) { } // Best
```

### Interfaces vs Types

```typescript
// Use interfaces for object shapes
interface User {
  id: string;
  name: string;
}

// Use types for unions, intersections, and aliases
type Result<T> = OkResult<T> | ErrResult<T>;
type UserId = string;
```

### Enums

```typescript
// Use string enums for readability
enum ImportOption {
  OVERWRITE = 'overwrite',
  MERGE = 'merge',
  APPEND = 'append'
}
```

### Null and Undefined

```typescript
// Use optional properties
interface Options {
  name: string;
  workspace?: string;  // optional
}

// Use undefined for optional returns
function find(): User | undefined { }

// Use null only when API returns null
interface ApiResponse {
  data: Data | null;
}
```

## Code Organization

### File Structure

```typescript
// 1. Imports (external, then internal)
import { Command } from 'commander';
import { Theneo } from '@theneo/sdk';

import { configManager } from '../config-manager';
import { tryCatch } from '../utils/exception';

// 2. Types and interfaces
interface CommandOptions {
  name: string;
}

// 3. Constants
const DEFAULT_NAME = 'default';

// 4. Main exports
export function initCommand(program: Command): Command {
  // ...
}

// 5. Helper functions (if any)
function validateOptions(options: CommandOptions): boolean {
  // ...
}
```

### Imports

```typescript
// Group imports:
// 1. External packages
import { Command } from 'commander';
import chalk from 'chalk';

// 2. Internal absolute imports (from package root)
import { Theneo } from '@theneo/sdk';

// 3. Relative imports (within same package)
import { configManager } from '../config-manager';
import { tryCatch } from './utils';
```

## Naming Conventions

### Variables and Functions

```typescript
// camelCase for variables and functions
const apiKey = 'xxx';
function getProjectById(id: string) { }

// Descriptive names
const projectList = [];  // Good
const pl = [];           // Bad

// Boolean prefixes
const isValid = true;
const hasPermission = false;
const canEdit = true;
```

### Classes and Interfaces

```typescript
// PascalCase for classes and interfaces
class ConfigManager { }
interface ProjectSchema { }

// Descriptive names
interface CreateProjectOptions { }  // Good
interface CPO { }                   // Bad
```

### Constants

```typescript
// UPPER_SNAKE_CASE for constants
const DEFAULT_API_URL = 'https://api.theneo.io';
const MAX_RETRY_COUNT = 3;
```

### Files

```typescript
// kebab-case for file names
// config-manager.ts
// project-schema.ts

// Match export name for single-export files
// theneo.ts exports class Theneo
```

## Error Handling

### Result Type Pattern

```typescript
// Use Result type for operations that can fail
async function fetchProject(id: string): Promise<Result<Project>> {
  try {
    const data = await api.get(id);
    return Ok(data);
  } catch (error) {
    return Err(error as Error);
  }
}

// Handle results properly
const result = await fetchProject('123');
if (result.err) {
  console.error('Failed:', result.error.message);
  return;
}
const project = result.value;
```

### Error Messages

```typescript
// Descriptive error messages
return Err(new Error('Project not found: ' + projectId));

// Include context
return Err(new Error(`Failed to import ${file}: ${error.message}`));
```

## Async/Await

```typescript
// Use async/await over raw promises
// Good
async function fetchData() {
  const result = await api.get('/data');
  return result;
}

// Avoid
function fetchData() {
  return api.get('/data').then(result => result);
}

// Handle errors with try/catch
async function safeOperation() {
  try {
    const result = await riskyOperation();
    return Ok(result);
  } catch (error) {
    return Err(error as Error);
  }
}
```

## Comments

Comments should be minimal - only add when super complex structure requires explanation.

```typescript
// Avoid obvious comments
const count = 0;  // Set count to zero  // Bad

// Add comments for complex logic only
// Retry with exponential backoff: 1s, 2s, 4s, 8s, 16s max
const delay = Math.min(1000 * Math.pow(2, retryCount), 16000);
```

## Formatting

### Prettier Configuration

The project uses Prettier with this configuration:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Code Width

- Maximum line length: 80-100 characters
- Break long lines logically

```typescript
// Good: Break at logical points
const result = await theneo.importProjectDocument({
  projectId,
  publish: true,
  data: { file: specFile },
  importOption: ImportOption.MERGE,
});

// Bad: One very long line
const result = await theneo.importProjectDocument({ projectId, publish: true, data: { file: specFile }, importOption: ImportOption.MERGE });
```

## CLI-Specific Guidelines

### Command Options

```typescript
// Use descriptive option names
.option('--workspace <workspace-slug>', 'Target workspace slug')
.option('--projectVersion <version-slug>', 'Project version slug')

// Provide defaults where sensible
.option('--dir <directory>', 'Output directory', 'docs')

// Use flags for booleans
.option('--publish', 'Publish after creation', false)
```

### User Output

```typescript
// Use chalk for colored output
import chalk from 'chalk';

console.log(chalk.green('Success!'));
console.log(chalk.red('Error:'), error.message);
console.log(chalk.yellow('Warning:'), message);

// Use spinners for long operations
import { createSpinner } from 'nanospinner';

const spinner = createSpinner('Creating project...').start();
// ... operation
spinner.success({ text: 'Project created!' });
```

## SDK-Specific Guidelines

### Public API

```typescript
// Document public methods
/**
 * Creates a new project on the Theneo platform
 * @param options Project creation options
 * @returns Result containing project ID or error
 */
public async createProject(
  options: CreateProjectOptions
): Promise<Result<CreateProjectResponse>> {
  // ...
}
```

### Internal Methods

```typescript
// Mark internal methods as private
private getHeaders(): ApiHeaders {
  return {
    ...this.defaultHeaders(),
    ...this.authHeaders(),
  };
}
```

## Testing Guidelines

```typescript
// Descriptive test names
describe('ConfigManager', () => {
  it('should read config from file', () => { });
  it('should return error for invalid profile', () => { });
  it('should create default profile on first login', () => { });
});

// Arrange-Act-Assert pattern
it('should create project from file', async () => {
  // Arrange
  const options = { name: 'Test', file: './test.yaml' };
  
  // Act
  const result = await theneo.createProject(options);
  
  // Assert
  expect(result.ok).toBe(true);
  expect(result.value.projectId).toBeDefined();
});
```

## Pre-Commit Hooks

The project uses Husky with lint-staged:

```json
{
  "lint-staged": {
    "*.ts": "eslint --cache --cache-location .eslintcache --fix"
  }
}
```

This automatically lints and fixes staged TypeScript files before commit.

## ESLint Rules

Key ESLint rules enforced:

- `@typescript-eslint/explicit-function-return-type`: Warn
- `@typescript-eslint/no-explicit-any`: Warn
- `@typescript-eslint/no-unused-vars`: Error
- `prettier/prettier`: Error

Run linting:

```bash
npm run lint
```
