'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Power, Edit, Trash2, LogOut, Monitor } from 'lucide-react';
import DeviceForm from '@/components/device-form';
import toast from 'react-hot-toast';
import { Loading, ButtonLoading } from '@/components/ui/loading';

interface Device {
    id: string;
    name: string;
    macAddress: string;
    ipAddress: string;
    description?: string;
    isOnline?: boolean;
}

export default function Dashboard() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [showDeviceForm, setShowDeviceForm] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { isLoaded, userId, isSignedIn, signOut } = useAuth();
    const { user, isLoaded: isUserLoaded } = useUser();

    // 認証チェック
    useEffect(() => {
        if (!isLoaded || !isUserLoaded) return; // ロード中は待機

        if (!isSignedIn || !userId) {
            router.push('/');
        }
    }, [isLoaded, isUserLoaded, isSignedIn, userId, router]);

    // デバイスデータ読み込み
    useEffect(() => {
        const savedDevices = localStorage.getItem('devices');
        if (savedDevices) {
            setDevices(JSON.parse(savedDevices));
        } else {
            // サンプルデバイス
            const sampleDevices: Device[] = [
                {
                    id: '1',
                    name: 'メインPC',
                    macAddress: '00:11:22:33:44:55',
                    ipAddress: '192.168.1.100',
                    description: 'リビングのデスクトップPC',
                    isOnline: false,
                },
                {
                    id: '2',
                    name: 'ゲーミングPC',
                    macAddress: 'AA:BB:CC:DD:EE:FF',
                    ipAddress: '192.168.1.101',
                    description: 'ゲーム用PC',
                    isOnline: true,
                },
            ];
            setDevices(sampleDevices);
            localStorage.setItem('devices', JSON.stringify(sampleDevices));
        }
    }, []);

    const handleWakeOnLan = async (device: Device) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/wol', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    macAddress: device.macAddress,
                    ipAddress: device.ipAddress,
                }),
            });

            if (response.ok) {
                toast.success(`${device.name} への起動信号を送信しました`);

                // 状態更新（シミュレーション）
                const updatedDevices = devices.map((d) =>
                    d.id === device.id ? { ...d, isOnline: true } : d
                );
                setDevices(updatedDevices);
                localStorage.setItem('devices', JSON.stringify(updatedDevices));
            } else {
                throw new Error('WOL送信に失敗しました');
            }
        } catch (error) {
            toast.error('WOLパケットの送信に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveDevice = (deviceData: Omit<Device, 'id'>) => {
        if (editingDevice) {
            // 編集
            const updatedDevices = devices.map((d) =>
                d.id === editingDevice.id ? { ...deviceData, id: editingDevice.id } : d
            );
            setDevices(updatedDevices);
            localStorage.setItem('devices', JSON.stringify(updatedDevices));
            toast.success(`${deviceData.name} の情報を更新しました`);
        } else {
            // 追加
            const newDevice: Device = {
                ...deviceData,
                id: Date.now().toString(),
                isOnline: false,
            };
            const updatedDevices = [...devices, newDevice];
            setDevices(updatedDevices);
            localStorage.setItem('devices', JSON.stringify(updatedDevices));
            toast.success(`${deviceData.name} を追加しました`);
        }

        setShowDeviceForm(false);
        setEditingDevice(null);
    };

    const handleDeleteDevice = (deviceId: string) => {
        const updatedDevices = devices.filter((d) => d.id !== deviceId);
        setDevices(updatedDevices);
        localStorage.setItem('devices', JSON.stringify(updatedDevices));
        toast.success('デバイスを削除しました');
    };

    const handleLogout = () => {
        signOut();
        router.push('/');
    };

    if (!user || !(isLoaded && isUserLoaded)) {
        return <Loading size="lg" text="認証情報を確認中..." overlay />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <Monitor className="h-8 w-8 text-blue-600 mr-3" />
                            <h1 className="text-3xl font-bold text-gray-900">Wake on LAN</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">
                                こんにちは、{user.fullName}さん
                            </span>

                            <Button
                                variant="outline"
                                className="cursor-pointer"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                ログアウト
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">登録デバイス</h2>
                        <Button className="cursor-pointer" onClick={() => setShowDeviceForm(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            デバイス追加
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {devices.map((device) => (
                            <Card key={device.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{device.name}</CardTitle>
                                            <CardDescription>{device.description}</CardDescription>
                                        </div>
                                        <Badge variant={device.isOnline ? 'default' : 'secondary'}>
                                            {device.isOnline ? 'オンライン' : 'オフライン'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium">MACアドレス:</span>
                                            <br />
                                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                                {device.macAddress}
                                            </code>
                                        </div>
                                        <div>
                                            <span className="font-medium">IPアドレス:</span>
                                            <br />
                                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                                {device.ipAddress}
                                            </code>
                                        </div>
                                    </div>

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
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    デバイスが登録されていません
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Wake on LANで起動したいデバイスを追加してください
                                </p>
                                <Button
                                    className="cursor-pointer"
                                    onClick={() => setShowDeviceForm(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    最初のデバイスを追加
                                </Button>
                            </CardContent>
                        </Card>
                    )}
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
        </div>
    );
}
