import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  User,
  Edit3,
  Save,
  X,
  Trash2,
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock3,
  Mail,
  Phone,
  Building,
  GraduationCap,
  AlertTriangle,
} from "lucide-react";
import {
  GetRegistrationById,
  DeleteRegistration,
  AddUserToRegistration,
  RemoveUserFromRegistration,
  UpdateRegistration,
} from "@/services/registrationService";
import { GetPostById } from "@/services/postServices";
import { cn } from "@/lib/utils";
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
import { toast } from 'react-toastify';

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

export interface AddUserPayload {
  user_id?: number;
  sut_id?: string;
}

export default function RegistrationDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [savingTeam, setSavingTeam] = React.useState(false);
  const [savingMember, setSavingMember] = React.useState(false);
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);
  const [memberToDelete, setMemberToDelete] = React.useState<number | null>(null);

  const [reg, setReg] = React.useState<any>(null);
  const [post, setPost] = React.useState<any>(null);
  const [isEditingTeam, setIsEditingTeam] = React.useState(false);

  // Forms
  const [editTeamName, setEditTeamName] = React.useState("");
  const [editDesc, setEditDesc] = React.useState("");
  const [memberSutId, setMemberSutId] = React.useState("");

  const toText = (v: any, fallback = ""): string => {
    if (v == null) return fallback;

    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean")
      return String(v);

    if (Array.isArray(v))
      return v
        .map((x) => toText(x, ""))
        .filter(Boolean)
        .join(", ");

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

        setEditTeamName(toText(data?.team_name ?? data?.TeamName, ""));
        setEditDesc(toText(data?.description ?? data?.Description, ""));

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
        alert(res?.data?.error || "โหลดรายละเอียดไม่สำเร็จ");
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "เกิดข้อผิดพลาด");
    }
  };

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      await reload();
      setLoading(false);
    })();
  }, [id]);

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
            <Button onClick={() => nav("/student/registrations")}>
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

  // ✅ canEdit = เฉพาะ Pending เท่านั้น
  const canEdit = status === "pending";

  const rejectionReason = toText(reg.rejection_reason ?? reg.RejectionReason, "");

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

  const onCancelRegistration = async () => {
    try {
      const res = await DeleteRegistration(regId);
  
      if (res?.status === 200) {
        toast.success("ยกเลิกการลงทะเบียนเรียบร้อย");
        nav("/student/registrations/MyRegistrationsPage");
      } else {
        toast.error(res?.data?.error || "ยกเลิกไม่สำเร็จ");
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการยกเลิก");
    }
  };

  const onSaveTeam = async () => {
    if (!canEdit) {
      toast.error("ไม่สามารถแก้ไขข้อมูลได้ในสถานะนี้");
      return;
    }

    if (!editTeamName.trim()) {
      toast.error("กรุณากรอกชื่อทีม");
      return;
    }

    setSavingTeam(true);
    try {
      const res = await UpdateRegistration(regId, {
        team_name: editTeamName.trim(),
        description: editDesc.trim(),
      });

      if (res?.status === 200) {
        toast.success("บันทึกข้อมูลทีมสำเร็จ");
        await reload();
        setIsEditingTeam(false);
      } else {
        toast.error(res?.data?.error || "บันทึกไม่สำเร็จ");
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSavingTeam(false);
    }
  };

  const onAddMember = async () => {
    if (!canEdit) {
      toast.error("ไม่สามารถเพิ่มสมาชิกได้ในสถานะนี้");
      return;
    }

    if (!memberSutId.trim()) {
      toast.error("กรุณากรอก SUT ID");
      return;
    }

    setSavingMember(true);
    try {
      const res = await AddUserToRegistration(regId, {
        sut_id: memberSutId.trim(),
      });

      if (res?.status === 200) {
        toast.success("เพิ่มสมาชิกเรียบร้อย");
        setMemberSutId("");
        await reload();
      } else {
        toast.error(res?.data?.error || res?.data?.message || "เพิ่มสมาชิกไม่สำเร็จ");
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการเพิ่มสมาชิก");
    } finally {
      setSavingMember(false);
    }
  };

  const onRemoveMember = async (uid: number) => {
    try {
      const res = await RemoveUserFromRegistration(regId, { user_id: uid });

      if (res?.status === 200) {
        toast.success("ลบสมาชิกเรียบร้อย");
        await reload();
        setMemberToDelete(null);
      } else {
        toast.error(res?.data?.error || res?.data?.message || "ลบสมาชิกไม่สำเร็จ");
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการลบสมาชิก");
    }
  };

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
                onClick={() => nav("/student/registrations/MyRegistrationsPage")}
              >
                <ArrowLeft className="size-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">รายละเอียดการลงทะเบียน</h1>
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
          ) : (
            <div className="relative h-48 bg-gradient-to-br from-indigo-400 to-purple-500">
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
              {status === "pending" && "กรุณารอการอนุมัติจากผู้จัดกิจกรรม"}
              {status === "approved" && "การลงทะเบียนของคุณได้รับการอนุมัติแล้ว"}
              {status === "rejected" && "การลงทะเบียนของคุณไม่ได้รับการอนุมัติ"}
            </p>
            
            {status === "rejected" && rejectionReason && (
              <div className="mt-4 p-4 bg-white rounded-lg border-2 border-red-300 shadow-sm">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-red-900 mb-1">
                      เหตุผลที่ไม่อนุมัติ:
                    </p>
                    <p className="text-sm text-red-800 leading-relaxed">
                      {rejectionReason}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Team Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5 text-indigo-600" />
                ข้อมูลทีม
              </CardTitle>
              {!isEditingTeam && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!canEdit) {
                      toast.error(
                        "สามารถแก้ไขข้อมูลได้เฉพาะสถานะรอดำเนินการ (Pending)"
                      );
                      return;
                    }
                    setIsEditingTeam(true);
                  }}
                >
                  <Edit3 className="size-4 mr-2" />
                  แก้ไข
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {isEditingTeam ? (
              <>
                <div className="space-y-2">
                  <Label>ชื่อทีม</Label>
                  <Input
                    value={editTeamName}
                    onChange={(e) => setEditTeamName(e.target.value)}
                    placeholder="ระบุชื่อทีม"
                  />
                </div>

                <div className="space-y-2">
                  <Label>คำอธิบาย</Label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="คำอธิบายเกี่ยวกับทีม (ถ้ามี)"
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={onSaveTeam} disabled={savingTeam} className="flex-1">
                    <Save className="size-4 mr-2" />
                    {savingTeam ? "กำลังบันทึก..." : "บันทึก"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingTeam(false);
                      setEditTeamName(teamName);
                      setEditDesc(desc);
                    }}
                    className="flex-1"
                  >
                    <X className="size-4 mr-2" />
                    ยกเลิก
                  </Button>
                </div>
              </>
            ) : (
              <>
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
              </>
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
            {/* ✅ แสดงช่องเพิ่มสมาชิกเฉพาะ Pending */}
            {canEdit && (
              <div className="flex gap-2 p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                <Input
                  value={memberSutId}
                  onChange={(e) => setMemberSutId(e.target.value)}
                  placeholder="กรอก SUT ID เพื่อเพิ่มสมาชิก"
                  className="flex-1"
                />
                <Button onClick={onAddMember} disabled={savingMember}>
                  <UserPlus className="size-4 mr-2" />
                  {savingMember ? "กำลังเพิ่ม..." : "เพิ่ม"}
                </Button>
              </div>
            )}

            {users.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Users className="size-12 mx-auto mb-2 opacity-30" />
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

                  return (
                    <Card key={userId} className="bg-slate-50 relative">
                      <CardContent className="p-4">
                        {/* ✅ ปุ่มลบมุมบนขวา: เฉพาะ Pending + ไม่ใช่ผู้ลงทะเบียน (index > 0) */}
                        {status === "pending" && index > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setMemberToDelete(userId)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}

                        <div className="flex items-start gap-2 mb-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <User className="size-5 text-slate-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold">
                              {firstName} {lastName}
                            </div>
                            {index === 0 && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                ผู้ลงทะเบียน
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
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
                          <div className="pt-2 border-t text-xs text-slate-500">
                            User ID: {toText(userId, "")}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cancel Registration - เฉพาะ Pending */}
        {status === "pending" && (
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    ยกเลิกการลงทะเบียน
                  </h3>
                  <p className="text-sm text-slate-600">
                    หากต้องการยกเลิก คุณจะไม่สามารถกู้คืนข้อมูลได้
                  </p>
                </div>
                <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
                  <Trash2 className="size-4 mr-2" />
                  ยกเลิกการสมัคร
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการยกเลิก?</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการลงทะเบียนนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={onCancelRegistration}
              className="bg-red-600 hover:bg-red-700"
            >
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Member Dialog */}
      <AlertDialog
        open={memberToDelete !== null}
        onOpenChange={() => setMemberToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบสมาชิก?</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบสมาชิกคนนี้ออกจากทีม?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToDelete && onRemoveMember(memberToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}