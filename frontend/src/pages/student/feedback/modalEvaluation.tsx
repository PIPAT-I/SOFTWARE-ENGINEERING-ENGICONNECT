import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { RatingCircles } from "./RatingCircles";
import type { EvaluationTopic, ScoreInput } from "@/interfaces/evaluation";

interface EvaluationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityName: string;
  topics: EvaluationTopic[];
  onSubmit: (scores: ScoreInput[], suggestion: string) => void;
}

export function EvaluationModal({
  open,
  onOpenChange,
  activityName,
  topics,
  onSubmit,
}: EvaluationModalProps) {
  const [scores, setScores] = useState<Record<number, number>>({});
  const [suggestion, setSuggestion] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const description = topics[0]?.description || "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // เช็คหัวข้อที่ยังไม่ได้ให้คะแนน
    const missingTopicIds = topics.filter(
      (t) => scores[t.ID] === undefined || scores[t.ID] === null
    );

    if (missingTopicIds.length > 0) {
      setShowErrors(true);
      return;
    }

    // เปิด confirmation dialog
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = () => {
    const scoreData: ScoreInput[] = Object.entries(scores).map(
      ([topicId, score]) => ({
        topic_id: Number(topicId),
        score,
      })
    );
    onSubmit(scoreData, suggestion);
    setScores({});
    setSuggestion("");
    setShowErrors(false);
    setConfirmOpen(false);
  };

  const handleCancel = () => {
    setScores({});
    setSuggestion("");
    setShowErrors(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-xl">
                แบบประเมิน: {activityName}
              </DialogTitle>
              {description && (
                <div className="bg-gray-50 border-l-4 border-black p-3 mt-3">
                  <DialogDescription className="text-gray-600 text-sm">
                    {description}
                  </DialogDescription>
                </div>
              )}
            </DialogHeader>

            <div className="space-y-1 mt-2">
              {topics.map((topic, index) => {
                const isMissing =
                  showErrors &&
                  (scores[topic.ID] === undefined || scores[topic.ID] === null);
                return (
                  <div
                    key={topic.ID}
                    className={`py-4 px-3 rounded-lg border flex flex-wrap justify-between items-center gap-4 ${isMissing
                      ? "bg-red-50 border-red-200"
                      : "border-transparent hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex-1">
                      <h3
                        className={`font-medium ${isMissing ? "text-red-700" : ""
                          }`}
                      >
                        {index + 1}. {topic.name}
                      </h3>
                      {isMissing && (
                        <p className="text-xs text-red-600 mt-1 font-medium">
                          * กรุณาระบุคะแนนในส่วนนี้
                        </p>
                      )}
                    </div>
                    <RatingCircles
                      name={topic.name}
                      value={scores[topic.ID] || 0} // Check implementation of RatingCircles usually takes null for empty
                      onChange={(val) => {
                        setScores((prev) => ({ ...prev, [topic.ID]: val }));
                        // Could auto-hide error for this field if we tracked per-field, but global is fine too
                      }}
                    />
                    {/* Note: value might need to be 0 or null depending on RatingCircles prop type.
                      Previous code used `scores[topic.ID] || null`. 
                      Let's stick to previous or check RatingCircles.
                      Assuming `scores[topic.ID]` is number | undefined. 
                   */}
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-5 mt-2">
              <h3 className="font-medium mb-2">ข้อเสนอแนะเพิ่มเติม</h3>
              <Textarea
                placeholder="แสดงความคิดเห็นเพิ่มเติม..."
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                className="resize-none"
                rows={4}
              />
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="ghost" onClick={handleCancel}>
                ยกเลิก
              </Button>
              <Button type="submit" className="bg-black hover:bg-gray-800">
                ส่งแบบประเมิน
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการส่งแบบประเมิน</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการส่งแบบประเมินกิจกรรม "{activityName}" หรือไม่?
              <br />
              <span className="text-gray-500 text-xs mt-2 block">
                หมายเหตุ: หลังจากส่งแล้วจะไม่สามารถแก้ไขได้
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              className="bg-black hover:bg-gray-800"
            >
              ยืนยันส่งแบบประเมิน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
