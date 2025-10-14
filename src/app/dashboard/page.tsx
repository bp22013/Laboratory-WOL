/* ダッシュボードページ */

'use client';

import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Power, Edit, Trash2 } from 'lucide-react';
import { DeviceForm } from '@/components/device-form';
import { Navbar } from '@/components/navigation';
import { client } from '@/lib/HonoClient';
import toast from 'react-hot-toast';
import { type DeviceFormValues } from '@/lib/validation';
import { Loading, ButtonLoading } from '@/components/ui/loading';
import { type Device } from '@/types/DeviceType';
import { useDevices } from '../context/DevicesContext';
import { DeleteConfirmModal } from '@/components/deleteConfirmModal';

const Dashboard: NextPage = () => {
    const {
        devices,
        isLoading: areDevicesLoading,
        addDevice,
        updateDevice,
        deleteDevice,
        sendWakeOnLan,
    } = useDevices();

    const [showDeviceForm, setShowDeviceForm] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);
    const [deletingDevice, setDeletingDevice] = useState<Device | null>(null);
    const [isWOLSending, setIsWOLSending] = useState<string | null>(null);
    const { isLoaded, userId, isSignedIn } = useAuth();
    const { user, isLoaded: isUserLoaded } = useUser();

    useEffect(() => {
        (async () => {
            if (!isLoaded || !isUserLoaded || !isSignedIn) {
                return;
            }

            if (!userId) {
                toast.error('ユーザーIDの取得に失敗しました。');
                return;
            }

            try {
                const res = await client.api.user.register.$post({
                    json: {
                        userId: userId,
                        email: user?.primaryEmailAddress?.emailAddress,
                        name: user?.fullName,
                    },
                });

                const resData = await res.json();

                if (!res.ok || !resData.success) {
                    toast.error('認証エラーが発生しました');
                }
            } catch (error) {
                toast.error('ユーザー登録中にエラーが発生しました。');
            }
        })();
    }, [isLoaded, isUserLoaded, isSignedIn, userId, user]);

    // 起動シグナル送信用関数
    const handleWakeOnLan = async (device: Device) => {
        setIsWOLSending(device.id);
        await sendWakeOnLan(device);
        setIsWOLSending(null);
    };

    // デバイス追加/更新関数
    const handleSaveDevice = async (data: DeviceFormValues) => {
        if (editingDevice) {
            await updateDevice(editingDevice.id, data);
        } else {
            await addDevice(data);
        }
        setShowDeviceForm(false);
        setEditingDevice(null);
    };

    // 認証情報読み込み中の表示
    if (!user || !(isLoaded && isUserLoaded)) {
        return <Loading size="lg" text="認証情報を確認中..." overlay />;
    }

    return (
        <div className="min-h-screen overflow-y-scroll">
            <Navbar />
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                    <h2 className="text-2xl sm:text-3xl font-bold">登録デバイス</h2>
                    <Button
                        onClick={() => {
                            setEditingDevice(null);
                            setShowDeviceForm(true);
                        }}
                        className="cursor-pointer"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        デバイス追加
                    </Button>
                </div>

                {areDevicesLoading && <p>デバイス情報を読み込み中...</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devices &&
                        devices.map((device) => (
                            <Card key={device.id}>
                                <CardHeader>
                                    <strong>{device.name}</strong>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm mb-2">MAC: {device.macAddress}</p>
                                    <div className="flex space-x-2">
                                        <Button
                                            onClick={() => handleWakeOnLan(device)}
                                            disabled={isWOLSending === device.id || device.isOnline}
                                            className="flex-1 cursor-pointer"
                                        >
                                            {isWOLSending === device.id ? (
                                                <>
                                                    <ButtonLoading className="mr-2" />
                                                    送信中...
                                                </>
                                            ) : (
                                                <>
                                                    <Power className="h-4 w-4 mr-2" />
                                                    {device.isOnline ? '起動済み' : '起動'}
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            className="cursor-pointer"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setEditingDevice(device);
                                                setShowDeviceForm(true);
                                            }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="cursor-pointer"
                                            size="sm"
                                            onClick={() => setDeletingDevice(device)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                </div>
            </main>

            {showDeviceForm && (
                <DeviceForm
                    device={editingDevice}
                    onSave={handleSaveDevice}
                    onCancel={() => {
                        setShowDeviceForm(false);
                        setEditingDevice(null);
                    }}
                />
            )}
            <DeleteConfirmModal
                isOpen={!!deletingDevice}
                onClose={() => setDeletingDevice(null)}
                onConfirm={() => {
                    if (deletingDevice) {
                        deleteDevice(deletingDevice.id);
                        setDeletingDevice(null);
                    }
                }}
                deviceName={deletingDevice?.name || ''}
            />
        </div>
    );
};

export default Dashboard;
