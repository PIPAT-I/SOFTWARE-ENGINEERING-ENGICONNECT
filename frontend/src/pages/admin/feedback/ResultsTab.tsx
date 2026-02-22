import { useState, useMemo } from "react";
import { ClipboardList, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getImageUrl } from "@/utils/imageUtils";
import FilterExport from "./FilterExport";
import type { Post } from "@/interfaces/post";
import type { EvaluationResultItem } from "@/interfaces/evaluation";

interface ResultsTabProps {
    selectedPost: Post | undefined;
    results: EvaluationResultItem[];
    loading: boolean;
}

export default function ResultsTab({
    selectedPost,
    results,
    loading,
}: ResultsTabProps) {
    const [selectedStudent, setSelectedStudent] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("");

    // Sorted results based on sortBy
    const sortedResults = useMemo(() => {
        if (!sortBy) return results;

        return [...results].sort((a, b) => {
            if (sortBy === "team_name") {
                return a.team_name.localeCompare(b.team_name);
            } else if (sortBy === "avg_score") {
                return b.avg_score - a.avg_score;
            } else if (sortBy === "student_id") {
                return a.student_id.localeCompare(b.student_id);
            }
            return 0;
        });
    }, [results, sortBy]);

    // Summary Stats calculation
    const summaryStats = useMemo(() => {
        if (results.length === 0) {
            return {
                avgScore: 0,
                totalResponses: 0,
                bestTopic: null as { name: string; score: number } | null,
                worstTopic: null as { name: string; score: number } | null,
            };
        }

        // Overall average score
        const avgScore =
            results.reduce((acc, r) => acc + r.avg_score, 0) / results.length;

        // Calculate average score per topic
        const topicScores: Record<string, { total: number; count: number }> = {};
        results.forEach((r) => {
            r.scores.forEach((s) => {
                if (!topicScores[s.topic_name]) {
                    topicScores[s.topic_name] = { total: 0, count: 0 };
                }
                topicScores[s.topic_name].total += s.score;
                topicScores[s.topic_name].count += 1;
            });
        });

        // Find best and worst topics
        let bestTopic: { name: string; score: number } | null = null;
        let worstTopic: { name: string; score: number } | null = null;

        Object.entries(topicScores).forEach(([name, data]) => {
            const avg = data.total / data.count;
            if (!bestTopic || avg > bestTopic.score) {
                bestTopic = { name, score: avg };
            }
            if (!worstTopic || avg < worstTopic.score) {
                worstTopic = { name, score: avg };
            }
        });

        return { avgScore, totalResponses: results.length, bestTopic, worstTopic };
    }, [results]);

    const selectedResult = sortedResults.find(
        (r) => String(r.response_id) === selectedStudent
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-4 bg-black rounded-full mb-4">
                    <ClipboardList className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                    ไม่มีผลการประเมิน
                </h3>
                <p className="text-slate-400">
                    ยังไม่มีผู้เข้าร่วมส่งแบบประเมินกิจกรรมนี้
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {/* Summary Cards */}
            <div className="px-6 py-4 border-b border-slate-100">
                <div className="grid grid-cols-4 gap-3">
                    {[
                        {
                            label: "คะแนนเฉลี่ยรวม",
                            value: summaryStats.avgScore.toFixed(1),
                        },
                        {
                            label: "จำนวนผู้ประเมิน",
                            value: summaryStats.totalResponses.toString(),
                        },
                        {
                            label: "หัวข้อที่ดีที่สุด",
                            value: summaryStats.bestTopic?.name || "-",
                            subValue: summaryStats.bestTopic
                                ? `${summaryStats.bestTopic.score.toFixed(1)} คะแนน`
                                : undefined,
                        },
                        {
                            label: "ควรปรับปรุง",
                            value: summaryStats.worstTopic?.name || "-",
                            subValue: summaryStats.worstTopic
                                ? `${summaryStats.worstTopic.score.toFixed(1)} คะแนน`
                                : undefined,
                        },
                    ].map((card, idx) => (
                        <div
                            key={idx}
                            className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-primary text-xs font-medium">
                                    {card.label}
                                </span>
                                <span className="text-slate-300 text-sm">→</span>
                            </div>
                            <div className="text-xl font-bold text-slate-900 truncate">
                                {card.value}
                            </div>
                            {card.subValue && (
                                <p className="text-xs text-slate-400 mt-0.5">{card.subValue}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex">
                {/* Left Panel - Student List */}
                <div className="w-1/2 border-r border-slate-100 p-6">
                    <h2 className="text-2xl font-bold mb-4">{selectedPost?.title}</h2>

                    {/* Sort Filter & Export */}
                    <FilterExport
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        results={sortedResults}
                        filename={selectedPost?.title || "results"}
                    />

                    <div className="space-y-3">
                        {sortedResults.map((r) => (
                            <button
                                key={r.response_id}
                                onClick={() => setSelectedStudent(String(r.response_id))}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${selectedStudent === String(r.response_id)
                                    ? "border-slate-900 bg-slate-50 shadow-sm"
                                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                    }`}
                            >
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden bg-slate-200">
                                    <img
                                        src={getImageUrl(r.avatar)}
                                        alt={r.user_name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 text-left min-w-0">
                                    <p className="font-semibold text-slate-900 truncate">
                                        {r.user_name}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                        <span className="flex items-center gap-1">
                                            <span className="text-slate-400">รหัส</span> {r.student_id}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="text-slate-400">ทีม</span> {r.team_name}
                                        </span>
                                    </div>
                                </div>

                                {/* Score */}
                                <div className="flex-shrink-0 text-center">
                                    <span className="text-2xl font-bold text-slate-900">
                                        {r.avg_score.toFixed(1)}
                                    </span>
                                    <p className="text-xs text-slate-400">คะแนน</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Panel - Student Detail */}
                <div className="w-1/2 p-6">
                    {!selectedStudent ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <p className="text-slate-400">เลือกผู้เข้าร่วมเพื่อดูรายละเอียด</p>
                        </div>
                    ) : selectedResult ? (
                        <div>
                            {/* Student Header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200">
                                    <img
                                        src={getImageUrl(selectedResult.avatar)}
                                        alt={selectedResult.user_name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold">{selectedResult.user_name}</h3>
                                    <p className="text-slate-500">
                                        {selectedResult.student_id}
                                        <br />
                                        ทีม {selectedResult.team_name}
                                    </p>
                                </div>
                                <span className="text-4xl font-bold">
                                    {selectedResult.avg_score.toFixed(1)}
                                </span>
                            </div>

                            {/* Scores */}
                            <div className="mb-6">
                                <h4 className="font-semibold mb-4">หัวข้อ</h4>
                                <div className="space-y-4">
                                    {selectedResult.scores.map((score, idx) => (
                                        <div key={idx}>
                                            <p className="text-sm mb-1">
                                                {idx + 1}. {score.topic_name}
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <Progress
                                                    value={(score.score / score.max_score) * 100}
                                                    className="h-3 flex-1"
                                                />
                                                <span className="text-sm font-medium w-10 text-right">
                                                    {score.score}/{score.max_score}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Comment */}
                            <div>
                                <h4 className="font-semibold mb-2">ความคิดเห็น</h4>
                                <div className="p-4 bg-slate-100 rounded-xl">
                                    <p className="text-slate-600">
                                        {selectedResult.suggestion || "ไม่มีความคิดเห็น"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
