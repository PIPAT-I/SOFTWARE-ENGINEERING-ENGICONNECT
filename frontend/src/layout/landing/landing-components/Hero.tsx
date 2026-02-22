import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function Hero() {
  useScrollReveal();

  return (
    <section
      id="highlight"
      className="relative min-h-screen flex flex-col justify-center items-center px-8 md:px-16 lg:px-24 pt-24 hero-bg"
    >
      <div className="w-full max-w-6xl z-10 text-center">
        {/* Headline */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-semibold tracking-tight mb-10 text-black heading-font leading-[1.05] ">
          <span>สร้างตัวตน</span>
          <br />
          <span className=" text-slate-400">หาทีมที่ใช่</span>
          <br />
          <span>คว้าโอกาส</span>
        </h1>

        {/* Description */}
        <p
          className="reveal-on-scroll max-w-3xl mx-auto text-xl md:text-2xl text-slate-600 font-light leading-relaxed mb-12"
          style={{ transitionDelay: "400ms" }}
        >
          Engi Connect ระบบบริหารกิจกรรมนักศึกษาแบบครบวงจร
        </p>

        {/* Buttons */}
        <div
          className="reveal-on-scroll flex flex-col md:flex-row gap-5 justify-center items-center mb-20"
          style={{ transitionDelay: "500ms" }}
        >
          <Link
            to="/register"
            className="px-10 py-5 bg-black text-white rounded-full font-semibold text-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 w-full md:w-auto text-center"
          >
            เริ่มต้นใช้งาน
          </Link>

          <a
            href="#problem"
            className="px-10 py-5 bg-white/90 backdrop-blur text-slate-700 border border-slate-200 rounded-full font-semibold text-xl hover:bg-white transition-all w-full md:w-auto shadow-sm text-center"
          >
            เรียนรู้เพิ่มเติม
          </a>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 w-full h-32 bg-linear-to-t from-[#f8fafc] to-transparent"></div>
    </section>
  );
}
