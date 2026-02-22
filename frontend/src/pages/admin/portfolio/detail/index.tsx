import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  GetPortfolioById,
  UpdatePortfolioStatus,
  formatBase64ToDataURL,
} from "@/services/portfolioService";
import type { PortfolioInterface } from "@/interfaces/portfolio";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

const getStatusLabel = (status?: string) => {
  switch (status) {
    case "Pending":
      return "รอการอนุมัติ";
    case "Approved":
      return "อนุมัติ";
    case "Rejected":
      return "ไม่อนุมัติ";
    default:
      return status || "-";
  }
};

function AdminPortfolioDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState<PortfolioInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminComment, setAdminComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Dialog states
  const [approveConfirm, setApproveConfirm] = useState(false);
  const [rejectConfirm, setRejectConfirm] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await GetPortfolioById(Number(id));
      if (res.status === 200) {
        const data = res.data.data || res.data;
        setPortfolio(data);
        if (data?.admin_comment) setAdminComment(data.admin_comment);
      } else {
        toast.error("ไม่พบข้อมูล");
        navigate("/admin/portfolio");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleApprove = async () => {
    if (!id || !portfolio) return;

    setApproveConfirm(false);
    setIsSubmitting(true);

    try {
      const res = await UpdatePortfolioStatus(Number(id), 2, adminComment);
      if (res.status === 200) {
        toast.success(`อนุมัติผลงานเรียบร้อย`);
        setPortfolio((prev) =>
          prev
            ? {
                ...prev,
                portfolio_status_id: 2,
                portfolio_status: {
                  ...prev.portfolio_status!,
                  status_name: "Approved",
                },
                admin_comment: adminComment,
              }
            : null
        );
      } else {
        toast.error("เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เชื่อมต่อล้มเหลว");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!id || !portfolio) return;

    if (!adminComment.trim()) {
      toast.error("กรุณาระบุเหตุผล (Admin Comment)");
      return;
    }

    setRejectConfirm(false);
    setIsSubmitting(true);

    try {
      const res = await UpdatePortfolioStatus(Number(id), 3, adminComment);
      if (res.status === 200) {
        toast.success(`ไม่อนุมัติผลงานเรียบร้อย`);
        setPortfolio((prev) =>
          prev
            ? {
                ...prev,
                portfolio_status_id: 3,
                portfolio_status: {
                  ...prev.portfolio_status!,
                  status_name: "Rejected",
                },
                admin_comment: adminComment,
              }
            : null
        );
      } else {
        toast.error("เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เชื่อมต่อล้มเหลว");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return <div className="text-center py-20 text-slate-500">กำลังโหลด...</div>;
  if (!portfolio) return null;

  const isPending = portfolio.portfolio_status?.status_name === "Pending";
  const isApproved = portfolio.portfolio_status?.status_name === "Approved";
  const isRejected = portfolio.portfolio_status?.status_name === "Rejected";

  return (
    <div className="min-h-screen bg-white pb-20 font-sans">
      <header className="bg-white sticky top-0 z-10 px-6 h-16 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-slate-600 -ml-2"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <span className="text-sm text-slate-500">ID: {portfolio.ID}</span>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden border-slate-200">
              <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center">
                {portfolio.file_urls ? (
                  <img
                    src={formatBase64ToDataURL(portfolio.file_urls)}
                    alt="Preview"
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setIsImageModalOpen(true)}
                  />
                ) : (
                  <span className="text-slate-400">No Image</span>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="size-4" /> เจ้าของผลงาน
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500">ชื่อเจ้าของผลงาน</span>
                  <span className="font-medium">
                    {portfolio.user?.first_name && portfolio.user?.last_name
                      ? `${portfolio.user.first_name} ${portfolio.user.last_name}`
                      : "-"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-slate-500">รหัสนักศึกษา</span>
                  <span className="font-medium">
                    {portfolio.user?.sut_id ?? "-"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-slate-500">วันที่ส่ง</span>
                  <span>
                    {portfolio.CreatedAt
                      ? new Date(portfolio.CreatedAt).toLocaleDateString(
                          "th-TH"
                        )
                      : "-"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-600"
                >
                  {portfolio.porttype || "General"}
                </Badge>
                <Badge
                  className={
                    isApproved
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : isRejected
                      ? "bg-red-100 text-red-700 hover:bg-red-100"
                      : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                  }
                >
                  {getStatusLabel(portfolio.portfolio_status?.status_name)}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-4">
                {portfolio.title}
              </h1>
              <p className="text-slate-600 whitespace-pre-line leading-relaxed mb-6">
                {portfolio.description}
              </p>
              {portfolio.link_portfolio && (
                <a
                  href={portfolio.link_portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-slate-700 bg-slate-100 p-3 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors border border-slate-200"
                >
                  <ExternalLink className="size-4" /> {portfolio.link_portfolio}
                </a>
              )}
            </Card>

            {isPending ? (
              <Card className="border-slate-300 shadow-md bg-white">
                <CardHeader className="border-b pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="size-4" /> ตรวจสอบและอนุมัติ
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ความคิดเห็น (Admin Comment)
                  </label>
                  <textarea
                    className="flex w-full rounded-md border border-slate-300 p-3 text-sm min-h-[100px] mb-6 focus:ring-2 focus:ring-slate-900 outline-none"
                    placeholder="ระบุเหตุผล..."
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                  />
                  <div className="flex gap-4 justify-end">
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => setRejectConfirm(true)}
                      disabled={isSubmitting}
                    >
                      <XCircle className="size-4 mr-2" /> ไม่อนุมัติ
                    </Button>
                    <Button
                      className="bg-black hover:bg-gray-800"
                      onClick={() => setApproveConfirm(true)}
                      disabled={isSubmitting}
                    >
                      <CheckCircle className="size-4 mr-2" /> อนุมัติผลงาน
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card
                className={`border ${
                  isApproved
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <CardContent className="p-6 flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-bold text-lg">
                    {isApproved ? (
                      <CheckCircle className="text-green-600" />
                    ) : (
                      <XCircle className="text-red-600" />
                    )}
                    <span
                      className={isApproved ? "text-green-800" : "text-red-800"}
                    >
                      ผลงานนี้ได้รับการ{isApproved ? "อนุมัติ" : "ปฏิเสธ"}แล้ว
                    </span>
                  </div>
                  {adminComment && (
                    <div className="text-sm text-slate-600 mt-1">
                      <span className="font-semibold">ความเห็นแอดมิน:</span>{" "}
                      {adminComment}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {isImageModalOpen && portfolio.file_urls && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-slate-300 transition-colors"
            onClick={() => setIsImageModalOpen(false)}
          >
            <X className="size-8" />
          </button>
          <img
            src={formatBase64ToDataURL(portfolio.file_urls)}
            alt="Portfolio Preview"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveConfirm} onOpenChange={setApproveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการอนุมัติผลงาน</AlertDialogTitle>
            <AlertDialogDescription>
              ต้องการอนุมัติผลงานนี้หรือไม่?
              <br />
              <br />
              <span className="text-slate-700 font-medium">
                หมายเหตุ: เมื่อผลงานได้รับการอนุมัติแล้ว จะแสดงในระบบสาธารณะ
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              className="bg-black hover:bg-gray-800"
            >
              อนุมัติผลงาน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectConfirm} onOpenChange={setRejectConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ไม่อนุมัติผลงาน</AlertDialogTitle>
            <AlertDialogDescription>
              กรุณายืนยันการไม่อนุมัติผลงานนี้
              <br />
              <br />
              <span className="text-orange-600">
                หมายเหตุ: โปรดตรวจสอบความคิดเห็นที่กรอกไว้ด้านบน
                ซึ่งจะถูกส่งไปยังผู้ส่งผลงาน
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
            >
              ยืนยันไม่อนุมัติ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AdminPortfolioDetail;
