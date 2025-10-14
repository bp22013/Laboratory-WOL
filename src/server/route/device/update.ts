/* デバイス情報を更新するAPI */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../../db/db';
import { devices } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const updateDevice = new Hono().post(
    '/update',
    zValidator(
        'json',
        z.object({
            id: z.string().nonempty(),
            name: z.string().nonempty(),
            macAddress: z
                .string()
                .nonempty()
                .regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/),
        })
    ),
    async (c) => {
        const { id, name, macAddress } = c.req.valid('json');

        try {
            await db
                .update(devices)
                .set({ name, macAddress })
                .where(eq(devices.id, id))
                .returning();
            return c.json({ success: true, message: 'デバイス情報を更新しました!' }, 200);
        } catch (e) {
            return c.json({ success: false, message: 'サーバーエラーが発生しました' }, 500);
        }
    }
);
