/* デバイス情報を保持するためのコンテキスト */

'use client';

import { createContext, useContext, ReactNode } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/nextjs';
import { client } from '@/lib/HonoClient';
import { type Device } from '@/types/DeviceType';
import { type DeviceFormValues } from '@/lib/validation';

// Contextに渡す値の型定義
interface DeviceContextType {
    devices: Device[] | undefined;
    isLoading: boolean;
    error: any;
    addDevice: (data: DeviceFormValues) => Promise<void>;
    updateDevice: (id: string, data: DeviceFormValues) => Promise<void>;
    deleteDevice: (id: string) => Promise<void>;
    sendWakeOnLan: (device: Device) => Promise<void>;
}

// Contextの作成
const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

// フェッチャー関数
const fetcher = async (url: string, userId: string | null | undefined) => {
    if (!userId) {
        throw new Error('User not authenticated');
    }
    const res = await client.api.device.select.$post({ json: { userId } });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch devices');
    }
    const data = await res.json();
    return data.devices || [];
};

// Providerコンポーネント
export const DeviceProvider = ({ children }: { children: ReactNode }) => {
    const { userId } = useAuth();
    // SWRを使ってデータフェッチ
    const {
        data: devices,
        error,
        isLoading,
        mutate,
    } = useSWR(
        userId ? ['/api/devices', userId] : null, // userIdが存在する場合のみフェッチ
        ([url, userId]) => fetcher(url, userId)
    );

    // デバイス追加
    const addDevice = async (data: DeviceFormValues) => {
        if (!userId) {
            toast.error('ユーザー情報が取得できませんでした');
            return;
        }

        toast.promise(
            new Promise<string>(async (resolve, reject) => {
                try {
                    const res = await client.api.device.add.$post({
                        json: {
                            name: data.name.trim(),
                            macAddress: data.macAddress.trim().toUpperCase(),
                            description: data.description?.trim() || '',
                            userId: userId,
                        },
                    });
                    const resData = await res.json();
                    if (res.ok && resData.success) {
                        resolve(`${data.name} を追加しました`);
                        mutate();
                    } else {
                        reject(resData.message || 'デバイスの追加に失敗しました');
                    }
                } catch (err: any) {
                    reject(err.message || 'デバイスの追加に失敗しました');
                }
            }),
            {
                loading: '追加中...',
                success: (message: string) => message,
                error: (message: string) => message,
            }
        );
    };

    // デバイス更新
    const updateDevice = async (id: string, data: DeviceFormValues) => {
        // 楽観的UI: 更新後のデータを即座にUIに反映
        mutate(
            (currentDevices) =>
                currentDevices?.map((d) =>
                    d.id === id
                        ? {
                              ...d,
                              name: data.name.trim(),
                              macAddress: data.macAddress.trim().toUpperCase(),
                              description: data.description?.trim() || '',
                          }
                        : d
                ),
            false // revalidateをfalseに設定
        );

        toast.promise(
            new Promise<string>(async (resolve, reject) => {
                try {
                    const res = await client.api.device.update.$post({
                        json: {
                            id: id,
                            name: data.name.trim(),
                            macAddress: data.macAddress.trim().toUpperCase(),
                        },
                    });

                    const resData = await res.json();

                    if (res.ok && resData.success) {
                        resolve(`${data.name} の情報を更新しました！`);
                    } else {
                        reject(resData.message);
                    }
                } catch (err: any) {
                    toast.error(err.message || 'デバイスの更新に失敗しました');
                    // エラー時は元のデータに戻す
                    mutate();
                }
            }),
            {
                loading: '更新中...',
                success: (message: string) => message,
                error: (message: string) => message,
            }
        );
    };

    // デバイス削除
    const deleteDevice = async (id: string) => {
        const originalDevices = devices;
        mutate((currentDevices) => currentDevices?.filter((d) => d.id !== id), false);

        toast.promise(
            new Promise<string>(async (resolve, reject) => {
                try {
                    const res = await client.api.device.delete.$post({
                        json: { id, userId: userId },
                    });

                    const resData = await res.json();

                    if (res.ok && resData.success) {
                        resolve('デバイスを削除しました');
                        mutate();
                    } else {
                        reject(resData.message);
                    }
                } catch {
                    reject('デバイスの削除に失敗しました');
                    mutate(originalDevices, false);
                }
            }),
            {
                loading: '削除中...',
                success: (message: string) => message,
                error: (message: string) => message,
            }
        );
    };

    // Wake on LAN信号送信
    const sendWakeOnLan = async (device: Device) => {
        try {
            const response = await client.api.wol.send.$post({
                json: { macAddress: device.macAddress },
            });
            const responseData = await response.json();
            if (response.ok && responseData.success) {
                toast.success(`${device.name} への起動信号を送信しました！`);
                // 状態をオンラインに更新
                mutate(
                    (currentDevices) =>
                        currentDevices?.map((d) =>
                            d.id === device.id ? { ...d, isOnline: true } : d
                        ),
                    false
                );
            } else {
                throw new Error(responseData.message || 'WOL送信に失敗しました');
            }
        } catch (err: any) {
            console.error('WOL送信エラー:', err);
            toast.error(err.message || 'WOLパケットの送信に失敗しました');
        }
    };

    return (
        <DeviceContext.Provider
            value={{
                devices,
                isLoading,
                error,
                addDevice,
                updateDevice,
                deleteDevice,
                sendWakeOnLan,
            }}
        >
            {children}
        </DeviceContext.Provider>
    );
};

export const useDevices = () => {
    const context = useContext(DeviceContext);
    if (context === undefined) {
        throw new Error('useDevices must be used within a DeviceProvider');
    }
    return context;
};
