/* ナビゲーションバーのコンポーネント */

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@clerk/nextjs';
import { Home, LogOut, Monitor, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar = () => {
    const router = useRouter();
    const { signOut } = useAuth();
    const { user } = useUser();

    const getUserInitials = (user: any): string => {
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

    const getUserDisplayName = (user: any): string => {
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

    const handleLogout = () => {
        signOut(() => router.push('/login'));
    };

    if (!user) {
        router.push('/login');
    }

    return (
        <header className="bg-white shadow sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                <div className="flex justify-between items-center py-2 sm:py-3 lg:py-4">
                    <div
                        className="flex items-center min-w-0 flex-1 cursor-pointer"
                        onClick={() => router.push('/dashboard')}
                    >
                        <Monitor className="h-5 w-5 sm:h-7 sm:w-7 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                        <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                            Wake On Lan
                        </h1>
                    </div>

                    <div className="flex items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
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
                                            <span className="text-sm font-medium text-gray-700 max-w-[120px] lg:max-w-[200px] truncate">
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
                                    className="cursor-pointer text-blue-500 hover:!bg-blue-100 focus:!text-blue-600 focus:!bg-blue-100 py-2"
                                    onClick={() => router.push('/setting')}
                                >
                                    <Settings className="mr-3 h-4 w-4 text-blue-500 flex-shrink-0" />
                                    <span className="text-sm">設定</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600 hover:!bg-red-100 focus:!text-red-600 cursor-pointer focus:!bg-red-100 py-2"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-3 h-4 w-4 focus:!text-red-600 flex-shrink-0" />
                                    <span className="text-sm">ログアウト</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    );
};
