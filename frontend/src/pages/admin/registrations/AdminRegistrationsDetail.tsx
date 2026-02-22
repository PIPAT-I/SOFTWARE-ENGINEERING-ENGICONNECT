import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  User,
  CheckCircle2,
  XCircle,
  Clock3,
  Mail,
  Phone,
  Building,
  GraduationCap,
  AlertTriangle,
  FileText,
  Activity,
} from "lucide-react";
import {
  GetRegistrationById,
  UpdateRegistrationStatus,
} from "@/services/registrationService";
import { GetPostById } from "@/services/postServices";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

const statusConfig: Record<
  string,
  { label: string; icon: any; color: string; bgColor: string }
> = {
  pending: {
    label: "รอดำเนินการ",
    icon: Clock3,
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
  },
  approved: {
    label: "อนุมัติแล้ว",
    icon: CheckCircle2,
    color: "text-green-700",
    bgColor: "bg-green-50",
  },
  rejected: {
    label: "ไม่อนุมัติ",
    icon: XCircle,
    color: "text-red-700",
    bgColor: "bg-red-50",
  },
};

export default function AdminRegistrationDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [reg, setReg] = React.useState<any>(null);
  const [post, setPost] = React.useState<any>(null);

  
  const [showRejectDialog, setShowRejectDialog] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState("");

  const toText = (v: any, fallback = ""): string => {
    if (v == null) return fallback;
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean")
      return String(v);
    if (Array.isArray(v))
      return v.map((x) => toText(x, "")).filter(Boolean).join(", ");
    if (typeof v === "object") {
      const n = v.name ?? v.Name ?? v.label ?? v.title ?? v.building ?? v.location_detail;
      if (typeof n === "string" && n.trim()) return n;
      return fallback;
    }
    return fallback;
  };

  const getLocationText = (p: any): string => {
    if (!p) return "ไม่ระบุสถานที่";
    const loc = p.location ?? p.Location;
    if (loc) {
      const building = loc.building ?? loc.Building;
      const detail = loc.location_detail ?? loc.LocationDetail;
      const parts = [];
      if (building) parts.push(`อาคาร ${building}`);
      if (detail) parts.push(detail);
      if (parts.length > 0) return parts.join(" - ");
    }
    return "ไม่ระบุสถานที่";
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const reload = async () => {
    if (!id) return;

    try {
      const res = await GetRegistrationById(Number(id));

      if (res?.status === 200) {
        const data = res.data?.data ?? res.data;
        setReg(data);

        
        const postId = data?.post_id ?? data?.PostID;
        if (postId) {
          try {
            const postRes = await GetPostById(postId);
            if (postRes?.status === 200) {
              const p = postRes.data?.data ?? postRes.data;
              setPost(p);
            }
          } catch (err) {
            console.error("Error loading post:", err);
          }
        }
      } else {
        toast.error(res?.data?.error || "โหลดรายละเอียดไม่สำเร็จ");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "เกิดข้อผิดพลาด");
    }
  };

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      await reload();
      setLoading(false);
    })();
  }, [id]);

  
  const handleApprove = async () => {
    if (!reg) return;

    const res = await UpdateRegistrationStatus(Number(id), {
      status: "approved",
      reason: "",
    });

    if (res?.status === 200) {
      toast.success("อนุมัติสำเร็จ");
      await reload();
    } else {
      toast.error(res?.data?.error || "อัปเดตสถานะไม่สำเร็จ");
    }
  };

  
  const handleRejectClick = () => {
    setRejectionReason("");
    setShowRejectDialog(true);
  };

  
  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      toast.error("กรุณากรอกเหตุผลที่ไม่อนุมัติ");
      return;
    }

    const res = await UpdateRegistrationStatus(Number(id), {
      status: "rejected",
      reason: rejectionReason.trim(),
    });

    if (res?.status === 200) {
      toast.success("ไม่อนุมัติสำเร็จ");
      setShowRejectDialog(false);
      setRejectionReason("");
      await reload();
    } else {
      toast.error(res?.data?.error || "อัปเดตสถานะไม่สำเร็จ");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!reg) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <div className="text-slate-400 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">ไม่พบข้อมูล</h3>
            <p className="text-slate-600 mb-6">ไม่สามารถโหลดข้อมูลการลงทะเบียนได้</p>
            <Button onClick={() => nav("/admin/registrations")}>
              <ArrowLeft className="mr-2 size-4" />
              กลับหน้ารายการ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const regId = reg.ID ?? reg.id;
  const teamName = toText(reg.team_name ?? reg.TeamName, "-");
  const desc = toText(reg.description ?? reg.Description, "");
  const users: any[] = Array.isArray(reg.users ?? reg.Users) ? reg.users ?? reg.Users : [];

  const rawStatus = toText(reg?.status ?? reg?.Status, "pending");
  const status = rawStatus.trim().toLowerCase();
  const statusInfo = statusConfig[status] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  const canEdit = status === "pending";
  const rejectionReasonFromReg = toText(reg.rejection_reason ?? reg.RejectionReason, "");

  const postTitle = toText(post?.title ?? post?.Title, "ชื่อกิจกรรม");
  const startDate = post?.start_date ?? post?.StartDate;
  const stopDate = post?.stop_date ?? post?.StopDate;
  const location = getLocationText(post);
  const posterBase64 = post?.picture ?? post?.Picture;

  const dateRange = startDate
    ? `${formatDate(startDate)}${stopDate ? ` - ${formatDate(stopDate)}` : ""}`
    : "ไม่ระบุวันที่";

  const posterUrl = posterBase64
    ? posterBase64.startsWith("data:")
      ? posterBase64
      : `data:image/jpeg;base64,${posterBase64}`
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => nav("/admin/registrations")}
              >
                <ArrowLeft className="size-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">รายละเอียดการลงทะเบียน (Admin)</h1>
                <p className="text-sm text-slate-500">Registration #{toText(regId, "")}</p>
              </div>
            </div>

            <Badge
              className={cn(
                "text-white border-0",
                status === "approved" && "bg-green-600",
                status === "rejected" && "bg-red-600",
                status === "pending" && "bg-yellow-600"
              )}
            >
              <StatusIcon className="size-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Post Info Card */}
        <Card className="overflow-hidden">
          {posterUrl ? (
            <div className="relative h-64 overflow-hidden">
              <img
                src={posterUrl}
                alt={postTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="size-5" />
                  <h2 className="text-2xl font-bold">{postTitle}</h2>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <span>{dateRange}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    <span>{toText(location, "ไม่ระบุสถานที่")}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative h-48 bg-gradient-to-br from-slate-700 to-gray-800">
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <Calendar className="size-32 text-white" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">{postTitle}</h2>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <span>{dateRange}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    <span>{toText(location, "ไม่ระบุสถานที่")}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Status Alert */}
        <div
          className={cn(
            "flex items-start gap-3 p-4 rounded-lg border-2",
            statusInfo.bgColor,
            statusInfo.color
          )}
        >
          <StatusIcon className="size-6 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">สถานะ: {statusInfo.label}</h3>
            <p className="text-sm mt-1">
              {status === "pending" && "รอการอนุมัติจากแอดมิน"}
              {status === "approved" && "การลงทะเบียนได้รับการอนุมัติแล้ว"}
              {status === "rejected" && "การลงทะเบียนไม่ได้รับการอนุมัติ"}
            </p>

            {/* แสดงเหตุผลที่ไม่อนุมัติ */}
            {status === "rejected" && rejectionReasonFromReg && (
              <div className="mt-4 p-4 bg-white rounded-lg border-2 border-red-300 shadow-sm">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-red-900 mb-1">
                      เหตุผลที่ไม่อนุมัติ:
                    </p>
                    <p className="text-sm text-red-800 leading-relaxed">
                      {rejectionReasonFromReg}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* แสดงข้อความเมื่อไม่สามารถเปลี่ยนได้ */}

          </div>
        </div>

        {/* Team Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-blue-900" />
              ข้อมูลทีม
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-sm text-slate-600 mb-1">ชื่อทีม</div>
                <div className="font-semibold">{teamName}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-sm text-slate-600 mb-1">จำนวนสมาชิก</div>
                <div className="font-semibold">{users.length} คน</div>
              </div>
            </div>

            {!!desc && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-sm text-slate-600 mb-1">คำอธิบาย</div>
                <div className="text-sm">{desc}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Members Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5 text-indigo-600" />
              สมาชิกในทีม ({users.length} คน)
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-8 text-slate-500 border-slate-200 bg-slate-50/30">
                <User className="size-5 text-slate-900" />
                <p>ยังไม่มีสมาชิกในทีม</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((u: any, index: number) => {
                  const userId = u.ID ?? u.id;
                  const firstName = toText(u.FirstName ?? u.first_name ?? u.firstName, "");
                  const lastName = toText(u.LastName ?? u.last_name ?? u.lastName, "");
                  const email = toText(u.Email ?? u.email, "");
                  const phone = toText(u.Phone ?? u.phone, "");
                  const faculty = toText(u.Faculty ?? u.faculty, "");
                  const major = toText(u.Major ?? u.major, "");
                  const sutId = toText(u.sut_id ?? u.SutId ?? u.SUTID, "");

                  return (
                    <Card key={userId} className="bg-slate-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                              <User className="size-5 text-slate-600" />
                            </div>
                            <div>
                              <div className="font-semibold">
                                {firstName} {lastName}
                              </div>
                              {index === 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  ผู้ลงทะเบียน
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          {sutId && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <FileText className="size-4" />
                              <span>SUT ID: {sutId}</span>
                            </div>
                          )}
                          {email && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Mail className="size-4" />
                              <span className="truncate">{email}</span>
                            </div>
                          )}
                          {phone && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Phone className="size-4" />
                              <span>{phone}</span>
                            </div>
                          )}
                          {faculty && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Building className="size-4" />
                              <span className="truncate">{faculty}</span>
                            </div>
                          )}
                          {major && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <GraduationCap className="size-4" />
                              <span className="truncate">{major}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Actions */}
        {canEdit && (
          <Card className="border-slate-200 bg-slate-50/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    การจัดการสถานะ
                  </h3>
                  <p className="text-sm text-slate-600">
                    อนุมัติหรือไม่อนุมัติการลงทะเบียนนี้
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleApprove}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="size-4 mr-2" />
                    อนุมัติ
                  </Button>
                  <Button variant="destructive" onClick={handleRejectClick}>
                    <XCircle className="size-4 mr-2" />
                    ไม่อนุมัติ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="size-5" />
              ไม่อนุมัติการลงทะเบียน
            </DialogTitle>
            <DialogDescription>
              กรุณาระบุเหตุผลที่ไม่อนุมัติการลงทะเบียนนี้
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">
                เหตุผล <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="เช่น จำนวนสมาชิกไม่ครบ, เอกสารไม่ครบถ้วน..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
              }}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectionReason.trim()}
            >
              <XCircle className="size-4 mr-2" />
              ยืนยันไม่อนุมัติ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}