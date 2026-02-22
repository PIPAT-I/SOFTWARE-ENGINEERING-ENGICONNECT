import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import type { SocialMedia } from "@/interfaces/user";

const SOCIAL_PLATFORMS = [
  "GitHub",
  "LinkedIn",
  "Twitter",
  "Instagram",
  "Facebook",
];
const SOCIAL_MAX_COUNT = 3;
interface SocialMediaInputProps {
  socials: SocialMedia[];
  platform: string;
  link: string;
  onPlatformChange: (value: string) => void;
  onLinkChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}
export default function SocialMediaInput({
  socials,
  platform,
  link,
  onPlatformChange,
  onLinkChange,
  onAdd,
  onRemove,
}: SocialMediaInputProps) {
  return (
    <div className="border-2 rounded-3xl p-4 bg-card">
      <Label className="text-sm font-medium mb-3 block">
        Social Media (Max {SOCIAL_MAX_COUNT})
      </Label>
      <div className="space-y-2 mb-3">
        {socials.map((social, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-xs bg-muted p-2 rounded-lg"
          >
            <span className="font-medium">{social.platform}:</span>
            <span className="flex-1 truncate text-muted-foreground">
              {social.link}
            </span>
            <button
              onClick={() => onRemove(index)}
              className="hover:text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {socials.length < SOCIAL_MAX_COUNT && (
        <div className="space-y-2">
          <Select value={platform} onValueChange={onPlatformChange}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              {SOCIAL_PLATFORMS.map((p: string) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="URL"
            className="h-9 text-sm"
            value={link}
            onChange={(e) => onLinkChange(e.target.value)}
          />
          <Button
            size="sm"
            className="w-full h-9 text-sm"
            onClick={onAdd}
            disabled={!platform || !link}
          >
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
