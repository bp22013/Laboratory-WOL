/* wolルート統合用ファイル */

import { Hono } from 'hono';
import { sender } from './send';
import deviceRoute from '../device';

const wolRoute = new Hono().route('/', sender).route('/device', deviceRoute);

export default wolRoute;
