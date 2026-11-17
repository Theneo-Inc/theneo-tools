# CLI Commands Reference

Complete reference for all Theneo CLI commands.

## login

Authenticate with Theneo.

```bash
theneo login [options]
```

### Options

| Option | Description |
|--------|-------------|
| `-t, --token <token>` | Theneo API token |
| `--profile <profile>` | Profile name (default: "default") |
| `--api-url <apiUrl>` | Custom Theneo API URL |
| `--app-url <appUrl>` | Custom Theneo App URL |

### Examples

```bash
# Interactive login
theneo login

# Login with token
theneo login --token YOUR_API_KEY

# Create named profile
theneo login --profile production --token PROD_API_KEY

# Custom endpoints
theneo login --api-url https://custom-api.theneo.io --app-url https://custom.theneo.io
```

---

## project

Project management commands.

### project list

List all projects.

```bash
theneo project list [options]
```

| Option | Description |
|--------|-------------|
| `--workspace <workspace-slug>` | Filter by workspace |
| `--profile <string>` | Use specific profile |

### project create

Create a new project.

```bash
theneo project create [options]
```

| Option | Description |
|--------|-------------|
| `--name <name>` | Project name |
| `--workspace <workspace-slug>` | Target workspace |
| `-f, --file <file>` | API spec file path |
| `--link <link>` | API spec URL |
| `--postman-api-key <key>` | Postman API key |
| `--postman-collection <id>` | Postman collection ID (repeatable) |
| `--empty` | Create empty project |
| `--sample` | Create with sample template |
| `--publish` | Publish after creation |
| `--public` | Make documentation public |
| `--generate-description <type>` | AI description generation: `fill`, `overwrite`, `no_generation` |
| `--profile <string>` | Use specific profile |

### Examples

```bash
# Interactive mode
theneo project create

# From OpenAPI file
theneo project create --name "My API" --file ./openapi.yaml

# From URL with AI descriptions
theneo project create \
  --name "My API" \
  --link https://example.com/openapi.json \
  --generate-description fill \
  --publish \
  --public

# From Postman
theneo project create \
  --name "My API" \
  --postman-api-key YOUR_KEY \
  --postman-collection collection-1 \
  --postman-collection collection-2
```

### project import

Import/update documentation from API spec.

```bash
theneo project import [options]
```

| Option | Description |
|--------|-------------|
| `--project <project-slug>` | Target project |
| `-f, --file <file>` | API spec file path |
| `--link <link>` | API spec URL |
| `--postman-api-key <key>` | Postman API key |
| `--postman-collection <id>` | Postman collection ID |
| `--import-type <type>` | Import strategy: `endpoints`, `overwrite`, `append`, `merge` |
| `--publish` | Publish after import |
| `--workspace <workspace-slug>` | Workspace slug |
| `--projectVersion <version-slug>` | Target version |
| `--keepOldParameterDescription` | Keep existing parameter descriptions (with merge) |
| `--keepOldSectionDescription` | Keep existing section descriptions (with merge) |
| `--profile <string>` | Use specific profile |

### Import Types

| Type | Description |
|------|-------------|
| `endpoints` | Import only endpoints |
| `overwrite` | Replace all existing data |
| `append` | Add to existing data |
| `merge` | Smart merge with existing data |

### Examples

```bash
# Interactive mode
theneo project import

# Basic import
theneo project import --project my-api --file ./openapi.yaml

# Merge with existing descriptions
theneo project import \
  --project my-api \
  --file ./openapi.yaml \
  --import-type merge \
  --keepOldParameterDescription \
  --keepOldSectionDescription \
  --publish

# Import to specific version
theneo project import \
  --project my-api \
  --projectVersion v2 \
  --file ./openapi-v2.yaml
```

### project publish

Publish project documentation.

```bash
theneo project publish [options]
```

| Option | Description |
|--------|-------------|
| `--project <project-slug>` | Project to publish |
| `--workspace <workspace-slug>` | Workspace slug |
| `--profile <string>` | Use specific profile |

### project delete

Delete a project.

```bash
theneo project delete [options]
```

