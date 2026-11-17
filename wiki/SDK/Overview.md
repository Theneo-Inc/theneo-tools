# SDK Overview

The Theneo SDK (`@theneo/sdk`) is a TypeScript/JavaScript library for interacting with the Theneo API programmatically.

## Installation

```bash
npm install @theneo/sdk
```

## Features

- **Full TypeScript Support**: Complete type definitions for all APIs
- **Result Types**: Functional error handling with `Result<T, E>` types
- **Project Management**: Create, update, delete, and publish projects
- **Documentation Import**: Import from files, URLs, text, or Postman
- **Version Management**: Create and manage documentation versions
- **Workspace Management**: List and work with workspaces
- **AI Integration**: Built-in support for AI description generation

## Quick Start

```typescript
import { Theneo } from '@theneo/sdk';

// Initialize the SDK
const theneo = new Theneo({
  apiKey: 'YOUR_API_KEY'
});

// List workspaces
const workspaces = await theneo.listWorkspaces();
if (workspaces.ok) {
  console.log('Workspaces:', workspaces.value);
}

// List projects
const projects = await theneo.listProjects();
if (projects.ok) {
  console.log('Projects:', projects.value);
}
```

## Core Concepts

### Theneo Class

The main entry point for all SDK operations:

```typescript
const theneo = new Theneo({
  apiKey: 'YOUR_API_KEY',
  baseApiUrl: 'https://api.theneo.io',  // optional
  baseAppUrl: 'https://app.theneo.io',  // optional
  apiClientMetadata: {                   // optional
    apiClientName: 'my-app',
    apiClientVersion: '1.0.0'
  }
});
```

### Result Types

All SDK methods return `Result<T, Error>` for type-safe error handling:

```typescript
const result = await theneo.listProjects();

// Check success
if (result.ok) {
  const projects = result.value;  // Type: ProjectSchema[]
} else {
  const error = result.error;     // Type: Error
}

// Using unwrap (throws on error)
try {
  const projects = result.unwrap();
} catch (error) {
  console.error('Failed:', error);
}

// Using map for transformation
const names = result.map(projects => projects.map(p => p.name));

// Using chain for sequential operations
const publishResult = result.chain(projects => 
  theneo.publishProject(projects[0].id)
);
```

### Description Generation

AI-powered description generation options:

```typescript
import { DescriptionGenerationType } from '@theneo/sdk';

// Generate descriptions for empty fields only
DescriptionGenerationType.FILL

// Overwrite all descriptions
DescriptionGenerationType.OVERWRITE

// Skip generation
DescriptionGenerationType.NO_GENERATION
```

## Main Operations

### Project Operations

```typescript
// Create project
const created = await theneo.createProject({
  name: 'My API',
  data: { file: './openapi.yaml' },
  publish: true
});

// List projects
const projects = await theneo.listProjects();

// Publish project
const published = await theneo.publishProject(projectId);

// Delete project
await theneo.deleteProjectById(projectId);
```

### Import/Export Operations

```typescript
// Import to existing project
const imported = await theneo.importProjectDocument({
  projectId: 'project-id',
  publish: true,
  data: { file: './updated-openapi.yaml' }
});

// Export project
const exported = await theneo.exportProject({
  projectId: 'project-id',
  dir: './docs'
});
```

### Version Operations

```typescript
// List versions
const versions = await theneo.listProjectVersions(projectId);

// Create version
const version = await theneo.createProjectVersion({
  projectId: 'project-id',
  name: 'v2.0'
});

// Delete version
await theneo.deleteProjectVersion(versionId);
```

### Workspace Operations

```typescript
// List workspaces
const workspaces = await theneo.listWorkspaces();

// List with role filter
const adminWorkspaces = await theneo.listWorkspaces(UserRole.ADMIN);
```

## Type Safety

The SDK provides full TypeScript support:

```typescript
import { 
  Theneo,
  TheneoOptions,
  CreateProjectOptions,
  CreateProjectResponse,
  ProjectSchema,
  Workspace,
  Result
} from '@theneo/sdk';

// All types are available for use
const options: CreateProjectOptions = {
  name: 'My API',
  publish: true,
  data: { file: './api.yaml' }
};

const result: Result<CreateProjectResponse> = await theneo.createProject(options);
```

## Error Handling

```typescript
const result = await theneo.createProject(options);

if (result.err) {
  // Handle specific error cases
  if (result.error.message.includes('not found')) {
    console.log('Resource not found');
  } else if (result.error.message.includes('unauthorized')) {
    console.log('Check your API key');
  } else {
    console.log('Error:', result.error.message);
  }
  return;
}

// Success path
console.log('Created:', result.value.projectId);
```

## Next Steps

- [API Reference](./API-Reference.md)
- [Examples](./Examples.md)
