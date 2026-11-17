# CLI Overview

The Theneo CLI (`@theneo/cli`) is a command-line interface for managing Theneo API documentation projects directly from your terminal.

## Installation

```bash
npm install -g @theneo/cli@latest
```

## Features

- **Project Management**: Create, update, delete, and publish API documentation projects
- **Multiple Import Sources**: Import from OpenAPI specs, Postman collections, URLs, or Markdown files
- **AI-Powered Descriptions**: Automatically generate descriptions for API parameters
- **Version Control**: Manage multiple versions of your documentation
- **Export/Import**: Export documentation as Markdown and re-import after editing
- **Multi-Workspace**: Work with multiple Theneo workspaces
- **Profile Support**: Manage multiple accounts with named profiles

## Command Structure

```
theneo [options] [command]
```

## Global Options

| Option | Description |
|--------|-------------|
| `-V, --version` | Output the version number |
| `-h, --help` | Display help for command |

## Commands Overview

| Command | Description |
|---------|-------------|
| `login` | Authenticate with Theneo |
| `project` | Project management commands |
| `workspace` | Workspace management commands |
| `version` | Project version commands |
| `export` | Export project as Markdown/OpenAPI |
| `import` | Import Markdown files to project |
| `create` | Create project from Markdown files |

## Basic Usage

### Get Help

```bash
# General help
theneo help

# Command-specific help
theneo project help
theneo project create --help
```

### Common Workflows

```bash
# Login
theneo login

# Create a project
theneo project create --name "My API" --file ./openapi.yaml

# Import updated spec
theneo project import --project my-api --file ./openapi.yaml

# Publish changes
theneo project publish --project my-api

# List projects
theneo project list
```

## Configuration

The CLI uses a configuration file stored at `~/.config/theneo/config`:

```yaml
profiles:
  default:
    apiKey: your_api_key
    apiUrl: https://api.theneo.io
    appUrl: https://app.theneo.io
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `THENEO_API_KEY` | API key for authentication |
| `THENEO_API_URL` | Custom API endpoint |
| `THENEO_APP_URL` | Custom app endpoint |
| `THENEO_POSTMAN_API_KEY` | Postman API key for imports |

## Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | General error |

## Next Steps

- [Commands Reference](./Commands.md)
- [Configuration](./Configuration.md)
