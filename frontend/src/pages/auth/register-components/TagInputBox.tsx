import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface TagInputBoxProps {
  title: string;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
  presetOptions?: { value: string; label: string }[];
  placeholder?: string;
  colorScheme?: "blue" | "purple" | "green" | "orange" | "black";
}

const colorSchemes = {
  blue: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200",
  green: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200",
  black: "bg-black text-white border-black hover:bg-gray-800",
};

export default function TagInputBox({
  title,
  items,
  onAdd,
  onRemove,
  presetOptions,
  placeholder = "+ Add",
  colorScheme = "blue",
}: TagInputBoxProps) {
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSelectChange = (value: string) => {
    if (value === "other") {
      setShowCustomInput(true);
    } else {
      onAdd(value);
    }
  };

  const handleCustomAdd = () => {
    if (customInput.trim() && !items.includes(customInput.trim())) {
      onAdd(customInput.trim());
      setCustomInput("");
      setShowCustomInput(false);
    }
  };

  return (
    <div className="border-2 rounded-3xl p-4 bg-white">
      <Label className="text-sm font-medium mb-3 block">{title}</Label>
      <div className="flex flex-wrap gap-1.5 mb-3 min-h-10">
        {items.map((item) => (
          <Badge
            key={item}
            className={`text-xs border ${colorSchemes[colorScheme]}`}
          >
            {item}
            <button
              onClick={() => onRemove(item)}
              className="ml-1.5 hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>

      {showCustomInput ? (
        <div className="flex gap-2">
          <Input
            placeholder="Type here..."
            className="h-9 text-sm flex-1"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCustomAdd();
              }
            }}
            autoFocus
          />
          <Button size="sm" className="h-9" onClick={handleCustomAdd}>
            Add
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9"
            onClick={() => {
              setShowCustomInput(false);
              setCustomInput("");
            }}
          >
            Cancel
          </Button>
        </div>
      ) : presetOptions && presetOptions.length > 0 ? (
        <Select onValueChange={handleSelectChange}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {presetOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
            <SelectItem value="other">Other...</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="w-full h-9"
          onClick={() => setShowCustomInput(true)}
        >
          {placeholder}
        </Button>
      )}
    </div>
  );
}
