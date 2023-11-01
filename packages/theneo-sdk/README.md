# Theneo SDK Package

This documentation provides an overview of the Theneo SDK package.
The SDK package includes classes and interfaces for working with the Theneo API.
Theneo is a platform for managing API documentation projects.

## Install

Install the Theneo SDK Package: Use npm to install the Theneo SDK package:

```bash
  npm install @theneo/sdk
```

## Usage

To use the Theneo SDK package, import the necessary classes and interfaces, and create an instance of the `Theneo` class
with the required options.
Then, you can use the methods provided by the SDK to interact with the Theneo API.

```typescript
import { Theneo, TheneoOptions, Result, Workspace, ProjectSchema, CreateProjectOptions } from "@theneo/sdk";

// Define Theneo options
const options: TheneoOptions = {
  apiKey: "YOUR_API_KEY"
};

// Create a Theneo instance
const theneo = new Theneo(options);

// Example usage
async function listWorkspaces() {
  const result: Result<Workspace[]> = await theneo.listWorkspaces();
  if (result.ok) {
    const workspaces: Workspace[] = result.unwrap();
    console.log("Workspaces:", workspaces);
  } else {
    console.error("Error:", result.unwrap());
  }
}

// Create a new project
async function createProject() {
  const projectOptions: CreateProjectOptions = {
    name: "My Project",
    workspace: { key: "workspace-key" },
    publish: true,
    isPublic: true,
    data: {
      // Specify the data source using one of the following attributes:
      // 1. Import from a file
      // file: '/path/to/api-documentation.json',

      // 2. Import from a URL
      // link: 'https://example.com/api-documentation.json',

      // 3. Import from a text string
      // text: 'API documentation content as a string',

      // 4. Import from a Postman collection
      // postman: {
      //   apiKey: 'YOUR_POSTMAN_API_KEY',
      //   collectionIds: ['collection-id-1', 'collection-id-2'],
      // },
    } as ApiDataInputOption
  };

  const result: Result<CreateProjectResponse> = await theneo.createProject(projectOptions);
  if (result.ok) {
    const createdProject: CreateProjectResponse = result.unwrap();
    console.log("Created Project:", createdProject);
  } else {
    console.error("Error:", result.unwrap());
  }
}

// Use the SDK methods as needed
listWorkspaces();
createProject();
```

### Import api document

An example
demonstrating how to use the `importProjectDocument` method
to import API documentation to an existing project using the Theneo SDK in TypeScript:

```typescript
import { Theneo, TheneoOptions, Result, ImportProjectOptions, ImportResponse, ApiDataInputOption } from "@theneo/sdk";

// Define Theneo options
const options: TheneoOptions = {
  apiKey: "YOUR_API_KEY"
};

// Create a Theneo instance
const theneo = new Theneo(options);

// Define the import options
const importOptions: ImportProjectOptions = {
  projectId: "project-id", // Replace with the actual project ID
  publish: true, // Set to true if you want to publish the imported data
  data: {
    // Specify the data source using one of the following attributes:
    // 1. Import from a file
    // file: '/path/to/api-documentation.json',

    // 2. Import from a URL
    // link: 'https://example.com/api-documentation.json',

    // 3. Import from a text string
    // text: 'API documentation content as a string',

    // 4. Import from a Postman collection
    // postman: {
    //   apiKey: 'YOUR_POSTMAN_API_KEY',
    //   collectionIds: ['collection-id-1', 'collection-id-2'],
    // },
  } as ApiDataInputOption
};

// Import API documentation to the project
async function importApiDocumentation() {
  const result: Result<ImportResponse> = await theneo.importProjectDocument(importOptions);
  if (result.ok) {
    const importResponse: ImportResponse = result.unwrap();
    console.log("Imported API Documentation:", importResponse);
  } else {
    console.error("Error:", result.unwrap());
  }
}

// Run the import function
importApiDocumentation();
```

In this example:

- We first create an instance of the `Theneo` class and provide the necessary API key in the `options` object.

- We define the import options in the `importOptions` object. You should replace `'project-id'` with the actual ID of
  the project where you want to import the API documentation.

- Inside the `data` attribute of `importOptions`, you can specify the source of the API documentation to be imported.
  You can choose one of the four options:
  1. Import from a file (specify the file path).
  2. Import from a URL (specify the URL).
  3. Import from a text string (specify the content as a string).
  4. Import from a Postman collection (specify the Postman API key and collection IDs).

- The `publish` option is set to `true` to indicate that the imported data should be published.

- The `importApiDocumentation` function uses the `importProjectDocument` method to perform the import operation.

Make sure to replace the placeholder values (`'YOUR_API_KEY'`, `'project-id'`, and any others) with your actual API key
and project details before running the code.

