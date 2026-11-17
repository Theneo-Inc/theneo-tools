# Authentication

Theneo Tools authenticate using API keys. This guide covers all authentication methods.

## Getting Your API Key

1. Log in to [Theneo](https://app.theneo.io)
2. Navigate to your account settings
3. Generate an API key

## Authentication Methods

### Method 1: Interactive Login

```bash
theneo login
```

You'll be prompted to enter your API key. This is the most secure method for local development.

### Method 2: Token Flag

```bash
theneo login --token YOUR_API_KEY
```

### Method 3: Environment Variable

Set the `THENEO_API_KEY` environment variable:

```bash
# Linux/macOS
export THENEO_API_KEY=your_api_key

# Windows (PowerShell)
$env:THENEO_API_KEY="your_api_key"

# Windows (CMD)
set THENEO_API_KEY=your_api_key
```

For persistent configuration, add to your shell profile:

```bash
# ~/.bashrc or ~/.zshrc
export THENEO_API_KEY=your_api_key
```

## Configuration File

The CLI stores authentication in a config file at `~/.config/theneo/config`:

```yaml
profiles:
  default:
    apiKey: your_api_key
    apiUrl: https://api.theneo.io
    appUrl: https://app.theneo.io
```

## Profiles

Use profiles to manage multiple accounts or environments:

### Creating Profiles

```bash
# Create a profile
theneo login --profile production --token PROD_API_KEY

# Create another profile
theneo login --profile staging --token STAGING_API_KEY
```

### Using Profiles

```bash
# Use default profile
theneo project list

# Use specific profile
theneo project list --profile production
```

### Config File with Multiple Profiles

```yaml
profiles:
  default:
    apiKey: dev_api_key
    apiUrl: https://api.theneo.io
    appUrl: https://app.theneo.io
  production:
    apiKey: prod_api_key
    apiUrl: https://api.theneo.io
    appUrl: https://app.theneo.io
  staging:
    apiKey: staging_api_key
    apiUrl: https://staging-api.theneo.io
    appUrl: https://staging.theneo.io
```

## Custom API Endpoints

For self-hosted or staging environments:

```bash
# Via login command
theneo login \
  --profile custom \
  --token YOUR_API_KEY \
  --api-url https://custom-api.example.com \
  --app-url https://custom-app.example.com
```

Or via environment variables:

```bash
export THENEO_API_KEY=your_api_key
export THENEO_API_URL=https://custom-api.example.com
export THENEO_APP_URL=https://custom-app.example.com
```

## SDK Authentication

### Basic Authentication

```typescript
import { Theneo } from '@theneo/sdk';

const theneo = new Theneo({
  apiKey: 'YOUR_API_KEY'
});
```

### Environment Variable (Recommended)

```typescript
import { Theneo } from '@theneo/sdk';

// Uses THENEO_API_KEY environment variable automatically
const theneo = new Theneo({});
```

### Custom Endpoints

```typescript
import { Theneo } from '@theneo/sdk';

const theneo = new Theneo({
  apiKey: 'YOUR_API_KEY',
  baseApiUrl: 'https://custom-api.example.com',
  baseAppUrl: 'https://custom-app.example.com'
});
```

### Client Metadata

Track API usage with custom client metadata:

```typescript
import { Theneo } from '@theneo/sdk';

const theneo = new Theneo({
  apiKey: 'YOUR_API_KEY',
  apiClientMetadata: {
    apiClientName: 'my-integration',
    apiClientVersion: '1.0.0'
  }
});
```

## Security Best Practices

### 1. Never Commit API Keys

Add to `.gitignore`:

```
.env
.env.local
.config/theneo/
```

### 2. Use Environment Variables in CI/CD

```yaml
# GitHub Actions
env:
  THENEO_API_KEY: ${{ secrets.THENEO_API_KEY }}
```

### 3. Rotate Keys Regularly

Generate new API keys periodically and revoke old ones.

### 4. Use Minimal Permissions

If Theneo supports scoped API keys, use the minimum required permissions.

### 5. Different Keys per Environment

Use separate API keys for development, staging, and production.

## Troubleshooting

### "No API key provided" Error

```bash
# Check if environment variable is set
echo $THENEO_API_KEY

# Or login again
theneo login
```

### "Invalid API key" Error

1. Verify the key in Theneo dashboard
2. Check for extra spaces or characters
3. Regenerate if necessary

### Config File Issues

```bash
# View config file location
ls ~/.config/theneo/

# Reset config
rm ~/.config/theneo/config
theneo login
```

## Next Steps

- [CLI Commands Reference](../CLI/Commands.md)
- [SDK API Reference](../SDK/API-Reference.md)
