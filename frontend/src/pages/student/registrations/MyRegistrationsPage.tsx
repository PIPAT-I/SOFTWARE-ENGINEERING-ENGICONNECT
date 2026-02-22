import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Building2,
  Trash2,
  RefreshCcw, 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GetMyRegistrations, DeleteRegistration } from "@/services/registrationService";
import { GetPostById } from "@/services/postServices";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
const statusConfig: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  pending: { label: "รออนุมัติ", icon: Clock3, color: "bg-yellow-500" },
  approved: { label: "อนุมัติแล้ว", icon: CheckCircle2, color: "bg-green-500" },
  rejected: { label: "ไม่ผ่านการอนุมัติ", icon: XCircle, color: "bg-red-500" },
};
interface RegistrationWithPost {
  registration: any;
  post: any | null;
}
export default function MyRegistrationsPage() {
  const nav = useNavigate();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<RegistrationWithPost[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingItem, setDeletingItem] = React.useState<RegistrationWithPost | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusInfo = (status?: string) => {
    const key = (status || "pending").toLowerCase().trim();
    return statusConfig[key] || statusConfig.pending;
  };

  const isEventExpired = (stopDate?: string) => {
    if (!stopDate) return false;
    const now = new Date();
    const stop = new Date(stopDate);
    return now > stop;
  };


  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await GetMyRegistrations();
      
      console.log("GetMyRegistrations raw:", res);
      console.log("GetMyRegistrations data:", res?.data?.data);

      if (res?.status === 401) {
        setError("กรุณาเข้าสู่ระบบใหม่");
        setItems([]);
        return;
      }

      if (res?.status !== 200) {
        setError(res?.data?.error || "ไม่สามารถดึงข้อมูลได้");
        setItems([]);
        return;
      }

      const registrations: any[] = Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      if (registrations.length === 0) {
        setItems([]);
        return;
      }

      const mapped: RegistrationWithPost[] = await Promise.all(
        registrations.map(async (reg) => {
          let post = reg.Post ?? null;
          
          if (!post && reg.post_id) {
            try {
              const postRes = await GetPostById(String(reg.post_id));
              if (postRes?.status === 200) {
                post = postRes.data?.data || postRes.data;
              }
            } catch (err) {
              console.error(`Error fetching post ${reg.post_id}:`, err);
            }
          }

          return {
            registration: reg,
            post: post,
          };
        })
      );

      console.log("Mapped items with posts:", mapped);
      setItems(mapped);
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  const handleDeleteClick = (item: RegistrationWithPost) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    const regId = deletingItem.registration?.ID ?? deletingItem.registration?.id;
    if (!regId) {
      toast.error("ไม่พบ ID การลงทะเบียน");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await DeleteRegistration(Number(regId));

      if (res?.status === 200) {
        toast.success("ลบการลงทะเบียนสำเร็จ");
        setDeleteDialogOpen(false);
        setDeletingItem(null);
        await load();
      } else {
        toast.error(res?.data?.error || "ลบการลงทะเบียนไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-slate-900 mx-auto mb-4" />
          <p className="text-slate-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <Card className="max-w-xl mx-auto border-red-200">
          <CardContent className="py-12 text-center">
            <AlertCircle className="size-10 text-red-500 mx-auto mb-4" />
            <p className="mb-6">{error}</p>
            <Button onClick={load}>
              <RefreshCw className="mr-2 size-4" />
              ลองใหม่อีกครั้ง
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <Card className="max-w-xl mx-auto">
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="mb-6">ยังไม่มีข้อมูลการลงทะเบียน</p>
            <Button onClick={() => nav("/student/events")}>
              ค้นหากิจกรรม
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-20 shadow-sm">
        <div className="w-full px-6 sm:px-12 lg:px-16">
          <div className="flex items-center justify-between h-20 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/student/events")}
                className="hover:bg-slate-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="size-5 text-slate-700" />
              </Button>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  ลงทะเบียนและจัดการทีม
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  ติดตามสถานะการลงทะเบียนของคุณ
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-6 sm:px-8 lg:px-12 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => {
            const { registration, post } = item;
            const regId = registration?.ID ?? registration?.id ?? idx;
            const postId = post?.ID ?? post?.id ?? registration?.post_id; 
            const status =
              registration?.Status ?? registration?.status ?? "pending";
            const statusInfo = getStatusInfo(status);
            const StatusIcon = statusInfo.icon;
            const location = post?.Location || post?.location;
            const stopDate = post?.stop_date || post?.stop;
            const expired = isEventExpired(stopDate);

            return (
              <Card
                key={regId}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* รูปภาพ - รองรับทั้ง base64 และ URL */}
                {post?.picture ? (
                  <img
                    src={
                      post.picture.startsWith("data:")
                        ? post.picture
                        : post.picture.startsWith("http")
                        ? post.picture
                        : `data:image/jpeg;base64,${post.picture}`
                    }
                    alt={post.title || "กิจกรรม"}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                    <Calendar className="size-20 text-white opacity-30" />
                  </div>
                )}

                <CardContent className="p-5">
                  {/* ชื่อกิจกรรมและสถานะ */}
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <h3 className="font-bold text-lg line-clamp-2 flex-1">
                      {post?.title || "ไม่ระบุชื่อกิจกรรม"}
                    </h3>
                    <Badge className={cn("text-white shrink-0", statusInfo.color)}>
                      <StatusIcon className="size-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>

                  {/* แสดง Badge "หมดเวลา" ถ้ากิจกรรมสิ้นสุดแล้ว */}
                  {expired && (
                    <div className="mb-3">
                      <Badge variant="outline" className="text-xs text-slate-500 border-slate-300">
                         กิจกรรมสิ้นสุดแล้ว
                      </Badge>
                    </div>
                  )}

                  {/* ข้อมูลกิจกรรม */}
                  <div className="text-sm text-slate-600 mb-4 space-y-2">
                    {/* ผู้จัดกิจกรรม */}
                    {post?.organizer && (
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-indigo-600 shrink-0" />
                        <span className="truncate">{post.organizer}</span>
                      </div>
                    )}

                    {/* สถานที่ */}
                    {location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-indigo-600 shrink-0" />
                        <span className="truncate">
                          {location.building || location.name || "ไม่ระบุสถานที่"}
                        </span>
                      </div>
                    )}

                    {/* วันที่กิจกรรม */}
                    {post && (
                      <div className="flex items-center gap-2">
                        <Calendar className=" text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200" />
                        <span className="truncate">
                          {formatDate(post.start_date || post.start)} -{" "}
                          {formatDate(post.stop_date || post.stop)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ปุ่มต่างๆ */}
                  <div className="flex flex-col gap-2">
                    {/* ปุ่มดูรายละเอียด */}
                    <Button
                      variant="outline"
                      className="flex-1 text-slate-600 hover:text-slate-700 hover:bg-slate-50 border-slate-200"
                      onClick={() => nav(`/student/registrations/${regId}`)}
                    >
                      ดูรายละเอียด
                    </Button>

                    {/* กิจกรรมหมดเวลา → แสดงเฉพาะปุ่มลบ */}
                    {expired && (
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleDeleteClick(item)}
                      >
                        <Trash2 className="size-4 mr-2" />
                        ลบการลงทะเบียน
                      </Button>
                    )}

                    {/* สถานะ Rejected (ไม่หมดเวลา) → แสดงปุ่มลงทะเบียนใหม่ */}
                    {!expired && status.toLowerCase() === "rejected" && (
                      <Button
                        variant="default"
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => nav(`/student/activities/${postId}/register`)}
                      >
                        <RefreshCcw className="size-4 mr-2" />
                        ลงทะเบียนใหม่อีกครั้ง
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="size-5" />
              ยืนยันการลบ
            </DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบการลงทะเบียนนี้?
            </DialogDescription>
          </DialogHeader>

          {deletingItem?.post && (
            <div className="py-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-semibold text-slate-900 mb-1">
                  {deletingItem.post.title || "กิจกรรม"}
                </p>
                <p className="text-sm text-slate-600">
                  ทีม: {deletingItem.registration.team_name || deletingItem.registration.TeamName || "-"}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  การดำเนินการนี้ไม่สามารถย้อนกลับได้
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingItem(null);
              }}
              disabled={isDeleting}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "กำลังลบ..." : "ยืนยันลบ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}