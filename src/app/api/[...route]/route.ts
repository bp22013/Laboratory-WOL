/* メインサーバー */

import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { db } from '@/db/db';
import { eq } from 'drizzle-orm';
import { wolQueue, devices } from '@/db/schema';

type Bindings = {
    DATABASE_URL: string; // NeonDBの接続文字列
    WOL_AGENT_ENDPOINT?: string; // ESP32-C3など、WOLパケットを送信するエージェントのURL
    AUTH_SECRET?: string; // エージェントへの認証用シークレット
};

// Hono.jsアプリケーションインスタンスの作成とベースパスの設定
// Next.js API Routeとして使用するため、通常 '/api' がベースパスになることが多いです。
const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

// CORS設定
app.use(cors());

app.use(csrf());

// --- ヘルスチェックエンドポイント ---
app.get('/api/health', (c) => {
    return c.json({ status: 'ok', message: 'Hono.js APIはNeonDBと接続してVercelで動いています' });
});

// --- デバイス関連エンドポイント ---

// 全デバイスの取得
app.get('/api/devices', async (c) => {
    try {
        const allDevices = await db.select().from(devices).execute();
        return c.json(allDevices);
    } catch (error) {
        console.error('Failed to fetch devices:', error);
        return c.json({ error: 'デバイスの取得に失敗しました。' }, 500);
    }
});

// 新しいデバイスの登録
app.post('/api/devices', async (c) => {
    const { name, macAddress } = await c.req.json();

    if (!name || !macAddress) {
        return c.json({ error: 'デバイス名とMACアドレスは必須です。' }, 400);
    }

    // MACアドレスの形式を簡易的にチェック
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(macAddress)) {
        return c.json({ error: '無効なMACアドレス形式です。' }, 400);
    }

    try {
        const newDevice = await db
            .insert(devices)
            .values({
                name: name,
                macAddress: macAddress.toUpperCase(), // 大文字に変換して保存
                createdAt: Math.floor(Date.now() / 1000), // UNIXタイムスタンプ
            })
            .returning() // PostgreSQLではreturning()で挿入された行を返す
            .execute();

        return c.json(
            {
                message: 'デバイスが正常に登録されました。',
                device: newDevice[0],
            },
            201
        ); // Created
    } catch (error: any) {
        console.error('Failed to register device:', error);
        // PostgreSQLのUNIQUE制約違反エラーコードは '23505'
        if (error.code === '23505') {
            return c.json({ error: 'このMACアドレスは既に登録されています。' }, 409); // Conflict
        }
        return c.json({ error: 'デバイスの登録に失敗しました。' }, 500);
    }
});

app.post('/api/wol/request', async (c) => {
    const { macAddress } = await c.req.json();

    if (!macAddress) {
        return c.json({ error: 'MACアドレスが必要です。' }, 400);
    }

    try {
        // MACアドレスが登録済みデバイスに存在するか確認
        const deviceExists = await db
            .select()
            .from(devices)
            .where(eq(devices.macAddress, macAddress.toUpperCase()))
            .limit(1)
            .execute();

        if (deviceExists.length === 0) {
            return c.json({ error: '登録されていないMACアドレスです。', macAddress }, 404);
        }

        // WOLキューにタスクを追加
        const newQueueItem = await db
            .insert(wolQueue)
            .values({
                macAddress: macAddress.toUpperCase(),
                createdAt: Math.floor(Date.now() / 1000),
            })
            .returning({ id: wolQueue.id, macAddress: wolQueue.macAddress })
            .execute(); // 追加されたレコードのIDとMACアドレスを返す

        return c.json(
            {
                message: 'WOLリクエストがキューに追加されました。',
                queueId: newQueueItem[0].id,
                macAddress: newQueueItem[0].macAddress,
            },
            202
        ); // Accepted
    } catch (error) {
        console.error('Failed to add WOL request to queue:', error);
        return c.json({ error: 'リクエストの処理中にエラーが発生しました。' }, 500);
    }
});

/**
 * キューからWOLリクエストを処理するワーカーエンドポイント
 * Cron Triggerなど、外部から定期的に呼び出されることを想定。
 * ESP32-C3への通知（WOLパケット送信トリガー）をここで行う。
 */
