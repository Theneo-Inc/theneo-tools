# Installation Guide

This guide covers installation of the Theneo CLI and SDK packages.

## Prerequisites

Before installing, ensure you have:

- **Node.js** version 18.x or higher
- **npm** version 9.x or higher (comes with Node.js)

You can verify your versions:

```bash
node --version  # Should be >= 18.x
npm --version   # Should be >= 9.x
```

## Installing the CLI

### Global Installation (Recommended)

Install the Theneo CLI globally to use it from any directory:

```bash
npm install -g @theneo/cli@latest
```

After installation, verify it works:

```bash
theneo --version
theneo help
```

### Local Installation

For project-specific installation:

```bash
npm install @theneo/cli --save-dev
```

Then run via npx:

```bash
npx theneo help
```

Or add to your `package.json` scripts:

```json
{
  "scripts": {
    "docs:create": "theneo project create",
    "docs:publish": "theneo project publish"
  }
}
```

## Installing the SDK

### npm

```bash
npm install @theneo/sdk
```

### yarn

```bash
yarn add @theneo/sdk
```

### pnpm

```bash
pnpm add @theneo/sdk
```

## Verifying Installation

### CLI Verification

```bash
theneo help

# Expected output:
# Usage: theneo [options] [command]
#
# A CLI for the Theneo application
#
# Options:
#   -V, --version       output the version number
#   -h, --help          display help for command
#
# Commands:
#   login [options]     Login in theneo cli
#   project <action>    Project related commands
#   workspace <action>  Workspace related commands
#   version <action>    Project Version related commands
#   export [options]    Export project data
#   import [options]    Import project data
#   create [options]    Create new project from markdown
#   help [command]      display help for command
```

### SDK Verification

Create a test file:

```typescript
import { Theneo } from '@theneo/sdk';

// This should not throw if installation is correct
console.log('Theneo SDK installed successfully!');
```

## Updating

### Update CLI

```bash
npm update -g @theneo/cli
```

### Update SDK

```bash
npm update @theneo/sdk
```

## Uninstalling

### Uninstall CLI

```bash
npm uninstall -g @theneo/cli
```

### Uninstall SDK

```bash
npm uninstall @theneo/sdk
```

## Installing from Source

For development or testing unreleased features:

```bash
# Clone the repository
git clone https://github.com/Theneo-Inc/theneo-tools.git
cd theneo-tools

# Use correct Node version
nvm use

# Install dependencies
npm install

# Build and install CLI globally
npm run cli
```

## Troubleshooting Installation

### Permission Errors (npm global)

If you encounter permission errors during global installation:

```bash
# Option 1: Use a Node version manager (recommended)
nvm install 18
nvm use 18

# Option 2: Change npm's default directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
# Add to your ~/.bashrc or ~/.zshrc:
# export PATH=~/.npm-global/bin:$PATH
```

### Node Version Issues

If you're using an older Node version:

```bash
# Using nvm
nvm install 18
nvm use 18

# Using n
n 18
```

### Cache Issues

If installation seems corrupted:

```bash
npm cache clean --force
npm install -g @theneo/cli@latest
```

## Next Steps

- [Quick Start Guide](./Quick-Start.md)
- [Authentication Setup](./Authentication.md)
