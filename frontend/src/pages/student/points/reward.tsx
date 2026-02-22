import { useState, useEffect } from 'react';
import { Gift, Lock, Check, Trophy, ArrowLeft } from 'lucide-react';
import { TbStarFilled } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { getTotalPoints, getRewards, redeemReward, getRedeemedRewards } from '@/services/pointsService';
import { useAuth } from '@/context/AuthContext';
import type { Reward } from '@/interfaces/reward';
import { toast } from 'react-toastify';
import { FaLightbulb } from 'react-icons/fa6';
import { getImageUrl } from '@/utils/imageUtils';

export default function RewardLevelsPage() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>กรุณาเข้าสู่ระบบ</div>;
  const [userPoints, setUserPoints] = useState<number>(0);
  const [redeemedRewards, setRedeemedRewards] = useState<number[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const navigate = useNavigate();

  // ดึงคะแนนจาก backend ด้วย userId จริง
  useEffect(() => {
    if (!user?.id) return;
    const fetchPoints = async () => {
      try {
        const res = await getTotalPoints(user.id as number);
        console.log('getTotalPoints response:', res); // log เพื่อตรวจสอบค่าที่รับมา
        setUserPoints(res.total_points || 0);
      } catch (e) {
        setUserPoints(0);
      }
    };
    fetchPoints();
  }, [user?.id]);

  // ดึง rewards จาก backend
  useEffect(() => {
    getRewards().then((data: any[]) => {
      setRewards(
        data.map((r: any) => ({
          id: r.ID || r.id,
          name: r.reward_name || r.name,
          points: r.point_required || r.points,
          img: r.reward_image || r.img,
          level: r.level || 'basic',
          stock: r.stock,
          desc: r.description
        }))
      );
    });
  }, []);

  // เพิ่ม useEffect เพื่อดึงข้อมูลรางวัลที่แลกไปแล้วจาก backend (หรือ localStorage ถ้ามี)
  // สมมุติ backend มี endpoint /points/redeemed/:userId
  useEffect(() => {
    if (!user?.id) return;
    // ดึงรางวัลที่แลกไปแล้ว
    getRedeemedRewards(user.id).then((redeemedIds: number[]) => {
      setRedeemedRewards(redeemedIds);
    });
  }, [user?.id]);

  const canRedeem = (points: number) => userPoints >= points;
  const isRedeemed = (id: number) => redeemedRewards.includes(id);

  const [confirmReward, setConfirmReward] = useState<Reward | null>(null);

  const handleRedeem = (reward: Reward) => {
    // ตรวจสอบว่าคะแนนพอหรือไม่
    if (!canRedeem(reward.points)) {
      toast.error(`คะแนนของคุณไม่เพียงพอ ต้องการอีก ${reward.points - userPoints} คะแนน`);
      return;
    }
    // ตรวจสอบว่าแลกไปแล้วหรือยัง
    if (isRedeemed(reward.id)) {
      toast.warning('คุณได้แลกรางวัลนี้ไปแล้ว');
      return;
    }
    // ตรวจสอบสต็อก
    if (reward.stock === 0) {
      toast.error('รางวัลนี้หมดแล้ว');
      return;
    }
    setConfirmReward(reward);
  };

  const handleConfirmRedeem = async () => {
    if (confirmReward && user?.id) {
      // เรียกใช้งาน redeemReward service
      const result = await redeemReward(user.id, confirmReward.id);
      if (result && !result.error) {
        setUserPoints(userPoints - confirmReward.points);
        setRedeemedRewards([...redeemedRewards, confirmReward.id]);
        toast.success(`แลก ${confirmReward.name} สำเร็จ! `);
      } else {
        toast.error(result.error || "เกิดข้อผิดพลาดในการแลกของรางวัล");
      }
      setConfirmReward(null);
    }
  };

  const handleCancelRedeem = () => {
    setConfirmReward(null);
  };

  // style สำหรับ grid 4 คอลัมน์
  const grid4Col = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginTop: "20px"
  };

  // ปรับ boxStyle ให้ type ถูกต้อง (ใช้ as const)
  const boxStyle = (bg: string, reward: any) => ({
    width: "220px",
    height: "260px",
    backgroundColor: bg,
    borderRadius: '16px',
    marginRight: '20px',
    marginBottom: '20px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between' as const,
    position: 'relative' as const,
    cursor: !canRedeem(reward.points) || isRedeemed(reward.id) || reward.stock === 0 ? 'not-allowed' : 'pointer',
    opacity: !canRedeem(reward.points) || isRedeemed(reward.id) || reward.stock === 0 ? 0.6 : 1,
    border: isRedeemed(reward.id) ? '3px solid #10b981' : 'none',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    alignItems: 'center' as const,
  });

  // สีการ์ดตามระดับคะแนนที่ต้องใช้แลก (membership level)
  const getCardBg = (points: number) => {
    if (points >= 5001) return "#e0e7ff";    // platinum (indigo-100)
    if (points >= 1001) return "#fef9c3";    // gold (yellow-100)
    if (points >= 201) return "#e0f2fe";    // silver (sky-100)
    return "#D1EFE5";                        // basic (เขียวอ่อน)
  };

  const pointsHeader = {
    backgroundColor: "#f8f9fa",
    padding: "20px 30px",
    borderRadius: "16px",
    marginBottom: "30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "2px solid #e9ecef",
  };

  // แบ่ง rewards ตามคะแนนที่ต้องใช้แลก (ไม่ใช้ r.level)
  const platinumRewards = rewards.filter(r => typeof r.points === 'number' && r.points >= 1000);
  const goldRewards = rewards.filter(r => typeof r.points === 'number' && r.points >= 500 && r.points < 1000);
  const silverRewards = rewards.filter(r => typeof r.points === 'number' && r.points >= 200 && r.points < 500);
  const basicRewards = rewards.filter(r => typeof r.points === 'number' && r.points < 200);

  return (
    <div style={{
      width: "90%",
      maxWidth: "1400px",
      minHeight: "100vh",
      padding: "30px 0",
      margin: "0 auto"
    }}>
      {/* ปุ่มกลับไปหน้าคะแนน */}
      <button
        style={{
          marginBottom: "24px",
          background: "transparent",
          color: "#000",
          padding: "8px 12px",
          fontSize: "14px",
          fontWeight: "500",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        onClick={() => navigate("/student/points")}
      >
        <ArrowLeft size={20} />
      </button>

      {/* Header แสดงคะแนน */}
      <div style={pointsHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <TbStarFilled size={32} color="#fbbf24" />
          <div>
            <div style={{ fontSize: "14px", color: "#6b7280" }}>คะแนนของฉัน</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "#1f2937" }}>{userPoints.toLocaleString()}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>รางวัลที่แลกแล้ว</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#000" }}>{redeemedRewards.length}</div>
        </div>
      </div>

      {/* แสดง rewards จริงจาก backend */}
      <div style={{ marginTop: 40 }}>
        {/* Platinum */}
        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 18, color: '#000', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trophy size={22} color="#000" /> ของรางวัลระดับแพลทินัม
        </div>
        <div style={grid4Col}>
          {platinumRewards.map(reward => (
            <div
              key={reward.id}
              style={boxStyle(getCardBg(reward.points), reward)}
              onClick={() => handleRedeem(reward)}
            >
              {isRedeemed(reward.id) && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  padding: '6px',
                }}>
                  <Check size={20} color="white" />
                </div>
              )}
              {reward.stock === 0 && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  padding: '6px',
                }}>
                  <Lock size={16} color="white" />
                </div>
              )}
              <img src={getImageUrl(reward.img)} alt={reward.name} style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 16, borderRadius: 12, boxShadow: '0 2px 8px #0001' }} />
              <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 8, color: '#3730a3', textAlign: 'center' }}>{reward.name}</div>
              <div style={{ color: '#f472b6', fontWeight: 700, fontSize: 18, marginBottom: 4, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><TbStarFilled style={{ color: '#fbbf24' }} /> {(typeof reward.points === 'number' ? reward.points.toLocaleString() : 0)}</div>
              {reward.desc && <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 6 }}>{reward.desc}</div>}
              {!canRedeem(reward.points) && !isRedeemed(reward.id) && reward.stock > 0 && (
                <div style={{ fontSize: '12px', color: '#ef4444', textAlign: 'center', marginTop: '4px' }}>
                  ต้องการอีก {typeof reward.points === 'number' ? (reward.points - userPoints).toLocaleString() : 0} คะแนน
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Gold */}
        <div style={{ fontSize: 20, fontWeight: 600, margin: '32px 0 10px 0', color: '#000', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trophy size={20} color="#000" /> ของรางวัลระดับทอง
        </div>
        <div style={grid4Col}>
          {goldRewards.map(reward => (
            <div
              key={reward.id}
              style={boxStyle(getCardBg(reward.points), reward)}
              onClick={() => handleRedeem(reward)}
            >
              {isRedeemed(reward.id) && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  padding: '6px',
                }}>
                  <Check size={20} color="white" />
                </div>
              )}
              {reward.stock === 0 && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  padding: '6px',
                }}>
                  <Lock size={16} color="white" />
                </div>
              )}
              <img src={getImageUrl(reward.img)} alt={reward.name} style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 16, borderRadius: 12, boxShadow: '0 2px 8px #0001' }} />
              <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 8, color: '#3730a3', textAlign: 'center' }}>{reward.name}</div>
              <div style={{ color: '#f472b6', fontWeight: 700, fontSize: 18, marginBottom: 4, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><TbStarFilled style={{ color: '#fbbf24' }} /> {(typeof reward.points === 'number' ? reward.points.toLocaleString() : 0)}</div>
              {reward.desc && <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 6 }}>{reward.desc}</div>}
              {!canRedeem(reward.points) && !isRedeemed(reward.id) && reward.stock > 0 && (
                <div style={{ fontSize: '12px', color: '#ef4444', textAlign: 'center', marginTop: '4px' }}>
                  ต้องการอีก {typeof reward.points === 'number' ? (reward.points - userPoints).toLocaleString() : 0} คะแนน
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Silver */}
        <div style={{ fontSize: 20, fontWeight: 600, margin: '32px 0 10px 0', color: '#000', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trophy size={20} color="#000" /> ของรางวัลระดับเงิน
        </div>
        <div style={grid4Col}>
          {silverRewards.map(reward => (
            <div
              key={reward.id}
              style={boxStyle(getCardBg(reward.points), reward)}
              onClick={() => handleRedeem(reward)}
            >
              {isRedeemed(reward.id) && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  padding: '6px',
                }}>
                  <Check size={20} color="white" />
                </div>
              )}
              {reward.stock === 0 && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  padding: '6px',
                }}>
                  <Lock size={16} color="white" />
                </div>
              )}
              <img src={getImageUrl(reward.img)} alt={reward.name} style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 16, borderRadius: 12, boxShadow: '0 2px 8px #0001' }} />
              <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 8, color: '#3730a3', textAlign: 'center' }}>{reward.name}</div>
              <div style={{ color: '#f472b6', fontWeight: 700, fontSize: 18, marginBottom: 4, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><TbStarFilled style={{ color: '#fbbf24' }} /> {(typeof reward.points === 'number' ? reward.points.toLocaleString() : 0)}</div>
              {reward.desc && <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 6 }}>{reward.desc}</div>}
              {!canRedeem(reward.points) && !isRedeemed(reward.id) && reward.stock > 0 && (
                <div style={{ fontSize: '12px', color: '#ef4444', textAlign: 'center', marginTop: '4px' }}>
                  ต้องการอีก {typeof reward.points === 'number' ? (reward.points - userPoints).toLocaleString() : 0} คะแนน
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Basic */}
        <div style={{ fontSize: 20, fontWeight: 600, margin: '32px 0 10px 0', color: '#000', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Gift size={20} color="#000" /> ของรางวัลระดับเริ่มต้น
        </div>
        <div style={grid4Col}>
          {basicRewards.map(reward => (
            <div
              key={reward.id}
              style={boxStyle(getCardBg(reward.points), reward)}
              onClick={() => handleRedeem(reward)}
            >
              {isRedeemed(reward.id) && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  padding: '6px',
                }}>
                  <Check size={20} color="white" />
                </div>
              )}
              {reward.stock === 0 && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  padding: '6px',
                }}>
                  <Lock size={16} color="white" />
                </div>
              )}
              <img src={getImageUrl(reward.img)} alt={reward.name} style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 16, borderRadius: 12, boxShadow: '0 2px 8px #0001' }} />
              <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 8, color: '#3730a3', textAlign: 'center' }}>{reward.name}</div>
              <div style={{ color: '#f472b6', fontWeight: 700, fontSize: 18, marginBottom: 4, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><TbStarFilled style={{ color: '#fbbf24' }} /> {(typeof reward.points === 'number' ? reward.points.toLocaleString() : 0)}</div>
              {reward.desc && <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 6 }}>{reward.desc}</div>}
              {!canRedeem(reward.points) && !isRedeemed(reward.id) && reward.stock > 0 && (
                <div style={{ fontSize: '12px', color: '#ef4444', textAlign: 'center', marginTop: '4px' }}>
                  ต้องการอีก {typeof reward.points === 'number' ? (reward.points - userPoints).toLocaleString() : 0} คะแนน
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* คำแนะนำ */}
      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#f3f4f6',
        borderRadius: '12px',
        fontSize: '14px',
        color: '#4b5563',
      }}>
        <strong><FaLightbulb />วิธีการแลกรางวัล:</strong>
        <ul style={{ marginTop: '10px', marginLeft: '20px' }}>
          <li>คลิกที่รางวัลที่ต้องการแลก (ต้องมีคะแนนเพียงพอและของยังไม่หมด)</li>
          <li>รางวัลที่แลกแล้วจะมีเครื่องหมาย ✓ สีเขียว</li>
        </ul>
      </div>

      {/* Modal ยืนยันการแลก */}
      {confirmReward && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.25)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, minWidth: 320, boxShadow: "0 4px 24px #0002", textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>ยืนยันการแลกรางวัล</div>
            <div style={{ fontSize: 16, marginBottom: 18 }}>คุณต้องการแลก <span style={{ fontWeight: 600 }}>{confirmReward.name}</span> ใช้ <span style={{ color: '#fbbf24', fontWeight: 700 }}>{typeof confirmReward.points === 'number' ? confirmReward.points.toLocaleString() : 0}</span> คะแนน?</div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 10 }}>
              <button onClick={handleConfirmRedeem} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>ยืนยัน</button>
              <button onClick={handleCancelRedeem} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}