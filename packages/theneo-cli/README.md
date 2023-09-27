# Theneo CLI

## Getting started

## Install

```bash
npm install @theneo/cli
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
theneo project create
```

### Update api documentation from api spec file

```bash
theneo project import --file <file> --project <project-key> --publish
```
### Publish document
```bash
theneo project publish --project <project-key>
```

### Delete project
```bash
theneo project delete --project <project-key>
```

