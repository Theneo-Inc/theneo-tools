import express from 'express';
import { exportOpenapi, loadSpec } from './exporter';

export async function startMcpServer(
  projectSlug: string,
  dir: string,
  port: number
): Promise<void> {
  let specPath = await exportOpenapi(projectSlug, dir);
  let openapi = loadSpec(specPath);
  const context = { project: projectSlug };

  const app = express();

  app.get('/openapi', (_req, res) => {
    res.json(openapi);
  });

  app.get('/context', (_req, res) => {
    res.json(context);
  });

  app.post('/refresh', (_req, res) => {
    void (async () => {
      try {
        specPath = await exportOpenapi(projectSlug, dir);
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
