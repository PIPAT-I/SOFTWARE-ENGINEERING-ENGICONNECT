import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FolderOpen, ArrowLeft, Search } from "lucide-react";
import {
  GetPortfoliosByUserId,
  formatBase64ToDataURL,
} from "@/services/portfolioService";
import { getUserProfile } from "@/services/profileService";
import type { PortfolioInterface } from "@/interfaces/portfolio";
import type { User } from "@/interfaces/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function OtherStudentPortfolio() {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>();
  const [portfolios, setPortfolios] = useState<PortfolioInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [targetUser, setTargetUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId) return;
      setLoading(true);
      try {
        const profileRes = await getUserProfile(studentId);
        const resAny: any = profileRes;
        if (resAny?.error || !resAny?.data) {
          console.error("User not found");
          setLoading(false);
          return;
        }
        setTargetUser(resAny.data);
        const userId = resAny.data.id;

        if (userId) {
          const res = await GetPortfoliosByUserId(userId);
          if (res.status === 200) {
            const data = res.data.data || res.data || [];
            if (Array.isArray(data)) {
              const approvedData = data.filter(
                (p: PortfolioInterface) =>
                  p.portfolio_status?.status_name === "Approved"
              );

              const sortedData = approvedData.sort(
                (a: PortfolioInterface, b: PortfolioInterface) =>
                  new Date(b.CreatedAt || 0).getTime() -
                  new Date(a.CreatedAt || 0).getTime()
              );
              setPortfolios(sortedData);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const searchedList = portfolios.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.title?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.porttype?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white gap-3">
        <Spinner className="size-8 text-slate-600" />
        <p className="text-slate-600 text-sm">กำลังโหลดข้อมูลผลงาน...</p>
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white gap-4">
        <p className="text-red-600 font-medium">ไม่พบข้อมูลผู้ใช้นี้</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          ย้อนกลับ
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/student/profile-skill/${studentId}`)}
                className="text-slate-500 hover:text-slate-900"
              >
                <ArrowLeft className="size-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  ผลงานของ {targetUser.first_name} {targetUser.last_name}
                </h1>
                <p className="text-xs text-slate-500">@{targetUser.sut_id}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end mb-8">
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

        {searchedList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
              <FolderOpen className="size-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">
              ไม่พบผลงานที่เผยแพร่
            </h3>
            <p className="text-slate-500">
              ผู้ใช้นี้ยังไม่มีผลงานที่ได้รับการอนุมัติ หรือตรงกับคำค้นหา
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchedList.map((item) => (
              <Card
                key={item.ID}
                onClick={() =>
                  navigate(
                    `/student/profile-skill/${studentId}/portfolio/${item.ID}`
                  )
                }
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
