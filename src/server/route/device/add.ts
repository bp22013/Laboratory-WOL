/* デバイスを追加する関数 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../../db/db';
import { devices } from '../../db/schema';

export const addDevice = new Hono().post(
    '/add',
    zValidator(
        'json',
        z.object({
            name: z.string().nonempty('デバイス名は必須です'),
            macAddress: z
                .string()
                .nonempty('MACアドレスは必須です')
                .regex(
                    /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
                    'MACアドレスの形式が正しくありません'
                ),
            description: z.string().optional(),
            userId: z.string().nonempty(),
        })
    ),
    async (c) => {
        const { name, macAddress, description, userId } = c.req.valid('json');

        try {
            const device = await db
                .insert(devices)
                .values({ name, macAddress, description, userId })
                .returning();
            return c.json(
                { success: true, message: 'デバイスを追加しました!', device: device },
                200
            );
        } catch (e: any) {
            if (e.code === '23505') {
                return c.json(
                    { success: false, message: '同じMACアドレスが既に登録されています' },
                    409
                );
            }
            console.error('デバイス追加エラー:', e);
            return c.json({ success: false, message: 'サーバーエラーが発生しました' }, 500);
        }
    }
);