app.get('/api/wol/process-queue', async (c) => {
    // Vercel (Node.js/Edge Functions) では `process.env` を使用
    const WOL_AGENT_ENDPOINT = process.env.WOL_AGENT_ENDPOINT;
    const AUTH_SECRET = process.env.AUTH_SECRET;
    const limit = 10; // 一度に処理するキューの数

    if (!WOL_AGENT_ENDPOINT) {
        console.warn('WOL_AGENT_ENDPOINT is not configured. WOL packets will not be sent.');
    }

    try {
        // 最も古いキューアイテムを取得（FIFO）
        const queueItems = await db
            .select()
            .from(wolQueue)
            .orderBy(asc(wolQueue.createdAt))
            .limit(limit)
            .execute();

        if (queueItems.length === 0) {
            return c.json({ message: '処理待ちのWOLリクエストはありません。' });
        }

        const processedMacAddresses: string[] = [];
        const processedIds: number[] = [];
        const failedMacAddresses: { mac: string; error: string }[] = [];

        for (const item of queueItems) {
            if (WOL_AGENT_ENDPOINT) {
                try {
                    // **WOL Agent (ESP32-C3) への通知**
                    // ここでESP32-C3にHTTPリクエストを送信し、WOLパケット送信をトリガーします。
                    const response = await fetch(WOL_AGENT_ENDPOINT, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${AUTH_SECRET || 'no-secret-configured'}`,
                        },
                        body: JSON.stringify({ macAddress: item.macAddress }),
                    });

                    if (response.ok) {
                        console.log(
                            `Successfully triggered WOL for: ${item.macAddress} via agent.`
                        );
                        processedMacAddresses.push(item.macAddress);
                        processedIds.push(item.id);
                    } else {
                        const errorText = await response.text();
                        console.error(
                            `Agent failed to trigger WOL for ${item.macAddress}: ${response.status} ${errorText}`
                        );
                        failedMacAddresses.push({
                            mac: item.macAddress,
                            error: `Agent error: ${response.status} ${errorText}`,
                        });
                    }
                } catch (fetchError: any) {
                    console.error(
                        `Error communicating with WOL Agent for ${item.macAddress}:`,
                        fetchError
                    );
                    failedMacAddresses.push({
                        mac: item.macAddress,
                        error: `Network/Agent communication error: ${fetchError.message}`,
                    });
                }
            } else {
                console.warn(
                    `WOL_AGENT_ENDPOINT is not set. Skipping WOL send for ${item.macAddress}.`
                );
                processedMacAddresses.push(item.macAddress);
                processedIds.push(item.id);
            }
        }

        // 処理が成功したアイテムをキューから削除
        if (processedIds.length > 0) {
            await db
                .delete(wolQueue)
                .where(sql`${wolQueue.id} IN (${processedIds})`)
                .execute();
            console.log(`Removed ${processedIds.length} items from WOL queue.`);
        }

        return c.json({
            message: `${processedMacAddresses.length}件のWOLリクエストを処理しました。`,
            processed: processedMacAddresses,
            failed: failedMacAddresses,
            removedIds: processedIds,
        });
    } catch (error) {
        console.error('Failed to process WOL queue:', error);
        return c.json({ error: 'キューの処理中にエラーが発生しました。' }, 500);
    }
});

/**
 * 特定のWOLリクエストのステータスを確認
 * フロントエンドがポーリングで利用する。
 */
app.get('/api/wol/status/:queueId', async (c) => {
    const queueId = c.req.param('queueId');

    if (!queueId || isNaN(Number(queueId))) {
        return c.json({ error: '無効なキューIDです。' }, 400);
    }

    try {
        const queueItem = await db
            .select()
            .from(wolQueue)
            .where(eq(wolQueue.id, Number(queueId)))
            .limit(1)
            .execute();

        if (queueItem.length === 0) {
            // キューから削除されていれば、処理済みとみなす
            return c.json({ status: 'completed', message: 'WOLリクエストは処理済みです。' });
        } else {
            // まだキューに残っていれば、処理待ち
            return c.json({ status: 'pending', message: 'WOLリクエストは処理待ちです。' });
        }
    } catch (error) {
        console.error('Failed to check WOL request status:', error);
        return c.json({ error: 'ステータス確認中にエラーが発生しました。' }, 500);
    }
});

// Next.jsのAPI RouteハンドラーとしてHonoアプリをエクスポート
// Vercelにデプロイする際、これらのエクスポートされた関数がサーバーレス関数として機能します。
export const GET = handle(app);
export const POST = handle(app);
export const OPTIONS = handle(app);
