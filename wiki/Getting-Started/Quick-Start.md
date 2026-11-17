# Quick Start Guide

Get up and running with Theneo Tools in minutes.

## Prerequisites

1. [Theneo CLI installed](./Installation.md)
2. A Theneo account (sign up at [theneo.io](https://theneo.io))
3. An API key from your Theneo account

## Step 1: Authenticate

First, authenticate with your Theneo API key:

```bash
# Interactive login (prompts for token)
theneo login

# Or with API key directly
theneo login --token YOUR_API_KEY
```

You can also use environment variables:

```bash
export THENEO_API_KEY=your_api_key
```

## Step 2: Create Your First Project

### Option A: From an OpenAPI Spec

```bash
# From a local file
theneo project create --name "My API" --file ./openapi.yaml --publish

# From a URL
theneo project create --name "My API" --link https://example.com/openapi.json --publish
```

### Option B: From a Postman Collection

```bash
theneo project create \
  --name "My API" \
  --postman-api-key YOUR_POSTMAN_KEY \
  --postman-collection COLLECTION_ID \
  --publish
```

### Option C: Interactive Mode

```bash
theneo project create
# Follow the prompts
```

## Step 3: View Your Documentation

After creating a project, you'll receive a URL to your published documentation:

```
https://app.theneo.io/your-workspace/your-project
```

## Common Workflows

### Update Documentation

When your API changes, update the documentation:

```bash
theneo project import \
  --project your-project-slug \
  --file ./updated-openapi.yaml \
  --publish
```

### Merge Updates (Keep Existing Descriptions)

```bash
theneo project import \
  --project your-project-slug \
  --file ./openapi.yaml \
  --import-type merge \
  --keepOldParameterDescription \
  --keepOldSectionDescription \
  --publish
```

### Export Documentation

Export your documentation as Markdown:

```bash
theneo export --project your-project-slug --dir ./docs
```

### List Your Projects

```bash
theneo project list
```

### Publish Changes

```bash
theneo project publish --project your-project-slug
```

## Using AI Description Generation

Theneo can automatically generate descriptions for your API parameters:

```bash
# Fill missing descriptions only
theneo project create \
  --name "My API" \
  --file ./openapi.yaml \
  --generate-description fill \
  --publish

# Overwrite all descriptions
theneo project create \
  --name "My API" \
  --file ./openapi.yaml \
  --generate-description overwrite \
  --publish
```

## SDK Quick Start

For programmatic access, use the SDK:

```typescript
import { Theneo, CreateProjectOptions } from '@theneo/sdk';

// Initialize with your API key
const theneo = new Theneo({
  apiKey: 'YOUR_API_KEY'
});

// List workspaces
const workspaces = await theneo.listWorkspaces();
if (workspaces.ok) {
  console.log('Workspaces:', workspaces.value);
}

// Create a project
const projectOptions: CreateProjectOptions = {
  name: 'My API',
  publish: true,
  isPublic: true,
  data: {
    file: './openapi.yaml'
  }
};

const result = await theneo.createProject(projectOptions);
if (result.ok) {
  console.log('Project created:', result.value.projectId);
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Update API Docs

on:
  push:
    branches: [main]
    paths:
      - 'api/openapi.yaml'

jobs:
  update-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install Theneo CLI
        run: npm install -g @theneo/cli
        
      - name: Update Documentation
        env:
          THENEO_API_KEY: ${{ secrets.THENEO_API_KEY }}
        run: |
          theneo project import \
            --project my-api \
            --file ./api/openapi.yaml \
            --import-type merge \
            --publish
```

## Next Steps

- [Authentication Details](./Authentication.md)
- [CLI Commands Reference](../CLI/Commands.md)
- [SDK API Reference](../SDK/API-Reference.md)
