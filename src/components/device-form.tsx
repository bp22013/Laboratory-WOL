/* WOLデバイスのカードコンポーネント */

'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Device {
    id: string;
    name: string;
    macAddress: string;
    ipAddress: string;
    description?: string;
    isOnline?: boolean;
}

interface DeviceFormProps {
    device?: Device | null;
    onSave: (device: Omit<Device, 'id'>) => void;
    onCancel: () => void;
}

export default function DeviceForm({ device, onSave, onCancel }: DeviceFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        macAddress: '',
        ipAddress: '',
        description: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (device) {
            setFormData({
                name: device.name,
                macAddress: device.macAddress,
                ipAddress: device.ipAddress,
                description: device.description || '',
            });
        }
    }, [device]);

    const validateMacAddress = (mac: string) => {
        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        return macRegex.test(mac);
    };

    const validateIpAddress = (ip: string) => {
        const ipRegex =
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ip);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'デバイス名は必須です';
        }

        if (!formData.macAddress.trim()) {
            newErrors.macAddress = 'MACアドレスは必須です';
        } else if (!validateMacAddress(formData.macAddress)) {
            newErrors.macAddress = 'MACアドレスの形式が正しくありません (例: 00:11:22:33:44:55)';
        }

        if (!formData.ipAddress.trim()) {
            newErrors.ipAddress = 'IPアドレスは必須です';
        } else if (!validateIpAddress(formData.ipAddress)) {
            newErrors.ipAddress = 'IPアドレスの形式が正しくありません';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onSave({
                name: formData.name.trim(),
                macAddress: formData.macAddress.trim().toUpperCase(),
                ipAddress: formData.ipAddress.trim(),
                description: formData.description.trim(),
            });
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <Dialog open={true} onOpenChange={onCancel}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{device ? 'デバイス編集' : 'デバイス追加'}</DialogTitle>
                    <DialogDescription>
                        Wake on LANで起動するデバイスの情報を入力してください
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">デバイス名 *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="例: メインPC"
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="macAddress">MACアドレス *</Label>
                        <Input
                            id="macAddress"
                            value={formData.macAddress}
                            onChange={(e) => handleInputChange('macAddress', e.target.value)}
                            placeholder="例: 00:11:22:33:44:55"
                            className={errors.macAddress ? 'border-red-500' : ''}
                        />
                        {errors.macAddress && (
                            <p className="text-sm text-red-500">{errors.macAddress}</p>
                        )}
                        <p className="text-xs text-gray-500">
                            コロン(:)またはハイフン(-)区切りで入力してください
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ipAddress">IPアドレス *</Label>
                        <Input
                            id="ipAddress"
                            value={formData.ipAddress}
                            onChange={(e) => handleInputChange('ipAddress', e.target.value)}
                            placeholder="例: 192.168.1.100"
                            className={errors.ipAddress ? 'border-red-500' : ''}
                        />
                        {errors.ipAddress && (
                            <p className="text-sm text-red-500">{errors.ipAddress}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">説明（任意）</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="例: リビングのデスクトップPC"
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onCancel}>
                            キャンセル
                        </Button>
                        <Button type="submit">{device ? '更新' : '追加'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
