import React, { useState, useEffect } from "react";
import { createReward, getRewards, updateReward, deleteReward } from "@/services/pointsService";
import type { Reward } from "@/interfaces/reward";
import { getImageUrl } from "@/utils/imageUtils";
import { toast } from "react-toastify";
import { TbStarFilled } from "react-icons/tb";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FaDropbox } from "react-icons/fa6";

export default function AdminRewardsPage() {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState({
    reward_name: "",
    point_required: "" as number | "",
    stock: "" as number | "",
    description: "",
    image: undefined as File | undefined,
    reward_image: "",
    imageUrl: ""
  });
  const [filter, setFilter] = useState<'all' | 'high' | 'low' | 'out'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; reward: Reward | null }>({ show: false, reward: null });
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  // สรุปสเตตัส
  const total = rewards.length;
  const high = rewards.filter(r => r.stock > 10).length;
  const low = rewards.filter(r => r.stock > 0 && r.stock <= 10).length;
  const out = rewards.filter(r => r.stock === 0).length;


  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault();

    const newError: any = {};
    if (
      !form.reward_name.trim()) {
      newError.reward_name = "กรุณาใส่ชื่อรางวัล";
    }
    if (!form.point_required || Number(form.point_required) < 100) {
      newError.point_required = "กรุณากำหนดจำนวนคะแนนมากกว่า 100";
    }
    if (!form.stock || Number(form.stock) < 1) {
      newError.stock = "กรุณากำหนดจำนวนสินค้าคงคลัง";
    }
    if (Object.keys(newError).length > 0) {
      Object.values(newError).forEach((error: any) => toast.error(error));
      return;
    }

    // ต้องมีรูปภาพถ้าเป็นการเพิ่มใหม่
    if (editIndex === null && !form.image) {
      toast.error("กรุณาอัปโหลดรูปภาพของรางวัล");
      return;
    }

    // ถ้าเป็นการแก้ไข ให้แสดง confirmation dialog
    if (editIndex !== null) {
      setShowEditConfirm(true);
      return;
    }

    // ถ้าเป็นการเพิ่มใหม่ ให้บันทึกเลย
    await performSave();
  };

  const performSave = async () => {
    try {
      if (editIndex !== null) {
        // เรียก updateReward
        await updateReward(rewards[editIndex].id, {
          reward_name: form.reward_name,
          point_required: form.point_required,
          stock: form.stock,
          description: form.description,
          reward_image: form.image,
        });
        // ดึง rewards ใหม่จาก backend
        const data = await getRewards();
        setRewards(
          data.map((r: any) => ({
            id: r.ID || r.id,
            name: r.reward_name || r.name,
            points: r.point_required || r.points,
            img: r.reward_image || r.img,
            level: r.level || "basic",
            stock: r.stock,
            desc: r.description
          }))
        );
        setEditIndex(null);
      } else {
        await createReward({
          reward_name: form.reward_name,
          point_required: form.point_required,
          stock: form.stock,
          description: form.description,
          image: form.image, // ส่ง image (File) ให้ backend
        });
        // ดึง rewards ใหม่จาก backend
        const data = await getRewards();
        setRewards(
          data.map((r: any) => ({
            id: r.ID || r.id,
            name: r.reward_name || r.name,
            points: r.point_required || r.points,
            img: r.reward_image || r.img,
            level: r.level || "basic",
            stock: r.stock,
            desc: r.description
          }))
        );
      }
      setShowAdd(false);
      setShowEditConfirm(false);
      setForm({ reward_name: "", point_required: "", stock: "", description: "", image: undefined, reward_image: "", imageUrl: "" });
      toast.success(editIndex !== null ? "แก้ไขสำเร็จ" : "บันทึกของรางวัลสำเร็จ");
      setEditIndex(null);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึกของรางวัล");
    }
  };

  // ฟังก์ชันจัดเรียงรางวัลตาม membership level (Platinum > Gold > Silver > Basic)
  function sortByMembershipLevel(a: any, b: any) {
    const order = ["แพลทินัม", "ทอง", "เงิน", "เริ่มต้น", "basic"];
    const aLevel = (a.level || "basic").toLowerCase();
    const bLevel = (b.level || "basic").toLowerCase();
    const aIdx = order.findIndex(l => a.level === l || aLevel.includes(l));
    const bIdx = order.findIndex(l => b.level === l || bLevel.includes(l));
    if (aIdx !== bIdx) return aIdx - bIdx;
    // ถ้า level เดียวกัน ให้เรียงคะแนนจากมากไปน้อย
    return b.points - a.points;
  }

  useEffect(() => {
    // ดึง rewards จาก backend
    getRewards().then((data: any[]) => {
      // แปลงข้อมูล backend -> frontend (ถ้าจำเป็น)
      setRewards(
        data
          .map((r: any) => ({
            id: r.ID || r.id,
            name: r.reward_name || r.name,
            points: r.point_required || r.points,
            img: r.reward_image || r.img,
            level: r.level || r.membership_level || "basic",
            stock: r.stock,
            desc: r.description
          }))
          .sort(sortByMembershipLevel)
      );
    });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#fff", padding: "40px 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          {/* ปุ่มย้อนกลับ */}
          <button
            style={{
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
            onClick={() => navigate("/admin/points")}
          >
            <ArrowLeft size={20} />
          </button>

          {/* ช่องค้นหา */}
          <input
            type="text"
            placeholder="ค้นหาของรางวัล..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              border: "1px solid #d1d5db",
              fontSize: 15,
              width: 300,
            }}
          />
        </div>
        {/* สรุปสเตตัส */}
        <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
          <div style={{ flex: 1, background: "#fff", color: "#000", borderRadius: 16, padding: 24, textAlign: "center", fontWeight: 500, fontSize: 24, cursor: "pointer", border: "1px solid #d9d9d9" }} onClick={() => setFilter('all')}> {total} <div style={{ fontSize: 15, fontWeight: 500 }}>ทั้งหมดมี</div></div>
          <div style={{ flex: 1, background: "#fff", color: "#000", borderRadius: 16, padding: 24, textAlign: "center", fontWeight: 500, fontSize: 24, cursor: "pointer", border: "1px solid #d9d9d9" }} onClick={() => setFilter('high')}> {high} <div style={{ fontSize: 15, fontWeight: 500 }}>คงเหลือสูง</div></div>
          <div style={{ flex: 1, background: "#fff", color: "#000", borderRadius: 16, padding: 24, textAlign: "center", fontWeight: 500, fontSize: 24, cursor: "pointer", border: "1px solid #d9d9d9" }} onClick={() => setFilter('low')}> {low} <div style={{ fontSize: 15, fontWeight: 500 }}>ใกล้หมด</div></div>
          <div style={{ flex: 1, background: "#fff", color: "#000", borderRadius: 16, padding: 24, textAlign: "center", fontWeight: 500, fontSize: 24, cursor: "pointer", border: "1px solid #d9d9d9" }} onClick={() => setFilter('out')}> {out} <div style={{ fontSize: 15, fontWeight: 500 }}>หมดแล้ว</div></div>
        </div>

        {/* Modal ฟอร์มเพิ่มของรางวัล */}
        {showAdd && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.2)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 4px 24px #0002", padding: 32, minWidth: 340, maxWidth: 400, width: "100%", position: "relative" }}>
              <h2 style={{ fontWeight: 600, fontSize: 22, marginBottom: 18, textAlign: "center" }}>{editIndex !== null ? 'แก้ไขของรางวัล' : 'เพิ่มของรางวัล'}</h2>
              <form onSubmit={handleAddReward}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>ชื่อของรางวัล</label>
                  <input type="text" required value={form.reward_name} onChange={e => setForm(f => ({ ...f, reward_name: e.target.value }))} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 16 }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>คะแนนที่ต้องใช้ในการแลก</label>
                  <input type="number" required min={1} value={form.point_required} onChange={e => setForm(f => ({ ...f, point_required: Number(e.target.value) }))} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 16 }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>จำนวนของรางวัล</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 16 }} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>รายละเอียดเพิ่มเติม</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 16 }} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>อัปโหลดรูปภาพ</label>
                  <div
                    style={{
                      border: '2px dashed #a5b4fc',
                      borderRadius: 10,
                      height: '200px', // Fixed height
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      marginBottom: 8,
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                    onClick={() => document.getElementById('reward-image-upload')?.click()}
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={e => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        setForm(f => ({ ...f, image: file, imageUrl: URL.createObjectURL(file) }));
                      }
                    }}
                  >
                    <input
                      id="reward-image-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setForm(f => ({ ...f, image: file, imageUrl: URL.createObjectURL(file) }));
                        }
                      }}
                    />

                    {form.imageUrl ? (
                      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <img src={form.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '8px', fontSize: '13px', backdropFilter: 'blur(4px)' }}>
                          คลิกเพื่อเปลี่ยนรูปภาพ
                        </div>
                      </div>
                    ) : form.reward_image ? (
                      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <img src={getImageUrl(form.reward_image)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '8px', fontSize: '13px', backdropFilter: 'blur(4px)' }}>
                          คลิกเพื่อเปลี่ยนรูปภาพ
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '0 20px' }}>
                        <div style={{ color: '#a5b4fc', fontWeight: 600, fontSize: 15 }}>ลากไฟล์มาวาง หรือ คลิกเพื่อเลือกไฟล์</div>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => { setShowAdd(false); setEditIndex(null); setForm({ reward_name: "", point_required: "", stock: "", description: "", image: undefined, reward_image: "", imageUrl: "" }); }} style={{ background: "#e5e7eb", color: "#374151", border: "none", borderRadius: 8, padding: "8px 24px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>ยกเลิก</button>
                  <button type="submit" style={{ background: "#a5b4fc", color: "#3730a3", border: "none", borderRadius: 8, padding: "8px 24px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>บันทึก</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal ยืนยันการลบ */}
        {deleteConfirm.show && deleteConfirm.reward && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.3)", zIndex: 1001, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 4px 24px #0004", padding: 32, minWidth: 340, maxWidth: 400, width: "100%", position: "relative" }}>
              <h2 style={{ fontWeight: 600, fontSize: 20, marginBottom: 12, textAlign: "center", color: "#000" }}>ยืนยันการลบ</h2>
              <p style={{ fontSize: 16, marginBottom: 24, textAlign: "center", color: "#374151" }}>
                คุณต้องการลบรางวัล <strong>"{deleteConfirm.reward.name}"</strong> หรือไม่?
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button
                  onClick={() => setDeleteConfirm({ show: false, reward: null })}
                  style={{ background: "#e5e7eb", color: "#374151", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, fontSize: 15, cursor: "pointer", minWidth: 100 }}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={async () => {
                    if (!deleteConfirm.reward) return;
                    try {
                      await deleteReward(deleteConfirm.reward.id);
                      const data = await getRewards();
                      setRewards(
                        data.map((r: any) => ({
                          id: r.ID || r.id,
                          name: r.reward_name || r.name,
                          points: r.point_required || r.points,
                          img: r.reward_image || r.img,
                          level: r.level || "basic",
                          stock: r.stock,
                          desc: r.description
                        }))
                      );
                      toast.success("ลบรางวัลสำเร็จ");
                      setDeleteConfirm({ show: false, reward: null });
                    } catch (error) {
                      toast.error("เกิดข้อผิดพลาดในการลบรางวัล");
                      setDeleteConfirm({ show: false, reward: null });
                    }
                  }}
                  style={{ background: "#000", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, fontSize: 15, cursor: "pointer", minWidth: 100 }}
                >
                  ลบ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal ยืนยันการแก้ไข */}
        {showEditConfirm && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.3)", zIndex: 1002, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 4px 24px #0004", padding: 32, minWidth: 340, maxWidth: 400, width: "100%", position: "relative" }}>
              <h2 style={{ fontWeight: 600, fontSize: 20, marginBottom: 12, textAlign: "center", color: "#000" }}>ยืนยันการแก้ไข</h2>
              <p style={{ fontSize: 16, marginBottom: 24, textAlign: "center", color: "#374151" }}>
                คุณต้องการแก้ไขรางวัล <strong>"{form.reward_name}"</strong> หรือไม่?
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button
                  onClick={() => setShowEditConfirm(false)}
                  style={{ background: "#e5e7eb", color: "#374151", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, fontSize: 15, cursor: "pointer", minWidth: 100 }}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={async () => {
                    await performSave();
                  }}
                  style={{ background: "#000", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, fontSize: 15, cursor: "pointer", minWidth: 100 }}
                >
                  ยืนยันการแก้ไข
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #eee', minHeight: 180, padding: 32, marginBottom: 24 }}>
          {/* รายการสินค้า/รางวัล Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ fontWeight: 500, fontSize: 20 }}>รายการสินค้า</div>
            <button onClick={() => { setShowAdd(true); setEditIndex(null); setForm({ reward_name: "", point_required: "", stock: "", description: "", image: undefined, reward_image: "", imageUrl: "" }); }} style={{ background: "#000", color: "#fff", border: "none", borderRadius: 8, padding: "8px 24px", fontWeight: 500, fontSize: 15, cursor: "pointer", boxShadow: "0 2px 8px #a5b4fc33", height: 36 }}>+ เพิ่มของรางวัล</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, width: '100%' }}>
            {(() => {
              const filtered = rewards.filter(r => {
                const matchesFilter = (() => {
                  if (filter === 'all') return true;
                  if (filter === 'high') return r.stock > 10;
                  if (filter === 'low') return r.stock > 0 && r.stock <= 10;
                  if (filter === 'out') return r.stock === 0;
                  return true;
                })();

                const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());

                return matchesFilter && matchesSearch;
              });
              if (filtered.length === 0) {
                let msg = 'ยังไม่มีรายการของรางวัล';
                if (filter === 'high') msg = 'ยังไม่มีรางวัลที่คงเหลือสูงในขณะนี้';
                if (filter === 'low') msg = 'ยังไม่มีรางวัลที่ใกล้หมดในขณะนี้';
                if (filter === 'out') msg = 'ยังไม่มีรางวัลที่หมดแล้วในขณะนี้';
                return (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#b0b0b0', fontSize: 20, padding: 60, background: 'transparent', borderRadius: 18, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 32, marginBottom: 12 }}><FaDropbox /></span>
                    <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 6 }}>{msg}</div>
                    {/* <div style={{ color: '#888', fontSize: 15 }}>กรุณาเพิ่มของรางวัลใหม่เพื่อให้แสดงในหน้านี้</div> */}
                  </div>
                );
              }
              return filtered.map((r, i) => (
                <div key={r.id} style={{ background: "#fff", borderRadius: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", padding: 24, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                  <img src={getImageUrl(r.img)} alt={r.name} style={{ width: 100, height: 100, objectFit: "contain", marginBottom: 16, borderRadius: 12, boxShadow: "0 2px 8px #0001" }} />
                  <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 8, color: "#3730a3" }}>{r.name}</div>
                  <div style={{ color: "#f472b6", fontWeight: 700, fontSize: 18, marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <TbStarFilled style={{ color: "#fbbf24" }} /> {(typeof r.points === 'number' ? r.points : 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 15, marginBottom: 10, color: r.stock === 0 ? "#f43f5e" : r.stock <= 10 ? "#a21caf" : "#0369a1" }}>
                    จำนวนคงเหลือ: {r.stock === 0 ? "0" : r.stock > 10 ? r.stock : r.stock <= 10 ? r.stock : ""}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      style={{ background: "#000", color: "#fff", border: "none", borderRadius: 8, padding: "8px 24px", fontWeight: 600, fontSize: 15, cursor: r.stock === 0 ? "not-allowed" : "pointer", opacity: r.stock === 0 ? 0.5 : 1, boxShadow: "0 2px 8px #a5b4fc33", height: 36 }}
                      onClick={() => {
                        setEditIndex(i);
                        setForm({
                          reward_name: r.name,
                          point_required: r.points,
                          stock: r.stock,
                          description: r.desc || "",
                          image: undefined,
                          reward_image: r.img,
                          imageUrl: ""
                        });
                        setShowAdd(true);
                      }}
                    >แก้ไข</button>
                    <button style={{ background: "#fca5a5", color: "#991b1b", border: "none", borderRadius: 8, padding: "8px 24px", fontWeight: 600, fontSize: 15, cursor: "pointer", boxShadow: "0 2px 8px #fca5a533", height: 36 }}
                      onClick={() => {
                        setDeleteConfirm({ show: true, reward: r });
                      }}
                    >ลบ</button>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}