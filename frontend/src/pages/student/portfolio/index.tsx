import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  FolderOpen,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  GetPortfoliosByUserId,
  formatBase64ToDataURL,
} from "@/services/portfolioService";
import type { PortfolioInterface } from "@/interfaces/portfolio";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const CountBadge = ({ count }: { count: number; color?: string }) =>
  count > 0 ? (
    <span className="ml-2 text-sm text-slate-500">{count}</span>
  ) : null;

const getStatusLabel = (status?: string) => {
  switch (status) {
    case "Pending":
      return "รอการอนุมัติ";
    case "Approved":
      return "อนุมัติ";
    case "Rejected":
      return "ไม่อนุมัติ";
    default:
      return status || "Unknown";
  }
};

function PortfolioList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<PortfolioInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("Approved");
  const currentUserId = user ? Number(user.id) : null;
  const fetchPortfolios = async () => {
    if (!currentUserId) return;

    setLoading(true);
    try {
      const res = await GetPortfoliosByUserId(currentUserId);
      if (res.status === 200) {
        const data = res.data.data || res.data || [];
        if (Array.isArray(data)) {
          const sortedData = [...data].sort(
            (a, b) =>
              new Date(b.CreatedAt || 0).getTime() -
              new Date(a.CreatedAt || 0).getTime()
          );
          setPortfolios(sortedData);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (currentUserId) {
      fetchPortfolios();
    }
  }, [currentUserId]);

  const searchedList = portfolios.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.title?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.porttype?.toLowerCase().includes(term)
    );
  });

  const filteredPortfolios = searchedList.filter(
    (item) => item.portfolio_status?.status_name === activeTab
  );

  const pendingCount = searchedList.filter(
    (p) => p.portfolio_status?.status_name === "Pending"
  ).length;
  const rejectedCount = searchedList.filter(
    (p) => p.portfolio_status?.status_name === "Rejected"
  ).length;
  const approvedCount = searchedList.filter(
    (p) => p.portfolio_status?.status_name === "Approved"
  ).length;

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-slate-900">
              คลังผลงานของฉัน
            </h1>
            <Button
              onClick={() => navigate("/student/portfolio/create")}
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="size-4 mr-2" /> สร้างผลงานใหม่
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex gap-1 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("Approved")}
              className={`flex-1 md:flex-none flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "Approved"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-700"
              }`}
            >
              <CheckCircle2 className="size-4 mr-2" />
              อนุมัติแล้ว{" "}
              <CountBadge
                count={approvedCount}
                color="bg-slate-200 text-slate-800"
              />
            </button>

            <button
              onClick={() => setActiveTab("Pending")}
              className={`flex-1 md:flex-none flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "Pending"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-700"
              }`}
            >
              <Clock className="size-4 mr-2" />
              รอตรวจสอบ{" "}
              <CountBadge
                count={pendingCount}
                color="bg-slate-200 text-slate-800"
              />
            </button>

            <button
              onClick={() => setActiveTab("Rejected")}
              className={`flex-1 md:flex-none flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "Rejected"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-700"
              }`}
            >
              <XCircle className="size-4 mr-2" />
              ไม่อนุมัติ{" "}
              <CountBadge
                count={rejectedCount}
                color="bg-slate-200 text-slate-800"
              />
            </button>
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

        {loading ? (
          <div className="flex justify-center items-center h-64 text-slate-400">
            กำลังโหลดข้อมูล...
          </div>
        ) : filteredPortfolios.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
              <FolderOpen className="size-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">
              ไม่มีรายการในสถานะ {activeTab}
            </h3>
            {activeTab === "Approved" && (
              <p className="text-slate-500">
                ผลงานที่อนุมัติแล้วจะมาแสดงที่นี่
              </p>
            )}
            {activeTab === "Pending" && (
              <p className="text-slate-500">ยังไม่มีงานที่รอตรวจสอบ</p>
            )}
            {activeTab === "Rejected" && (
              <p className="text-slate-500">
                ไม่มีงานที่ถูกไม่อนุมัติ เยี่ยมมาก!
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPortfolios.map((item) => (
              <Card
                key={item.ID}
                onClick={() => navigate(`/student/portfolio/${item.ID}`)}
                className="group cursor-pointer overflow-hidden border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white"
              >
                <div className="h-48 bg-slate-100 overflow-hidden relative flex items-center justify-center">
                  {item.file_urls ? (
                    <img
                      src={formatBase64ToDataURL(item.file_urls)}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <FolderOpen className="size-10 text-slate-300 opacity-50" />
                  )}

                  <div
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm backdrop-blur-md
                    ${
                      item.portfolio_status?.status_name === "Approved"
                        ? "bg-green-100/90 text-green-700 border-green-200"
                        : item.portfolio_status?.status_name === "Rejected"
                        ? "bg-red-100/90 text-red-700 border-red-200"
                        : "bg-yellow-100/90 text-yellow-700 border-yellow-200"
                    }
                  `}
                  >
                    {getStatusLabel(item.portfolio_status?.status_name)}
                  </div>
                </div>

                <div className="p-5">
                  <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
                    {item.porttype || "General"}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-slate-900 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-2 h-10 mb-4">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                    <span className="text-xs text-slate-400">
                      คลิกเพื่อดูรายละเอียด
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default PortfolioList;
