import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Upload,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  GetPortfolioById,
  UpdatePortfolio,
  formatBase64ToDataURL,
  convertFileToBase64,
} from "@/services/portfolioService";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PortfolioEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link_portfolio: "",
    file_urls: "",
    porttype: "",
    user_id: 0,
    portfolio_status_id: 1,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await GetPortfolioById(Number(id));
        if (res.status === 200) {
          const data = res.data.data || res.data;
          if (
            user &&
            data.user_id &&
            Number(data.user_id) !== Number(user.id)
          ) {
            toast.error("คุณไม่มีสิทธิ์แก้ไขผลงานนี้");
            navigate("/student/portfolio");
            return;
          }
          setFormData({
            title: data.title || "",
            description: data.description || "",
            link_portfolio: data.link_portfolio || "",
            file_urls: data.file_urls || "",
            porttype: data.porttype || "",
            user_id: data.user_id,
            portfolio_status_id: data.portfolio_status_id || 1,
          });

          if (data.file_urls) {
            setPreviewImage(formatBase64ToDataURL(data.file_urls));
          }
        } else {
          toast.error("ไม่พบข้อมูลผลงาน");
          navigate("/student/portfolio");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
        navigate("/student/portfolio");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, user]);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      try {
        const base64 = await convertFileToBase64(file);
        setFormData((prev) => ({ ...prev, file_urls: base64 }));
      } catch (error) {
        toast.error("อัปโหลดรูปไม่สำเร็จ");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!formData.title.trim()) {
      toast.error("กรุณากรอกชื่อผลงาน");
      return;
    }
    if (!formData.porttype) {
      toast.error("กรุณาเลือกประเภทผลงาน");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        link_portfolio: formData.link_portfolio,
        file_urls: formData.file_urls,
        port_type: formData.porttype,
        user_id: formData.user_id,
        portfolio_status_id: formData.portfolio_status_id,
      };

      console.log("Updating Payload:", payload);

      const res = await UpdatePortfolio(Number(id), payload);

      if (res.status === 200) {
        toast.success("แก้ไขข้อมูลเรียบร้อยแล้ว!");
        navigate(`/student/portfolio/${id}`);
      } else {
        const errorMsg = res.data?.error || "บันทึกไม่สำเร็จ";
        if (errorMsg.includes("too long") || errorMsg.includes("payload")) {
          toast.error("รูปภาพมีขนาดใหญ่เกินไป กรุณาเลือกรูปใหม่");
        } else {
          toast.error(`บันทึกไม่สำเร็จ: ${errorMsg}`);
        }
      }
    } catch (error: any) {
      console.error(error);
      const backendError = error.response?.data?.error;
      if (backendError) {
        toast.error(`${backendError}`);
      } else {
        toast.error("เชื่อมต่อล้มเหลว");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-slate-500">
        กำลังโหลดข้อมูล...
      </div>
    );

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="bg-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-slate-600 -ml-2"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <h1 className="ml-4 text-lg font-bold text-slate-900">
              แก้ไขผลงาน
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>รูปปกผลงาน</Label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors relative overflow-hidden group h-64">
                  {previewImage ? (
                    <div className="relative w-full h-full">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <span className="text-white font-medium flex items-center">
                          <Upload className="size-4 mr-2" /> เปลี่ยนรูปภาพ
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon className="size-12 mx-auto mb-2 opacity-50" />
                      <p>คลิกเพื่ออัปโหลดรูปภาพ</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    ชื่อผลงาน <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="h-11 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    ประเภทผลงาน <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.porttype}
                    onValueChange={(val) =>
                      setFormData({ ...formData, porttype: val })
                    }
                  >
                    <SelectTrigger className="h-11 w-full border-slate-200 bg-white focus:ring-slate-900">
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Development">Development</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Data & AI">Data & AI</SelectItem>
                      <SelectItem value="IoT & Robotics">
                        IoT & Robotics
                      </SelectItem>
                      <SelectItem value="Research & Academic">
                        Research & Academic
                      </SelectItem>
                      <SelectItem value="Activities & Leadership">
                        Activities & Leadership
                      </SelectItem>
                      <SelectItem value="Other">อื่นๆ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">ลิงก์ผลงาน</Label>
                <Input
                  id="link"
                  value={formData.link_portfolio}
                  onChange={(e) =>
                    setFormData({ ...formData, link_portfolio: e.target.value })
                  }
                  className="h-11 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">
                  รายละเอียด <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="desc"
                  className="min-h-[150px] resize-y p-4 leading-relaxed bg-white placeholder:text-slate-400"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={submitting}
              className="h-11 px-6"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white min-w-[140px] h-11"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" /> กำลังบันทึก
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" /> บันทึกการแก้ไข
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
