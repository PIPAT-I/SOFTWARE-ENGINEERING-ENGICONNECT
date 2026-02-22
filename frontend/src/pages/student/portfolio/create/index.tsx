import React, { useState } from "react";
import {
  ArrowLeft,
  Upload as UploadIcon,
  X,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  CreatePortfolio as CreatePortfolioAPI,
  convertFileToBase64,
} from "@/services/portfolioService";
import type { PortfolioInterface } from "../../../../interfaces/portfolio";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function CreatePortfolio() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    try {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    const fileInput = document.getElementById(
      "cover-upload"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const onSubmit = async () => {
    if (!projectName.trim()) {
      toast.error("กรุณากรอกชื่อผลงาน");
      return;
    }
    if (!description.trim()) {
      toast.error("กรุณากรอกรายละเอียดผลงาน");
      return;
    }
    if (!projectType) {
      toast.error("กรุณาเลือกประเภทผลงาน");
      return;
    }
    if (!coverFile) {
      toast.error("กรุณาเพิ่มรูปภาพ");
      return;
    }
    if (!user || !user.id) {
      toast.error("ไม่พบข้อมูลผู้ใช้งาน กรุณาล็อกอินใหม่");
      return;
    }

    setIsLoading(true);

    try {
      let coverBase64 = "";
      if (coverFile) {
        coverBase64 = await convertFileToBase64(coverFile);
      }
      const payload: PortfolioInterface = {
        title: projectName.trim(),
        description: description.trim(),
        porttype: projectType,
        link_portfolio: projectLink,
        file_urls: coverBase64,
        user_id: Number(user.id),
        portfolio_status_id: 1,
        ID: undefined,
        user: undefined,
      };

      console.log("Sending Payload:", payload);
      const res = await CreatePortfolioAPI(payload);

      if (res.status === 201 || res.status === 200) {
        toast.success("สร้างผลงานสำเร็จ!");
        navigate("/student/portfolio");
      } else {
        const errorMsg =
          res.data?.error || res.data?.message || "เกิดข้อผิดพลาดในการบันทึก";
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error("Error:", error);
      const backendError = error.response?.data?.error;
      if (backendError) {
        toast.error(`${backendError}`);
      } else if (error.message?.includes("Duplicate")) {
        toast.error("ชื่อผลงานนี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น");
      } else if (
        error.message?.includes("too long") ||
        error.message?.includes("payload")
      ) {
        toast.error("ไฟล์รูปภาพมีขนาดใหญ่เกินไป หรือข้อความยาวเกินกำหนด");
      } else {
        toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-slate-100 rounded-full"
              >
                <ArrowLeft className="size-5 text-slate-700" />
              </Button>
              <h1 className="text-xl font-bold text-slate-900">
                สร้างผลงานใหม่
              </h1>
            </div>

            {user && (
              <div className="text-sm text-slate-500 hidden sm:block">
                สร้างโดย:{" "}
                <span className="font-medium text-slate-900">
                  {user.sut_id || user.email}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <div className="pt-6">
            <div className="mb-8">
              <Label className="text-base font-semibold text-slate-900">
                รูปปกผลงาน <span className="text-red-500">*</span>
              </Label>
              <div className="mt-3">
                {!coverPreview ? (
                  <>
                    <label
                      htmlFor="cover-upload"
                      className="group flex flex-col items-center justify-center h-64 w-full border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-slate-900 hover:bg-slate-50 transition-all duration-200"
                    >
                      <div className="p-4 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors mb-3">
                        <ImageIcon className="size-8 text-slate-500 group-hover:text-slate-900" />
                      </div>
                      <p className="text-slate-900 font-medium">อัปโหลดรูปปก</p>
                      <p className="text-xs text-slate-500 mt-1">
                        JPG, PNG, GIF (Max 5MB)
                      </p>
                    </label>
                    <input
                      id="cover-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverChange}
                    />
                  </>
                ) : (
                  <div className="relative w-full">
                    <img
                      src={coverPreview}
                      alt="Cover Preview"
                      className="w-full h-80 object-cover rounded-2xl border border-slate-200 shadow-sm"
                    />

                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-red-50 text-red-600 rounded-full shadow-lg border border-red-100 transition-all"
                      title="ลบรูปภาพ"
                    >
                      <X className="size-5" />
                    </button>

                    <div className="absolute bottom-4 right-4">
                      <label
                        htmlFor="cover-upload-replace"
                        className="flex items-center gap-2 px-4 py-2 bg-primary/90 hover:bg-primary text-white rounded-full cursor-pointer shadow-lg backdrop-blur-sm transition-all"
                      >
                        <UploadIcon className="size-4" />
                        <span className="text-sm font-medium">เปลี่ยนรูป</span>
                      </label>
                      <input
                        id="cover-upload-replace"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverChange}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="projectName">
                    ชื่อผลงาน <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="projectName"
                    placeholder="เช่น ออกแบบ UX/UI แอปพลิเคชัน"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-white focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectType">
                    ประเภทผลงาน <span className="text-red-500">*</span>
                  </Label>
                  <Select value={projectType} onValueChange={setProjectType}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white focus:ring-slate-900">
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
                <Label htmlFor="projectLink">ลิงก์ผลงาน (ถ้ามี)</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3.5 size-4 text-slate-400" />
                  <Input
                    id="projectLink"
                    placeholder="https://github.com/..."
                    value={projectLink}
                    onChange={(e) => setProjectLink(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-white pl-10 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  รายละเอียด <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="description"
                  rows={6}
                  className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all resize-none"
                  placeholder="อธิบายเกี่ยวกับผลงานของคุณ เครื่องมือที่ใช้ หรือสิ่งที่ได้เรียนรู้..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isLoading}
                className="rounded-xl px-6 h-11 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              >
                ยกเลิก
              </Button>

              <Button
                onClick={onSubmit}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-11 shadow-lg shadow-primary/20"
              >
                {isLoading ? "กำลังบันทึก..." : "ยืนยันการสร้าง"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreatePortfolio;
