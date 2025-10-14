/* ダッシュボードページ */

'use client';

import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Power, Edit, Trash2, Monitor } from 'lucide-react';
import { DeviceForm } from '@/components/device-form';
import { Navbar } from '@/components/navigation';
import { client } from '@/lib/HonoClient';
import toast from 'react-hot-toast';
import { Loading, ButtonLoading } from '@/components/ui/loading';
import { type Device } from '@/types/DeviceType';

const Dashboard: NextPage = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [showDeviceForm, setShowDeviceForm] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { isLoaded, userId, isSignedIn } = useAuth();
    const { user, isLoaded: isUserLoaded } = useUser();

    // 認証チェック
    useEffect(() => {
        if (!isLoaded || !isUserLoaded) return;
        if (!isSignedIn || !userId) {
            toast.error('再度ログインしてください');
            router.push('/');
        }
    }, [isLoaded, isUserLoaded, isSignedIn, userId, router]);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/devices');
                if (res.ok) {
                    const data = await res.json();
                    setDevices(data);
                }
            } catch (error) {
                toast.error('再度ログインしてください');
            }
        })();
    }, []);

    // 起動シグナル送信用関数
    const handleWakeOnLan = async (device: Device) => {
        setIsLoading(true);

        toast.promise(
            new Promise(async (resolve, reject) => {
                try {
                    const response = await client.api.wol.send.$post({
                        json: { macAddress: device.macAddress },
                    });

                    const responseData = await response.json();

                    if (response.ok && responseData.success) {
                        resolve(`${device.name} への起動信号を送信しました！`);
                        setDevices((prev) =>
                            prev.map((d) => (d.id === device.id ? { ...d, isOnline: true } : d))
                        );
                    } else {
                        reject(`WOL送信に失敗しました: ${responseData.message}`);
                    }
                } catch {
                    toast.error('WOLパケットの送信に失敗しました');
                } finally {
                    setIsLoading(false);
                }
            }),
            {
                loading: '起動シグナルを送信しています...',
                success: `${device.name} への起動信号を送信しました！`,
                error: (message: string) => message,
            }
        );
    };

    const handleSaveDevice = async (deviceData: Omit<Device, 'id'>) => {
        try {
            if (editingDevice) {
                // 更新
                const res = await fetch(`/api/devices/${editingDevice.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(deviceData),
                });
                if (!res.ok) throw new Error();
                toast.success(`${deviceData.name} の情報を更新しました`);
            } else {
                // 追加
                const res = await fetch('/api/devices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(deviceData),
                });
                if (!res.ok) throw new Error();
                toast.success(`${deviceData.name} を追加しました`);
            }

            // 再取得
            const updated = await fetch('/api/devices').then((r) => r.json());
            setDevices(updated);
        } catch {
            toast.error('デバイスの保存に失敗しました');
        }

        setShowDeviceForm(false);
        setEditingDevice(null);
    };

    const handleDeleteDevice = async (deviceId: string) => {
        try {
            const res = await fetch(`/api/devices/${deviceId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            toast.success('デバイスを削除しました');
            setDevices((prev) => prev.filter((d) => d.id !== deviceId));
        } catch {
            toast.error('デバイスの削除に失敗しました');
        }
    };

    if (!user || !(isLoaded && isUserLoaded)) {
        return <Loading size="lg" text="認証情報を確認中..." overlay />;
    }

    return (
        <div className="min-h-screen bg-gray-50 overflow-y-scroll">
            <Navbar />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">登録デバイス</h2>
                    <Button onClick={() => setShowDeviceForm(true)} className="cursor-pointer">
                        <Plus className="h-4 w-4 mr-2" />
                        デバイス追加
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devices.map((device) => (
                        <Card key={device.id}>
                            <CardHeader>
                                <div className="flex justify-between">
                                    <div>
                                        <CardTitle>{device.name}</CardTitle>
                                        <CardDescription>{device.description}</CardDescription>
                                    </div>
                                    <Badge variant={device.isOnline ? 'default' : 'secondary'}>
                                        {device.isOnline ? 'オンライン' : 'オフライン'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm mb-2">MAC: {device.macAddress}</p>
                                <div className="flex space-x-2">
                                    <Button
                                        onClick={() => handleWakeOnLan(device)}
                                        disabled={isLoading || device.isOnline}
                                        className="flex-1"
                                    >
                                        {isLoading ? (
                                            <>
                                                <ButtonLoading className="mr-2" />
                                                起動中...
                                            </>
                                        ) : (
                                            <>
                                                <Power className="h-4 w-4 mr-2" />
                                                {device.isOnline ? '起動済み' : '起動'}
                                            </>
                                        )}
                                    </Button>
                                    <Button
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
                                        size="sm"
                                        onClick={() => handleDeleteDevice(device.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {devices.length === 0 && (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">デバイスが登録されていません</p>
                            <Button
                                onClick={() => setShowDeviceForm(true)}
                                className="cursor-pointer"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                最初のデバイスを追加
                            </Button>
                        </CardContent>
                    </Card>
                )}
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
        </div>
    );
};

export default Dashboard;
