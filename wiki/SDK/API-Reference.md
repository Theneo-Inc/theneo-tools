# SDK API Reference

Complete API reference for the Theneo SDK.

## Theneo Class

### Constructor

```typescript
constructor(options: TheneoOptions)
```

Creates a new Theneo SDK instance.

### TheneoOptions

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `apiKey` | `string` | No* | API key (uses `THENEO_API_KEY` env var if not provided) |
| `baseApiUrl` | `string` | No | Theneo API URL (default: `https://api.theneo.io`) |
| `baseAppUrl` | `string` | No | Theneo App URL (default: `https://app.theneo.io`) |
| `apiClientMetadata` | `ApiClientMetadata` | No | Client identification metadata |

*Required if `THENEO_API_KEY` environment variable is not set.

### ApiClientMetadata

```typescript
interface ApiClientMetadata {
  apiClientName: string;
  apiClientVersion: string;
}
```

---

## Workspace Methods

### listWorkspaces

```typescript
listWorkspaces(role?: UserRole): Promise<Result<Workspace[]>>
```

Lists all workspaces available to the user.

**Parameters:**
- `role` (optional): Filter by user role (`ADMIN` or `EDITOR`)

**Returns:** `Result<Workspace[]>`

**Example:**
```typescript
const result = await theneo.listWorkspaces();
if (result.ok) {
  result.value.forEach(ws => console.log(ws.name));
}
```

### Workspace Interface

```typescript
interface Workspace {
  workspaceId: string;
  name: string;
  slug: string;
  role: UserRole;
  isDefault: boolean;
  isCorporate: boolean;
  isSubscribed: boolean;
}
```

---

## Project Methods

### listProjects

```typescript
listProjects(): Promise<Result<ProjectSchema[]>>
```

Lists all user projects.

**Returns:** `Result<ProjectSchema[]>`

### ProjectSchema Interface

```typescript
interface ProjectSchema {
  id: string;
  name: string;
  key: string;
  isPublic: boolean;
  companyId: string;
  createdAt: Date;
  company: CompanySchema;
}
```

### createProject

```typescript
createProject(options: CreateProjectOptions): Promise<Result<CreateProjectResponse>>
```

Creates a new project.

### CreateProjectOptions

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Project name |
| `workspace` | `WorkspaceOption` | No | Target workspace |
| `publish` | `boolean` | No | Publish after creation (default: `false`) |
| `isPublic` | `boolean` | No | Make public (default: `false`) |
| `data` | `ApiDataInputOption` | No | Source data |
| `sampleData` | `boolean` | No | Create with sample data |
| `descriptionGenerationType` | `DescriptionGenerationType` | No | AI description generation mode |
| `progressUpdateHandler` | `Function` | No | Progress callback |

### ApiDataInputOption

```typescript
interface ApiDataInputOption {
  file?: string;              // Path to file
  link?: URL;                 // URL to specification
  text?: string;              // Raw specification text
  postman?: PostmanImportOptions;
  directory?: string;         // Markdown directory
}
```

### CreateProjectResponse

```typescript
interface CreateProjectResponse {
  projectId: string;
  publishData?: PublishProjectResponse;
  projectData?: any;
}
```

**Example:**
```typescript
const result = await theneo.createProject({
  name: 'My API',
  data: { file: './openapi.yaml' },
  publish: true,
  descriptionGenerationType: DescriptionGenerationType.FILL,
  progressUpdateHandler: (percent) => {
    console.log(`AI generation: ${percent}%`);
  }
});
```

### deleteProjectById

```typescript
deleteProjectById(projectId: string): Promise<Result<void>>
```

Deletes a project.

**Parameters:**
- `projectId`: ID of the project to delete

### publishProject

```typescript
publishProject(projectId: string, versionId?: string): Promise<Result<PublishProjectResponse>>
```

Publishes project documentation.

### PublishProjectResponse

```typescript
interface PublishProjectResponse {
  projectKey: string;
  baseUrlRequired: boolean;
  companySlug: string;
  publishedPageUrl: string;
}
```

### getPreviewProjectLink

```typescript
getPreviewProjectLink(projectId: string): string
```

Returns the preview URL for a project.

---

## Import/Export Methods

### importProjectDocument

```typescript
importProjectDocument(options: ImportProjectOptions): Promise<Result<ImportResponse>>
```

Imports documentation to an existing project.

### ImportProjectOptions

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `projectId` | `string` | Yes | Target project ID |
| `publish` | `boolean` | Yes | Publish after import |
| `data` | `ApiDataInputOption` | Yes | Source data |
| `versionId` | `string` | No | Target version |
| `importOption` | `ImportOption` | No | Import strategy |
| `importOptionAdditionalData` | `ImportOptionAdditionalData` | No | Merge options |
| `tabSlug` | `string` | No | Import to specific tab |

### ImportOption Enum

```typescript
enum ImportOption {
  ENDPOINTS_ONLY = 'endpoints',
  OVERWRITE = 'overwrite',
  APPEND = 'append',
  MERGE = 'merge'
}
```

### MergingStrategy Enum

```typescript
enum MergingStrategy {
  KEEP_OLD = 'keep_old',
  KEEP_NEW = 'keep_new'
}
```

### ImportOptionAdditionalData

```typescript
interface ImportOptionAdditionalData {
  parameterDescriptionMergeStrategy?: MergingStrategy;
  sectionDescriptionMergeStrategy?: MergingStrategy;
}
```

**Example:**
```typescript
const result = await theneo.importProjectDocument({
  projectId: 'project-id',
  publish: true,
  data: { file: './updated-api.yaml' },
  importOption: ImportOption.MERGE,
  importOptionAdditionalData: {
    parameterDescriptionMergeStrategy: MergingStrategy.KEEP_OLD,
    sectionDescriptionMergeStrategy: MergingStrategy.KEEP_OLD
  }
});
```

