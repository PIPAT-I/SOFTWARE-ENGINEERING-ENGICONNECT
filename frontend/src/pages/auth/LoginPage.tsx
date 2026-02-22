import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useAuth } from "@/context/AuthContext";
import { login as loginService } from "@/services/authService";
import { toast } from "react-toastify";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  sut_id: z
    .string()
    .min(1, "กรุณากรอกรหัสนักศึกษา")
    .regex(
      /^[AaBbMmDd]\d{7}$/,
      "รูปแบบรหัสนักศึกษาไม่ถูกต้อง (ต้องขึ้นต้นด้วย B, M, D ตามด้วยตัวเลข 7 หลัก)"
    ),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      sut_id: "",
      password: "",
    },
  });

  // รับข้อความจากหน้า Register
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      if (location.state.sut_id) {
        setValue("sut_id", location.state.sut_id);
      }
    }
  }, [location.state, setValue]);

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const response = await loginService({
        sut_id: data.sut_id,
        password: data.password,
      });

      // ตรวจสอบว่าเป็น error response หรือไม่
      if (response?.data?.error) {
        toast.error(response.data.error);
        return;
      }

      // รอให้ login และ fetch profile เสร็จก่อน navigate
      await login(response.token, response.token_type);
      toast.success(`ยินดีต้อนรับ!`);
      onOpenChange(false);
      reset();

      // ใช้ role จาก response ที่ได้จาก backend
      const userRole = response.role?.toLowerCase();
      if (userRole === "admin") {
        navigate("/admin/events");
      } else if (userRole === "student") {
        navigate("/student/events");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-5 rounded-4xl border-slate-200/60 overflow-hidden">
        <div className="p-8 pb-4 text-center">
          <div className="flex justify-center mb-4">
            <BrandLogo
              size="md"
              variant="dark"
              showText={false}
              linkTo={undefined}
            />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 heading-font">
            ยินดีต้อนรับกลับมา
          </h3>
          <p className="text-slate-500 mt-2 font-light">
            เข้าสู่ระบบเพื่อเชื่อมต่อกับทีมของคุณ
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 pt-2 space-y-5">
          <div className="space-y-2">
            <Label className={errors.sut_id ? "text-red-500" : ""}>
              รหัสนักศึกษา
            </Label>
            <Input
              type="text"
              placeholder="Bxxxxxxx"
              {...register("sut_id")}
              autoComplete="username"
              className={errors.sut_id ? "border-red-500" : ""}
            />
            {errors.sut_id && (
              <p className="text-red-500 text-sm">{errors.sut_id.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className={errors.password ? "text-red-500" : ""}>
              รหัสผ่าน
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="*************"
                {...register("password")}
                autoComplete="current-password"
                className={errors.password ? "border-red-500" : ""}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary rounded-full w-full mt-4 heading-font"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
        </form>

        {/* Footer */}
        <div className="p-6 pt-0 bg-slate-50/50 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            ยังไม่มีบัญชี?{""}
            <Link
              to="/register"
              onClick={() => onOpenChange(false)}
              className="text-slate-900 font-bold hover:underline decoration-2 underline-offset-4 ml-1"
            >
              ลงทะเบียนนักศึกษาใหม่
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
