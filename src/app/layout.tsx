import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextFont } from 'next/dist/compiled/@next/font';
import React, { ReactNode, Suspense } from 'react';
import { ToasterContext } from './context/ToastContext';
import { ClerkProvider } from '@clerk/nextjs';
import { jaJP } from '@clerk/localizations';
import './styles/globals.css';

const inter: NextFont = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'VitLab-WOL',
    description: '画像応用システム研究室のWOL',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <ClerkProvider localization={jaJP}>
            <html lang="en">
                <Suspense>
                    <body className={inter.className}>
                        <div>{children}</div>
                        <ToasterContext />
                    </body>
                </Suspense>
            </html>
        </ClerkProvider>
    );
}
