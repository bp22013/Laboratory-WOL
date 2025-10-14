/* デバイス情報を取得するAPI */

import { Hono } from 'hono';
import { db } from '@/server/db/db';
import { devices } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export const selectUserDevice = new Hono().post('/select', async (c) => {
    try {
        const { userId } = await c.req.json();

        if (!userId) {
            return c.json({ success: false, message: 'ユーザーIDは必須です' }, 400);
        }

        const userDevices = await db.select().from(devices).where(eq(devices.userId, userId));

        return c.json(
            {
                success: true,
                message: 'デバイス情報を取得しました',
                devices: userDevices,
                count: userDevices.length,
            },
            200
        );
    } catch (error) {
        console.error('デバイス取得エラー:', error);
        return c.json({ success: false, message: 'サーバーエラーが発生しました' }, 500);
    }
});
