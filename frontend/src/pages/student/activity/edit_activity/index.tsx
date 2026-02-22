import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Upload as UploadIcon,
  Plus,
  X,
  Calendar,
  MapPin,
  AlertCircle,
  Save,
  Loader2,
  Edit,
} from "lucide-react";

import {
  GetPostById,
  UpdatePost,
  convertFileToBase64,
  formatBase64ToDataURL,
} from "@/services/postServices";

import { getLocations } from "@/services/metadataService";
import { type LocationInterface } from "@/interfaces/Location";
import { type UpdatePostRequest, type Post } from "@/interfaces/post";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import "dayjs/locale/th";

dayjs.extend(isBetween);

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PENDING_STATUS_ID = 1;
const APPROVED_STATUS_ID = 2;
const REJECTED_STATUS_ID = 3;

function EditActivity() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const postId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [id]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [locationList, setLocationList] = useState<LocationInterface[]>([]);
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [type, setType] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
  const [registerStart, setRegisterStart] = useState<dayjs.Dayjs | null>(null);
  const [registerStop, setRegisterStop] = useState<dayjs.Dayjs | null>(null);
  const [locationID, setLocationID] = useState<number | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [existingPicture, setExistingPicture] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); 

  const getStatusLabel = (statusId: number | null, statusName?: string) => {
    const byId: Record<number, string> = {
      1: "Pending (รออนุมัติ)",
      2: "Approved (อนุมัติแล้ว)",
      3: "Rejected (ไม่อนุมัติ)",
      4: "Upcoming (รอเริ่ม)",
      5: "Active (กำลังดำเนินการ)",
      6: "Ended (สิ้นสุดแล้ว)",
    };
  
    if (statusName && statusName.trim()) return statusName;
    if (typeof statusId === "number" && byId[statusId]) return byId[statusId];
    return "Unknown";
  };

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        setError("ID ไม่ถูกต้อง");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await GetPostById(String(postId));
        const postData = res?.data?.data; 
        if (res?.status !== 200) {
          throw new Error(res?.data?.error || "ไม่สามารถโหลดข้อมูลโพสต์ได้");
        }

        const statusId = postData?.status_id ?? postData?.status?.ID ?? null;

        if (postData.user_id && user?.id && postData.user_id !== user.id) {
          setError(
            `คุณไม่มีสิทธิ์เข้าถึงโพสต์นี้ (โพสต์นี้เป็นของ user ID: ${postData.user_id}, คุณคือ user ID: ${user.id})`
          );
          setLoading(false);
          return;
        }

        const allowedStatuses = [PENDING_STATUS_ID, APPROVED_STATUS_ID, REJECTED_STATUS_ID];
        if (!allowedStatuses.includes(statusId)) {
          const statusLabel = getStatusLabel(statusId, postData.status?.status_name);
          setError(
            `ไม่สามารถเข้าถึงโพสต์นี้ได้\n(สถานะปัจจุบัน: ${statusLabel}, ID: ${statusId})`
          );
          setLoading(false);
          return;
        }

        setPost(postData);
        setName(postData.title || "");
        setDetail(postData.detail || "");
        setType(postData.type || "");
        setOrganizer(postData.organizer || "");
        setLocationID(postData.location_id ?? null);

        if (postData.start_date) setStartDate(dayjs(postData.start_date));
        if (postData.stop_date) setEndDate(dayjs(postData.stop_date));
        if (postData.start) setRegisterStart(dayjs(postData.start));
        if (postData.stop) setRegisterStop(dayjs(postData.stop));

        if (postData.picture) {
          setExistingPicture(postData.picture);
          setPosterPreview(formatBase64ToDataURL(postData.picture));
        }
      } catch (err: any) {
        console.error("❌ Error fetching post:", err);
        setError(err?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, user?.id]);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoadingLocations(true);
      try {
        const data = await getLocations();
        if (Array.isArray(data)) setLocationList(data);
      } catch (e) {
        console.error("Failed to fetch locations:", e);
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

    setPosterFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPosterPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemovePoster = () => {
    setPosterFile(null);
    setPosterPreview(null);
    setExistingPicture("");
    const fileInput = document.getElementById("poster-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const formatLocationName = (loc: LocationInterface) => {
    const parts: string[] = [];
    if (loc.building) parts.push(`${loc.building}`);
    if (loc.location_detail) parts.push(loc.location_detail);
    return parts.length > 0 ? parts.join(" - ") : `สถานที่ #${loc.ID}`;
  };

  const handleEnableEdit = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmEdit = () => {
    setIsEditMode(true);
    setShowConfirmDialog(false);
    toast.info("เปิดโหมดแก้ไข - การบันทึกจะทำให้โพสต์กลับเป็นสถานะ 'รออนุมัติ'");
  };

  const handleSubmit = async () => {
    if (!postId) {
      toast.error("ID ไม่ถูกต้อง");
      return;
    }

    if (!name.trim()) return toast.error("กรุณากรอกชื่อกิจกรรม");
    if (!detail.trim()) return toast.error("กรุณากรอกรายละเอียดกิจกรรม");
    if (!startDate) return toast.error("กรุณาเลือกวันเริ่มต้น");
    if (!endDate) return toast.error("กรุณาเลือกวันสิ้นสุด");
    if (!registerStart) return toast.error("กรุณาเลือกวันเริ่มลงทะเบียน");
    if (!registerStop) return toast.error("กรุณาเลือกวันสิ้นสุดลงทะเบียน");
    if (!type) return toast.error("กรุณากรอกประเภทกิจกรรม");
    if (!locationID) return toast.error("กรุณาเลือกสถานที่จัดกิจกรรม");

    if (endDate.isBefore(startDate)) {
      return toast.error("วันสิ้นสุดกิจกรรมต้องมาหลังวันเริ่มต้น");
    }

    if (registerStop.isBefore(registerStart)) {
      return toast.error("วันสิ้นสุดลงทะเบียนต้องมาหลังวันเริ่มลงทะเบียน");
    }

    const isStartInRange = registerStart.isBetween(startDate, endDate, null, '[]');
    const isStopInRange = registerStop.isBetween(startDate, endDate, null, '[]');
    
    if (!isStartInRange || !isStopInRange) {
      toast.error(
        `ช่วงเวลาลงทะเบียนต้องอยู่ระหว่าง ${startDate.format("D MMM YYYY")} - ${endDate.format("D MMM YYYY")}`
      );
      return;
    }

    setSaving(true);

    try {
      let pictureStr = existingPicture;
      if (posterFile) {
        pictureStr = await convertFileToBase64(posterFile);
      }

      const payload: UpdatePostRequest = {
        ID: postId,
        title: name.trim(),
        detail: detail.trim(),
        start_date: startDate.toISOString(),
        stop_date: endDate.toISOString(),
        start: registerStart.toISOString(),
        stop: registerStop.toISOString(),
        organizer: organizer.trim() || "",
        type,
        picture: pictureStr,
        user_id: post?.user_id || user?.id || 0,
        status_id: PENDING_STATUS_ID,
        location_id: Number(locationID),
      };

      const res = await UpdatePost(postId, payload);

      if (res && (res.status === 200 || res.status === 201)) {
        toast.success("บันทึกการแก้ไขสำเร็จ - โพสต์ถูกส่งเพื่อรอการอนุมัติใหม่");
        setTimeout(() => navigate("/student/activity/status_activity"), 1500);
      } else {
        toast.error(`บันทึกไม่สำเร็จ: ${res?.data?.error || "ข้อมูลไม่ถูกต้อง"}`);
      }
    } catch (e: any) {
      console.error("Error during update:", e);
      toast.error(`เกิดข้อผิดพลาด: ${e?.response?.data?.error || e.message || "Error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate("/student/activity/status_activity");

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-12 animate-spin text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-20 py-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/student/activity/status_activity")}
                className="hover:bg-slate-100 rounded-xl"
              >
                <ArrowLeft className="size-5" />
              </Button>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="size-4 text-red-600" />
            <AlertDescription>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-red-900 mb-2">ไม่สามารถเข้าถึงโพสต์ได้</p>
                  <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate("/student/activity/status_activity")}>
                    กลับหน้าสถานะโพสต์
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/student/events")}>
                    กลับหน้ากิจกรรม
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }


  const currentStatusId = post?.status_id ?? null;
  const isApproved = currentStatusId === APPROVED_STATUS_ID;
  const isRejected = currentStatusId === REJECTED_STATUS_ID;
  const isReadOnly = isApproved && !isEditMode; 

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="hover:bg-slate-100 rounded-xl"
                disabled={saving}
              >
                <ArrowLeft className="size-5" />
              </Button>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {isApproved && !isEditMode
                    ? "รายละเอียดกิจกรรม" 
                    : isRejected 
                      ? "แก้ไขและส่งใหม่" 
                      : "แก้ไขโพสต์กิจกรรม"
                  }
                </h1>
                <p className="text-sm text-slate-500">
                  Post ID: {postId} 
                  {isApproved && <span className="text-green-600"> • อนุมัติแล้ว</span>}
                  {isEditMode && <span className="text-orange-600"> • โหมดแก้ไข</span>}
                </p>
              </div>
            </div>

            {/* ปุ่มแก้ไขสำหรับ Approved */}
            {isApproved && !isEditMode && (
              <Button
                onClick={handleEnableEdit}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Edit className="size-4 mr-2" />
                ขอแก้ไข
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert แยกตามสถานะ */}
        {isApproved && !isEditMode ? (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertCircle className="size-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <p className="font-semibold mb-1">โพสต์นี้ได้รับการอนุมัติแล้ว</p>
              <p className="text-sm mb-2">
                คุณสามารถดูรายละเอียดได้ หากต้องการแก้ไขกรุณากดปุ่ม "ขอแก้ไข" ด้านบน
              </p>
              <p className="text-xs text-green-700">
                 <strong>หมายเหตุ:</strong> การแก้ไขจะทำให้โพสต์กลับเป็นสถานะ "รออนุมัติ" และต้องรอการอนุมัติใหม่อีกครั้ง
              </p>
            </AlertDescription>
          </Alert>
        ) : isApproved && isEditMode ? (
          <Alert className="mb-6 bg-orange-50 border-orange-200">
            <Edit className="size-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <p className="font-semibold mb-1">โหมดแก้ไข - โพสต์ที่อนุมัติแล้ว</p>
              <p className="text-sm mb-2">
                คุณกำลังแก้ไขโพสต์ที่ได้รับการอนุมัติแล้ว เมื่อกดบันทึก:
              </p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>โพสต์จะกลับเป็นสถานะ <strong>"รออนุมัติ"</strong></li>
                <li>ต้องรอการอนุมัติจากผู้ดูแลระบบอีกครั้ง</li>
                <li>โพสต์จะไม่แสดงในระบบจนกว่าจะได้รับการอนุมัติ</li>
              </ul>
            </AlertDescription>
          </Alert>
        ) : isRejected ? (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="size-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <p className="font-semibold mb-1">โพสต์นี้ไม่ผ่านการอนุมัติ</p>
              {post?.comment && (
                <p className="text-sm mb-2">
                  <span className="font-medium">เหตุผล:</span> {post.comment}
                </p>
              )}
              <p className="text-sm">
                กรุณาแก้ไขข้อมูลตามเหตุผลที่ระบุ และกดบันทึกเพื่อส่งใหม่
              </p>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertCircle className="size-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              โพสต์นี้อยู่ในสถานะ "รออนุมัติ" คุณสามารถแก้ไขข้อมูลได้ก่อนที่ผู้ดูแลระบบจะตรวจสอบ
            </AlertDescription>
          </Alert>
        )}

        <Card className="shadow-xl border-slate-200">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Poster */}
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
                        className={`flex flex-col items-center justify-center h-64 w-full border-2 border-dashed border-slate-300 rounded-2xl ${
                          !isReadOnly ? "cursor-pointer hover:border-slate-400 hover:bg-slate-50/50" : "cursor-not-allowed opacity-60"
                        } transition-all group`}
                      >
                        <div className="p-4 bg-slate-100 rounded-full mb-3 group-hover:scale-110 transition-transform">
                          <Plus className="size-8 text-slate-600" />
                        </div>
                        <p className="text-slate-700 font-semibold">
                          {isReadOnly ? "ไม่มีรูปโปสเตอร์" : "อัปโหลดรูปโปสเตอร์"}
                        </p>
                        {!isReadOnly && (
                          <p className="text-sm text-slate-500 mt-2">รองรับ JPG, PNG, GIF • ไม่เกิน 5MB</p>
                        )}
                      </label>
                      {!isReadOnly && (
                        <input
                          id="poster-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePosterChange}
                        />
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative w-full">
                        <img
                          src={posterPreview}
                          alt="Poster Preview"
                          className="w-full h-96 object-cover rounded-2xl border-2 border-slate-200 shadow-md"
                        />
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={handleRemovePoster}
                            className="absolute top-3 right-3 p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg transition-all hover:scale-110"
                          >
                            <X className="size-5" />
                          </button>
                        )}
                      </div>

                      {!isReadOnly && (
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {posterFile?.name || "รูปภาพปัจจุบัน"}
                            </p>
                            {posterFile && (
                              <p className="text-xs text-slate-500 mt-1">
                                {((posterFile?.size || 0) / 1024).toFixed(2)} KB
                              </p>
                            )}
                          </div>

                          <label htmlFor="poster-upload-replace">
                            <Button type="button" variant="outline" size="sm" asChild>
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
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ข้อมูลพื้นฐาน</CardTitle>
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
                        disabled={isReadOnly}
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
                        className="h-11"
                        disabled={isReadOnly}
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
                      disabled={isReadOnly}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="detail">
                      รายละเอียดกิจกรรม <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      id="detail"
                      rows={5}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="อธิบายรายละเอียดกิจกรรม เช่น กำหนดการ กิจกรรมย่อย ฯลฯ"
                      value={detail}
                      onChange={(e) => setDetail(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Date - กิจกรรม */}
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
                          setStartDate(e.target.value ? dayjs(e.target.value) : null)
                        }
                        className="h-11"
                        disabled={isReadOnly}
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
                          setEndDate(e.target.value ? dayjs(e.target.value) : null)
                        }
                        min={startDate ? startDate.format("YYYY-MM-DDTHH:mm") : ""}
                        className="h-11"
                        disabled={isReadOnly}
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
                        value={registerStart ? registerStart.format("YYYY-MM-DDTHH:mm") : ""}
                        onChange={(e) =>
                          setRegisterStart(e.target.value ? dayjs(e.target.value) : null)
                        }
                        className="h-11"
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-stop">
                        วันสิ้นสุดลงทะเบียน <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="register-stop"
                        type="datetime-local"
                        value={registerStop ? registerStop.format("YYYY-MM-DDTHH:mm") : ""}
                        onChange={(e) =>
                          setRegisterStop(e.target.value ? dayjs(e.target.value) : null)
                        }
                        className="h-11"
                        disabled={isReadOnly}
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
                        onChange={(e) => setLocationID(e.target.value ? Number(e.target.value) : null)}
                        className="w-full h-11 rounded-xl border px-4 bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={isReadOnly}
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
                  onClick={handleCancel} 
                  disabled={saving} 
                  className="px-8"
                >
                  {isReadOnly ? "ปิด" : "ยกเลิก"}
                </Button>
                
                {!isReadOnly && (
                  <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 shadow-lg"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <Save className="size-4 mr-2" />
                        {isRejected ? "ส่งใหม่" : "บันทึกการแก้ไข"}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="size-5" />
              ยืนยันการแก้ไขโพสต์ที่อนุมัติแล้ว
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <p>
                คุณกำลังจะแก้ไขโพสต์ที่<strong>ได้รับการอนุมัติแล้ว</strong> เมื่อกดยืนยัน:
              </p>
              <ul className="space-y-2 ml-6 list-disc text-sm">
                <li>คุณจะสามารถแก้ไขข้อมูลในโพสต์ได้</li>
                <li className="text-orange-700 font-medium">
                  เมื่อบันทึกการแก้ไข โพสต์จะกลับเป็นสถานะ <strong>"รออนุมัติ"</strong>
                </li>
                <li>โพสต์จะไม่แสดงในระบบจนกว่าจะได้รับการอนุมัติอีกครั้ง</li>
                <li>ผู้ดูแลระบบจะต้องตรวจสอบและอนุมัติโพสต์ใหม่</li>
              </ul>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-amber-800">
                  <strong> คำแนะนำ:</strong> หากไม่จำเป็นต้องแก้ไขข้อมูล ควรเก็บสถานะ "อนุมัติแล้ว" ไว้เพื่อให้โพสต์ยังคงแสดงในระบบ
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleConfirmEdit}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Edit className="size-4 mr-2" />
              ยืนยัน - เปิดโหมดแก้ไข
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EditActivity;