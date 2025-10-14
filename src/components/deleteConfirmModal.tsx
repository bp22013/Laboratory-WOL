/* 削除確認モーダルコンポーネント */

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    deviceName: string;
}

export const DeleteConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    deviceName,
}: DeleteConfirmationDialogProps) => {
    if (!isOpen) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="w-11/12 rounded-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                    <AlertDialogDescription>
                        デバイス「<strong>{deviceName}</strong>
                        」を削除すると、この操作は元に戻せません。関連するすべてのデータが完全に削除されます。
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer" onClick={onClose}>
                        キャンセル
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700 cursor-pointer"
                    >
                        削除する
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
