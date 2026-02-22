import * as React from "react"

// ปรับ path ให้ตรงกับ utils ของคุณ (ส่วนใหญ่จะอยู่ที่ @/lib/utils หรือ @/utils)
// ถ้าไม่มี function cn ให้ลบ import นี้และลบการใช้ cn(...) ออก
import { cn } from "@/lib/utils" 

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }