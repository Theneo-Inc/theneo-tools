import path from 'path';
import fs from 'fs';
import { execa } from 'execa';

export async function exportOpenapi(
  projectSlug: string,
  dir: string,
  profile?: string
): Promise<string> {
  const args = [
    '@theneo/cli',
    'export',
    '--project',
    projectSlug,
    '--openapi',
    '--format',
    'json',
    '--dir',
    dir,
  ];

  if (profile) {
    args.push('--profile', profile);
  }

  await execa('npx', args, { stdio: 'inherit' });

  const specPath = path.join(dir, 'openapi_spec.json');
  if (!fs.existsSync(specPath)) {
    throw new Error('OpenAPI spec not found');
  }
  return specPath;
}

export function loadSpec(specPath: string): any {
  const data = fs.readFileSync(specPath, 'utf-8');
  return JSON.parse(data);
}
