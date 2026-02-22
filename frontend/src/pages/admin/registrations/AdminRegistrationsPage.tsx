import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Activity,
  Filter,
  ChevronRight,
  FileText,
  AlertCircle,
  Trash2, 
} from "lucide-react";
 
import { GetAllPosts } from "@/services/postServices"; 
import {
  GetRegistrationsByPostId,
  UpdateRegistrationStatus,
  DeleteRegistration, 
} from "@/services/registrationService";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

const statusConfig = {
  pending: {
    label: "รออนุมัติ",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Clock,
    badgeColor: "bg-amber-500",
  },
  approved: {
    label: "อนุมัติแล้ว",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    badgeColor: "bg-green-500",
  },
  rejected: {
    label: "ไม่อนุมัติ",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
    badgeColor: "bg-red-500",
  },
};

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminRegistrationsPage() {
  const nav = useNavigate();

  const [posts, setPosts] = React.useState<any[]>([]);
  const [postId, setPostId] = React.useState<number | null>(null);
  const [selectedPost, setSelectedPost] = React.useState<any>(null);

  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [q, setQ] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");

  
  const [showRejectDialog, setShowRejectDialog] = React.useState(false);
  const [selectedRegId, setSelectedRegId] = React.useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");

  
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [deletingRegId, setDeletingRegId] = React.useState<number | null>(null);
  const [deletingTeamName, setDeletingTeamName] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  const loadPosts = async () => {
    const res = await GetAllPosts();
    if (res?.status === 200) {
      const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setPosts(list);
    } else {
      toast.error(res?.data?.error || "ดึงกิจกรรมไม่สำเร็จ");
    }
  };

  const loadRegistrations = async (pid: number) => {
    setLoading(true);
    const res = await GetRegistrationsByPostId(pid);
    if (res?.status === 200) {
      const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setItems(list);
    } else {
      toast.error(res?.data?.error || "ดึงรายการสมัครไม่สำเร็จ");
      setItems([]);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadPosts();
  }, []);

  const onSelectPost = async (post: any) => {
    const id = Number(post.ID ?? post.id);
    setPostId(id);
    setSelectedPost(post);
    await loadRegistrations(id);
  };

  
  const handleApprove = async (regId: number) => {
    const res = await UpdateRegistrationStatus(regId, {
      status: "approved",
      reason: "",
    });

    if (res?.status === 200) {
      toast.success("อนุมัติสำเร็จ");
      if (postId) await loadRegistrations(postId);
    } else {
      toast.error(res?.data?.error || "อัปเดตสถานะไม่สำเร็จ");
    }
  };

  
  const handleRejectClick = (regId: number) => {
    setSelectedRegId(regId);
    setRejectionReason("");
    setShowRejectDialog(true);
  };

  
  const handleRejectConfirm = async () => {
    if (!selectedRegId) return;

    if (!rejectionReason.trim()) {
      toast.error("กรุณากรอกเหตุผลที่ไม่อนุมัติ");
      return;
    }

    const res = await UpdateRegistrationStatus(selectedRegId, {
      status: "rejected",
      reason: rejectionReason.trim(),
    });

    if (res?.status === 200) {
      toast.success("ไม่อนุมัติสำเร็จ");
      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedRegId(null);
      if (postId) await loadRegistrations(postId);
    } else {
      toast.error(res?.data?.error || "อัปเดตสถานะไม่สำเร็จ");
    }
  };

  
  const handleDeleteClick = (regId: number, teamName: string) => {
    setDeletingRegId(regId);
    setDeletingTeamName(teamName);
    setShowDeleteDialog(true);
  };

  
  const handleDeleteConfirm = async () => {
    if (!deletingRegId) return;

    setIsDeleting(true);
    try {
      const res = await DeleteRegistration(deletingRegId);

      if (res?.status === 200) {
        toast.success("ลบทีมสำเร็จ");
        setShowDeleteDialog(false);
        setDeletingRegId(null);
        setDeletingTeamName("");
        if (postId) await loadRegistrations(postId);
      } else {
        toast.error(res?.data?.error || "ลบทีมไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("เกิดข้อผิดพลาดในการลบทีม");
    } finally {
      setIsDeleting(false);
    }
  };

  
  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();

    return items.filter((r: any) => {
      const team = String(r.team_name ?? r.TeamName ?? "").toLowerCase();
      const st = String(r.status ?? r.Status ?? "pending").toLowerCase();

      const passStatus = statusFilter === "all" ? true : st === statusFilter;
      const passQ = query ? team.includes(query) : true;

      return passStatus && passQ;
    });
  }, [items, q, statusFilter]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-gray-900 flex items-center justify-center">
                <FileText className="size-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  จัดการการลงทะเบียน
                </h1>
                <p className="text-xs text-slate-500">Admin Panel</p>
              </div>
            </div>

            {selectedPost && (
              <Badge
                variant="secondary"
                className="hidden md:flex items-center gap-2"
              >
                <Activity className="size-3" />
                {selectedPost.title ?? selectedPost.Title}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Post Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="size-5 text-slate-900" />
              <CardTitle>เลือกกิจกรรม</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <AlertCircle className="size-12 mx-auto mb-3 opacity-30" />
                <p>ไม่พบกิจกรรม</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((p: any) => {
                  const id = Number(p.ID ?? p.id);
                  const name = p.title ?? p.Title ?? `Post ${id}`;
                  const isSelected = postId === id;

                  return (
                    <button
                      key={id}
                      onClick={() => onSelectPost(p)}
                      className={cn(
                        "group relative text-left rounded-xl border-2 p-4 transition-all",
                        "hover:shadow-md hover:border-slate-300 hover:-translate-y-1",
                      isSelected
                        ? "border-slate-900 bg-slate-50 shadow-md"
                        : "border-slate-200 bg-white"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div
                            className={cn(
                              "font-semibold mb-1 line-clamp-2",
                              isSelected ? "text-slate-900" : "text-slate-900"
                            )}
                          >
                            {name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {p.type ?? p.Type ?? ""}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                            <CheckCircle className="size-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filters & Actions */}
        {postId && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                {/* Search */}
                <div className="flex-1 space-y-2">
                  <Label className="text-xs text-slate-600">ค้นหาชื่อทีม</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="พิมพ์ชื่อทีม..."
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="w-full md:w-48 space-y-2">
                  <Label className="text-xs text-slate-600 flex items-center gap-1">
                    <Filter className="size-3" />
                    กรองสถานะ
                  </Label>
                  <select
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-slate-900 focus:ring-indigo-500"
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as StatusFilter)
                    }
                  >
                    <option value="all">ทุกสถานะ</option>
                    <option value="pending">รออนุมัติ</option>
                    <option value="approved">อนุมัติแล้ว</option>
                    <option value="rejected">ไม่อนุมัติ</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registrations List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-slate-900" />
                <CardTitle>ทีมที่สมัคร</CardTitle>
              </div>
              {filtered.length > 0 && (
                <Badge variant="secondary">{filtered.length} ทีม</Badge>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {!postId ? (
              <div className="text-center py-12 text-slate-500">
                <Activity className="size-16 mx-auto mb-4 opacity-20" />
                <p className="font-medium">กรุณาเลือกกิจกรรมก่อน</p>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900 mx-auto mb-4"></div>
                <p className="text-slate-600">กำลังโหลดข้อมูล...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Search className="size-16 mx-auto mb-4 opacity-20" />
                <p className="font-medium">ไม่พบทีมตามเงื่อนไข</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((r: any) => {
                  const regId = Number(r.ID ?? r.id);
                  const team = r.team_name ?? r.TeamName ?? "-";
                  const st = String(
                    r.status ?? r.Status ?? "pending"
                  ).toLowerCase() as keyof typeof statusConfig;
                  const users = r.users ?? r.Users ?? [];
                  const reason = r.rejection_reason ?? r.RejectionReason ?? "";
                  const config = statusConfig[st] || statusConfig.pending;
                  const StatusIcon = config.icon;

                  const canChangeStatus = st === "pending";

                  return (
                    <Card
                      key={regId}
                      className="border-2 hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-slate-900 truncate">
                                {team}
                              </h3>
                              <Badge
                                className={cn(
                                  "flex items-center gap-1",
                                  config.color
                                )}
                              >
                                <StatusIcon className="size-3" />
                                {config.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <FileText className="size-3" />
                                ID: {regId}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="size-3" />
                                {users.length} สมาชิก
                              </span>
                            </div>

                            {st === "rejected" && reason && (
                              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-xs font-semibold text-red-700 mb-1">
                                  เหตุผลที่ไม่อนุมัติ:
                                </p>
                                <p className="text-sm text-red-900">{reason}</p>
                              </div>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => nav(`/admin/registrations/${regId}`)}
                            className="text-slate-900 hover:text-slate-900 hover:bg-slate-50"
                          >
                            ดูรายละเอียด
                            <ChevronRight className="size-4 ml-1" />
                          </Button>
                        </div>

                        {/* Members Grid */}
                        {users.length > 0 && (
                          <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                            <p className="text-xs font-semibold text-slate-600 mb-3">
                              สมาชิกในทีม:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {users.map((u: any) => (
                                <div
                                  key={u.ID}
                                  className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200"
                                >
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-semibold text-slate-900">
                                      {(u.FirstName || u.first_name || "U")[0]}
                                    </span>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-900 truncate">
                                      {(u.FirstName || u.first_name || "User") +
                                        " " +
                                        (u.LastName || u.last_name || "")}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      SUT ID: {u.sut_id}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/*  Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-4 border-t">
                          {/* ปุ่มอนุมัติ/ไม่อนุมัติ - เฉพาะ Pending */}
                          {canChangeStatus && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(regId)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="size-4 mr-1" />
                                อนุมัติ
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectClick(regId)}
                              >
                                <XCircle className="size-4 mr-1" />
                                ไม่อนุมัติ
                              </Button>
                            </>
                          )}

                          {/*  ปุ่มลบ - แสดงทุกสถานะ */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => handleDeleteClick(regId, team)}
                          >
                            <Trash2 className="size-4 mr-1" />
                            ลบทีม
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
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
                setSelectedRegId(null);
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

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="size-5" />
              ยืนยันการลบทีม
            </DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบทีมนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm font-semibold text-slate-900 mb-1">
                ทีม: {deletingTeamName}
              </p>
              <p className="text-xs text-slate-600">
                Registration ID: {deletingRegId}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeletingRegId(null);
                setDeletingTeamName("");
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
              <Trash2 className="size-4 mr-2" />
              {isDeleting ? "กำลังลบ..." : "ยืนยันลบ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}