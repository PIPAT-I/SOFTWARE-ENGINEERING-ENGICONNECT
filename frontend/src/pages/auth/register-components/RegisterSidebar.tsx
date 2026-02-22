import { BrandLogo } from "@/components/ui/brand-logo";

export default function RegisterSidebar() {
  return (
    <div className="hidden lg:flex auth-bg flex-col justify-between p-12 xl:p-16 text-white relative">
      <div className="z-10">
        <BrandLogo size="lg" variant="light" linkTo="/" rounded />
      </div>
      <div className="z-10 mb-16">
        <h2 className="text-4xl xl:text-6xl font-bold heading-font mb-6 leading-tight">
          เริ่มต้นการเดินทางสู่นวัตกรรมของคุณ
        </h2>
        <p className="text-slate-300 font-light text-xl xl:text-2xl leading-relaxed">
          สร้างโปรไฟล์เพื่อค้นหาทีมที่ใช่
          และเปลี่ยนไอเดียให้กลายเป็นจริงร่วมกับเพื่อนนักศึกษาต่างสาขา
        </p>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-black/50 to-transparent pointer-events-none"></div>
    </div>
  );
}
