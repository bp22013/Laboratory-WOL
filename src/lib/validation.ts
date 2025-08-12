/* バリデーションスキーマ */

'use client';

import * as z from 'zod';

// バリデーションスキーマの定義
export const loginFormSchema = z.object({
    email: z.string().email({ message: '有効なメールアドレスを入力してください。' }),
    password: z.string().min(6, { message: 'パスワードは6文字以上で入力してください。' }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
