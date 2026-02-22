import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "./landing-components/Navbar";
import { Hero } from "./landing-components/Hero";
import { MarqueeStrip } from "./landing-components/MarqueeStrip";
import { ProblemSection } from "./landing-components/ProblemSection";
import { Features } from "./landing-components/Features";
import { Footer } from "./landing-components/Footer";
import { LoginModal } from "@/pages/auth/LoginPage";

function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPath = location.pathname === "/login";
  const [isLoginOpen, setIsLoginOpen] = useState(isLoginPath);

  useEffect(() => {
    setIsLoginOpen(isLoginPath);
  }, [isLoginPath]);

  const handleLoginOpenChange = (open: boolean) => {
    setIsLoginOpen(open);
    if (!open && isLoginPath) {
      navigate("/");
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans flex flex-col text-slate-900 selection:bg-slate-900 selection:text-white scroll-smooth">
      <Navbar />
      <main className="grow">
        <section id="hero">
          <Hero />
        </section>
        <MarqueeStrip />
        <section id="solution">
          <ProblemSection />
        </section>
        <section id="features">
          <Features />
        </section>
      </main>

      <Footer />

      {/* Login Modal */}
      <LoginModal open={isLoginOpen} onOpenChange={handleLoginOpenChange} />
    </div>
  );
}

export default LandingPage;
