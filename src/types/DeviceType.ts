/* デバイスのインターフェースの定義 */

export interface Device {
    id: string;
    name: string;
    macAddress: string;
    description?: string | null;
    isOnline?: boolean;
}
