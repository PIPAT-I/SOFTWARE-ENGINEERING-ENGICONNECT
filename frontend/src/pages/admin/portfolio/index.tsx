import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Eye, FileText, ArrowRight, Search } from "lucide-react";
import { toast } from "react-toastify";

import {
  GetAllPortfolios,
  UpdatePortfolioStatus,
  formatBase64ToDataURL,
} from "@/services/portfolioService";
import type { PortfolioInterface } from "@/interfaces/portfolio";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

const StatCard = ({
  title,
  count,
  onClick,
  active,
  color,
}: {
  title: string;
  count: number;
  onClick?: () => void;
  active?: boolean;
  color?: string;
}) => (
  <Card
    onClick={onClick}
    className={`p-6 flex flex-col justify-between h-32 bg-white border shadow-sm rounded-xl transition-all duration-200 cursor-pointer
      ${
        active
          ? "border-slate-400 ring-2 ring-slate-100 shadow-md transform -translate-y-1"
          : "border-slate-200 hover:border-slate-300 hover:shadow-md"
      }
    `}
  >
    <div className="flex justify-between items-start">
      <div
        className={`font-medium text-sm ${
          active ? "text-slate-800 font-bold" : "text-slate-600"
        }`}
      >
        {title}
      </div>
      {onClick && (
        <ArrowRight
          className={`size-4 ${active ? "text-slate-800" : "text-slate-300"}`}
        />
      )}
    </div>
    <div className={`text-4xl font-semibold mt-2 ${color || "text-slate-900"}`}>
      {count}
    </div>
  </Card>
);

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

