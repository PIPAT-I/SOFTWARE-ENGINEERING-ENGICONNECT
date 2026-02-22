import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import LogoImage from "@/assets/Logo-EngiConnect.png";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  showText?: boolean;
  className?: string;
  linkTo?: string;
  rounded?: boolean;
}

const sizeConfig = {
  sm: {
    icon: "w-6 h-6",
    text: "text-sm",
  },
  md: {
    icon: "w-9 h-9",
    text: "text-xl",
  },
  lg: {
    icon: "w-10 h-10",
    text: "text-2xl",
  },
};

const variantConfig = {
  light: {
    text: "text-white",
  },
  dark: {
    text: "text-slate-900",
  },
};

export function BrandLogo({
  size = "md",
  variant = "dark",
  showText = true,
  className,
  linkTo = "/",
  rounded = false,
}: BrandLogoProps) {
  const sizeStyles = sizeConfig[size];
  const variantStyles = variantConfig[variant];

  const content = (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src={LogoImage}
        alt="EngiConnect Logo"
        className={cn("object-contain", sizeStyles.icon, rounded && "rounded-full")}
      />
      {showText && (
        <span
          className={cn(
            "font-semibold tracking-tight heading-font",
            sizeStyles.text,
            variantStyles.text
          )}
        >
          ENGI CONNECT
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
