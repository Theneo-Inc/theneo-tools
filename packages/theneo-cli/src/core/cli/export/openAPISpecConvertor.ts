import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export function saveOpenapiSpec(
  openapiSpec: any,
  outputDir: string,
  format: 'yaml' | 'json'
): string {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  if (format === 'json') {
    const outputFile = path.join(outputDir, 'openapi_spec.json');
    const jsonData = JSON.stringify(openapiSpec, null, 2);
    fs.writeFileSync(outputFile, jsonData);
    return outputFile;
  }
  const outputFile = path.join(outputDir, 'openapi_spec.yaml');
  const yamlData = yaml.dump(openapiSpec, { sortKeys: false });
  fs.writeFileSync(outputFile, yamlData);
  return outputFile;
}
