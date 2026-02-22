import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
import { Spinner } from "@/components/ui/spinner";
import { Upload, X } from "lucide-react";
import { getFaculties, getMajors } from "@/services/metadataService";
import {
  updateMyProfile,
  uploadAvatar,
  getMyProfile,
} from "@/services/profileService";
import { getImageUrl } from "@/utils/imageUtils";
import TagInputBox from "@/pages/auth/register-components/TagInputBox";
import SocialMediaInput from "@/pages/auth/register-components/SocialMediaInput";
import type { Faculty } from "@/interfaces/faculty";
import type { Major } from "@/interfaces/major";
import type { User, SocialMedia } from "@/interfaces/user";

export default function EditProfilePage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveConfirm, setSaveConfirm] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    faculty_id: 0,
    major_id: 0,
    year: 1,
    bio: "",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [socials, setSocials] = useState<SocialMedia[]>([]);
  const [socialPlatform, setSocialPlatform] = useState("");
  const [socialUrl, setSocialUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileResponse, facultiesData, majorsData] = await Promise.all([
          getMyProfile(),
          getFaculties(),
          getMajors(),
        ]);

        if (profileResponse?.data) {
          const data = profileResponse.data;
          setUserData(data);
          setFormData({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            phone: data.phone || "",
            faculty_id: data.faculty_id || 0,
            major_id: data.major_id || 0,
            year: data.year || 1,
            bio: data.bio || "",
          });
          setSkills(data.skills || []);
          setInterests(data.interests || []);
          setTools(data.tools || []);
          setSocials(data.socials || []);
        }

        if (facultiesData && !facultiesData.error) setFaculties(facultiesData);
        if (majorsData && !majorsData.error) setMajors(majorsData);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        setError("กรุณาเลือกไฟล์รูปภาพ (jpg, png, gif, webp)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB");
        return;
      }
      setAvatarFile(file);
      setError("");
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

  const handleAddSocial = () => {
    if (socialPlatform && socialUrl && socials.length < 5) {
      setSocials([...socials, { platform: socialPlatform, link: socialUrl }]);
      setSocialPlatform("");
      setSocialUrl("");
    }
  };

  const handleRemoveSocial = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index));
  };

  const handleOpenSaveConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveConfirm(true);
  };

  const handleSubmit = async () => {
    setError("");
    setSaving(true);

    try {
      const updateData = {
        ...formData,
        skills,
        interests,
        tools,
        socials,
      };

      const profileResponse = await updateMyProfile(updateData);
      if (profileResponse.error) {
        throw new Error(profileResponse.error);
      }
      if (avatarFile && user?.sut_id) {
        const avatarResponse = await uploadAvatar(user.sut_id, avatarFile);
        if (avatarResponse.error) {
          console.warn("Avatar upload failed:", avatarResponse.error);
        }
      }
      await refreshProfile();
      toast.success("บันทึกข้อมูลโปรไฟล์สำเร็จ!");
      navigate("/student/profile-skill");
    } catch (err: any) {
      const errorMessage = err.message || "เกิดข้อผิดพลาดในการอัพเดทโปรไฟล์";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="w-8 h-8 text-slate-600" />
          <p className="text-slate-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  const currentAvatar = avatarPreview || getImageUrl(userData?.avatar_url);

  return (
    <div className="min-h-full bg-white text-slate-900">
      <div className="max-w-8xl mx-auto px-10 py-10">
        <form onSubmit={handleOpenSaveConfirm} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-40 h-40 rounded-full overflow-hidden ring-4 ring-slate-200 shadow-lg">
                <img
                  src={currentAvatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  เปลี่ยนรูปโปรไฟล์
                </Button>

                {(avatarFile || avatarPreview) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    onClick={handleRemoveAvatar}
                    className="px-6"
                  >
                    <X className="w-4 h-4 mr-2" />
                    ลบรูป
                  </Button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-all duration-300">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                ข้อมูลพื้นฐาน
              </h2>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="first_name" className="text-base">
                    ชื่อ *
                  </Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    className="mt-2 h-12"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="last_name" className="text-base">
                    นามสกุล *
                  </Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    className="mt-2 h-12"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-base">
                    อีเมล
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="mt-2 h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-base">
                    เบอร์โทรศัพท์ *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="mt-2 h-12"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="year" className="text-base">
                    ชั้นปี *
                  </Label>
                  <Select
                    value={formData.year.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, year: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="เลือกชั้นปี" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">ปี 1</SelectItem>
                      <SelectItem value="2">ปี 2</SelectItem>
                      <SelectItem value="3">ปี 3</SelectItem>
                      <SelectItem value="4">ปี 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="faculty" className="text-base">
                    คณะ *
                  </Label>
                  <Select
                    value={formData.faculty_id.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, faculty_id: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="เลือกคณะ" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculties.map((faculty) => (
                        <SelectItem
                          key={faculty.ID}
                          value={faculty.ID.toString()}
                        >
                          {faculty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="major" className="text-base">
                    สาขาวิชา *
                  </Label>
                  <Select
                    value={formData.major_id.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, major_id: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="เลือกสาขาวิชา" />
                    </SelectTrigger>
                    <SelectContent>
                      {majors.map((major) => (
                        <SelectItem key={major.ID} value={major.ID.toString()}>
                          {major.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bio" className="text-base">
                    เกี่ยวกับฉัน
                  </Label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="w-full min-h-[120px] mt-2 px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="เขียนบางอย่างเกี่ยวกับตัวคุณ..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-all duration-300">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                ทักษะและความสนใจ
              </h2>

              <div className="space-y-5">
                <TagInputBox
                  title="ทักษะ (Skills)"
                  items={skills}
                  onAdd={(item) => setSkills([...skills, item])}
                  onRemove={(item) =>
                    setSkills(skills.filter((s) => s !== item))
                  }
                  placeholder="+ เพิ่มทักษะ"
                  colorScheme="black"
                />

                <TagInputBox
                  title="สิ่งที่สนใจ (Interests)"
                  items={interests}
                  onAdd={(item) => setInterests([...interests, item])}
                  onRemove={(item) =>
                    setInterests(interests.filter((i) => i !== item))
                  }
                  placeholder="+ เพิ่มความสนใจ"
                  colorScheme="black"
                />

                <TagInputBox
                  title="เครื่องมือ (Tools)"
                  items={tools}
                  onAdd={(item) => setTools([...tools, item])}
                  onRemove={(item) => setTools(tools.filter((t) => t !== item))}
                  placeholder="+ เพิ่มเครื่องมือ"
                  colorScheme="black"
                />

                <SocialMediaInput
                  socials={socials}
                  platform={socialPlatform}
                  link={socialUrl}
                  onPlatformChange={setSocialPlatform}
                  onLinkChange={setSocialUrl}
                  onAdd={handleAddSocial}
                  onRemove={handleRemoveSocial}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-base text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/student/profile-skill")}
              disabled={saving}
              size="lg"
              className="px-10"
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={saving} size="lg" className="px-10">
              {saving ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  กำลังบันทึก...
                </>
              ) : (
                "บันทึกการเปลี่ยนแปลง"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={saveConfirm} onOpenChange={setSaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการบันทึก</AlertDialogTitle>
            <AlertDialogDescription>
              ต้องการบันทึกการเปลี่ยนแปลงข้อมูลโปรไฟล์หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setSaveConfirm(false);
                handleSubmit();
              }}
              className="bg-black hover:bg-gray-800"
            >
              ยืนยันการบันทึก
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
