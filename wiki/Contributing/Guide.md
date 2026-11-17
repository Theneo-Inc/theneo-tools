# Contributing Guide

Thank you for your interest in contributing to Theneo Tools! This guide will help you get started.

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all skill levels.

## Ways to Contribute

- **Bug Reports**: Found a bug? Open an issue!
- **Feature Requests**: Have an idea? We'd love to hear it!
- **Code Contributions**: Fix bugs or add features
- **Documentation**: Improve docs, fix typos, add examples
- **Testing**: Help test new features and releases

## Getting Started

### 1. Fork the Repository

1. Go to [github.com/Theneo-Inc/theneo-tools](https://github.com/Theneo-Inc/theneo-tools)
2. Click "Fork" to create your own copy
3. Clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/theneo-tools.git
cd theneo-tools
```

### 2. Set Up Development Environment

See [Development Setup](./Development-Setup.md) for detailed instructions.

```bash
# Use correct Node version
nvm use

# Install dependencies
npm install

# Build all packages
npm run build

# Install CLI globally for testing
npm run cli
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Use descriptive branch names:
- `feature/add-export-format`
- `fix/login-error-handling`
- `docs/update-api-reference`

## Making Changes

### 1. Make Your Changes

- Follow the [Code Style](./Code-Style.md) guidelines
- Write clear, concise code
- Add tests if applicable
- Update documentation as needed

### 2. Test Your Changes

```bash
# Build to check for compilation errors
npm run build

# Run linting
npm run lint

# Test the CLI manually
theneo --help
```

### 3. Create a Changeset

If your change affects the public API or fixes a bug:

```bash
npm run changeset
```

This interactive command will:
1. Ask which packages are affected
2. Ask for version bump type (patch/minor/major)
3. Ask for a summary of changes

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new export format option"
```

Use conventional commit messages:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Open a Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill out the PR template
4. Submit the PR

## Pull Request Guidelines

### PR Checklist

- [ ] Code is up-to-date with the `main` branch
- [ ] `npm run lint` passes
- [ ] PR links relevant issues as `Fixes #123`
- [ ] Tests are added/updated if applicable
- [ ] Documentation is updated if needed
- [ ] Changeset is created if applicable

### PR Description

Include:
- What the change does
- Why the change is needed
- How to test it
- Screenshots if UI-related

### Review Process

1. Maintainers will review your PR
2. Address any feedback
3. Once approved, it will be merged

## Issue Guidelines

### Bug Reports

Use the bug report template and include:
- Current behavior
- Expected behavior
- Steps to reproduce
- Debug log (run with `--debug` flag)
- Node version, OS, etc.

### Feature Requests

Use the feature request template and include:
- Problem description
- Proposed solution
- Alternatives considered
- Willingness to implement

## Development Tips

### Testing CLI Changes

```bash
# Rebuild and reinstall
npm run cli

# Test specific commands
theneo project list
theneo project create --help
```

### Testing SDK Changes

```bash
# Build SDK
cd packages/theneo-sdk
npm run build

# Test in examples
cd examples/theneo-sdk-test
npm install
npm start
```

### Debugging

Add console.log statements or use Node.js debugger:

```bash
# Debug CLI
node --inspect-brk $(which theneo) project list
```

### Hot Reload During Development

```bash
# Watch mode for all packages
npm run dev

# In another terminal, test your changes
theneo --help
```

## Questions?

- Open a discussion on GitHub
- Check existing issues and PRs
- Review this wiki

Thank you for contributing!