## TheneoOptions (Interface)

Options for initializing the Theneo SDK.

- `apiKey?: string`: API key for the Theneo application.
- `apiClientName?: string`: Name of the client making the API call (default is `theneo-sdk:${SDK_VERSION}`).
- `baseApiUrl?: string`: Theneo API URL.
- `baseAppUrl?: string`: Theneo APP URL.

## Theneo (Class)

The main class for interacting with the Theneo API.

### Methods

- `listWorkspaces(role?: UserRole): Promise<Result<Workspace[]>>`: Lists workspaces available for a user.
- `listProjects(): Promise<Result<ProjectSchema[]>>`: Lists user projects.
- `deleteProjectById(projectId: string): Promise<Result<void>>`: Deletes a project by ID.
- `publishProject(projectId: string): Promise<Result<PublishProjectResponse>>`: Publishes API documentation for a
  project.
- `getPreviewProjectLink(projectId: string): string` returns preview link for a project. 
- `importProjectDocument(options: ImportProjectOptions): Promise<Result<ImportResponse>>`: Imports API documentation to
  an existing project.
- `createProject(options: CreateProjectOptions): Promise<Result<CreateProjectResponse>>`: Creates a new project on the
  Theneo platform.
- `getDescriptionGenerationStatus(projectId: string): Promise<Result<ProjectCreationStatusResponse, Error>>`: Gets the
  description generation status for a project.
- `waitForDescriptionGeneration(projectId: string, progressUpdateHandler?: DescriptionGenerationProgressHandler, retryTime?: number, maxWaitTime?: number): Promise<Result<never>>`:
  Waits for description generation to finish.

- `static listPostmanCollections(postmanApiKey: string): Promise<Result<PostmanCollection[]>>`: Returns list of Postman
  Collections using the api key

## DescriptionGenerationType (Enum)

An enum representing different types of description generation options.

- `FILL`: Generate descriptions for parameters that do not have descriptions already.
- `OVERWRITE`: Overwrite descriptions for parameters that do not have descriptions already.
- `NO_GENERATION`: Do not generate descriptions for parameters that do not have descriptions already.

## DescriptionGenerationProgressHandler (Type)

A callback function type that receives the progress percentage of description generation.

## PostmanImportOptions (Interface)

Options for importing Postman collections.

- `apiKey: string`: Postman API key.
- `collectionId: string[]`: Postman collection IDs to be imported.

## WorkspaceOption (Interface)

Workspace options for creating a project.

- `key?: string`: Workspace key.
- `id?: string`: Workspace ID.

## ApiDataInputOption (Interface)

Data input options for creating a project. Specify only one of the following attributes.

- `file?: fs.PathLike`: Path to a file containing API documentation.
- `link?: URL`: URL to a file containing API documentation.
- `text?: string`: API documentation as a string.
- `postman?: PostmanImportOptions`: Postman collection to create the project from.

## CreateProjectOptions (Interface)

Options for creating a project.

