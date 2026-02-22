import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

import { BrandLogo } from "@/components/ui/brand-logo";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RegisterSidebar from "./register-components/RegisterSidebar";
import TagInputBox from "./register-components/TagInputBox";
import AvatarUpload from "./register-components/AvatarUpload";
import SocialMediaInput from "./register-components/SocialMediaInput";
import { TAG_CONFIGS } from "./register-components/constants";
import { register, login } from "@/services/authService";
import { uploadAvatar } from "@/services/profileService";
import { useAuth } from "@/context/AuthContext";
import { getFaculties, getMajors } from "@/services/metadataService";
import type { Faculty } from "@/interfaces/faculty";
import type { Major } from "@/interfaces/major";

// Schema Validation
const registerSchema = z.object({
  sut_id: z
    .string()
    .min(1, "กรุณากรอกรหัสนักศึกษา")
    .length(8, "รหัสนักศึกษาต้องมี 8 ตัวอักษร")
    .regex(
      /^[AaBbMmDd]\d{7}$/,
      "รูปแบบรหัสนักศึกษาไม่ถูกต้อง (ต้่องขึ้นต้นด้วย B หรือ M หรือ D)"
    ),
  fullName: z.string().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  password: z
    .string()
    .min(1, "กรุณากรอกรหัสผ่าน")
    .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
  email: z.string().min(1, "กรุณากรอกอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
  phone: z
    .string()
    .min(1, "กรุณากรอกเบอร์โทรศัพท์")
    .regex(/^\d+$/, "เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น")
    .min(10, "เบอร์โทรศัพท์ต้องมีอย่างน้อย 10 หลัก"),
  year: z.string().min(1, "กรุณาเลือกชั้นปี"),
  faculty: z.string().min(1, "กรุณาเลือกคณะ"),
  major: z.string().min(1, "กรุณาเลือกสาขาวิชา"),
  bio: z.string().max(200, "Bio ต้องไม่เกิน 200 ตัวอักษร").optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  socials: z
    .array(z.object({ platform: z.string(), link: z.string() }))
    .optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    undefined
  );

  // Form Setup
  const {
    register: formRegister,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      sut_id: "",
      fullName: "",
      lastName: "",
      password: "",
      email: "",
      phone: "",
      year: "",
      faculty: "",
      major: "",
      bio: "",
      skills: [],
      interests: [],
      tools: [],
      socials: [],
    },
  });

  const currentSocials = watch("socials") || [];

  // Social Media State
  const [socialPlatform, setSocialPlatform] = useState("");
  const [socialLink, setSocialLink] = useState("");

  // Load Initial Metadata
  useEffect(() => {
    getFaculties()
      .then((res) => setFaculties(Array.isArray(res) ? res : res.data || []))
      .catch(() => toast.error("ไม่สามารถโหลดข้อมูลคณะได้"));

    getMajors()
      .then((res) => setMajors(Array.isArray(res) ? res : res.data || []))
      .catch(() => toast.error("ไม่สามารถโหลดข้อมูลสาขาได้"));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      const payload = {
        sut_id: data.sut_id,
        email: data.email,
        password: data.password,
        first_name: data.fullName,
        last_name: data.lastName,
        phone: data.phone,
        year: parseInt(data.year) || 1,
        faculty_id: parseInt(data.faculty),
        major_id: parseInt(data.major),
        bio: data.bio,
        skills: data.skills?.length ? data.skills : undefined,
        tools: data.tools?.length ? data.tools : undefined,
        interests: data.interests?.length ? data.interests : undefined,
        socials: data.socials?.length ? data.socials : undefined,
      };

      const regRes = await register(payload);
      if (regRes?.data?.error) {
        toast.error(regRes.data.error);
        return;
      }
      if (avatarFile) {
        console.log("Uploading avatar:", {
          sut_id: data.sut_id,
          fileName: avatarFile.name,
          fileSize: avatarFile.size,
          fileType: avatarFile.type,
        });
        try {
          const uploadRes = await uploadAvatar(data.sut_id, avatarFile);
          console.log("Upload response:", uploadRes);
        } catch (err) {
          console.error("Upload error:", err);
          toast.warn("อัปโหลดรูปโปรไฟล์ไม่สำเร็จ แต่บัญชีถูกสร้างเรียบร้อย");
        }
      } else {
        console.log("No avatar file selected");
      }
      const loginRes = await login({
        sut_id: data.sut_id,
        password: data.password,
      });
      if (loginRes?.error || !loginRes?.token) {
        toast.error("สร้างบัญชีสำเร็จแต่เข้าสู่ระบบไม่ได้ กรุณาลองใหม่");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }
      authLogin(loginRes.token, loginRes.token_type as string);
      toast.success("ลงทะเบียนสำเร็จ!");
      const payloadBase64 = loginRes.token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      navigate(decodedPayload?.role === "Admin" ? "/admin" : "/student");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "ลงทะเบียนไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // Handlers for Tags
  const addTag = (field: "skills" | "interests" | "tools", item: string) => {
    const current = watch(field) || [];
    if (!current.includes(item)) setValue(field, [...current, item]);
  };
  const removeTag = (field: "skills" | "interests" | "tools", item: string) => {
    const current = watch(field) || [];
    setValue(
      field,
      current.filter((i) => i !== item)
    );
  };

  const addSocial = () => {
    if (socialPlatform && socialLink) {
      const current = watch("socials") || [];
      setValue("socials", [
        ...current,
        { platform: socialPlatform, link: socialLink },
      ]);
      setSocialPlatform("");
      setSocialLink("");
    }
  };
  const removeSocial = (index: number) => {
    const current = watch("socials") || [];
    setValue(
      "socials",
      current.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="h-screen overflow-hidden">
      <div className="flex h-full">
        <RegisterSidebar />
        <div className="w-full h-full flex flex-col relative bg-background">
          <div className="lg:hidden p-6 flex items-center justify-between border-b bg-background/95 backdrop-blur">
            <BrandLogo size="md" variant="dark" linkTo={undefined} rounded />
            <Link
              to="/"
              className="text-base text-muted-foreground hover:text-primary font-medium"
            >
              Back to Home
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto custom-scroll p-8 md:p-12 lg:p-16 xl:p-20 flex justify-center items-start">
            <div className="w-full max-w-4xl py-1">
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">สมัครสมาชิก</h1>
                <p className="text-muted-foreground">
                  กรอกข้อมูลของคุณเพื่อเริ่มต้นใช้งาน
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <AvatarUpload
                  preview={avatarPreview}
                  onFileChange={handleFileChange}
                />

                <section className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className={errors.fullName ? "text-red-500" : ""}>
                        ชื่อ*
                      </Label>
                      <Input
                        {...formRegister("fullName")}
                        placeholder="สมชาย"
                        className={errors.fullName ? "border-red-500" : ""}
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm">
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className={errors.lastName ? "text-red-500" : ""}>
                        นามสกุล*
                      </Label>
                      <Input
                        {...formRegister("lastName")}
                        placeholder="ใจดี"
                        className={errors.lastName ? "border-red-500" : ""}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className={errors.email ? "text-red-500" : ""}>
                      อีเมล*
                    </Label>
                    <Input
                      {...formRegister("email")}
                      type="email"
                      placeholder="email@university.ac.th"
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className={errors.sut_id ? "text-red-500" : ""}>
                        รหัสนักศึกษา*
                      </Label>
                      <Input
                        {...formRegister("sut_id")}
                        placeholder="B66XXXXX"
                        className={errors.sut_id ? "border-red-500" : ""}
                      />
                      {errors.sut_id && (
                        <p className="text-red-500 text-sm">
                          {errors.sut_id.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className={errors.password ? "text-red-500" : ""}>
                        รหัสผ่าน*
                      </Label>
                      <Input
                        {...formRegister("password")}
                        type="password"
                        placeholder="••••••••"
                        className={errors.password ? "border-red-500" : ""}
                      />
                      {errors.password && (
                        <p className="text-red-500 text-sm">
                          {errors.password.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className={errors.faculty ? "text-red-500" : ""}>
                        คณะ*
                      </Label>
                      <Controller
                        name="faculty"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={loading}
                          >
                            <SelectTrigger
                              className={errors.faculty ? "border-red-500" : ""}
                            >
                              <SelectValue placeholder="เลือกคณะ" />
                            </SelectTrigger>
                            <SelectContent>
                              {faculties.map((f) => (
                                <SelectItem key={f.ID} value={f.ID.toString()}>
                                  {f.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.faculty && (
                        <p className="text-red-500 text-sm">
                          {errors.faculty.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className={errors.major ? "text-red-500" : ""}>
                        สาขาวิชา*
                      </Label>
                      <Controller
                        name="major"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={loading}
                          >
                            <SelectTrigger
                              className={errors.major ? "border-red-500" : ""}
                            >
                              <SelectValue placeholder="เลือกสาขา" />
                            </SelectTrigger>
                            <SelectContent>
                              {majors.map((m) => (
                                <SelectItem key={m.ID} value={m.ID.toString()}>
                                  {m.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.major && (
                        <p className="text-red-500 text-sm">
                          {errors.major.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className={errors.year ? "text-red-500" : ""}>
                        ชั้นปี*
                      </Label>
                      <Controller
                        name="year"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger
                              className={errors.year ? "border-red-500" : ""}
                            >
                              <SelectValue placeholder="เลือกชั้นปี" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4].map((y) => (
                                <SelectItem
                                  key={y}
                                  value={y.toString()}
                                >{`ปี ${y}`}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.year && (
                        <p className="text-red-500 text-sm">
                          {errors.year.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className={errors.phone ? "text-red-500" : ""}>
                        เบอร์โทรศัพท์*
                      </Label>
                      <Input
                        {...formRegister("phone")}
                        placeholder="08XXXXXXXX"
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="space-y-8">
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <textarea
                      {...formRegister("bio")}
                      className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us about yourself..."
                      maxLength={200}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {TAG_CONFIGS.map((cfg) => (
                      <TagInputBox
                        key={cfg.field}
                        title={cfg.title}
                        items={watch(cfg.field as any) || []}
                        onAdd={(val) => addTag(cfg.field as any, val)}
                        onRemove={(val) => removeTag(cfg.field as any, val)}
                        presetOptions={cfg.options
                          .filter(
                            (o) => !(watch(cfg.field as any) || []).includes(o)
                          )
                          .map((o) => ({ value: o, label: o }))}
                        colorScheme={cfg.color}
                      />
                    ))}
                    <SocialMediaInput
                      socials={currentSocials}
                      platform={socialPlatform}
                      link={socialLink}
                      onPlatformChange={setSocialPlatform}
                      onLinkChange={setSocialLink}
                      onAdd={addSocial}
                      onRemove={removeSocial}
                    />
                  </div>
                </section>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full text-lg py-6"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                      กำลังลงทะเบียน...
                    </>
                  ) : (
                    "สมัครสมาชิก"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
