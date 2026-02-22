import { useRef } from "react";
import { Camera, Plus } from "lucide-react";

interface AvatarUploadProps {
  preview?: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export default function AvatarUpload({ preview, onFileChange }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative group cursor-pointer w-32 h-32"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-32 h-32 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center overflow-hidden hover:border-primary transition-colors">
          {preview ? (
            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <>
              <Camera className="w-8 h-8 text-muted-foreground mb-1 group-hover:text-primary transition-colors" />
              <span className="text-xs text-muted-foreground group-hover:text-primary">อัปโหลดรูป</span>
            </>
          )}
        </div>
        <div className="absolute bottom-0 right-0 bg-primary rounded-full p-2 text-primary-foreground shadow-md group-hover:scale-110 transition-transform ring-2 ring-background">
          <Plus className="w-4 h-4" />
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      </div>
    </div>
  );
}
