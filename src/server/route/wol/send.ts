/* 起動シグナル送信用関数 */

import { Hono } from 'hono';

export const sender = new Hono().post('/send', async (c) => {
    const { macAddress } = await c.req.json();

    if (!macAddress) {
        return c.json({ success: false, message: 'MACアドレスは必須です' }, 400);
    }

    const username = process.env.ADAFRUIT_IO_USERNAME;
    const aioKey = process.env.ADAFRUIT_IO_KEY;
    const feedKey = process.env.ADAFRUIT_FEED_KEY;
    const url = `https://io.adafruit.com/api/v2/${username}/feeds/${feedKey}/data`;

    if (!username || !aioKey) {
        return c.json({ success: false, message: 'MQTTエラーが発生しました' }, 500);
    }

    const adafruitBody = {
        value: macAddress,
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-AIO-Key': aioKey,
            },
            body: JSON.stringify(adafruitBody),
        });

        const resData = await res.json();

        if (res.ok) {
            return c.json(
                { success: true, message: '起動シグナルを送信しました!', data: resData },
                200
            );
        } else {
            return c.json({ success: false, message: `起動に失敗しました: ${resData}` });
        }
    } catch (error) {
        return c.json({ success: false, message: 'サーバーエラーが発生しました' }, 500);
    }
});
