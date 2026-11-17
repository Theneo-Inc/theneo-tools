# SDK Examples

Practical examples for common Theneo SDK use cases.

## Basic Setup

```typescript
import { Theneo, TheneoOptions } from '@theneo/sdk';

const options: TheneoOptions = {
  apiKey: process.env.THENEO_API_KEY
};

const theneo = new Theneo(options);
```

## Project Management

### List All Projects

```typescript
async function listProjects() {
  const result = await theneo.listProjects();
  
  if (result.err) {
    console.error('Failed to list projects:', result.error.message);
    return;
  }
  
  console.log('Your projects:');
  result.value.forEach(project => {
    console.log(`- ${project.name} (${project.key})`);
    console.log(`  Public: ${project.isPublic}`);
    console.log(`  Workspace: ${project.company.name}`);
  });
}
```

### Create Project from OpenAPI File

```typescript
import { 
  Theneo, 
  CreateProjectOptions, 
  DescriptionGenerationType 
} from '@theneo/sdk';

async function createProjectFromFile() {
  const options: CreateProjectOptions = {
    name: 'Pet Store API',
    data: {
      file: './petstore.yaml'
    },
    publish: true,
    isPublic: true,
    descriptionGenerationType: DescriptionGenerationType.FILL,
    progressUpdateHandler: (percent) => {
      console.log(`Generating descriptions: ${percent}%`);
    }
  };

  const result = await theneo.createProject(options);
  
  if (result.ok) {
    console.log('Project created!');
    console.log('Project ID:', result.value.projectId);
    if (result.value.publishData) {
      console.log('Published at:', result.value.publishData.publishedPageUrl);
    }
  } else {
    console.error('Failed:', result.error.message);
  }
}
```

### Create Project from URL

```typescript
async function createProjectFromUrl() {
  const result = await theneo.createProject({
    name: 'GitHub API',
    data: {
      link: new URL('https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json')
    },
    publish: true
  });

  if (result.ok) {
    console.log('Created from URL:', result.value.projectId);
  }
}
```

### Create Project from Postman Collection

```typescript
async function createFromPostman() {
  // First, list available collections
  const collections = await Theneo.listPostmanCollections(
    process.env.POSTMAN_API_KEY!
  );
  
  if (collections.err) {
    console.error('Failed to list Postman collections');
    return;
  }
  
  console.log('Available collections:');
  collections.value.forEach(c => console.log(`- ${c.name}: ${c.id}`));
  
  // Create project from collection
  const result = await theneo.createProject({
    name: 'My Postman API',
    data: {
      postman: {
        apiKey: process.env.POSTMAN_API_KEY!,
        collectionIds: ['collection-id-1', 'collection-id-2']
      }
    },
    publish: true
  });

  if (result.ok) {
    console.log('Created from Postman:', result.value.projectId);
  }
}
```

### Delete Project

```typescript
async function deleteProject(projectId: string) {
  const result = await theneo.deleteProjectById(projectId);
  
  if (result.ok) {
    console.log('Project deleted successfully');
  } else {
    console.error('Failed to delete:', result.error.message);
  }
}
```

## Import/Export

### Update Documentation

```typescript
import { ImportOption, MergingStrategy } from '@theneo/sdk';

async function updateDocumentation(projectId: string) {
  const result = await theneo.importProjectDocument({
    projectId,
    publish: true,
    data: {
      file: './updated-openapi.yaml'
    },
    importOption: ImportOption.MERGE,
    importOptionAdditionalData: {
      parameterDescriptionMergeStrategy: MergingStrategy.KEEP_OLD,
      sectionDescriptionMergeStrategy: MergingStrategy.KEEP_OLD
    }
  });

  if (result.ok) {
    console.log('Documentation updated!');
    if (result.value.publishData) {
      console.log('Published at:', result.value.publishData.publishedPageUrl);
    }
  } else {
    console.error('Update failed:', result.error.message);
  }
}
```

### Export Documentation

```typescript
async function exportDocumentation(projectId: string) {
  const result = await theneo.exportProject({
    projectId,
    dir: './exported-docs',
    openapi: false
  });

  if (result.ok) {
    console.log('Export complete!');
    console.log('Files exported to ./exported-docs');
  } else {
    console.error('Export failed:', result.error.message);
  }
}
```

### Export as OpenAPI

```typescript
async function exportAsOpenAPI(projectId: string) {
  const result = await theneo.exportProject({
    projectId,
    openapi: true,
    noGeneration: true  // Don't write files, just get the data
  });

  if (result.ok) {
    console.log('OpenAPI spec:', JSON.stringify(result.value, null, 2));
  }
}
```

## Version Management

### List Versions

```typescript
async function listVersions(projectId: string) {
  const result = await theneo.listProjectVersions(projectId);
  
  if (result.ok) {
    console.log('Versions:');
    result.value.forEach(v => {
      const defaultLabel = v.isDefault ? ' (default)' : '';
      console.log(`- ${v.name}${defaultLabel}`);
    });
  }
}
```

### Create New Version

```typescript
async function createVersion(projectId: string) {
  const result = await theneo.createProjectVersion({
    projectId,
    name: 'v2.0.0',
    isDefault: false
  });

  if (result.ok) {
    console.log('Version created:', result.value.name);
    console.log('Version ID:', result.value.id);
  }
}
```

### Create Version from Existing

```typescript
async function duplicateVersion(projectId: string, sourceVersionId: string) {
  const result = await theneo.createProjectVersion({
    projectId,
    name: 'v2.1.0',
    previousVersionId: sourceVersionId,
    isDefault: true
  });

  if (result.ok) {
    console.log('New version created from existing:', result.value.name);
  }
}
```

## Workspace Management

### List Workspaces