| Option | Description |
|--------|-------------|
| `--project <project-slug>` | Project to delete |
| `--workspace <workspace-slug>` | Workspace slug |
| `--profile <string>` | Use specific profile |

### project preview

Get preview link for a project.

```bash
theneo project preview [options]
```

| Option | Description |
|--------|-------------|
| `--project <project-slug>` | Project to preview |
| `--workspace <workspace-slug>` | Workspace slug |
| `--profile <string>` | Use specific profile |

---

## workspace

Workspace management commands.

### workspace list

List available workspaces.

```bash
theneo workspace list [options]
```

| Option | Description |
|--------|-------------|
| `--profile <string>` | Use specific profile |

---

## version

Project version management commands.

### version list

List project versions.

```bash
theneo version list [options]
```

| Option | Description |
|--------|-------------|
| `--project <project-slug>` | Project slug |
| `--workspace <workspace-slug>` | Workspace slug |
| `--profile <string>` | Use specific profile |

### version create

Create a new version.

```bash
theneo version create [options]
```

| Option | Description |
|--------|-------------|
| `--name <name>` | Version name |
| `--project <project-slug>` | Project slug |
| `--workspace <workspace-slug>` | Workspace slug |
| `--previousVersion <slug>` | Previous version to duplicate from |
| `--default` | Set as default version |
| `--profile <string>` | Use specific profile |

### version delete

Delete a version.

```bash
theneo version delete [options]
```

| Option | Description |
|--------|-------------|
| `--version <version-slug>` | Version to delete |
| `--project <project-slug>` | Project slug |
| `--workspace <workspace-slug>` | Workspace slug |
| `--profile <string>` | Use specific profile |

### version add-subscriber

Add a changelog subscriber.

```bash
theneo version add-subscriber [options]
```

| Option | Description |
|--------|-------------|
| `--project <project-slug>` | Project slug |
| `--workspace <workspace-slug>` | Workspace slug |
| `--projectVersion <version-slug>` | Version slug |
| `--email <email>` | Subscriber email |
| `--profile <string>` | Use specific profile |

---

## export

Export project documentation.

```bash
theneo export [options]
```

| Option | Description |
|--------|-------------|
| `--project <project-slug>` | Project to export |
| `--projectVersion <version-slug>` | Version to export |
| `--workspace <workspace-slug>` | Workspace slug |
| `--profile <string>` | Use specific profile |
| `--dir <directory>` | Output directory (default: "docs") |
| `--publishedView` | Export published view (default: editor view) |
| `--force` | Overwrite existing files |
| `--openapi` | Export as OpenAPI spec |
| `--format <format>` | OpenAPI format: `yaml` or `json` |
| `--tab <tab-slug>` | Export specific tab only |

### Examples

```bash
# Export as Markdown
theneo export --project my-api --dir ./docs

# Export as OpenAPI
theneo export --project my-api --openapi --format yaml

# Export specific tab
theneo export --project my-api --tab api-reference --dir ./docs
```

---

## import

Import Markdown files to project.

```bash
theneo import [options]
```

| Option | Description |
|--------|-------------|
| `--project <project-slug>` | Target project |
| `--workspace <workspace-slug>` | Workspace slug |
| `--dir <directory>` | Source directory |
| `--publish` | Publish after import |
| `--projectVersion <version-slug>` | Target version |
| `--profile <string>` | Use specific profile |
| `--tab <tab-slug>` | Import to specific tab only |

### Examples

```bash
# Import Markdown docs
theneo import --project my-api --dir ./docs --publish

# Import to specific tab
theneo import --project my-api --tab api-reference --dir ./docs
```

---

## create

Create a new project from Markdown files.

```bash
theneo create [options]
```

| Option | Description |
|--------|-------------|
| `--dir <directory>` | Source directory |
| `--name <project-name>` | Project name |
| `--workspace <workspace-slug>` | Target workspace |
| `--profile <string>` | Use specific profile |

### Examples

```bash
theneo create --dir ./docs --name "My API Documentation"
```

---

## Common Options

These options are available on most commands:

| Option | Description |
|--------|-------------|
| `--profile <string>` | Use a specific profile from your config file |
| `--workspace <workspace-slug>` | Specify the workspace |
| `-h, --help` | Display help for command |
