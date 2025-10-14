/* ユーザー情報をDBに登録するAPI */

import { Hono } from 'hono';
import { db } from '@/server/db/db';
import { users } from '@/server/db/schema';

export const registerUser = new Hono().post('/register', async (c) => {
    try {
        const { userId, email, name } = await c.req.json();

        if (!userId || !email || !name) {
            return c.json(
                { success: false, message: 'ユーザーIDとメールアドレスと名前は必須です。' },
                400
            );
        }

        await db
            .insert(users)
            .values({ id: userId, email, name })
            .onConflictDoUpdate({
                target: users.id,
                set: {
                    email: email,
                    name: name,
                },
            })
            .returning();

        return c.json({ success: true, message: '' }, 200);
    } catch (error) {
        console.error('ユーザー登録エラー:', error);
        return c.json({ success: false, message: `サーバーエラーが発生しました: ${error}` }, 500);
    }
});
