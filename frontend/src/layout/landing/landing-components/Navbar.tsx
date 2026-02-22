import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Link, useNavigate } from "react-router-dom";

export function Navbar() {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <nav className="fixed w-full z-60 bg-white/80 backdrop-blur-md border-b border-slate-100 top-0 left-0 px-4 flex items-center transition-all">
        <div className="mr-12 cursor-pointer" onClick={scrollToTop}>
          <BrandLogo size="lg" variant="dark" linkTo={undefined} />
        </div>

        <div className="hidden md:flex items-center gap-2">
          <a
            href="#hero"
            className="px-6 py-5 text-lg font-sarabun  text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all duration-200"
          >
            หน้าหลัก
          </a>
          <a
            href="#solution"
            className="px-7 py-5 text-lg font-sarabun  text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all duration-200"
          >
            โซลูชัน
          </a>
          <a
            href="#features"
            className="px-7 py-5 text-lg font-sarabun  text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all duration-200"
          >
            ฟีเจอร์
          </a>
          <a
            href="#faq"
            className="px-7 py-5 text-lg font-sarabun  text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all duration-200"
          >
            คำถามที่พบบ่อย
          </a>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <Link
            to="/register"
            // แก้ text-sm เป็น text-base
            className="hidden lg:block text-lg font-medium text-slate-500 hover:text-slate-900 transition-colors px-7 py-5 "
          >
            สมัครสมาชิก
          </Link>

          <Button
            onClick={() => navigate("/login")}
            className="bg-primary text-white px-7 py-5 rounded-full text-lg font-medium hover:bg-primary/90 hover:shadow-lg transition-all duration-300 heading-font shadow-md shadow-primary/10 flex items-center gap-2"
          >
            <span>เข้าสู่ระบบ</span>
          </Button>
        </div>
      </nav>
    </>
  );
}
