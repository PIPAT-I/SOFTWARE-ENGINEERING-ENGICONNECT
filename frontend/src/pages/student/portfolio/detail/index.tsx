import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Trash2,
  Edit,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  GetPortfolioById,
  DeletePortfolio,
  formatBase64ToDataURL,
} from "@/services/portfolioService";
import type { PortfolioInterface } from "@/interfaces/portfolio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

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

function PortfolioDetail() {
  const { id, studentId } = useParams<{ id: string; studentId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await GetPortfolioById(Number(id));
        if (res.status === 200) {
          const data = res.data.data || res.data;
          if (data) setPortfolio(data);
          else {
            toast.error("ไม่พบข้อมูล");
            if (studentId) {
              navigate(`/student/profile-skill/${studentId}/portfolio`);
            } else {
              navigate("/student/portfolio");
            }
          }
        } else {
          if (studentId) {
            navigate(`/student/profile-skill/${studentId}/portfolio`);
          } else {
            navigate("/student/portfolio");
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!id || !window.confirm("ยืนยันการลบผลงานนี้?")) return;
    const res = await DeletePortfolio(Number(id));
    if (res.status === 200) {
      toast.success("ลบเรียบร้อยแล้ว");
      if (studentId) {
        navigate(`/student/profile-skill/${studentId}/portfolio`);
      } else {
        navigate("/student/portfolio");
      }
    } else {
      toast.error("เกิดข้อผิดพลาดในการลบ");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-slate-400">
        กำลังโหลด...
      </div>
    );
  if (!portfolio) return null;

  const isApproved = portfolio.portfolio_status?.status_name === "Approved";
  const isRejected = portfolio.portfolio_status?.status_name === "Rejected";
  const isPending = portfolio.portfolio_status?.status_name === "Pending";
  const isOwner = user?.id === portfolio.user_id;
  const canEdit = isPending && isOwner;

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => {
                if (studentId) {
                  navigate(`/student/profile-skill/${studentId}/portfolio`);
                } else {
                  navigate("/student/portfolio");
                }
              }}
              className="text-slate-600"
            >
              <ArrowLeft className="size-5" />
            </Button>

            <div className="flex gap-2">
              {canEdit && (
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  onClick={() => navigate(`/student/portfolio/edit/${id}`)}
                >
                  <Edit className="size-4 mr-2" /> แก้ไข
                </Button>
              )}

              {isOwner && (
                <Button
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 border-red-200"
                  onClick={handleDelete}
                >
                  <Trash2 className="size-4 mr-2" /> ลบ
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-white">
          {portfolio.file_urls ? (
            <img
              src={formatBase64ToDataURL(portfolio.file_urls)}
              alt={portfolio.title}
              className="w-full h-[400px] md:h-[500px] object-cover object-center cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setIsImageModalOpen(true)}
            />
          ) : (
            <div className="w-full h-64 bg-slate-100 flex items-center justify-center text-slate-400">
              ไม่มีรูปภาพประกอบ
            </div>
          )}
        </div>

        {(portfolio.admin_comment || isRejected) && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="size-5 text-orange-600 shrink-0" />
            <div>
              <h4 className="font-semibold text-orange-900">Admin Comment:</h4>
              <p className="text-orange-800 text-sm">
                {portfolio.admin_comment || "ไม่ผ่านการอนุมัติ"}
              </p>
            </div>
          </div>
        )}
        {isApproved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-800 font-medium">
            <CheckCircle2 className="size-5 text-green-600" />{" "}
            ผลงานนี้ได้รับการอนุมัติแล้ว
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge
                  variant="secondary"
                  className="bg-slate-200 text-slate-700"
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
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                {portfolio.title}
              </h1>

              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-lg">
                <p className="whitespace-pre-line">{portfolio.description}</p>
              </div>
            </div>

            {portfolio.link_portfolio && (
              <a
                href={portfolio.link_portfolio}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-slate-700 bg-slate-100 p-4 rounded-xl hover:bg-slate-200 transition-colors border border-slate-200"
              >
                <ExternalLink className="size-5" />
                <span className="font-medium truncate">
                  {portfolio.link_portfolio}
                </span>
              </a>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 bg-white border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                ข้อมูลเพิ่มเติม
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="block text-slate-500 mb-1">วันที่สร้าง</span>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <Calendar className="size-4 text-slate-400" />
                    {new Date(
                      portfolio.CreatedAt || portfolio.CreatedAt || new Date()
                    ).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div>
                  <span className="block text-slate-500 mb-1">
                    ชื่อเจ้าของผลงาน
                  </span>
                  <div className="text-slate-900 font-medium">
                    {portfolio.user?.first_name && portfolio.user?.last_name
                      ? `${portfolio.user.first_name} ${portfolio.user.last_name}`
                      : "-"}
                  </div>
                </div>
                <div>
                  <span className="block text-slate-500 mb-1">
                    รหัสนักศึกษา
                  </span>
                  <div className="text-slate-900 font-medium">
                    {portfolio.user?.sut_id ?? "-"}
                  </div>
                </div>
              </div>
            </Card>
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
            alt={portfolio.title}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default PortfolioDetail;
