import { User, Puzzle, FileText } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const problems = [
  {
    icon: <User className="w-8 h-8 text-red-700" />,
    title: "ตัวตนที่ไม่ชัดเจน",
    description: "ระบบทั่วไปบอกแค่คณะ แต่ไม่บอกทักษะ ทำให้การหาคนมาร่วมทีมที่มี Skill ตรงกันยาก"
  },
  {
    icon: <Puzzle className="w-8 h-8 text-green-700" />,
    title: "โอกาสที่กระจัดกระจาย",
    description: "อยากทำ Startup หรือแข่ง Hackathon แต่ไม่มีพื้นที่กลางในการเสนอไอเดีย (Proposal)"
  },
  {
    icon: <FileText className="w-8 h-8 text-blue-700" />,
    title: "ผลงานที่สูญหาย",
    description: "จบกิจกรรมแล้วก็จบกัน ไม่มีระบบรับรอง (Verification) หรือ Portfolio กลางเพื่อใช้ต่อยอด"
  }
];

export function ProblemSection() {
  useScrollReveal();

  return (
    <section id="problem" className="py-32 md:py-40 px-8 md:px-16 lg:px-24 bg-white relative">
      <div className="w-full">
        {/* Layout: Text Left + Cards Right */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Left Side: Header Text */}
          <div className="lg:w-2/5 lg:sticky lg:top-32 lg:self-start">
            <span className="text-slate-500 font-medium tracking-wider text-base uppercase">
              The Pain Point
            </span>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-medium mt-3 heading-font text-slate-900 leading-tight">
              ทำไมไอเดียดีๆ <br />
              ถึงไม่ได้ไปต่อ?
            </h2>
            <p className="text-xl lg:text-2xl text-slate-500 font-light leading-relaxed mt-8">
              ปัญหาใหญ่ในรั้วมหาวิทยาลัยคือ "การขาดการเชื่อมต่อ" 
              <br />
              คุณมีทักษะแต่ไม่มีทีม มีผลงานแต่ไม่มีที่โชว์
            </p>
          </div>

          {/* Right Side: Problem Cards (Column) */}
          <div className="lg:w-3/5 flex flex-col gap-6">
            {problems.map((problem, index) => (
              <div 
                key={index}
                className="reveal-on-scroll p-8 lg:p-10 bg-slate-50 rounded-3xl border border-slate-100 hover:border-slate-300 transition-colors flex flex-col sm:flex-row gap-6 items-start"
                style={{ transitionDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0">
                  {problem.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3 heading-font text-slate-800">
                    {problem.title}
                  </h3>
                  <p className="text-lg text-slate-500 font-light leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
