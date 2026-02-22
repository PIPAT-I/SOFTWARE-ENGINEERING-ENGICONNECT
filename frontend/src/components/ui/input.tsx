import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "h-12 w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900",
          "shadow-sm shadow-slate-200/50",
          "transition-all placeholder:text-slate-400",
          "focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:shadow-md focus:shadow-slate-200/60",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
