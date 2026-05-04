import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { compress } from 'hono/compress';

import { healthRoutes } from './routes/health';
import { publicRoutes } from './routes/public';
import { authRoutes } from './routes/auth';
import { learningRoutes } from './routes/learning';
import { checkoutRoutes } from './routes/checkout';
import { adminRoutes } from './routes/admin';
import { webhookRoutes } from './routes/webhooks';
import { errorHandler } from './middleware/error';

const app = new Hono();

app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', compress());

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  '*',
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
  }),
);

app.route('/health', healthRoutes);
app.route('/public', publicRoutes);
app.route('/auth', authRoutes);
app.route('/learning', learningRoutes);
app.route('/checkout', checkoutRoutes);
app.route('/admin', adminRoutes);
app.route('/webhooks', webhookRoutes);

app.onError(errorHandler);

const port = Number(process.env.PORT ?? 8080);
serve({ fetch: app.fetch, port }, (info) => {
  console.info(`🚀 API listening on :${info.port}`);
});