export default function AdminPortfolioPage() {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState<PortfolioInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [activeTab, setActiveTab] = useState<string>("Pending");

  // Dialog states
  const [approveConfirm, setApproveConfirm] = useState<number | null>(null);
  const [rejectConfirm, setRejectConfirm] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await GetAllPortfolios();
      if (res.status === 200) {
        const data = res.data.data || res.data || [];
        if (Array.isArray(data)) setPortfolios(data);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const total = portfolios.length;
  const approvedCount = portfolios.filter(
    (p) => p.portfolio_status?.status_name === "Approved"
  ).length;
  const pendingCount = portfolios.filter(
    (p) => p.portfolio_status?.status_name === "Pending"
  ).length;
  const rejectedCount = portfolios.filter(
    (p) => p.portfolio_status?.status_name === "Rejected"
  ).length;

  const filteredList = portfolios.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.title?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.porttype?.toLowerCase().includes(term);

    if (activeTab === "All") return matchesSearch;
    return matchesSearch && item.portfolio_status?.status_name === activeTab;
  });

  const handleApprove = async () => {
    if (!approveConfirm) return;

    const id = approveConfirm;
    setApproveConfirm(null);
    setProcessingId(id);

    try {
      const res = await UpdatePortfolioStatus(id, 2, "");
      if (res.status === 200) {
        toast.success("อนุมัติผลงานเรียบร้อยแล้ว");
        setPortfolios((prev) =>
          prev.map((p) =>
            p.ID === id
              ? {
                  ...p,
                  portfolio_status_id: 2,
                  portfolio_status: {
                    ...p.portfolio_status!,
                    status_name: "Approved",
                  },
                }
              : p
          )
        );
      } else {
        toast.error("เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เชื่อมต่อล้มเหลว");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectConfirm || !rejectReason.trim()) return;

    const id = rejectConfirm;
    const reason = rejectReason.trim();

    setRejectConfirm(null);
    setRejectReason("");
    setProcessingId(id);

    try {
      const res = await UpdatePortfolioStatus(id, 3, reason);
      if (res.status === 200) {
        toast.success("ปฏิเสธผลงานเรียบร้อยแล้ว");
        setPortfolios((prev) =>
          prev.map((p) =>
            p.ID === id
              ? {
                  ...p,
                  portfolio_status_id: 3,
                  portfolio_status: {
                    ...p.portfolio_status!,
                    status_name: "Rejected",
                  },
                  admin_comment: reason,
                }
              : p
          )
        );
      } else {
        toast.error("เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เชื่อมต่อล้มเหลว");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 md:p-10 font-sans bg-white min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          title="ผลงานทั้งหมด"
          count={total}
          onClick={() => setActiveTab("All")}
          active={activeTab === "All"}
        />
        <StatCard
          title="ผลงานอนุมัติแล้ว"
          count={approvedCount}
          onClick={() => setActiveTab("Approved")}
          active={activeTab === "Approved"}
        />
        <StatCard
          title="ผลงานรออนุมัติ"
          count={pendingCount}
          onClick={() => setActiveTab("Pending")}
          active={activeTab === "Pending"}
        />
        <StatCard
          title="ผลงานไม่อนุมัติ"
          count={rejectedCount}
          onClick={() => setActiveTab("Rejected")}
          active={activeTab === "Rejected"}
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-800">
            {activeTab === "Pending"
              ? "ผลงานรอการอนุมัติ"
              : activeTab === "Approved"
              ? "ผลงานที่อนุมัติแล้ว"
              : activeTab === "Rejected"
              ? "ผลงานที่ไม่อนุมัติ"
              : "รายการผลงานทั้งหมด"}
          </h2>
          <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            {filteredList.length} รายการ
          </span>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="ค้นหาชื่อ, ประเภท หรือรายละเอียด..."
            className="pl-10 rounded-full border-slate-200 bg-white shadow-sm focus:border-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 text-slate-400">กำลังโหลด...</div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed rounded-xl text-slate-400">
            ไม่มีข้อมูลในสถานะนี้
          </div>
        ) : (
          filteredList.map((item) => (
            <Card
              key={item.ID}
              className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl transition-all hover:shadow-md"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-64 h-48 md:h-auto bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center relative">
                  {item.file_urls ? (
                    <img
                      src={formatBase64ToDataURL(item.file_urls)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="size-10 text-slate-300" />
                  )}
                  <div
                    className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded shadow-sm ${
                      item.portfolio_status?.status_name === "Approved"
                        ? "bg-green-100 text-green-700"
                        : item.portfolio_status?.status_name === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {getStatusLabel(item.portfolio_status?.status_name)}
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {item.title}
                      </h3>
                      <span className="text-xs text-slate-400">
                        ID: {item.ID}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-3">
                      {item.description}
                    </p>

                    {item.portfolio_status?.status_name === "Rejected" &&
                      item.admin_comment && (
                        <div className="bg-red-50 text-red-700 text-xs p-2 rounded border border-red-100 mb-3">
                          <b>เหตุผล:</b> {item.admin_comment}
                        </div>
                      )}

                    <div className="flex items-center gap-2">
                      <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-medium">
                        {item.porttype || "General"}
                      </span>
                      <span className="text-xs text-slate-400">
                        SUT ID: {item.user?.sut_id ?? "-"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-50">
                    <Button
                      variant="outline"
                      className="h-9 px-3"
                      onClick={() => navigate(`/admin/portfolio/${item.ID}`)}
                    >
                      <Eye className="size-4 mr-2" /> รายละเอียด
                    </Button>

                    {(activeTab === "Pending" || activeTab === "All") &&
                      item.portfolio_status?.status_name === "Pending" && (
                        <>
                          <Button
                            className="bg-red-500 hover:bg-red-600 text-white border-transparent h-9 px-3"
                            onClick={() => {
                              setRejectConfirm(Number(item.ID));
                              setRejectReason("");
                            }}
                            disabled={processingId === item.ID}
                          >
                            <X className="size-4 mr-2" /> ไม่อนุมัติ
                          </Button>
                          <Button
                            className="bg-black hover:bg-gray-800 text-white border-transparent h-9 px-3"
                            onClick={() => setApproveConfirm(Number(item.ID))}
                            disabled={processingId === item.ID}
                          >
                            <Check className="size-4 mr-2" /> อนุมัติ
                          </Button>
                        </>
                      )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Approve Confirmation Dialog */}
      <AlertDialog
        open={!!approveConfirm}
        onOpenChange={() => setApproveConfirm(null)}
      >
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
      <AlertDialog
        open={!!rejectConfirm}
        onOpenChange={() => {
          setRejectConfirm(null);
          setRejectReason("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ไม่อนุมัติผลงาน</AlertDialogTitle>
            <AlertDialogDescription>
              กรุณาระบุเหตุผลในการไม่อนุมัติผลงานนี้
              <br />
              <br />
              <span className="text-orange-600">
                หมายเหตุ: เหตุผลนี้จะถูกส่งไปยังผู้ส่งผลงานเพื่อปรับปรุง
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="ระบุเหตุผลในการไม่อนุมัติ..."
              className="resize-none min-h-[100px]"
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ไม่อนุมัติผลงาน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
