import { BrandLogo } from "@/components/ui/brand-logo";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 py-16 px-8 md:px-16 lg:px-24">
      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8">
        <BrandLogo size="md" variant="dark" linkTo="/" />
        <div className="text-base text-slate-500 font-light text-center md:text-right">
          2025 ENGI CONNECT SYSTEM. มหาวิทยาลัยเทคโนโลยีสุรนารี
          <br />
          Designed for Student Success.
        </div>
      </div>
    </footer>
  );
}
