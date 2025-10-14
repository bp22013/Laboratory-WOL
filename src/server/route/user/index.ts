/* userルート統合ファイル */

import { Hono } from 'hono';
import { registerUser } from './register';

const userRoute = new Hono().route('/', registerUser);

export default userRoute;
