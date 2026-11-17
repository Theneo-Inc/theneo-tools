# CLI Configuration

This guide covers all configuration options for the Theneo CLI.

## Configuration File

The CLI configuration is stored in `~/.config/theneo/config` (YAML format).

### File Structure

```yaml
profiles:
  default:
    apiKey: your_default_api_key
    apiUrl: https://api.theneo.io
    appUrl: https://app.theneo.io
  production:
    apiKey: your_production_api_key
    apiUrl: https://api.theneo.io
    appUrl: https://app.theneo.io
  staging:
    apiKey: your_staging_api_key
    apiUrl: https://staging-api.theneo.io
    appUrl: https://staging.theneo.io
```

### Profile Properties

| Property | Description | Default |
|----------|-------------|---------|
| `apiKey` | Theneo API key | Required |
| `apiUrl` | Theneo API endpoint | `https://api.theneo.io` |
| `appUrl` | Theneo App endpoint | `https://app.theneo.io` |

## Environment Variables

Environment variables take precedence over config file values.

| Variable | Description |
|----------|-------------|
| `THENEO_API_KEY` | API key for authentication |
| `THENEO_API_URL` | Theneo API endpoint URL |
| `THENEO_APP_URL` | Theneo App endpoint URL |
| `THENEO_POSTMAN_API_KEY` | Postman API key for imports |
| `THENEO_API_DEFAULT_URL` | Default API URL (fallback) |
| `THENEO_APP_DEFAULT_URL` | Default App URL (fallback) |

### Setting Environment Variables

**Linux/macOS (temporary)**:
```bash
export THENEO_API_KEY=your_api_key
theneo project list
```

**Linux/macOS (permanent)**:
```bash
# Add to ~/.bashrc, ~/.zshrc, or ~/.profile
export THENEO_API_KEY=your_api_key
```

**Windows PowerShell (temporary)**:
```powershell
$env:THENEO_API_KEY="your_api_key"
theneo project list
```

**Windows PowerShell (permanent)**:
```powershell
[Environment]::SetEnvironmentVariable("THENEO_API_KEY", "your_api_key", "User")
```

## Configuration Precedence

The CLI resolves configuration in this order (highest priority first):

1. Command-line arguments
2. Environment variables
3. Profile from config file
4. Default values

### Example

```bash
# This uses:
# 1. Token from --token flag
# 2. Profile settings for other values
theneo project list --token OVERRIDE_TOKEN --profile production
```

## Profiles

### Creating Profiles

```bash
# Create default profile
theneo login --token YOUR_API_KEY

# Create named profile
theneo login --profile production --token PROD_API_KEY

# Create with custom endpoints
theneo login \
  --profile staging \
  --token STAGING_API_KEY \
  --api-url https://staging-api.theneo.io \
  --app-url https://staging.theneo.io
```

### Using Profiles

```bash
# Use default profile
theneo project list

# Use named profile
theneo project list --profile production

# Use profile with any command
theneo project create --profile staging --name "Test API" --file ./api.yaml
```

### Updating Profiles

Run the login command again with the same profile name:

```bash
theneo login --profile production --token NEW_API_KEY
```

You'll be prompted to overwrite the existing profile.

### Deleting Profiles

Manually edit the config file at `~/.config/theneo/config`.

## Multiple Workspaces

Work with multiple Theneo workspaces:

```bash
# List workspaces
theneo workspace list

# Specify workspace for commands
theneo project list --workspace my-workspace
theneo project create --workspace my-workspace --name "My API"
```

## Supported Config Formats

The CLI supports multiple configuration file formats:

| Format | Extension |
|--------|-----------|
| YAML | `.yaml`, `.yml` |
| JSON | `.json` |
| TOML | `.toml` |

The default format is YAML.

## Configuration Directory

The config directory is located at:

| OS | Location |
|----|----------|
| Linux | `~/.config/theneo/` |
| macOS | `~/.config/theneo/` |
| Windows | `%USERPROFILE%\.config\theneo\` |

## CI/CD Configuration

### GitHub Actions

```yaml
name: Update Docs
on: [push]

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g @theneo/cli
      - name: Update Documentation
        env:
          THENEO_API_KEY: ${{ secrets.THENEO_API_KEY }}
        run: theneo project import --project my-api --file ./api.yaml --publish
```

### GitLab CI

```yaml
update-docs:
  image: node:20
  script:
    - npm install -g @theneo/cli
    - theneo project import --project my-api --file ./api.yaml --publish
  variables:
    THENEO_API_KEY: $THENEO_API_KEY
```

### Jenkins

```groovy
pipeline {
    agent any
    environment {
        THENEO_API_KEY = credentials('theneo-api-key')
    }
    stages {
        stage('Update Docs') {
            steps {
                sh 'npm install -g @theneo/cli'
                sh 'theneo project import --project my-api --file ./api.yaml --publish'
            }
        }
    }
}
```

## Troubleshooting

### Config File Not Found

```bash
# Create by logging in
theneo login --token YOUR_API_KEY
```

### Invalid Config File

```bash
# Remove and recreate
rm ~/.config/theneo/config
theneo login --token YOUR_API_KEY
```

### Profile Not Found

```bash
# List profiles by viewing config
cat ~/.config/theneo/config

# Create missing profile
theneo login --profile missing-profile --token YOUR_API_KEY
```

### Permission Issues

```bash
# Fix permissions
chmod 600 ~/.config/theneo/config
chmod 700 ~/.config/theneo
```
