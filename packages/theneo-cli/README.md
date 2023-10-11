# Theneo CLI

## Getting started

## Install

```bash
npm install -g @theneo/cli
```

## Usage

```bash
theneo help

Usage: theneo [options] [command]

A CLI for the Theneo application

Options:
  -V, --version       output the version number
  -h, --help          display help for command

Commands:
  login               Login in theneo cli
  project <action>    Theneo's project related commands
  workspace <action>  Theneo's workspace related commands
  help [command]      display help for command
```

## Examples

### Login

```bash
theneo login
```

### Create new project

```bash
Usage: theneo project create [options]

Create new project

Options:
  --name <name>                                    Project name
  --workspace <workspace>                          Enter workspace slug where the project should be created in, if not present uses default workspace
  -f, --file <file>                                API file path to import (eg: docs/openapi.yml)
  --link <link>                                    API file URL to create project using it
  --postman-api-key <postman-api-key>              Postman API Key (env: THENEO_POSTMAN_API_KEY)
  --postman-collection <postman-collection-id>  Postman collection id
  --empty                                          Creates empty project (default: false)
  --sample                                         Creates project with sample template (default: false)
  --publish                                        Publish the project after creation (default: false)
  --public                                         Make published documentation to be publicly accessible. Private by default (default: false)
  --generate-description <generate-description>    Indicates if AI should be used for description generation (choices: "fill", "overwrite", "no_generation", default: "no_generation")
  --profile <string>                               Use a specific profile from your config file.
  -h, --help                                       display help for command

```

1. create new project interactively
    ```bash
    theneo project create
    ```
2. Create the project directly using api spec file

    ```bash
    theneo project create --name api-documentation --generate-description overwrite --publish --public --file ./examples/openapi-spec.json
    ```
3. Create project using a link to api documentation
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

Update theneo project with a updated API file

Options:
  --key <project-key>                              Specify the project key to import updated documentation in
  -f, --file <file>                                API file path to import (eg: docs/openapi.yml)
  --link <link>                                    API file URL to create project using it
  --postman-api-key <postman-api-key>              Postman API Key (env: THENEO_POSTMAN_API_KEY)
  --postman-collection <postman-collection-id>  Postman collection id
  --import-type <import-type>                      Indicates how should the new api spec be imported (choices: "overwrite", "merge", "endpoints")
  --publish                                        Automatically publish the project (default: false)
  --profile <string>                               Use a specific profile from your config file.
  -h, --help                                       display help for command

```

```bash
theneo project import --file <file> --project <project-key> --publish
```

### Publish document

```bash
theneo project publish --key <project-key>
```

### Delete project

```bash
theneo project delete --key <project-key>
```