- `name: string`: Project name.
- `workspace?: WorkspaceOption`: Workspace where to create the project (default is the user's default workspace).
- `publish?: boolean`: Indicates if the project should be published after creation (default is `false`).
- `isPublic?: boolean`: Indicates if the project is public (default is `false`).
- `data?: ApiDataInputOption`: API documentation data for creating the project.
- `sampleData?: boolean`: Indicates if the project should be created with sample data.
- `descriptionGenerationType?: DescriptionGenerationType`: Description generation type.
- `progressUpdateHandler?: DescriptionGenerationProgressHandler`: Callback for description generation progress.

## ImportOption (Enum)

An enum representing different options for importing API specifications.

- `ENDPOINTS_ONLY`: Import only the endpoints.
- `OVERWRITE`: Overwrite existing data.
- `MERGE`: Merge with existing data.

## ImportProjectOptions (Interface)

Options for importing API documentation to an existing project.

- `projectId: string`: Project ID.
- `publish: boolean`: Indicates if the imported data should be published.
- `data: ApiDataInputOption`: API documentation data for importing.
- `importOption?: ImportOption`: Import option.

## PublishProjectResponse (Interface)

A response object after publishing a project.

- `projectKey: string`: Project key.
- `baseUrlRequired: boolean`: Indicates if a base URL is required.
- `companySlug: string`: Company slug.
- `publishedPageUrl: string`: URL of the published page.

## CompanySchema (Interface)

A schema representing company information.

- `id: string`: Company ID.
- `name: string`: Company name.
- `slug: string`: Company slug.
- `corporateId: string`: Corporate ID.
- `createdAt: Date`: Creation date.
- `updatedAt: Date`: Last updated date.
- `createdBy: string`: Created by user.

## ProjectSchema (Interface)

A schema representing project information.

- `id: string`: Project ID.
- `name: string`: Project name.
- `key: string`: Project key.
- `isPublic: boolean`: Indicates if the project is public.
- `companyId: string`: Company ID.
- `createdAt: Date`: Creation date.
- `company: CompanySchema`: Company information.

## CreateOtherTypeOfDocOptions (Interface)

Options for creating other types of documentation.

- `docType: string`: The type of documentation.
- `gettingStartedSections?: { introduction: boolean; prerequisites: boolean; quickStart: boolean; resources: boolean; }`:
  Sections for getting started documentation.
- `sdk?: { overview: boolean; supportedLibraries: boolean; sampleCode: boolean; troubleshooting: boolean; }`: SDK
  documentation sections.
- `faq?: { generalInfo: boolean; authentication: boolean; usage: boolean; billing: boolean; }`: FAQ sections.

## CreatedProjectStatusEnum (Enum)

An enum representing different statuses for a created project.

- `CREATED`: Project creation completed successfully.
- `STARTED`: Project creation is in progress.
- `FINISHED`: Project creation finished successfully.
- `ERROR`: Project creation encountered an error.
- `CREATED_WITHOUT_AI_GENERATION`: Project created without AI generation.

## CreateProjectResponse (Interface)

A response object after creating a project.

- `projectId: string`: Project ID.
- `publishData?: PublishProjectResponse`: Information about the published project.

## ProjectCreationStatusResponse (Interface)

A response object containing information about the status of project creation.

- `name: string`: Project name.
- `key: string`: Project key.
- `creationStatus: CreatedProjectStatusEnum`: Creation status.
- `descriptionGenerationProgress: number`: Progress of description generation in percentage.
- `updatedAt: string`: Last updated date.

## ImportResponse (Interface)

A response object after importing a project.

- `collectionId: string`: Collection ID.
- `publishData?: PublishProjectResponse`: Information about the published project.

## UserRole (Enum)

An enum representing different user roles.

- `ADMIN`: Administrator.
- `EDITOR`: Editor.

## Workspace (Interface)

Workspace information.

- `workspaceId: string`: Workspace ID.
- `name: string`: Workspace name.
- `slug: string`: Workspace slug/key.
- `role: UserRole`: Workspace role.
- `isDefault: boolean`: Indicates if the workspace is the default workspace.
- `isCorporate: boolean`: Indicates if the workspace is corporate.
- `isSubscribed: boolean`: Indicates if the workspace is subscribed.

## ResultImpl<T, E extends Error> (Abstract Class)

An abstract class
representing the result of an operation
that can either succeed with a value of type `T` or fail with an error of type `E`.

### Methods

- `unwrap(): T`: Unwraps the successful result value. If the result is an error, this method will throw an exception.
- `unwrap<U>(ok: (value: T) => U): U`: Unwraps the successful result value and applies a function to it.
- `unwrap<U, V>(ok: (value: T) => U, err: (error: E) => V): U | V`: Unwraps the result value and applies functions based
  on whether it's a success or an error.
- `unwrap<U>(ok: (value: T) => U, err: (error: E) => U): U`: Unwraps the result value and applies a function based on
  whether it's a success or an error.
- `map<U>(ok: (value: T) => U): Result<U, E>`: Transforms a successful result into a new result with a different value
  type.
- `map<U, F extends Error>(ok: (value: T) => U, err: (error: E) => F): Result<U, F>`: Transforms a result into a new
  result with different value and error types.
- `chain<X>(ok: (value: T) => Result<X, E>): Result<X, E>`: Chains a function that produces a new result based on the
  success value.
- `chain<X>(ok: (value: T) => Result<X, E>, err: (error: E) => Result<X, E>): Result<X, E>`: Chains functions for both
  success and error cases.
- `chain<X, U extends Error>(ok: (value: T) => Result<X, U>, err: (error: E) => Result<X, U>): Result<X, U>`: Chains
  functions with different error types.

## OkResult<T, E extends Error> (Class)

A class representing a successful result.

### Properties

- `value: T`: The successful value.

## ErrResult<T, E extends Error> (Class)

A class representing an error result.

### Properties

- `error: E`: The error object.

## Ok<T, E extends Error>(value: T): Result<T, E> (Function)

A function for creating a successful result.

- `value: T`: The value to wrap in the result.

## Err<E extends Error, T = never>(error?: E): Result<T, E> (Function)

A function for creating an error result.

- `error?: E`: An optional error object.

## ResponseSchema<T> (Interface)

An interface representing the schema of a response object.

- `data: T`: The data payload of the response.
- `message: string`: A message associated with the response.
