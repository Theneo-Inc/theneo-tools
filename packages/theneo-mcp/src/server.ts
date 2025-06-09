import express from 'express';
import { exportOpenapi, loadSpec } from './exporter';

export async function startMcpServer(
  projectSlug: string,
  dir: string,
  port: number,
  mode = 'local',
  profile?: string
): Promise<void> {
  if (mode !== 'local') {
    console.warn(
      `Mode ${mode} not fully supported. Falling back to local mode.`
    );
  }
  let specPath = await exportOpenapi(projectSlug, dir, profile);
  let openapi = loadSpec(specPath);
  const context = { project: projectSlug };
  const manifest = {
    schema_version: 'v1',
    name_for_human: `${projectSlug} MCP`,
    name_for_model: `${projectSlug} MCP`,
    description_for_human: `MCP server for project ${projectSlug}`,
    description_for_model: `MCP server for project ${projectSlug}`,
    api: {
      openapi: '/openapi',
    },
    auth: {
      type: 'none',
    },
  };

  const app = express();

  app.get('/openapi', (_req, res) => {
    res.json(openapi);
  });

  app.get('/.well-known/mcp/tool-manifest.json', (_req, res) => {
    res.json(manifest);
  });

  app.get('/context', (_req, res) => {
    res.json(context);
  });

  app.post('/refresh', (_req, res) => {
    void (async () => {
      try {
        specPath = await exportOpenapi(projectSlug, dir, profile);
        openapi = loadSpec(specPath);
        res.json({ status: 'refreshed' });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    })();
  });

  app.listen(port, () => {
    console.log(`MCP server running on port ${port}`);
  });
}
