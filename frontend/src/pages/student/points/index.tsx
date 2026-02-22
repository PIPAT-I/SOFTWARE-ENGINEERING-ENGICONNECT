import { useState, useEffect, type SetStateAction } from "react";
import { Gift, Award, Calendar } from "lucide-react";
import { TbStarFilled } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import ReactCalendar from "react-calendar";
import { GrAchievement, GrUserExpert } from "react-icons/gr";
import "react-calendar/dist/Calendar.css";
import { toast } from "react-toastify";
import {
  getTotalPoints,
  getMembershipLevel,
  getPointRecords,
  dailyCheckin,
  getRewards,
} from "@/services/pointsService";
import { useAuth } from "@/context/AuthContext";
import { getImageUrl } from "@/utils/imageUtils";

export default function StudentPointsPage() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>กรุณาเข้าสู่ระบบ</div>;
  const userId = user.id;
  const [points, setPoints] = useState(0);
  const [activities, setActivities] = useState<any[]>([]);
  const [checkinDates, setCheckinDates] = useState<Date[]>([]);
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);
  const [currentLevel, setCurrentLevel] = useState("");
  const [availableRewards, setAvailableRewards] = useState<any[]>([]);

  // คำนวณคะแนนที่ต้องการเพื่อไประดับถัดไป (จะคำนวณใหม่หลังจาก getLevelInfo)

  const navigate = useNavigate();

  // ฟังก์ชันรับคะแนนรายวัน (mock)
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const hasCheckedInToday = checkinDates.some(
    (d) => d.getTime() === todayDate.getTime()
  );

  const handleDailyCheckin = async () => {
    if (!userId) return;
    if (hasCheckedInToday) {
      toast.warning("วันนี้คุณเช็คอินรับคะแนนไปแล้ว");
      return;
    }
    try {
      const res = await dailyCheckin(userId);
      if (res?.error === "already checked in today") {
        toast.warning("วันนี้คุณเช็คอินรับคะแนนไปแล้ว");
        return;
      }
      // อัปเดตคะแนนใหม่
      const data = await getTotalPoints(userId);
      setPoints(data.total_points);
      setCheckinDates((prev) => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return [...prev, d];
      });

      setActivities([
        {
          id: Date.now(),
          name: "เช็คอินประจำวัน",
          points: 20,
          created_at: new Date().toISOString(),
          type: "daily_checkin",
        },
        ...activities,
      ]);
      setShowCalendarPopup(true); // แสดงปฏิทินหลังเช็คอินสำเร็จ
      toast.success("เช็คอินสำเร็จ! ได้รับ 20 คะแนน");
    } catch (e) {
      toast.error("เกิดข้อผิดพลาดในการเช็คอิน");
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "activity_participation":
        return <GrAchievement color="#FACC15" />;
      case "daily_checkin":
        return <TbStarFilled color="#FACC15" />;
      default:
        return <GrUserExpert color="#FACC15" />;
    }
  };

  useEffect(() => {
    console.log("userId:", userId);
    if (!userId) return;
    getTotalPoints(userId).then(
      (data: { total_points: SetStateAction<number> }) => {
        console.log("getTotalPoints:", data);
        setPoints(data.total_points);
      }
    );
    getPointRecords(userId).then((records: any[]) => {
      console.log("getPointRecords:", records);
      // ตรวจสอบว่าเป็น array หรือไม่
      if (!Array.isArray(records)) {
        console.error("records is not an array:", records);
        return;
      }
      // เรียงจากใหม่ไปเก่า (created_at ล่าสุดอยู่บน)
      const sorted = [...records].sort(
        (a, b) =>
          new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
      );
      setActivities(
        sorted.map((r) => ({
          id: r.id || r.ID,
          name: r.activity_name || r.description || "คะแนนต้อนรับสมาชิกใหม่",
          points: r.points,
          created_at: r.CreatedAt,
          type: r.type || "activity",
        }))
      );
    });
    getMembershipLevel(userId).then((data: { membership_level: any }) => {
      console.log("getMembershipLevel:", data);
      setCurrentLevel(data.membership_level || "");
    });
    getRewards().then((data: any[]) => {
      // เงื่อนไข: แลกได้ = stock > 0 และ points <= คะแนนปัจจุบัน
      setAvailableRewards(
        data.filter(
          (r) => r.stock > 0 && points >= (r.point_required || r.points || 0)
        )
      );
    });
  }, [userId, points]);

  useEffect(() => {
    if (!userId) return;
    getPointRecords(userId).then((records: any[]) => {
      // ตรวจสอบว่าเป็น array หรือไม่
      if (!Array.isArray(records)) return;
      // filter เฉพาะ daily_checkin
      const checkin = records.filter((r) => r.type === "daily_checkin");
      // แปลงวันที่เป็น Date object (ใช้ created_at หรือ CreatedAt)
      setCheckinDates(
        checkin.map((r) => {
          const d = new Date(r.created_at || r.CreatedAt);
          d.setHours(0, 0, 0, 0);
          return d;
        })
      );
    });
  }, [userId]);

  // ฟังก์ชันช่วยคำนวณช่วง membership
  const getLevelInfo = (points: number) => {
    if (points >= 5001) return { level: "แพลทินัม", min: 5001, max: 10000 };
    if (points >= 1001) return { level: "ทอง", min: 1001, max: 5000 };
    if (points >= 201) return { level: "เงิน", min: 201, max: 1000 };
    return { level: "เริ่มต้น", min: 0, max: 200 };
  };

  const levelInfo = getLevelInfo(points);
  const nextLevelPoints = Math.max(0, levelInfo.max - points);
  const percent = Math.min(
    100,
    ((points - levelInfo.min) / (levelInfo.max - levelInfo.min)) * 100
  );

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "rgb(248, 249, 250)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* 🔵 พื้นหลังฟ้า */}
      <div
        style={{
          width: "100%",
          height: "140px",
          background: "rgb(248, 249, 250)",
          position: "relative",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* การ์ดคะแนนลอย */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            transform: "translateY(50%)",
            width: "90%",
            maxWidth: "900px",
            background: "rgb(248, 249, 250)",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
            border: "2px solid rgb(233, 236, 239)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <TbStarFilled size={40} color="#FACC15" />

            <div style={{ fontSize: "20px", fontWeight: "600" }}>
              คะแนนของฉัน
            </div>

            <div
              style={{
                marginLeft: "auto",
                fontSize: "40px",
                fontWeight: "600",
              }}
            >
              {points}
            </div>

            <div style={{ color: "#6b7280" }}>คะแนน</div>
          </div>

          <div
            style={{
              marginTop: "4px",
              marginLeft: "56px",
              fontSize: "13px",
              color: "#9ca3af",
            }}
          >
            อีก {nextLevelPoints} คะแนนเพื่อระดับถัดไป
          </div>
        </div>
      </div>

      {/* กันพื้นที่ */}
      <div style={{ height: "90px" }}></div>

      {/* ปุ่ม */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginTop: "8px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button
          style={{
            background: hasCheckedInToday ? "8080" : "000",
            color: hasCheckedInToday ? "gray" : "fff",
            minWidth: "180px",
            padding: "20px 32px",
            fontSize: "18px",
            fontWeight: "600",
            borderRadius: "14px",
            border: "none",
            cursor: hasCheckedInToday ? "not-allowed" : "pointer",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            height: 36,
          }}
          onClick={handleDailyCheckin}
          disabled={hasCheckedInToday}
        >
          <Calendar size={20} />{" "}
          {hasCheckedInToday ? "รับคะแนนแล้ววันนี้" : "รับคะแนนรายวัน"}
        </button>

        <button
          style={{
            background: "#000",
            color: "white",
            minWidth: "180px",
            padding: "20px 32px",
            fontSize: "18px",
            fontWeight: "600",
            borderRadius: "14px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            height: 36,
          }}
          onClick={() => navigate("/student/points/reward")}
        >
          <Gift size={20} /> แลกรางวัล
        </button>
      </div>

      {/* การ์ดระดับ */}
      <div
        style={{
          marginTop: "24px",
          width: "100%",
          maxWidth: "420px",
          background: "white",
          borderRadius: "16px",
          padding: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Award size={24} color="#FACC15" />
            <div style={{ fontWeight: "600", fontSize: "18px" }}>
              ระดับ {currentLevel || levelInfo.level}
            </div>
          </div>
          <div style={{ fontWeight: 600, color: "#374151", fontSize: "15px" }}>
            {points} / {levelInfo.max} คะแนน
          </div>
        </div>
        <div
          style={{
            width: "100%",
            height: "10px",
            background: "#E5E7EB",
            borderRadius: "20px",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${percent}%`,
              height: "10px",
              borderRadius: "20px",
              background: "linear-gradient(to right, #FACC15, #F472B6)",
              transition: "width 0.5s",
            }}
          ></div>
        </div>
      </div>

      {/* การ์ดรางวัลที่แลกได้ในขณะนี้ */}
      <div
        style={{ width: "100%", maxWidth: "900px", margin: "32px auto 0 auto" }}
      >
        <div
          style={{ fontSize: "20px", fontWeight: "500", marginBottom: "12px" }}
        >
          รางวัลที่แลกได้ในขณะนี้
        </div>
        <div
          style={{
            display: "flex",
            gap: "20px",
            overflowX: "auto",
            paddingBottom: "8px",
          }}
        >
          {availableRewards.length === 0 && (
            <div style={{ color: "#888", fontSize: 16 }}>
              ยังไม่มีรางวัลที่แลกได้
            </div>
          )}
          {availableRewards.map((reward, idx) => (
            <div
              key={reward.id || idx}
              style={{
                minWidth: "220px",
                background: "#fff",
                borderRadius: "18px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                padding: "18px",
                color: "#333",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img
                src={getImageUrl(reward.reward_image)}
                alt={reward.reward_name}
                style={{
                  width: 80,
                  height: 80,
                  objectFit: "contain",
                  marginBottom: 16,
                  borderRadius: 12,
                  boxShadow: "0 2px 8px #0001",
                }}
              />
              <div
                style={{
                  fontWeight: 500,
                  fontSize: 16,
                  marginBottom: 8,
                  color: "#3730a3",
                  textAlign: "center",
                }}
              >
                {reward.reward_name}
              </div>
              <div
                style={{
                  color: "#f472b6",
                  fontWeight: 700,
                  fontSize: 18,
                  marginBottom: 4,
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <TbStarFilled size={18} color="#fbbf24" />
                {typeof reward.point_required === "number"
                  ? reward.point_required.toLocaleString()
                  : 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* คะแนนล่าสุด */}
      <div style={{ width: "100%", maxWidth: "900px", marginTop: "40px" }}>
        <div
          style={{ fontSize: "20px", fontWeight: "500", marginBottom: "12px" }}
        >
          คะแนนที่ได้รับล่าสุด
        </div>
        <div
          style={{
            background: "#FEF6DF",
            borderRadius: "16px",
            padding: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            maxHeight: "500px",
            overflowY: "auto",
          }}
        >
          {activities.map((activity) => (
            <div
              key={activity.id}
              style={{
                background: "white",
                padding: "16px",
                borderRadius: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    background: "#FEF6DF",
                    borderRadius: "10px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "20px",
                  }}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div>
                  <div style={{ fontWeight: "500", color: "#374151" }}>
                    {activity.type === "daily_checkin"
                      ? "เช็คอินประจำวัน"
                      : activity.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {new Date(activity.created_at).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
              <div
                style={{
                  background: "000",
                  color: "fff",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                +{activity.points}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popup ปฏิทิน */}
      {showCalendarPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "32px 24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              minWidth: "340px",
              maxWidth: "90vw",
              position: "relative",
            }}
          >
            <div
              style={{
                fontWeight: "600",
                fontSize: "20px",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              ประวัติการรับคะแนนรายวัน
            </div>
            <ReactCalendar
              value={null}
              tileClassName={({ date }) =>
                checkinDates.some(
                  (d) =>
                    d.getTime() ===
                    new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate()
                    ).getTime()
                )
                  ? "checkin-highlight"
                  : undefined
              }
            />
            <div
              style={{
                textAlign: "center",
                marginTop: "12px",
                color: "#6b7280",
                fontSize: "15px",
              }}
            >
              เช็คอินแล้ว {checkinDates.length} วัน
            </div>
            <button
              style={{
                marginTop: "24px",
                background: "#F472B6",
                color: "white",
                padding: "10px 24px",
                fontSize: "16px",
                fontWeight: "600",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
              }}
              onClick={() => setShowCalendarPopup(false)}
            >
              ปิด
            </button>
            <style>{`
              .checkin-highlight {
                background: #F9A8D4 !important;
                color: white !important;
                border-radius: 50% !important;
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}
