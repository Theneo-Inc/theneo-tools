# Frequently Asked Questions

Common questions about Theneo Tools.

## General

### What is Theneo?

Theneo is a platform for creating, managing, and publishing API documentation. It supports importing from OpenAPI specs, Postman collections, and more, with AI-powered description generation.

### What are Theneo Tools?

Theneo Tools is an open-source project containing:
- **@theneo/cli**: Command-line interface for Theneo
- **@theneo/sdk**: TypeScript/JavaScript SDK for Theneo API

### Is Theneo Tools free?

Yes, the CLI and SDK are free and open-source (MIT license). You need a Theneo account to use them, and Theneo has various pricing plans.

### What's the difference between CLI and SDK?

- **CLI**: For terminal/command-line usage, CI/CD pipelines, scripting
- **SDK**: For programmatic integration in Node.js applications

## Installation

### What Node.js version is required?

Node.js 18 or higher is required.

### Can I use yarn or pnpm?

Yes:
```bash
yarn add @theneo/sdk
pnpm add @theneo/sdk
```

### How do I update to the latest version?

```bash
# CLI
npm update -g @theneo/cli

# SDK
npm update @theneo/sdk
```

## Authentication

### Where do I get an API key?

1. Log in to [app.theneo.io](https://app.theneo.io)
2. Go to account settings
3. Generate an API key

### Is my API key secure?

The CLI stores your API key in `~/.config/theneo/config`. Keep this file secure and don't commit it to version control.

### Can I use multiple accounts?

Yes, use profiles:
```bash
theneo login --profile work --token WORK_KEY
theneo login --profile personal --token PERSONAL_KEY

theneo project list --profile work
theneo project list --profile personal
```

## Projects

### What file formats are supported?

- OpenAPI/Swagger 2.0, 3.0, 3.1 (YAML or JSON)
- Postman Collections
- Theneo Markdown export format

### How do I find my project slug?

The slug is in your documentation URL:
```
https://app.theneo.io/workspace-slug/project-slug
                                    ^^^^^^^^^^^^
```

Or list projects:
```bash
theneo project list
```

### What's the difference between import types?

| Type | Behavior |
|------|----------|
| `endpoints` | Import only API endpoints |
| `overwrite` | Replace everything |
| `append` | Add new content without changing existing |
| `merge` | Smart merge, can preserve existing descriptions |

### How does AI description generation work?

When you specify `--generate-description fill` or `overwrite`:
- **fill**: AI generates descriptions only for empty fields
- **overwrite**: AI generates descriptions for all fields

The process runs asynchronously and may take time for large specs.

## Versions

### What are project versions?

Versions let you maintain multiple versions of your documentation (e.g., v1, v2, beta). Each version has its own content.

### How do I set a default version?

```bash
theneo version create --project myproject --name "v2" --default
```

## Export/Import

### Can I edit documentation as Markdown?

Yes:
1. Export: `theneo export --project myproject --dir ./docs`
2. Edit the Markdown files
3. Import: `theneo import --project myproject --dir ./docs`

### What format does export use?

Export creates:
- `theneo.json`: Project metadata
- `section-name/index.md`: Content for each section
- `section-name/section.json`: Section metadata

### Can I export as OpenAPI?

Yes:
```bash
theneo export --project myproject --openapi --format yaml
```

## SDK

### Does the SDK work in browsers?

No, the SDK is designed for Node.js environments. It uses Node.js-specific features like `fs` for file operations.

### What TypeScript version is required?

TypeScript 5.x is recommended.

### How do I handle errors?

The SDK uses Result types:

```typescript
const result = await theneo.listProjects();

if (result.ok) {
  // Success: use result.value
  console.log(result.value);
} else {
  // Error: use result.error
  console.error(result.error.message);
}
```

### Can I use async/await?

Yes, all SDK methods return Promises:

```typescript
async function main() {
  const projects = await theneo.listProjects();
  // ...
}
```

## CI/CD

### How do I use Theneo in GitHub Actions?

```yaml
- name: Update Docs
  env:
    THENEO_API_KEY: ${{ secrets.THENEO_API_KEY }}
  run: |
    npm install -g @theneo/cli
    theneo project import --project myapi --file ./openapi.yaml --publish
```

### Can I automate documentation updates?

Yes, trigger on changes to your API spec file:

```yaml
on:
  push:
    paths:
      - 'api/openapi.yaml'
```

## Workspaces

### What is a workspace?

A workspace is a container for projects, often representing a team or organization.

### How do I switch workspaces?

Use the `--workspace` flag:
```bash
theneo project list --workspace other-workspace
```

### Can I have multiple default workspaces?

No, but you can use profiles to switch between workspaces easily.

## Troubleshooting

### Why is my command slow?

- Large OpenAPI specs take time to process
- AI description generation runs asynchronously
- Network latency

### Why aren't my changes appearing?

Make sure to publish after importing:
```bash
theneo project import --project myapi --file ./api.yaml --publish
```

Or publish separately:
```bash
theneo project publish --project myapi
```

### Where can I get help?

1. Check [Common Issues](./Common-Issues.md)
2. Search [GitHub Issues](https://github.com/Theneo-Inc/theneo-tools/issues)
3. Open a new issue if needed
4. Check [Theneo documentation](https://theneo.io/docs)

## Contributing

### How can I contribute?

See our [Contributing Guide](../Contributing/Guide.md). We welcome:
- Bug reports
- Feature requests
- Code contributions
- Documentation improvements

### Is there a roadmap?

Check the GitHub issues labeled `enhancement` for upcoming features.

### How are releases managed?

We use Changesets for versioning. See [Release Process](../Contributing/Release-Process.md).
