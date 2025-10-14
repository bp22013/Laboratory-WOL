/* deviceルート統合用ファイル */

import { Hono } from 'hono';
import { addDevice } from './add';
import { updateDevice } from './update';
import { deleteDevice } from './delete';
import { selectUserDevice } from './select';

const deviceRoute = new Hono()
    .route('/', addDevice)
    .route('/', updateDevice)
    .route('/', deleteDevice)
    .route('/', selectUserDevice);

export default deviceRoute;
