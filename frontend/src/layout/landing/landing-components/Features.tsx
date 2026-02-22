import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const systemCards = [
  {
    type: "INPUT",
    typeColor: "bg-blue-50 text-blue-600",
    title: "1. สร้างฐานข้อมูล",
    features: [
      { label: "Profile:", description: "Skill Matrix เชิงลึก" },
      { label: "Manage:", description: "ประกาศอีเว้นท์ทางการ" },
      { label: "Proposal:", description: "ระบบคำร้องตั้งทีม" },
    ],
  },
  {
    type: "PROCESS",
    typeColor: "bg-purple-50 text-purple-600",
    title: "2. เชื่อมต่อทีม",
    highlight: true,
    features: [
      { label: "Chat:", description: "สื่อสารภายในกลุ่ม" },
      { label: "Register:", description: "ลงทะเบียนยืนยันทีม" },
      { label: "Feedback:", description: "ประเมินผลกิจกรรม" },
    ],
  },
  {
    type: "OUTPUT",
    typeColor: "bg-orange-50 text-orange-600",
    title: "3. รับรองผลงาน",
    features: [
      { label: "Certificate:", description: "ใบประกาศดิจิทัล" },
      { label: "Portfolio:", description: "คลังผลงานยืนยันได้" },
      { label: "Reward:", description: "ระบบแต้มแลกรางวัล" },
    ],
  },
];

const faqItems = [
  {
    question: "อยากโชว์ทักษะให้คนอื่นเห็น ทำยังไง?",
    answer:
      "สร้างโปรไฟล์ใส่ Skills, Tools และ Interests ที่ถนัด แล้วคนอื่นจะค้นหาและเชิญคุณเข้าทีมได้เลย",
  },
  {
    question: "อยากสร้างทีมทำกิจกรรม ต้องทำอย่างไร?",
    answer:
      "ส่งใบเสนอตั้งทีมระบุชื่อทีม รายละเอียด และเชิญสมาชิกที่ต้องการ รอแอดมินอนุมัติก็พร้อมลุย",
  },
  {
    question: "ลงทะเบียนกิจกรรมได้ที่ไหน?",
    answer:
      "เข้าหน้า Events เลือกกิจกรรมที่สนใจ กดลงทะเบียน ระบบจะบันทึกการเข้าร่วมให้อัตโนมัติ",
  },
  {
    question: "คุยกับทีมได้ยังไง?",
    answer:
      "มีระบบ Chat ในตัว เข้าห้องสนทนาของทีม ส่งข้อความ แชร์ไฟล์ และวางแผนงานกับสมาชิกได้เลย",
  },
  {
    question: "ใบรับรองกิจกรรมได้มาอย่างไร?",
    answer:
      "เมื่อเข้าร่วมกิจกรรมเสร็จสิ้น แอดมินจะออกใบรับรองดิจิทัลให้ ดาวน์โหลดไปใช้แนบ Portfolio ได้เลย",
  },
  {
    question: "แต้มใช้ทำอะไรได้บ้าง?",
    answer:
      "สะสมแต้มจากการเข้าร่วมกิจกรรม นำไปแลกรางวัลหรือสิทธิพิเศษต่างๆ ในระบบได้",
  },
];

export function Features() {
  useScrollReveal();

  return (
    <section
      id="system"
      className="py-32 md:py-40 px-8 md:px-16 lg:px-24 bg-slate-50"
    >
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-24">
          
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold mt-4 mb-8 heading-font text-slate-900">
            สถาปัตยกรรมระบบ
          </h2>
          <p className="text-xl lg:text-2xl text-slate-500 font-light max-w-4xl mx-auto">
            เปลี่ยน Requirement ให้เป็นโซลูชันที่ใช้งานได้จริง
          </p>
        </div>

        {/* System Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 reveal-on-scroll mb-24">
          {systemCards.map((card, index) => (
            <div
              key={index}
              className={`bg-white p-10 rounded-3xl border border-slate-100 shadow-sm hover-card relative overflow-hidden ${
                card.highlight ? "" : ""
              }`}
            >
              {card.highlight && (
                <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
              )}
              <div className="flex items-center gap-4 mb-8">
                <span
                  className={`${card.typeColor} text-sm font-bold px-4 py-1.5 rounded-full tracking-wide`}
                >
                  {card.type}
                </span>
                <div className="h-px bg-slate-100 grow"></div>
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-6 heading-font text-slate-800">
                {card.title}
              </h3>
              <ul className="space-y-5">
                {card.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-4">
                    <span className="text-green-500 mt-1 text-lg">✓</span>
                    <span className="text-slate-600 text-base md:text-lg leading-relaxed">
                      <strong className="text-slate-900">
                        {feature.label}
                      </strong>{" "}
                      {feature.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <section id="faq" className="mb-24 pt-16 border-t border-slate-200">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 heading-font">
              คำถามที่พบบ่อย (FAQ)
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-3xl border border-slate-100"
              >
                <h4 className="font-bold text-slate-800 text-xl mb-3">
                  {item.question}
                </h4>
                <p className="text-slate-500 text-base md:text-lg font-light leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <div className="reveal-on-scroll relative w-full bg-primary rounded-[3rem] overflow-hidden py-24 md:py-32 lg:py-40 px-8 md:px-16 text-center border border-primary/80 shadow-2xl">
          <div className="absolute inset-0 bg-tech-pattern opacity-30"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]"></div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-8 heading-font leading-tight">
              พร้อมที่จะ<span className="text-blue-400">เชื่อมต่อ</span>
              <br />
              กับทีมในฝันของคุณหรือยัง?
            </h2>
            <p className="text-slate-400 text-xl md:text-2xl mb-12 font-light">
              อย่าปล่อยให้ไอเดียเป็นเพียงความฝัน เริ่มต้นสร้างโปรไฟล์
              ค้นหาเพื่อนร่วมทีม และสร้างนวัตกรรมไปด้วยกันวันนี้
            </p>

            <Link
              to="/register"
              className="group relative inline-flex items-center gap-4 bg-white text-slate-900 px-10 py-5 rounded-full text-xl font-bold hover:bg-blue-50 transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)] heading-font"
            >
              <span>สร้างโปรไฟล์นักศึกษา</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>

            <p className="mt-10 text-base text-slate-500 flex items-center justify-center gap-3 opacity-80"></p>
          </div>
        </div>
      </div>
    </section>
  );
}
