import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CSVLink } from "react-csv";
import { Download } from "lucide-react";
import type { EvaluationResultItem } from "@/interfaces/evaluation";

interface FilterExportProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  results: EvaluationResultItem[];
  filename: string;
}

export default function FilterExport({
  sortBy,
  onSortChange,
  results,
  filename,
}: FilterExportProps) {
  const csvHeaders = useMemo(() => {
    const baseHeaders = [
      { label: "ลำดับ", key: "index" },
      { label: "รหัสนักศึกษา", key: "student_id" },
      { label: "ชื่อ-นามสกุล", key: "user_name" },
      { label: "ทีม", key: "team_name" },
    ];

    const topicHeaders = (results[0]?.scores || []).map((s, idx) => ({
      label: s.topic_name || `หัวข้อ ${idx + 1}`,
      key: `topic_${s.topic_id}`,
    }));

    return [
      ...baseHeaders,
      ...topicHeaders,
      { label: "คะแนนเฉลี่ย", key: "avg_score" },
      { label: "ความคิดเห็น", key: "suggestion" },
    ];
  }, [results]);

  // CSV Data
  const csvData = results.map((r, i) => {
    const base: Record<string, unknown> = {
      index: i + 1,
      student_id: r.student_id,
      user_name: r.user_name,
      team_name: r.team_name,
      avg_score: r.avg_score.toFixed(2),
      suggestion: r.suggestion || "-",
    };

    // Add topic scores
    r.scores.forEach((s) => {
      base[`topic_${s.topic_id}`] = s.score;
    });

    return base;
  });

  return (
    <div className="flex items-center gap-3 mb-4">
      {/* Sort Dropdown */}
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="เรียงลำดับตาม" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="team_name">ทีม</SelectItem>
          <SelectItem value="avg_score">คะแนน</SelectItem>
          <SelectItem value="student_id">รหัส</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear button */}
      {sortBy && (
        <button
          onClick={() => onSortChange("")}
          className="text-sm text-slate-400 hover:text-slate-600"
        >
          ล้าง
        </button>
      )}

      <div className="flex-1" />

      {/* Export CSV button */}
      <CSVLink
        data={csvData}
        headers={csvHeaders}
        filename={`ผลประเมินและความคิดเห็นของกิจกรรม_${filename}.csv`}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
      >
        <Download className="w-4 h-4" />
        Export CSV
      </CSVLink>
    </div>
  );
}