### exportProject

```typescript
exportProject(input: ExportProjectInput): Promise<Result<ExportedProject>>
```

Exports project documentation.

### ExportProjectInput

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `projectId` | `string` | Yes | Project to export |
| `versionId` | `string` | No | Version to export |
| `dir` | `string` | No | Output directory |
| `shouldGetPublicViewData` | `boolean` | No | Export published view |
| `openapi` | `boolean` | No | Export as OpenAPI |
| `tabSlug` | `string` | No | Export specific tab |
| `noGeneration` | `boolean` | No | Skip file generation |

---

## Version Methods

### listProjectVersions

```typescript
listProjectVersions(projectId: string): Promise<Result<ProjectVersion[]>>
```

Lists all versions for a project.

### ProjectVersion

```typescript
interface ProjectVersion {
  id: string;
  name: string;
  slug: string;
  isDefault: boolean;
  createdAt: Date;
}
```

### createProjectVersion

```typescript
createProjectVersion(options: CreateProjectVersionOptions): Promise<Result<ProjectVersion>>
```

Creates a new version.

### CreateProjectVersionOptions

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `projectId` | `string` | Yes | Parent project |
| `name` | `string` | Yes | Version name |
| `previousVersionId` | `string` | No | Copy from this version |
| `isDefault` | `boolean` | No | Set as default |

### deleteProjectVersion

```typescript
deleteProjectVersion(versionId: string): Promise<Result<void>>
```

Deletes a version.

### addSubscriberToProjectVersion

```typescript
addSubscriberToProjectVersion(options: AddSubscriberToProjectVersionQuery): Promise<Result<never>>
```

Adds a changelog subscriber.

---

## AI Generation Methods

### getDescriptionGenerationStatus

```typescript
getDescriptionGenerationStatus(projectId: string): Promise<Result<ProjectCreationStatusResponse>>
```

Gets the status of AI description generation.

### ProjectCreationStatusResponse

```typescript
interface ProjectCreationStatusResponse {
  name: string;
  key: string;
  creationStatus: CreatedProjectStatusEnum;
  descriptionGenerationProgress: number;
  updatedAt: string;
}
```

### CreatedProjectStatusEnum

```typescript
enum CreatedProjectStatusEnum {
  CREATED = 'CREATED',
  STARTED = 'STARTED',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR',
  CREATED_WITHOUT_AI_GENERATION = 'CREATED_WITHOUT_AI_GENERATION'
}
```

### waitForDescriptionGeneration

```typescript
waitForDescriptionGeneration(
  projectId: string,
  progressUpdateHandler?: DescriptionGenerationProgressHandler,
  retryTime?: number,
  maxWaitTime?: number
): Promise<Result<never>>
```

Waits for AI generation to complete.

**Parameters:**
- `projectId`: Project ID
- `progressUpdateHandler`: Callback for progress updates
- `retryTime`: Polling interval in ms (default: 5000)
- `maxWaitTime`: Maximum wait time in ms (default: 600000)

---

## Static Methods

### listPostmanCollections

```typescript
static listPostmanCollections(postmanApiKey: string): Promise<Result<PostmanCollection[]>>
```

Lists Postman collections.

**Example:**
```typescript
const result = await Theneo.listPostmanCollections('postman-api-key');
if (result.ok) {
  result.value.forEach(collection => {
    console.log(`${collection.name}: ${collection.id}`);
  });
}
```

---

## Result Type

All SDK methods return a `Result<T, Error>` type for type-safe error handling.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `ok` | `boolean` | `true` if successful |
| `err` | `boolean` | `true` if error |
| `value` | `T` | Success value (when `ok` is `true`) |
| `error` | `Error` | Error object (when `err` is `true`) |

### Methods

#### unwrap()

```typescript
unwrap(): T
unwrap<U>(ok: (value: T) => U): U
unwrap<U, V>(ok: (value: T) => U, err: (error: E) => V): U | V
```

Unwraps the result value. Throws if error.

#### map()

```typescript
map<U>(ok: (value: T) => U): Result<U, E>
map<U, F extends Error>(ok: (value: T) => U, err: (error: E) => F): Result<U, F>
```

Transforms the success value.

#### chain()

```typescript
chain<X>(ok: (value: T) => Result<X, E>): Result<X, E>
chain<X>(ok: (value: T) => Result<X, E>, err: (error: E) => Result<X, E>): Result<X, E>
```

Chains operations that return Results.

### Helper Functions

```typescript
// Create success result
Ok<T>(value: T): Result<T>

// Create error result
Err<E extends Error>(error: E): Result<never, E>
Err(message: string): Result<never, Error>
```

**Example:**
```typescript
import { Ok, Err, Result } from '@theneo/sdk';

function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return Err('Division by zero');
  }
  return Ok(a / b);
}
```

---

## Enums Reference

### UserRole

```typescript
enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR'
}
```

### DescriptionGenerationType

```typescript
enum DescriptionGenerationType {
  FILL = 'fill',
  OVERWRITE = 'overwrite',
  NO_GENERATION = 'no_generation'
}
```

### ImportOption

```typescript
enum ImportOption {
  ENDPOINTS_ONLY = 'endpoints',
  OVERWRITE = 'overwrite',
  APPEND = 'append',
  MERGE = 'merge'
}
```

### MergingStrategy

```typescript
enum MergingStrategy {
  KEEP_OLD = 'keep_old',
  KEEP_NEW = 'keep_new'
}
```
