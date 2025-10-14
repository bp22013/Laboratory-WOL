/* wolルート統合用ファイル */

import { Hono } from 'hono';
import { sender } from './send';

const wolRoute = new Hono().route('/', sender);

export default wolRoute;
