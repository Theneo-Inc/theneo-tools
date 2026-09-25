# @theneo/mcp

This package provides a simple Model Context Protocol (MCP) server for Theneo projects.

## Building

```bash
npm run build
```

## Usage

Run the server for a specific project slug:

```bash
node dist/bin.js add <projectSlug> [--port <port>] [--mode <local|cloud>] [--profile <profile>]
```

- `--port` - server port (defaults to `3000`)
- `--mode` - server mode (`local` or `cloud`, default `local`)
- `--profile` - use a specific CLI profile (e.g. `local`)

The server exposes the following endpoints:

- `/openapi` – exported OpenAPI specification
- `/context` – basic project context
- `/.well-known/mcp/tool-manifest.json` – tool manifest for agent registration
- `/refresh` – re-export and reload the spec

## Example

```bash
node dist/bin.js add parsing --profile local --port 4000
```

This will start an MCP server for the `parsing` project on port `4000` using the `local` profile.