```typescript
import { UserRole } from '@theneo/sdk';

async function listWorkspaces() {
  // All workspaces
  const all = await theneo.listWorkspaces();
  
  // Only admin workspaces
  const admin = await theneo.listWorkspaces(UserRole.ADMIN);
  
  if (all.ok) {
    console.log('Workspaces:');
    all.value.forEach(ws => {
      console.log(`- ${ws.name} (${ws.slug})`);
      console.log(`  Role: ${ws.role}`);
      console.log(`  Default: ${ws.isDefault}`);
    });
  }
}
```

### Create Project in Specific Workspace

```typescript
async function createInWorkspace(workspaceSlug: string) {
  const result = await theneo.createProject({
    name: 'Team API',
    workspace: {
      key: workspaceSlug
    },
    data: {
      file: './api.yaml'
    }
  });

  if (result.ok) {
    console.log('Project created in workspace:', workspaceSlug);
  }
}
```

## Error Handling Patterns

### Using Result Type

```typescript
async function safeOperation() {
  const result = await theneo.listProjects();
  
  // Pattern 1: Check ok/err
  if (result.ok) {
    return result.value;
  } else {
    throw result.error;
  }
}
```

### Using unwrap with Callbacks

```typescript
async function withCallbacks() {
  const result = await theneo.listProjects();
  
  // Transform both success and error
  const output = result.unwrap(
    projects => `Found ${projects.length} projects`,
    error => `Error: ${error.message}`
  );
  
  console.log(output);
}
```

### Using map for Transformation

```typescript
async function transformResult() {
  const result = await theneo.listProjects();
  
  // Map to just names
  const names = result.map(projects => 
    projects.map(p => p.name)
  );
  
  if (names.ok) {
    console.log('Project names:', names.value);
  }
}
```

### Chaining Operations

```typescript
async function chainOperations() {
  const workspaces = await theneo.listWorkspaces();
  
  // Chain: get workspaces -> find default -> create project
  const result = workspaces
    .map(ws => ws.find(w => w.isDefault))
    .chain(defaultWs => {
      if (!defaultWs) {
        return Err(new Error('No default workspace'));
      }
      return theneo.createProject({
        name: 'New Project',
        workspace: { key: defaultWs.slug }
      });
    });
}
```

## CI/CD Integration

### GitHub Actions Script

```typescript
// scripts/update-docs.ts
import { Theneo, ImportOption } from '@theneo/sdk';

async function main() {
  const theneo = new Theneo({
    apiKey: process.env.THENEO_API_KEY!
  });

  const projectSlug = process.env.PROJECT_SLUG!;
  const specFile = process.env.SPEC_FILE || './openapi.yaml';

  // Get project ID from slug
  const projects = await theneo.listProjects();
  if (projects.err) {
    console.error('Failed to list projects');
    process.exit(1);
  }

  const project = projects.value.find(p => p.key === projectSlug);
  if (!project) {
    console.error(`Project not found: ${projectSlug}`);
    process.exit(1);
  }

  // Import and publish
  const result = await theneo.importProjectDocument({
    projectId: project.id,
    publish: true,
    data: { file: specFile },
    importOption: ImportOption.MERGE
  });

  if (result.err) {
    console.error('Import failed:', result.error.message);
    process.exit(1);
  }

  console.log('Documentation updated successfully!');
  if (result.value.publishData) {
    console.log('URL:', result.value.publishData.publishedPageUrl);
  }
}

main().catch(console.error);
```

### Usage in GitHub Actions

```yaml
- name: Update Theneo Docs
  env:
    THENEO_API_KEY: ${{ secrets.THENEO_API_KEY }}
    PROJECT_SLUG: my-api
    SPEC_FILE: ./api/openapi.yaml
  run: npx ts-node scripts/update-docs.ts
```

## Full Application Example

```typescript
import { 
  Theneo, 
  CreateProjectOptions, 
  ImportOption,
  DescriptionGenerationType,
  UserRole
} from '@theneo/sdk';

class DocManager {
  private theneo: Theneo;

  constructor(apiKey: string) {
    this.theneo = new Theneo({ apiKey });
  }

  async listAll() {
    const [workspaces, projects] = await Promise.all([
      this.theneo.listWorkspaces(),
      this.theneo.listProjects()
    ]);

    console.log('=== Workspaces ===');
    if (workspaces.ok) {
      workspaces.value.forEach(w => console.log(`- ${w.name}`));
    }

    console.log('\n=== Projects ===');
    if (projects.ok) {
      projects.value.forEach(p => console.log(`- ${p.name} (${p.key})`));
    }
  }

  async createAndPublish(name: string, specFile: string) {
    console.log(`Creating project: ${name}`);
    
    const result = await this.theneo.createProject({
      name,
      data: { file: specFile },
      publish: true,
      descriptionGenerationType: DescriptionGenerationType.FILL,
      progressUpdateHandler: (p) => console.log(`AI: ${p}%`)
    });

    if (result.ok) {
      console.log('Success!');
      console.log('Project ID:', result.value.projectId);
      return result.value.projectId;
    } else {
      throw result.error;
    }
  }

  async update(projectId: string, specFile: string) {
    console.log(`Updating project: ${projectId}`);
    
    const result = await this.theneo.importProjectDocument({
      projectId,
      publish: true,
      data: { file: specFile },
      importOption: ImportOption.MERGE
    });

    if (result.ok) {
      console.log('Updated!');
      return result.value;
    } else {
      throw result.error;
    }
  }
}

// Usage
const manager = new DocManager(process.env.THENEO_API_KEY!);

await manager.listAll();
const projectId = await manager.createAndPublish('My API', './api.yaml');
await manager.update(projectId, './api-v2.yaml');
```
