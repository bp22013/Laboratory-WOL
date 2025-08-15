/* ユーザーの設定ページ */

'use client';

import { UserProfile } from '@clerk/nextjs';
import { Navbar } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Setting() {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex flex-1 flex-col items-center p-4">
                <div className="w-full max-w-4xl mb-4">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 cursor-pointer"
                        onClick={() => router.push('/dashboard')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        ダッシュボードに戻る
                    </Button>
                </div>

                <UserProfile routing="hash" />
            </main>
        </div>
    );
}
