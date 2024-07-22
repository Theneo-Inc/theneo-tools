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

```bash
Usage: theneo project import [options]

Import updated documentation into Theneo using file, link or postman collection

Note: Published document link has this pattern: https://app.theneo.io/<workspace-slug>/<project-slug>/<version-slug>

Options:
  --key <project-slug>                       Specify the project slug to import updated documentation in - deprecated
  --project <project-slug>                   Specify the project slug to import updated documentation in
  -f, --file <file>                          API file path to import (eg: docs/openapi.yml)
  --link <link>                              API file URL to create project using it
  --postman-api-key <postman-api-key>        Postman API Key (env: THENEO_POSTMAN_API_KEY)
  --postman-collection <postman-collection>  Postman collection id, you can use multiple times
  --import-type <import-type>                Indicates how should the new api spec be imported (choices: "endpoints", "overwrite", "append", "merge")
  --publish                                  Automatically publish the project (default: false)
  --workspace <workspace-slug>               Workspace slug, where the project is located
  --versionSlug <version-slug>               Project version slug to import to, if not provided then default version will be used - deprecated
  --projectVersion <version-slug>            Project version slug to import to, if not provided then default version will be used
  --keepOldParameterDescription              Additional flag during merging import option, it will keep old parameter descriptions
  --keepOldSectionDescription                Additional flag during merging import option, it will keep old section descriptions
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
  create [options]
  delete [options]
  help [command]    display help for command
```

### Create

```bash
Usage: theneo version create [options]

Options:
  --name <name>                              Name of the version
  --projectKey <project-slug>                Project slug to create version for - deprecated
  --project <project-slug>                   Project slug to create version for
  --workspace <workspace-slug>               Workspace slug where the project is
  --previousVersion <previous-version-slug>  Previous version slug to duplicate the content from
  --profile <string>                         Use a specific profile from your config file.
  -h, --help                                 display help for command
```

```bash
theneo version create
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
