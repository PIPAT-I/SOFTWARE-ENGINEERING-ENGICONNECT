import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Upload as UploadIcon,
  Plus,
  X,
  MapPin,
  CheckCircle2,
  Eye,
  Send,
  ArrowRight,
  Calendar,
  FileText,
  AlertCircle,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreatePost, convertFileToBase64 } from "@/services/postServices";
import { getLocations } from "@/services/metadataService";
import { type LocationInterface } from "@/interfaces/Location";
import { type CreatePostRequest } from "@/interfaces/post";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import "dayjs/locale/th";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert-dialog";

const PENDING_STATUS_ID = 1;
const TYPE_LABELS: Record<string, string> = {
  volunteer: "จิตอาสา",
  academic: "วิชาการ",
  sport: "กีฬา",
  cultural: "วัฒนธรรม",
  social: "สังคม",
  art: "ศิลปะ",
  culture: "วัฒนธรรม",
  other: "อื่นๆ",
};

function PostActivitiesComplete() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [type, setType] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
  const [registerStart, setRegisterStart] = useState<dayjs.Dayjs | null>(null);
  const [registerStop, setRegisterStop] = useState<dayjs.Dayjs | null>(null);
  const [locationID, setLocationID] = useState<number | null>(null);
  const [locationList, setLocationList] = useState<LocationInterface[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoadingLocations(true);
      try {
        const data = await getLocations();
        if (Array.isArray(data)) {
          setLocationList(data);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
        toast.error("ไม่สามารถโหลดข้อมูลสถานที่ได้");
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchLocations();
  }, []);

  const handlePosterChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error:", err);
      toast.error("เกิดข้อผิดพลาดในการอ่านไฟล์");
    }
  };

  const handleRemovePoster = () => {
    setPosterFile(null);
    setPosterPreview(null);
    const fileInput = document.getElementById("poster-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const formatLocationName = (loc: LocationInterface) => {
    const parts = [];
    if (loc.building) parts.push(`${loc.building}`);
    if (loc.location_detail) parts.push(loc.location_detail);
    return parts.length > 0 ? parts.join(" - ") : `สถานที่ #${loc.ID}`;
  };

  const getLocationName = (locationId: number) => {
    const location = locationList.find((loc) => loc.ID === locationId);
    return location ? formatLocationName(location) : "ไม่ระบุ";
  };

  const formatDate = (date: dayjs.Dayjs | null) => {
    if (!date) return "-";
    return date.locale("th").format("D MMMM YYYY");
  };

  const handleNext = () => {
  if (!name.trim()) {
    toast.error("กรุณากรอกชื่อกิจกรรม");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  if (!detail.trim()) {
    toast.error("กรุณากรอกรายละเอียดกิจกรรม");
    return;
  }
  if (!startDate) {
    toast.error("กรุณาเลือกวันเริ่มกิจกรรม");
    return;
  }
  if (!endDate) {
    toast.error("กรุณาเลือกวันสิ้นสุดกิจกรรม");
    return;
  }
  if (!registerStart) {
    toast.error("กรุณาเลือกวันเริ่มลงทะเบียน");
    return;
  }
  if (!registerStop) {
    toast.error("กรุณาเลือกวันสิ้นสุดลงทะเบียน");
    return;
  }
  if (!type) {
    toast.error("กรุณาเลือกประเภทกิจกรรม");
    return;
  }
  if (!locationID) {
    toast.error("กรุณาเลือกสถานที่จัดกิจกรรม");
    return;
  }

  if (startDate && endDate) {
    if (endDate.isBefore(startDate)) {
      toast.error("วันสิ้นสุดกิจกรรมต้องมาหลังวันเริ่มต้น");
      return;
    }
  }

  if (registerStart && registerStop) {
    if (registerStop.isBefore(registerStart)) {
      toast.error("วันสิ้นสุดลงทะเบียนต้องมาหลังวันเริ่ม");
      return;
    }
  }

  setCurrentStep(1);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      let pictureStr = "";
      if (posterFile) {
        pictureStr = await convertFileToBase64(posterFile);
      }

      const payload: CreatePostRequest = {
        title: name.trim(),
        detail: detail.trim(),
        start_date: startDate ? startDate.toISOString() : "",
        stop_date: endDate ? endDate.toISOString() : "",
        start: registerStart ? registerStart.toISOString() : "",  
        stop: registerStop ? registerStop.toISOString() : "",     
        organizer: organizer.trim() || "ไม่ระบุ",
        type: type,
        picture: pictureStr,
        user_id: user?.id || 0,
        status_id: PENDING_STATUS_ID,
        location_id: locationID ? Number(locationID) : undefined,
      };

      console.log("Creating post with payload:", payload);
      const res = await CreatePost(payload);

      if (res && (res.status === 200 || res.status === 201)) {
        console.log("สร้างโพสต์กิจกรรมสำเร็จ!");
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error(`บันทึกไม่สำเร็จ: ${res?.data?.error || "ข้อมูลไม่ถูกต้อง"}`);
      }
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "เกิดข้อผิดพลาด";
      toast.error(`เกิดข้อผิดพลาด: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinish = () => {
    navigate("/student/activity/status_activity");
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-8">
      {[
        { num: 1, label: "กรอกข้อมูล", icon: FileText },
        { num: 2, label: "ตรวจสอบ", icon: Eye },
        { num: 3, label: "เสร็จสิ้น", icon: CheckCircle2 },
      ].map((step, idx) => (
        <React.Fragment key={step.num}>
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                currentStep >= idx
                  ? "bg-gradient-to-r from-slate-900 to-gray-900 text-white shadow-lg"
                  : "bg-slate-200 text-slate-400"
              }`}
            >
              <step.icon className="size-6" />
            </div>
            <span
              className={`text-xs font-medium ${
                currentStep >= idx ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < 2 && (
            <div
              className={`h-1 w-16 rounded transition-all ${
                currentStep > idx ? "bg-slate-600" : "bg-slate-200"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white from-slate-50 via-slate-50 to-indigo-50"> 
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-slate-100 rounded-xl"
                disabled={isLoading}
              >
                <ArrowLeft className="size-5" />
              </Button>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  สร้างโพสต์กิจกรรม
                </h1>
                <p className="text-sm text-slate-500">
                  กรอกข้อมูลและส่งเพื่อรอการอนุมัติ
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-xl border-slate-200">
          <CardContent className="p-8">
            <StepIndicator />

            {/* Step 1: Input Form */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <Alert className="bg-slate-50 border-slate-200">
                  <Info className="size-4 text-slate-600" />
                  <AlertDescription className="text-slate-800">
                    กรุณากรอกข้อมูลกิจกรรมให้ครบถ้วน
                    ข้อมูลทั้งหมดจะถูกส่งไปยังผู้ดูแลระบบเพื่อพิจารณาอนุมัติ
                  </AlertDescription>
                </Alert>

                {/* Poster Upload */}
                <Card className="border-dashed border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <UploadIcon className="size-5 text-blue-600" />
                      รูปโปสเตอร์กิจกรรม
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!posterPreview ? (
                      <>
                        <label
                          htmlFor="poster-upload"
                          className="flex flex-col items-center justify-center h-64 w-full border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-slate-400 hover:bg-slate-50/50 transition-all group"
                        >
                          <div className="p-4 bg-slate-100 rounded-full mb-3 group-hover:scale-110 transition-transform">
                            <Plus className="size-8 text-slate-600" />
                          </div>
                          <p className="text-slate-700 font-semibold">
                            อัปโหลดรูปโปสเตอร์
                          </p>
                          <p className="text-sm text-slate-500 mt-2">
                            รองรับ JPG, PNG, GIF • ไม่เกิน 5MB
                          </p>
                        </label>
                        <input
                          id="poster-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePosterChange}
                        />
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative w-full">
                          <img
                            src={posterPreview}
                            alt="Poster Preview"
                            className="w-full h-96 object-cover rounded-2xl border-2 border-slate-200 shadow-md"
                          />
                          <button
                            type="button"
                            onClick={handleRemovePoster}
                            className="absolute top-3 right-3 p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg transition-all hover:scale-110"
                          >
                            <X className="size-5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {posterFile?.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {((posterFile?.size || 0) / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <label htmlFor="poster-upload-replace">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <span className="cursor-pointer">
                                <Plus className="size-4 mr-2" />
                                เปลี่ยนรูป
                              </span>
                            </Button>
                          </label>
                          <input
                            id="poster-upload-replace"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePosterChange}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg"> ข้อมูลพื้นฐาน</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          ชื่อกิจกรรม <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder="เช่น กิจกรรมวันกีฬาสี 2025"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type">
                          ประเภทกิจกรรม <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="type"
                          placeholder="วิชาการ, กีฬา, สังคม"
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organizer">ผู้จัดกิจกรรม</Label>
                      <Input
                        id="organizer"
                        placeholder="ระบุผู้จัดกิจกรรม (ถ้ามี)"
                        value={organizer}
                        onChange={(e) => setOrganizer(e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="detail">
                        รายละเอียดกิจกรรม <span className="text-red-500">*</span>
                      </Label>
                      <textarea
                        id="detail"
                        rows={5}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        placeholder="อธิบายรายละเอียดกิจกรรม เช่น กำหนดการ กิจกรรมย่อย ฯลฯ"
                        value={detail}
                        onChange={(e) => setDetail(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Date & Time - กิจกรรม */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="size-5 text-blue-600" />
                      วันที่จัดกิจกรรม
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="start-date">
                          วันเริ่มกิจกรรม <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="start-date"
                          type="datetime-local"
                          value={startDate ? startDate.format("YYYY-MM-DDTHH:mm") : ""}
                          onChange={(e) =>
                            setStartDate(
                              e.target.value ? dayjs(e.target.value) : null
                            )
                          }
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-date">
                          วันสิ้นสุดกิจกรรม <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="end-date"
                          type="datetime-local"
                          value={endDate ? endDate.format("YYYY-MM-DDTHH:mm") : ""}
                          onChange={(e) =>
                            setEndDate(
                              e.target.value ? dayjs(e.target.value) : null
                            )
                          }
                          min={startDate ? startDate.format("YYYY-MM-DDTHH:mm") : ""}
                          className="h-11"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card ลงทะเบียน */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="size-5 text-green-600" />
                      ช่วงเวลาเปิดลงทะเบียน
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="register-start">
                          วันเริ่มลงทะเบียน <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="register-start"
                          type="datetime-local"
                          value={
                            registerStart ? registerStart.format("YYYY-MM-DDTHH:mm") : ""
                          }
                          onChange={(e) =>
                            setRegisterStart(
                              e.target.value ? dayjs(e.target.value) : null
                            )
                          }
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-stop">
                          วันสิ้นสุดลงทะเบียน{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="register-stop"
                          type="datetime-local"
                          value={
                            registerStop ? registerStop.format("YYYY-MM-DDTHH:mm") : ""
                          }
                          onChange={(e) =>
                            setRegisterStop(
                              e.target.value ? dayjs(e.target.value) : null
                            )
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="size-5 text-red-500" />
                      สถานที่จัดกิจกรรม
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="location">
                        เลือกสถานที่ <span className="text-red-500">*</span>
                      </Label>
                      {loadingLocations ? (
                        <div className="h-11 flex items-center justify-center border rounded-lg bg-slate-50">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-slate-600"></div>
                            กำลังโหลดสถานที่...
                          </div>
                        </div>
                      ) : (
                        <select
                          value={locationID?.toString() || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLocationID(val ? Number(val) : null);
                          }}
                          className="w-full h-11 rounded-xl border px-4 bg-white"
                        >
                          <option value="">เลือกสถานที่</option>
                          {locationList.map((loc) => (
                            <option key={loc.ID} value={loc.ID}>
                              {formatLocationName(loc)}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Separator className="my-8" />

                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate(-1)}
                    className="px-8"
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleNext}
                    className="from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-12 shadow-lg"
                  >
                    ถัดไป
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="size-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    กรุณาตรวจสอบความถูกต้องของข้อมูลทั้งหมดก่อนกดส่ง
                    หากพบข้อผิดพลาดสามารถย้อนกลับไปแก้ไขได้
                  </AlertDescription>
                </Alert>

                {posterPreview && (
                  <div className="flex justify-center">
                    <div className="relative">
                      <img
                        src={posterPreview}
                        alt="โปสเตอร์กิจกรรม"
                        className="max-w-md w-full h-auto rounded-2xl shadow-xl border-4 border-white"
                      />
                      <Badge className="absolute top-4 right-4 bg-green-500">
                        <CheckCircle2 className="size-3 mr-1" />
                        มีรูปภาพ
                      </Badge>
                    </div>
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">ข้อมูลกิจกรรม</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-500 text-sm">
                          ชื่อกิจกรรม
                        </Label>
                        <p className="font-semibold text-slate-600 mt-1">
                          {name || "-"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-slate-500 text-sm">
                          ประเภทกิจกรรม
                        </Label>
                        <p className="mt-1">
                          {type ? (
                            <Badge className="text-sm">
                              {[type]} {TYPE_LABELS[type]}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-slate-500 text-sm">
                        ผู้จัดกิจกรรม
                      </Label>
                      <p className="mt-1">{organizer || "-"}</p>
                    </div>

                    <div>
                      <Label className="text-slate-500 text-sm">
                        รายละเอียด
                      </Label>
                      <p className="mt-1 whitespace-pre-wrap">
                        {detail || "-"}
                      </p>
                    </div>

                    <Separator />

                    {/* แสดงวันที่ใช้ formatDate */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-blue-500 text-sm">
                          วันที่จัดกิจกรรม
                        </Label>
                        <p className="mt-1">
                          {startDate && endDate
                            ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-slate-500 text-sm">
                          ช่วงเวลาลงทะเบียน
                        </Label>
                        <p className="mt-1 text-green-700 font-medium">
                          {registerStart && registerStop
                            ? `${formatDate(registerStart)} - ${formatDate(
                                registerStop
                              )}`
                            : "-"}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-slate-500 text-sm">สถานที่</Label>
                      <p className="mt-1 flex items-center gap-2">
                        <MapPin className="size-4 text-red-500" />
                        {locationID ? getLocationName(locationID) : "-"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Separator className="my-8" />

                <div className="flex justify-between gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleBack}
                    className="px-8"
                  >
                    <ArrowLeft className="size-4 mr-2" />
                    ย้อนกลับ
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="-to-r from-slate-600 hover:from-slate-700 hover:to-emerald-700 text-white px-12 "
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        กำลังส่ง...
                      </>
                    ) : (
                      <>
                        ส่งข้อมูล
                        <Send className="size-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {currentStep === 2 && (
              <div className="text-center py-12">
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                      <CheckCircle2 className="size-14 text-white" />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold text-slate-600 mb-2">
                      ส่งข้อมูลสำเร็จ!
                    </h2>
                    <p className="text-slate-600">
                      โพสต์กิจกรรมของคุณถูกส่งเรียบร้อยแล้ว
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <Badge
                      variant="outline"
                      className="text-lg px-6 py-2 border-amber-300 bg-amber-50"
                    >
                       สถานะ: รออนุมัติ
                    </Badge>
                  </div>

                  <div className="pt-4">
                    <Button
                      size="lg"
                      onClick={handleFinish}
                      className="from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-16 py-6 text-lg shadow-xl"
                    >
                      กลับหน้ากิจกรรม
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default PostActivitiesComplete;