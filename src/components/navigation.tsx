/* ナビゲーションバーのコンポーネント */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Switch } from '../components/ui/switch';
import { useTheme } from 'next-themes';
import { useUser, useAuth } from '@clerk/nextjs';
import { LogOut, Monitor, Settings, Loader2, Sun, Moon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import toast from 'react-hot-toast';
import { UserResource } from '@clerk/types';

export const Navbar = () => {
    const router = useRouter();
    const { signOut, isLoaded } = useAuth();
    const { theme, setTheme } = useTheme();
    const { user, isLoaded: userLoaded } = useUser();
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getUserInitials = (user: UserResource): string => {
        if (user?.firstName && user?.lastName) {
            return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
        }
        if (user?.firstName) {
            return user.firstName[0].toUpperCase();
        }
        if (user?.fullName) {
            const names = user.fullName.split(' ');
            if (names.length >= 2) {
                return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
            }
            return names[0][0].toUpperCase();
        }
        if (user?.emailAddresses?.[0]?.emailAddress) {
            return user.emailAddresses[0].emailAddress[0].toUpperCase();
        }
        return 'U';
    };

    const getUserDisplayName = (user: UserResource): string => {
        if (user?.fullName) {
            return user.fullName;
        }
        if (user?.firstName && user?.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        if (user?.firstName) {
            return user.firstName;
        }
        if (user?.emailAddresses?.[0]?.emailAddress) {
            return user.emailAddresses[0].emailAddress;
        }
        return 'ユーザー';
    };

    // ログアウトの処理
    const handleLogout = async () => {
        if (isSigningOut || !isLoaded) return;

        setIsSigningOut(true);

        await toast.promise(
            new Promise<string>(async (resolve, reject) => {
                try {
                    await signOut(() => {
                        // サインアウト完了後のコールバック
                        router.push('/login');
                    });
                    resolve('ログアウトしました');
                } catch (error) {
                    console.error('Sign out error:', error);
                    reject('ログアウトに失敗しました');
                } finally {
                    setIsSigningOut(false);
                }
            }),
            {
                loading: 'ログアウト中...',
                success: (message: string) => message,
                error: (message: string) => message,
            }
        );
    };

    // Clerkのロード中またはユーザー情報が未ロードの場合
    if (!isLoaded || !userLoaded) {
        return (
            <header className="bg-white dark:bg-gray-900 shadow sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                    <div className="flex justify-between items-center py-2 sm:py-3 lg:py-4">
                        <div className="flex items-center min-w-0 flex-1">
                            <Monitor className="h-5 w-5 sm:h-7 sm:w-7 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                            <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                                Wake On Lan
                            </h1>
                        </div>
                        <div className="flex items-center">
                            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full h-7 w-7 sm:h-9 sm:w-9"></div>
                            <div className="ml-3 h-6 w-10 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </header>
        );
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    // テーマがダークモードかどうかを判定
    const isDarkMode = theme === 'dark';

    // スイッチの状態が変更されたときにテーマを切り替える関数
    const handleThemeChange = (checked: boolean) => {
        setTheme(checked ? 'dark' : 'light');
    };

    return (
        <header className="bg-white dark:bg-gray-900 shadow sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                <div className="flex justify-between items-center py-2 sm:py-3 lg:py-4">
                    <div
                        className="flex items-center min-w-0 flex-1 cursor-pointer"
                        onClick={() => router.push('/dashboard')}
                    >
                        <Monitor className="h-5 w-5 sm:h-7 sm:w-7 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                        <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                            Wake On Lan
                        </h1>
                    </div>

                    <div className="flex items-center">
                        {mounted ? (
                            <div className="flex items-center space-x-2 mr-7">
                                <Sun className="h-5 w-5" />
                                <Switch checked={isDarkMode} onCheckedChange={handleThemeChange} />
                                <Moon className="h-5 w-5" />
                            </div>
                        ) : (
                            <div className="h-6 w-[92px] bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-auto p-0 hover:bg-transparent"
                                    disabled={isSigningOut || !isLoaded}
                                >
                                    <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
                                        <Avatar className="h-7 w-7 sm:h-9 sm:w-9">
                                            <AvatarImage
                                                src={user?.imageUrl || ''}
                                                alt={getUserDisplayName(user)}
                                            />
                                            <AvatarFallback className="bg-blue-600 text-white text-xs sm:text-sm">
                                                {getUserInitials(user)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="hidden sm:block">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] lg:max-w-[200px] truncate">
                                                {getUserDisplayName(user)}
                                            </span>
                                        </div>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-72 sm:w-80 lg:w-96 max-w-[90vw]"
                                align="end"
                                forceMount
                                sideOffset={8}
                            >
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex gap-3 items-center">
                                        <Avatar className="h-9 w-9 flex-shrink-0">
                                            <AvatarImage
                                                src={user?.imageUrl || ''}
                                                alt={getUserDisplayName(user)}
                                            />
                                            <AvatarFallback className="bg-blue-600 text-white">
                                                {getUserInitials(user)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col space-y-1 min-w-0 flex-1">
                                            <p className="text-sm font-medium leading-none truncate">
                                                {getUserDisplayName(user)}
                                            </p>
                                            <p className="text-xs leading-none text-muted-foreground truncate">
                                                {user?.emailAddresses?.[0]?.emailAddress}
                                            </p>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-blue-500 hover:!bg-blue-100 focus:!text-blue-600 focus:!bg-blue-100 dark:text-blue-400 dark:hover:!bg-gray-700 dark:focus:!bg-gray-700 py-2"
                                    onClick={() => router.push('/setting')}
                                    disabled={isSigningOut || !isLoaded}
                                >
                                    <Settings className="mr-3 h-4 w-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                                    <span className="text-sm">設定</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className={`text-red-600 hover:!bg-red-100 focus:!text-red-600 cursor-pointer focus:!bg-red-100 dark:text-red-400 dark:hover:!bg-red-900/50 dark:focus:!bg-red-900/50 py-2 ${
                                        isSigningOut || !isLoaded
                                            ? 'opacity-50 cursor-not-allowed'
                                            : ''
                                    }`}
                                    onClick={handleLogout}
                                    disabled={isSigningOut || !isLoaded}
                                >
                                    {isSigningOut ? (
                                        <Loader2 className="mr-3 h-4 w-4 animate-spin flex-shrink-0" />
                                    ) : (
                                        <LogOut className="mr-3 h-4 w-4 focus:!text-red-600 flex-shrink-0" />
                                    )}
                                    <span className="text-sm">
                                        {isSigningOut ? 'ログアウト中...' : 'ログアウト'}
                                    </span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    );
};
