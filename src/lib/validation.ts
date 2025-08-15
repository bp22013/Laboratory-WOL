/* バリデーションスキーマ */

'use client';

import * as z from 'zod';

// ログインフォームのバリデーションスキーマ定義
export const loginFormSchema = z.object({
    email: z
        .string()
        .nonempty('パスワードを入力してください')
        .email({ message: '有効なメールアドレスを入力してください' }),
    password: z.string().min(6, { message: 'パスワードは6文字以上で入力してください' }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

// デバイス登録フォームのバリデーションスキーマ定義
export const deviceSchema = z.object({
    name: z.string().min(1, 'デバイス名は必須です'),
    macAddress: z
        .string()
        .nonempty('MACアドレスは必須です')
        .regex(
            /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
            'MACアドレスの形式が正しくありません (例: 00:11:22:33:44:55)'
        ),
    ipAddress: z
        .string()
        .nonempty('IPアドレスは必須です')
        .regex(
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
            'IPアドレスの形式が正しくありません'
        ),
    description: z.string().optional(),
});

export type DeviceFormValues = z.infer<typeof deviceSchema>;
