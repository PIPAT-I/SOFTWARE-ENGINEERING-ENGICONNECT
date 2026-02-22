import { useState, useEffect, useRef } from "react";
import { Mail, Phone, User, Shield, Upload, Save, X } from "lucide-react";
import { toast } from "react-toastify";
import { getMyProfile, updateMyProfile, uploadAvatar } from "@/services/profileService";
import type { User as UserType } from "@/interfaces/user";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getImageUrl } from "@/utils/imageUtils";
import { useAuth } from "@/context/AuthContext";

export default function AdminProfilePage() {
  const { refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMyProfile();
        if (response?.data && !response?.error) {
          setUserData(response.data);
          setFormData({
            first_name: response.data.first_name || "",
            last_name: response.data.last_name || "",
            email: response.data.email || "",
            phone: response.data.phone || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("กรุณาเลือกไฟล์รูปภาพ (jpg, png, gif, webp)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview("");
    if (userData) {
      setFormData({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || "",
        phone: userData.phone || "",
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update profile
      const updateData = {
        ...formData,
        faculty_id: userData?.faculty_id || 0,
        major_id: userData?.major_id || 0,
        year: userData?.year || 1,
      };
      
      const profileResponse = await updateMyProfile(updateData);
      if (profileResponse.error) {
        throw new Error(profileResponse.error);
      }

      // Upload avatar if changed
      if (avatarFile && userData?.sut_id) {
        const avatarResponse = await uploadAvatar(userData.sut_id, avatarFile);
        if (avatarResponse.error) {
          console.warn("Avatar upload failed:", avatarResponse.error);
        }
      }

      await refreshProfile();
      
      // Refresh local data
      const response = await getMyProfile();
      if (response?.data) {
        setUserData(response.data);
      }

      toast.success("บันทึกข้อมูลโปรไฟล์สำเร็จ!");
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview("");
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Spinner className="size-6 text-gray-600" />
        <p className="text-gray-600 text-sm">กำลังโหลดข้อมูลโปรไฟล์...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">ไม่พบข้อมูลโปรไฟล์</p>
      </div>
    );
  }

  const currentAvatar = avatarPreview || getImageUrl(userData.avatar_url);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          โปรไฟล์ผู้ดูแลระบบ
        </h1>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">ข้อมูลส่วนตัว</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-slate-900 ring-offset-4 ring-offset-white">
                <img
                  src={currentAvatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {isEditing && (
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    เปลี่ยนรูป
                  </Button>
                  {(avatarFile || avatarPreview) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveAvatar}
                    >
                      <X className="w-4 h-4 mr-2" />
                      ลบรูปที่เลือก
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}
              
              <Badge className="bg-purple-100 text-purple-700 border border-purple-200">
                <Shield className="w-3 h-3 mr-1" />
                {userData.role?.name || "Admin"}
              </Badge>
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-6">
              {isEditing ? (
                // Edit Mode
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">ชื่อ</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">นามสกุล</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">อีเมล</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {userData.first_name} {userData.last_name}
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-gray-500 text-xs">รหัสผู้ใช้</p>
                        <p className="font-mono font-medium">{userData.sut_id}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-gray-500 text-xs">อีเมล</p>
                        <p className="font-medium">{userData.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-gray-500 text-xs">เบอร์โทรศัพท์</p>
                        <p className="font-medium">{userData.phone || "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="bg-black text-white hover:bg-gray-800">
                แก้ไขโปรไฟล์
              </Button>
            ) : (
              <>
                <Button onClick={handleCancel} variant="outline" disabled={saving}>
                  <X className="w-4 h-4 mr-2" />
                  ยกเลิก
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      บันทึก
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
