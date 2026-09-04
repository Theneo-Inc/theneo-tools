# Theneo CLI
The Theneo CLI (Command Line Interface) is s a command-line tool for effortless management of the Theneo platform from your terminal.
Create, manage, and publish API documentation with ease, all without leaving your terminal.

You can find the npm package [here](https://www.npmjs.com/package/@theneo/cli)
## Pre-requisites
- Node.js v18 or higher

## Install
To install the Theneo CLI, use the following command:

```bash
npm install -g @theneo/cli@latest
```
This command installs the Theneo CLI globally on your machine, allowing it to be run from any directory.

## Usage
To get started with Theneo CLI, you can use the help command:
```bash
theneo help

Usage: theneo [options] [command]

A CLI for the Theneo application

Options:
  -V, --version       output the version number
  -h, --help          display help for command

Commands:
  login [options]     Login in theneo cli
  project <action>    Project related commands
  workspace <action>  Workspace related commands
  version <action>    Project Version related commands
  help [command]      display help for command
```

## Examples

### Login
Standard Login:
```bash
theneo login
```


Login with an API Key:
```bash
theneo login --token <theneo-api-key>
```

You can also set the `THENEO_API_KEY` environment variable.


### Create new project

```bash
Usage: theneo project create [options]

Create new project

Options:
  --name <name>                                  Project name
  --workspace <workspace-slug>                   Enter workspace slug where the project should be created in, if not present uses default workspace
  -f, --file <file>                              API file path to import (eg: docs/openapi.yml)
  --link <link>                                  API file URL to create project using it
  --postman-api-key <postman-api-key>            Postman API Key (env: THENEO_POSTMAN_API_KEY)
  --postman-collection <postman-collection>      Postman collection id, you can use multiple times
  --empty                                        Creates empty project (default: false)
  --sample                                       Creates project with sample template (default: false)
  --publish                                      Publish the project after creation (default: false)
  --public                                       Make published documentation to be publicly accessible. Private by default (default: false)
  --generate-description <generate-description>  Indicates if AI should be used for description generation (choices: "fill", "overwrite", "no_generation", default:
                                                 "no_generation")
  --profile <string>                             Use a specific profile from your config file.
  -h, --help                                     display help for command

```

1. Create a new project interactively
   ```bash
   theneo project create
   ```
2. Create the project directly using api spec file

   ```bash
   theneo project create --name api-documentation --generate-description overwrite --publish --public --file ./examples/openapi-spec.json
   ```

3. Create a project using a link to api documentation
   ```bash
   theneo project create --name api-documentation --generate-description fill --publish --public --link https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/uspto.json
   ```
4. Create a project from Postman collections
   ```bash
    theneo project create --name api-documentation --postman-api-key <key> --postman-collection <id-1> --postman-collection <id-2>
   ```

### Update api documentation from api spec file
Import updated documentation into Theneo using file, link or postman collection

Note: Published document link has this pattern: https://app.theneo.io/<workspace-slug>/<project-slug>/<version-slug>

```bash
Usage: theneo project import [options]

Options:
  --project <project-slug>                   Specify the project slug to import updated documentation in
  -f, --file <file>                          API file path to import (eg: docs/openapi.yml)
  --link <link>                              API file URL to create project using it
  --postman-api-key <postman-api-key>        Postman API Key (env: THENEO_POSTMAN_API_KEY)
  --postman-collection <postman-collection>  Postman collection id, you can use multiple times
  --import-type <import-type>                How to import the spec (choices: "endpoints", "overwrite", "append", "merge", "merge_v2")
  --description-merge-strategy <strategy>    For merge_v2: keep_new or keep_old (default: keep_new)
  --generate-description <generate-description>  AI description generation mode (choices: "fill", "overwrite", "no_generation", default: "no_generation")
                                             Note: requires --import-type overwrite
  --publish                                  Automatically publish the project (default: false)
  --workspace <workspace-slug>               Workspace slug, where the project is located
  --projectVersion <version-slug>            Project version slug to import to, if not provided then default version will be used
  --keepOldParameterDescription              For merge: keep existing parameter descriptions
  --keepOldSectionDescription                For merge: keep existing section descriptions
  --profile <string>                         Use a specific profile from your config file.
  -h, --help                                 display help for command
```

#### Updating a Project:

```bash
# interactive
theneo project import
# or
theneo project import --file <file> --project <project-slug> --publish
```

#### Example import with merge option

```bash
theneo project import --project <project-slug> \
--workspace <workspace-slug> \
--projectVersion <version-slug> \
--publish \
--file ./api-spec.json \
--import-type merge \
--keepOldParameterDescription \
--keepOldSectionDescription
```

#### Example import with merge_v2 (smart merge)

```bash
theneo project import --project <project-slug> --file openapi.yaml --import-type merge_v2
theneo project import --project <project-slug> --file openapi.yaml --import-type merge_v2 --description-merge-strategy keep_old
```

#### Example import with AI description generation

```bash
# Fill empty descriptions with AI
theneo project import --project <project-slug> \
--file ./api-spec.json \
--import-type overwrite \
--generate-description fill \
--publish

# Regenerate all descriptions with AI
theneo project import --project <project-slug> \
--file ./api-spec.json \
--import-type overwrite \
--generate-description overwrite \
--publish
```

##### AI Description Generation Modes

| Mode | What it does |
|------|-------------|
| `fill` | Generate AI descriptions only for empty parameters |
| `overwrite` | Regenerate all descriptions with AI |
| `no_generation` | No AI processing (default, current behavior) |

**Note:** AI description generation is only available when `--import-type overwrite` is used. Attempting to use `--generate-description` with other import types will result in an error.

### Publish document

```bash
theneo project publish --project <project-slug>
```

### Delete project

```bash
theneo project delete --project <project-slug>
```

## Project version

```bash
theneo version --help
Usage: theneo version [options] [command] <action>

Project version related commands

Options:
  -h, --help        display help for command

Commands:
  list [options]    List project versions
  create [options]  Create new version
  delete [options]  Delete a version
  add-subscriber [options]  Add a subscriber for project changelog
  help [command]    display help for command
```

### Create

```bash
Usage: theneo version create [options]

Options:
  --name <name>                              Name of the version
  --project <project-slug>                   Project slug to create version for
  --workspace <workspace-slug>               Workspace slug where the project is
  --previousVersion <previous-version-slug>  Previous version slug to duplicate the content from
  --default                                  set as default version
  --profile <string>                         Use a specific profile from your config file.
  -h, --help                                 display help for command
```

```bash
theneo version create
```
### Add ChangeLog subscriber

```bash
Usage: theneo version add-subscriber [options]

Add a subscriber for project changelog

Options:
  --project <project-slug>                  Project slug
  --workspace <workspace-slug>              Workspace slug
  --projectVersion <previous-version-slug>  Project version slug
  --email <email>                           Email of the new subscriber to change log
  --profile <string>                        Use a specific profile from your config file.
  -h, --help                                display help for command
```

### Use the main branch changes

#### Clone the repository
```bash
git clone git@github.com:Theneo-Inc/theneo-tools.git
```

#### install packages

```bash
nvm use 
npm install
```

#### install the cli

```bash
npm run cli
```
#### Run the cli

```bash
theneo help
```

### Change theneo API endpoint

* Using environment variable
  ```bash
  THENEO_API_KEY=<theneo-api-key> THENEO_API_URL=https://api.theneo.io THENEO_APP_URL=https://app.theneo.io \
  theneo <command>
  ```

* Using theneo config file and profile
  ```bash
  theneo login --profile <profile-name> --token <theneo-api-key> --api-url https://api.theneo.io --app-url https://app.theneo.io
  ```
  check the config file at `.config/theneo/config`


## Export and Import project data in Markdown format

### Export project data in Markdown format and JSON files

```bash
Usage: theneo export [options]

Options:
  --project <project-slug>         project slug
  --projectVersion <version-slug>  Version slug
  --workspace <workspace-slug>     Enter workspace slug where the project should be created in, if not present uses default workspace
  --profile <string>               Use a specific profile from your config file.
  --dir <directory>                directory location where the project will be exported (default: "docs")
  --publishedView                  By default it will export data from editor, pass this flag to get published project data (default: false)
  --force                          Overwrite existing files without prompting (default: false)
  --openapi                        Export as OpenAPI spec
  --format <format>                exported OpenAPI spec format (yaml or json) (default: "yaml")
  --tab <tab-slug>                 Export only a specific tab (optional)
  -h, --help                       display help for command
```

```shell
# Export entire project
theneo export --project <project-slug> --projectVersion <version-slug> --dir <directory>

# Export only a specific tab
theneo export --project <project-slug> --tab tab-1 --dir <directory>
```

### Import project data from Markdown files

import exported markdown files back to theneo

```bash
Usage: theneo import [options]

Update theneo project from generated markdown directory

Options:
  --project <project-slug>         project slug
  --workspace <workspace-slug>     Enter workspace slug where the project should be created in, if not present uses default workspace
  --dir <directory>                Generated theneo project directory
  --publish                        Automatically publish the project (default: false)
  --projectVersion <version-slug>  Version slug
  --profile <string>               Use a specific profile from your config file.
  --tab <tab-slug>                 Import into a specific tab only (optional)
  -h, --help                       display help for command
```

```shell
# Import entire project
theneo import --project <project-slug> --projectVersion <version-slug> --dir <directory>

# Import into a specific tab only
theneo import --project <project-slug> --tab tab-2 --dir <directory>
```

**Note on Tabs**: When using the `--tab` flag, only the specified tab will be updated during import, while other tabs remain unchanged. During export, only the sections belonging to the specified tab will be exported. Markdown files exported with tabs contain a `<!-- tab:tab-slug -->` marker at the beginning to indicate which tab they belong to.


### Create a new project from markdown files

```bash
Usage: theneo create [options]

Options:
  --dir <directory>             directory location where the project will be exported
  --name <project-name>         project name 
  --workspace <workspace-slug>  Enter workspace slug where the project should be created in, if not present uses default workspace
  --profile <string>            Use a specific profile from your config file.
  -h, --help                    display help for command
```

```shell
theneo create --dir <directory> --name <project-name>
```


### Audit a project

Validate a Theneo documentation project on disk and report structural problems, so mistakes are caught locally or in CI instead of at import or publish time. No Theneo account or API key is required.

```bash
Usage: theneo audit [options]

Validate a Theneo documentation project on disk and report structural problems

Options:
  --dir <directory>  Project directory to validate (default: current directory)
  --json             Output findings as a JSON array (pipeable)
  -h, --help         display help for command
```

Findings have two severities: `error` (the project is broken) and `warning` (a smell). The command **exits with code 1 if any error-level finding exists**, and `0` otherwise (warnings alone still exit `0`), which makes it suitable for CI gating.

```shell
# Audit the current directory
theneo audit

# Audit a specific project directory
theneo audit --dir ./my-project

# Machine-readable output for scripts/CI
theneo audit --dir ./my-project --json
```

Each finding names the file it relates to (relative path), what is wrong, and how to fix it. With `--json`, the command prints only a findings array (`{ severity, file, line?, rule, message }`).

#### What it checks

**Tier 1 — structure**

- `theneo.json` exists at the root, is valid JSON, and has the required top-level fields (`error`).
- Every declared section folder has both `index.md` and `section.json` (`error`).
- A section's folder name matches its `slug`, case-sensitively (`error`).
- Orphan detection in both directions: declared-but-missing on disk (`error`) and on-disk-but-undeclared (`warning`).
- No `index.md` at the project root (`error`).
- Each `section.json` is valid JSON and, when `endpoints.method` is set, uses a valid HTTP verb (`error`).

**Tier 2 — tabs**

- `tabs`, when present, is an array (`error`).
- Every tab has a non-empty `title` and `slug` (`error`).
- Tab slugs are unique across tabs (`error`).
- A tab sets exactly one of `iconUrl` or `svgCode` — flagged when it has both or neither (`warning`).
- When tabs exist, every top-level section is claimed by exactly one tab — flagged when it appears in zero or in two-or-more tabs (`error`).
- Every slug listed under a tab's `sections` resolves to a real declared section (`error`).
- Each section's `index.md` starts with a `<!-- tab:slug -->` marker matching a declared tab: missing or unknown slug is an `error`; present but not at the very top is a `warning` (reported with a line number). The scan ignores YAML frontmatter and fenced code blocks, so an example marker inside a code block is not mistaken for the real one.

**Tier 3 — MDX widgets** (findings include a line number)

- Every widget's `attributes` prop is valid JSON (`error`).
- Paired widget tags are balanced — every opening tag has a matching close, correctly nested (`error`).
- A `<TabPanel>` is nested directly inside a `<Tabs>`, and its `tabTitle` is one of the parent's declared tabs (`error`).
- A `<Callout>`'s `dataType` is one of `info`, `warning`, `error`, `success` (`error`).
- A widget nested more than one level deep is flagged (`warning`).
- A malformed tag — an opening tag missing its `>` (`<table-cell<p …>`), a closing tag missing its `>` (`</Callout` …), or an `attributes` value with an unterminated quote — is flagged (`error`).

The structural checks (valid JSON, balance, nesting) apply to Theneo's known widget tags, so prose that contains angle-bracket text (e.g. `<Bearer Token>` in an auth example) is not mistaken for a widget. Tag scanning is quote-aware (so `>` inside an `attributes` value is handled) and skips fenced code blocks. Malformed-tag detection covers the known widgets plus their structural tags (`table-row`, `table-cell`, `title`, `description`); it never flags `<`/`>` in code (`Map<String>`), math (`a<b`), or prose, and it does not check malformed tags inside code blocks or a `>` that merges a tag name into adjacent text (`<CodeLinecurl…`).
