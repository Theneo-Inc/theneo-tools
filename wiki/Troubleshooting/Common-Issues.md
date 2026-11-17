# Common Issues

Solutions for frequently encountered problems with Theneo Tools.

## Installation Issues

### "Command not found: theneo"

**Cause**: CLI not installed globally or not in PATH.

**Solutions**:

1. Install globally:
   ```bash
   npm install -g @theneo/cli@latest
   ```

2. Check npm global path:
   ```bash
   npm config get prefix
   # Add to PATH if needed: export PATH=$(npm config get prefix)/bin:$PATH
   ```

3. Use npx:
   ```bash
   npx @theneo/cli help
   ```

### Permission Denied During Install

**Cause**: npm global directory requires elevated permissions.

**Solutions**:

1. Use nvm (recommended):
   ```bash
   nvm install 18
   nvm use 18
   npm install -g @theneo/cli
   ```

2. Change npm prefix:
   ```bash
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
   source ~/.bashrc
   ```

### Node Version Errors

**Cause**: Node.js version too old.

**Solution**:
```bash
node --version  # Check version
# If below 18:
nvm install 18
nvm use 18
```

## Authentication Issues

### "No API key provided"

**Cause**: API key not configured.

**Solutions**:

1. Login:
   ```bash
   theneo login
   ```

2. Use environment variable:
   ```bash
   export THENEO_API_KEY=your_api_key
   ```

3. Check config file:
   ```bash
   cat ~/.config/theneo/config
   ```

### "Invalid API key" or "Unauthorized"

**Cause**: API key is incorrect or expired.

**Solutions**:

1. Verify key in Theneo dashboard
2. Re-login:
   ```bash
   theneo login --token YOUR_NEW_API_KEY
   ```

### "Profile does not exist"

**Cause**: Referenced profile not in config.

**Solutions**:

1. List profiles:
   ```bash
   cat ~/.config/theneo/config
   ```

2. Create profile:
   ```bash
   theneo login --profile myprofile --token YOUR_KEY
   ```

## Project Commands

### "Project not found"

**Cause**: Project slug doesn't exist or wrong workspace.

**Solutions**:

1. List projects to find correct slug:
   ```bash
   theneo project list
   ```

2. Specify workspace:
   ```bash
   theneo project list --workspace correct-workspace
   ```

### "Workspace not found"

**Cause**: Incorrect workspace slug.

**Solution**:
```bash
theneo workspace list
# Use the correct slug from the output
```

### Import Fails with "Invalid file"

**Cause**: OpenAPI spec has syntax errors.

**Solutions**:

1. Validate your spec:
   ```bash
   # Install validator
   npm install -g @apidevtools/swagger-cli
   
   # Validate
   swagger-cli validate your-spec.yaml
   ```

2. Check file format:
   - YAML must be valid YAML
   - JSON must be valid JSON

### "AI Description Generation Timeout"

**Cause**: Large spec takes too long.

**Solutions**:

1. Wait longer or retry
2. Use `--generate-description no_generation` to skip
3. Break into smaller imports

## Export/Import Issues

### Export Directory Already Exists

**Cause**: Output directory has existing files.

**Solution**:
```bash
# Use force flag
theneo export --project myproject --dir ./docs --force
```

### Import Tab Markers Not Working

**Cause**: Tab slug doesn't match or marker format is wrong.

**Solutions**:

1. Check tab slug exists in project
2. Ensure marker format: `<!-- tab:tab-slug -->`
3. Place marker at file start

### Markdown Files Not Recognized

**Cause**: Directory structure doesn't match expected format.

**Solution**: Use the exact structure from export:
```
docs/
├── theneo.json
├── section-name/
│   ├── index.md
│   ├── section.json
│   └── subsection/
│       ├── index.md
│       └── section.json
```

## SDK Issues

### "Cannot find module '@theneo/sdk'"

**Cause**: SDK not installed.

**Solution**:
```bash
npm install @theneo/sdk
```

### TypeScript Type Errors

**Cause**: TypeScript version mismatch or missing types.

**Solutions**:

1. Update SDK:
   ```bash
   npm update @theneo/sdk
   ```

2. Check TypeScript version (should be 5.x):
   ```bash
   npx tsc --version
   ```

### Result Type Confusion

**Cause**: Not checking `ok` before accessing `value`.

**Solution**:
```typescript
// Always check result
const result = await theneo.listProjects();
if (result.err) {
  console.error(result.error.message);
  return;
}
const projects = result.value;  // Safe now
```

## Network Issues

### "ECONNREFUSED" or "Network Error"

**Cause**: Cannot reach Theneo API.

**Solutions**:

1. Check internet connection
2. Verify API URL:
   ```bash
   echo $THENEO_API_URL
   # Should be empty or https://api.theneo.io
   ```

3. Check if behind proxy:
   ```bash
   npm config set proxy http://your-proxy:port
   npm config set https-proxy http://your-proxy:port
   ```

### "Request Timeout"

**Cause**: Slow connection or large file.

**Solutions**:

1. Check connection speed
2. For large files, consider:
   - Breaking into smaller imports
   - Increasing timeout (if configurable)

### SSL Certificate Errors

**Cause**: Certificate validation issues.

**Solutions**:

1. Update Node.js:
   ```bash
   nvm install 18 --reinstall-packages-from=current
   ```

2. If corporate proxy, add CA certificate:
   ```bash
   export NODE_EXTRA_CA_CERTS=/path/to/certificate.pem
   ```

## Configuration Issues

### Config File Corrupted

**Cause**: Invalid YAML/JSON in config.

**Solution**:
```bash
# Remove and recreate
rm ~/.config/theneo/config
theneo login
```

### Environment Variables Not Working

**Cause**: Variables not exported or wrong shell.

**Solutions**:

1. Check variable is set:
   ```bash
   echo $THENEO_API_KEY
   ```

2. Export in current session:
   ```bash
   export THENEO_API_KEY=your_key
   ```

3. Add to shell profile:
   ```bash
   echo 'export THENEO_API_KEY=your_key' >> ~/.bashrc
   source ~/.bashrc
   ```

## Build Issues (Development)

### "Cannot find module" After Changes

**Cause**: Build not run after changes.

**Solution**:
```bash
npm run build
# or for clean build:
npm run clean && npm run build
```

### Type Errors in CLI After SDK Changes

**Cause**: SDK not rebuilt.

**Solution**:
```bash
# Rebuild all from root
cd /path/to/theneo-tools
npm run build
```

### Lint Errors on Commit

**Cause**: Pre-commit hook catching issues.

**Solution**:
```bash
npm run lint
# Review and fix any errors
```

## Getting More Help

### Debug Mode

Run commands with more output:

```bash
# Some commands support --debug
theneo project create --debug

# Or use Node.js debug
DEBUG=* theneo project list
```

### Check Version

```bash
theneo --version
```

### Report Issues

If none of these help:

1. Check [existing issues](https://github.com/Theneo-Inc/theneo-tools/issues)
2. [Open a new issue](https://github.com/Theneo-Inc/theneo-tools/issues/new) with:
   - Theneo CLI version
   - Node.js version
   - Operating system
   - Full error message
   - Steps to reproduce
