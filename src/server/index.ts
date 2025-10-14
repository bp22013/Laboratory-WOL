/* メインAPI */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { logger } from 'hono/logger';
import wolRoute from './route/wol';

const app = new Hono();

app.use('*', logger());
app.use('*', cors());
app.use('*', csrf());

export const route = app.route('/api/wol', wolRoute);

export type AppType = typeof route;
export default app;
