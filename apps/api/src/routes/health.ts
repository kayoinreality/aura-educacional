import { Hono } from 'hono';

export const healthRoutes = new Hono();

healthRoutes.get('/', (c) =>
  c.json({
    status: 'ok',
    service: 'aura-api',
    version: process.env.SERVICE_VERSION ?? 'dev',
    timestamp: new Date().toISOString(),
  }),
);
