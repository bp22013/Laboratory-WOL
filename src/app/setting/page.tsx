/* ユーザーの設定ページ */

'use client';

import { NextPage } from 'next';
import { UserProfile } from '@clerk/nextjs';
import { Navbar } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

const SettingPage: NextPage = () => {
    const router = useRouter();
    const [isScrollable, setIsScrollable] = useState(false);

    useEffect(() => {
        const checkScrollable = () => {
            const hasScroll = document.body.scrollHeight > window.innerHeight;
            setIsScrollable(hasScroll);
        };

        // 初期チェック
        checkScrollable();

        // リサイズ時に再チェック
        window.addEventListener('resize', checkScrollable);

        return () => {
            window.removeEventListener('resize', checkScrollable);
        };
    }, []);

    return (
        <div
            className={clsx(
                'flex flex-col min-h-screen',
                isScrollable ? 'overflow-y-scroll' : 'overflow-y-hidden'
            )}
        >
            <Navbar />
            <main className="flex flex-1 flex-col items-center p-4 sm:p-6">
                <div className="w-full max-w-4xl mb-6">
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
};

export default SettingPage;
