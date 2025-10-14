/* デバイスを削除するAPI */

import { Hono } from 'hono';
import { db } from '../../db/db';
import { devices } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export const deleteDevice = new Hono().post('/delete', async (c) => {
    const { id, userId } = await c.req.json();

    if (!id || !userId) {
        return c.json({ success: false, message: 'idとユーザーIDは必須です' }, 401);
    }
    try {
        const deletedDevice = await db
            .delete(devices)
            .where(and(eq(devices.id, id), eq(devices.userId, userId)))
            .returning();

        if (deletedDevice.length === 0) {
            return c.json(
                { success: false, message: '指定されたデバイスが見つからないか、権限がありません' },
                404
            );
        }

        return c.json({ success: true, message: '対象のデバイスを削除しました!' }, 200);
    } catch (error) {
        return c.json({ success: false, message: `サーバーエラーが発生しました: ${error}` }, 500);
    }
});
