import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Loader2, Pencil } from "lucide-react";
import {
    CreateTopics,
    DeleteTopic,
    UpdateTopic,
} from "@/services/evaluationService";
import { toast } from "react-toastify";
import type { TopicItem } from "@/interfaces/evaluation";

interface TopicsTabProps {
    selectedActivity: string;
    loading: boolean;
    formDescription: string;
    setFormDescription: (value: string) => void;
    items: TopicItem[];
    setItems: (items: TopicItem[]) => void;
    hasExistingData: boolean;
    originalItems: Record<number, string>;
    onRefresh: () => void;
}

export default function TopicsTab({
    selectedActivity,
    loading,
    formDescription,
    setFormDescription,
    items,
    setItems,
    hasExistingData,
    originalItems,
    onRefresh,
}: TopicsTabProps) {
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(!hasExistingData);
    const [deleteConfirm, setDeleteConfirm] = useState<TopicItem | null>(null);
    const [saveConfirm, setSaveConfirm] = useState(false);

    const addItem = () => {
        if (!isEditing) return;
        setItems([...items, { id: Date.now(), name: "", isNew: true }]);
    };

    const removeItem = async (item: TopicItem) => {
        if (!isEditing) return;
        if (item.isNew) {
            setItems(items.filter((i) => i.id !== item.id));
            return;
        }
        setDeleteConfirm(item);
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        const res = await DeleteTopic({ id: deleteConfirm.id });
        if (res?.status === 200) {
            setItems(items.filter((i) => i.id !== deleteConfirm.id));
            toast.success("ลบหัวข้อสำเร็จ");
        } else {
            toast.error(res?.data?.error || "ลบไม่สำเร็จ");
        }
        setDeleteConfirm(null);
    };

    const updateItemName = (id: number, name: string) => {
        if (!isEditing) return;
        setItems(items.map((i) => (i.id === id ? { ...i, name } : i)));
    };

    const save = async () => {
        if (!selectedActivity || !isEditing) return;
        setSaving(true);

        const existingItems = items.filter((i) => !i.isNew && i.name.trim());
        const newItems = items.filter((i) => i.isNew && i.name.trim());

        const changedItems = existingItems.filter(
            (i) => originalItems[i.id] !== i.name.trim()
        );

        for (const item of changedItems) {
            const res = await UpdateTopic({
                id: item.id,
                name: item.name.trim(),
                description: formDescription.trim(),
            });
            if (res?.status !== 200) {
                toast.error(res?.data?.error || "อัปเดตหัวข้อไม่สำเร็จ");
                setSaving(false);
                return;
            }
        }

        if (newItems.length > 0) {
            const res = await CreateTopics({
                post_id: Number(selectedActivity),
                topics: newItems.map((i) => ({
                    name: i.name.trim(),
                    description: formDescription.trim(),
                })),
            });
            if (res?.status !== 201) {
                toast.error(res?.data?.error || "สร้างหัวข้อไม่สำเร็จ");
                setSaving(false);
                return;
            }
        }

        toast.success("บันทึกสำเร็จ!");
        onRefresh();
        setSaving(false);
        setIsEditing(false);
    };

    const cancel = () => {
        if (hasExistingData) {
            setIsEditing(false);
            onRefresh();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">หัวข้อการประเมิน</h2>
                    {hasExistingData && (
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${isEditing
                                    ? "bg-black text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            <Pencil className="w-4 h-4" />
                            แก้ไข
                        </button>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        คำอธิบายฟอร์มประเมิน
                    </label>
                    <Textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="กรุณาประเมินความพึงพอใจและให้ข้อเสนอแนะ..."
                        className={`resize-none min-h-[60px] ${isEditing ? "bg-white" : "bg-gray-100"
                            }`}
                        disabled={!isEditing}
                    />
                </div>
            </div>

            <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    หัวข้อประเมิน
                </label>
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            className={`flex items-center gap-3 rounded-xl p-3 ${isEditing ? "bg-gray-50" : "bg-gray-100"
                                }`}
                        >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm shrink-0 bg-black text-white">
                                {index + 1}
                            </div>
                            <Input
                                value={item.name}
                                onChange={(e) => updateItemName(item.id, e.target.value)}
                                placeholder="ชื่อหัวข้อประเมิน..."
                                className={`flex-1 border-0 ${isEditing ? "bg-white" : "bg-gray-200"
                                    }`}
                                disabled={!isEditing}
                            />
                            {isEditing && (
                                <button
                                    onClick={() => removeItem(item)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                    {isEditing && (
                        <button
                            onClick={addItem}
                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-black hover:text-black flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            เพิ่มหัวข้อประเมิน
                        </button>
                    )}
                </div>
            </div>

            {isEditing && (
                <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                    <Button
                        variant="outline"
                        onClick={cancel}
                        className="rounded-full px-6"
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={() => setSaveConfirm(true)}
                        disabled={saving}
                        className="rounded-full px-6 bg-black hover:bg-gray-800"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                กำลังบันทึก...
                            </>
                        ) : (
                            "บันทึกทั้งหมด"
                        )}
                    </Button>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!deleteConfirm}
                onOpenChange={() => setDeleteConfirm(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบหัวข้อ</AlertDialogTitle>
                        <AlertDialogDescription>
                            ต้องการลบหัวข้อ <strong>"{deleteConfirm?.name}"</strong> หรือไม่?
                            <br />
                            <br />
                            <span className="text-orange-600">
                                หมายเหตุ: หากมีผู้ประเมินแล้วจะไม่สามารถลบได้
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            ลบหัวข้อ
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Save Confirmation Dialog */}
            <AlertDialog
                open={saveConfirm}
                onOpenChange={() => setSaveConfirm(false)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการบันทึก</AlertDialogTitle>
                        <AlertDialogDescription>
                            {hasExistingData
                                ? "ต้องการบันทึกการแก้ไขหัวข้อประเมินหรือไม่?"
                                : "ต้องการสร้างหัวข้อประเมินใหม่หรือไม่?"}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setSaveConfirm(false);
                                save();
                            }}
                            className="bg-black hover:bg-gray-800"
                        >
                            ยืนยันการบันทึก
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
