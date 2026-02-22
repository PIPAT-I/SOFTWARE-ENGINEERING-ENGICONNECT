import { useState, useEffect } from "react";
import { ClipboardList, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GetMyRegisteredPosts,
  GetTopicsByPost,
  SubmitEvaluation,
} from "@/services/evaluationService";
import { formatBase64ToDataURL } from "@/services/postServices";
import { EvaluationModal } from "./modalEvaluation";
import { toast } from "react-toastify";
import type {
  MyRegistration,
  EvaluationTopic,
  ScoreInput,
} from "@/interfaces/evaluation";
export default function StudentFeedbackPage() {
  const [registrations, setRegistrations] = useState<MyRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState<MyRegistration | null>(null);
  const [topics, setTopics] = useState<EvaluationTopic[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    const res = await GetMyRegisteredPosts();
    if (res?.status === 200) {
      setRegistrations(res.data?.data || []);
    }
    setLoading(false);
  };

  const openEvaluation = async (reg: MyRegistration) => {
    setSelectedReg(reg);
    const res = await GetTopicsByPost(reg.post.ID);
    if (res?.status === 200) {
      setTopics(res.data?.data || []);
      setModalOpen(true);
    } else {
      toast.error(res?.data?.error || "ไม่พบหัวข้อประเมิน");
    }
  };

  const handleSubmit = async (scores: ScoreInput[], suggestion: string) => {
    if (!selectedReg) return;
    const res = await SubmitEvaluation({
      registration_id: selectedReg.ID,
      scores,
      suggestion,
    });
    if (res?.status === 201) {
      toast.success("ส่งแบบประเมินสำเร็จ!");
      setModalOpen(false);
      loadRegistrations();
    } else {
      toast.error(res?.data?.error || "เกิดข้อผิดพลาด");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <ClipboardList className="w-12 h-12 text-black mb-4" />
        <p className="text-lg font-medium text-gray-400">
          ไม่มีกิจกรรมให้ประเมิน
        </p>
        <p className="text-gray-400">กิจกรรมที่คุณลงทะเบียนยังไม่สิ้นสุด</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">ประเมินกิจกรรม</h1>
      <div className="flex flex-row flex-wrap gap-6">
        {registrations.map((reg) => (
          <div
            key={reg.ID}
            className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4 w-80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
          >
            {/* รูปภาพกิจกรรม */}
            <div className="w-full h-44 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
              {reg.post.picture ? (
                <img
                  src={formatBase64ToDataURL(reg.post.picture)}
                  alt={reg.post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ClipboardList className="w-12 h-12 text-gray-300" />
                </div>
              )}
            </div>

            {/* ข้อมูลกิจกรรม */}
            <div className="flex-1 space-y-2">
              <h3 className="font-bold text-base line-clamp-2 text-gray-900">
                {reg.post.title}
              </h3>
              <p className="text-sm text-gray-500">
                ผู้จัด: {reg.post.organizer}
              </p>
              <p className="text-sm text-gray-400">ทีม: {reg.team_name}</p>
            </div>

            {/* ปุ่มประเมิน */}
            <Button
              onClick={() => openEvaluation(reg)}
              className="w-full bg-black hover:bg-gray-800 rounded-xl py-3 font-medium transition-all duration-200 hover:shadow-lg"
            >
              ประเมินกิจกรรม
            </Button>
          </div>
        ))}
      </div>

      <EvaluationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        activityName={selectedReg?.post.title || ""}
        topics={topics}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
