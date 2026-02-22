import { useState, useEffect } from "react";
import { getPendingPosts, getPostsWithPoints, updatePostPoint, distributePoints } from "@/services/pointsService";
import { toast } from "react-toastify";
import { HiOutlineGift } from "react-icons/hi";
import { FaDropbox } from "react-icons/fa6";

export default function AdminPointsPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editPoints, setEditPoints] = useState<string | number>("");
  const [totalPoints, setTotalPoints] = useState(0);

  // State สำหรับกิจกรรมที่ยังไม่ได้ตั้งค่าคะแนน
  const [pendingActivities, setPendingActivities] = useState<any[]>([]);

  // State สำหรับการกรอง: 'all' | 'pending_distribution' | 'unconfigured' | 'distributed'
  const [filter, setFilter] = useState<string>('all');

  // State สำหรับการค้นหา
  const [searchQuery, setSearchQuery] = useState<string>('');

  // State สำหรับการกรองตามประเภท
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // โหลดข้อมูลกิจกรรมที่ pending และที่มีคะแนนแล้ว
  const fetchActivities = async () => {
    try {
      const pending = await getPendingPosts();
      setPendingActivities(
        pending.map((r: any) => {
          // นับจำนวนผู้เข้าร่วมจริงจาก users ในแต่ละ registration
          const participantCount = r.registrations?.reduce((total: number, reg: any) => {
            return total + (reg.users?.length || 0);
          }, 0) || 0;

          return {
            id: r.ID || r.id,
            name: r.title || r.Title || "กิจกรรมใหม่",
            type: r.type || r.Type || "ทั่วไป",
            description: r.detail || r.Detail || "",
            points: r.post_point || 0,
            stopDate: r.stop_date || r.StopDate,
            participantCount,
          };
        })
      );
      const withPoints = await getPostsWithPoints();
      setActivities(
        withPoints.map((r: any) => {
          // Check if points already distributed
          const hasDistributedPoints = r.registrations?.some((reg: any) =>
            reg.point_records?.some((record: any) => record.type === "activity_completion")
          ) || false;

          // นับจำนวนผู้เข้าร่วมจริงจาก users ในแต่ละ registration
          const participantCount = r.registrations?.reduce((total: number, reg: any) => {
            return total + (reg.users?.length || 0);
          }, 0) || 0;

          // Check if has results
          const hasResults = r.registrations?.some((reg: any) => reg.results && reg.results.length > 0);

          return {
            id: r.ID || r.id,
            name: r.title || r.Title || "กิจกรรม",
            type: r.type || r.Type || "ทั่วไป",
            description: r.detail || r.Detail || "",
            points: r.post_point,
            stopDate: r.stop_date || r.StopDate,
            pointsDistributed: hasDistributedPoints,
            participantCount,
            hasResults, // Add this field
          };
        })
      );
    } catch (e) {
      setPendingActivities([]);
      setActivities([]);
    }
  };

  useEffect(() => {
    fetchActivities();
    // ดึงคะแนนรวมทั้งหมด
    getPostsWithPoints().then((posts: any[]) => {
      const sum = posts.reduce((acc, cur) => acc + (cur.post_point || 0), 0);
      setTotalPoints(sum);
    });
  }, []);

  const handleEdit = (id: number, points: number) => {
    setEditId(id);
    setEditPoints(points === 0 ? "" : points);
  };

  const handleSave = async (id: number) => {
    try {
      const pointsValue = typeof editPoints === 'string' ? parseInt(editPoints) || 0 : editPoints;
      await updatePostPoint(id, pointsValue);
      setEditId(null);
      // ไม่ต้อง fetchActivities() ทันที ให้ user เห็นกิจกรรมค้างอยู่ก่อน
      // setTimeout เพื่อรีเฟรชข้อมูลหลังจาก delay เล็กน้อย (optional)
      setTimeout(() => {
        fetchActivities();
      }, 500);
    } catch (e) {
      // handle error
    }
  };

  const handleConfirmDistribution = async (activityId: number) => {
    try {
      await distributePoints(activityId);
      toast.success('แจกคะแนนสำเร็จ!');
      fetchActivities(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'เกิดข้อผิดพลาดในการแจกคะแนน');
    }
  };

  // รวมกิจกรรมทั้งหมดแบบ unique (ใช้ activities เป็นหลัก)
  const allActivities = [
    ...activities,
    ...pendingActivities.filter(
      p => !activities.some(a => a.id === p.id)
    )
  ].sort((a, b) => {
    // 1. กิจกรรมที่ยังไม่ได้ตั้งค่าคะแนน (points === 0) ขึ้นก่อน
    if (a.points === 0 && b.points !== 0) return -1;
    if (a.points !== 0 && b.points === 0) return 1;

    // 2. กิจกรรมที่รอแจกคะแนน (!pointsDistributed) ขึ้นก่อนกิจกรรมที่แจกไปแล้ว
    const aDistributed = a.pointsDistributed || false;
    const bDistributed = b.pointsDistributed || false;
    if (!aDistributed && bDistributed) return -1;
    if (aDistributed && !bDistributed) return 1;

    // 3. ถ้าสถานะเหมือนกัน เรียงตาม id
    return a.id - b.id;
  });

  // กรองกิจกรรมตาม filter ที่เลือก และ search query
  const filteredActivities = allActivities.filter(a => {
    // กรองตาม filter
    let matchFilter = true;
    if (filter === 'unconfigured') matchFilter = a.points === 0;
    else if (filter === 'pending_distribution') matchFilter = a.points > 0 && !a.pointsDistributed;
    else if (filter === 'distributed') matchFilter = a.pointsDistributed;

    // กรองตาม search query
    let matchSearch = true;
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      matchSearch = a.name.toLowerCase().includes(query) || a.type.toLowerCase().includes(query);
    }

    // กรองตามประเภทกิจกรรม
    let matchType = true;
    if (typeFilter !== 'all') {
      matchType = a.type.toLowerCase() === typeFilter.toLowerCase();
    }

    return matchFilter && matchSearch && matchType;
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fff" }}>
      {/* Main content */}
      <main
        style={{
          flex: 1,
          padding: "40px 32px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
            gap: 16,
          }}
        >
          <input
            type="text"
            placeholder="ค้นหากิจกรรม..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              border: "1px solid #d1d5db",
              fontSize: 16,
              flex: 1,
            }}
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              border: "1px solid #d1d5db",
              fontSize: 16,
              minWidth: 200,
              cursor: "pointer",
            }}
          >
            <option value="all">ทุกประเภท</option>
            {Array.from(new Set(allActivities.map(a => a.type))).sort().map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        {/* Cards section */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginBottom: 32,
          }}
        >
          <div
            onClick={() => setFilter(filter === 'pending_distribution' ? 'all' : 'pending_distribution')}
            style={{
              flex: 1,
              background: filter === 'pending_distribution' ? "#ffffffff" : "#fff",
              borderRadius: 18,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              padding: 24,
              minWidth: 260,
              border: filter === 'pending_distribution' ? "2px solid #000" : "1px solid #e5e7eb",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 18,
                marginBottom: 8,
              }}
            >
              กิจกรรมรอแจกคะแนน ({activities.filter(a => !a.pointsDistributed).length})
            </div>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>
              กิจกรรมที่ยังไม่ได้รับคะแนน
            </div>
            <div style={{ maxHeight: 80, overflowY: "auto" }}>
              {activities.filter(a => !a.pointsDistributed).length === 0 ? (
                <div style={{ color: '#b0b0b0', fontSize: 15, textAlign: 'center' }}>ยังไม่มีกิจกรรมที่รอแจกคะแนน</div>
              ) : (
                activities.filter(a => !a.pointsDistributed).map((a) => (
                  <div key={a.id} style={{ color: '#222', fontSize: 15, marginBottom: 4 }}>
                    • {a.name} ({a.points} คะแนน)
                  </div>
                ))
              )}
            </div>
          </div>
          <div
            onClick={() => setFilter(filter === 'unconfigured' ? 'all' : 'unconfigured')}
            style={{
              flex: 1,
              background: filter === 'unconfigured' ? "#ffffffff" : "#fff",
              borderRadius: 18,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              padding: 24,
              minWidth: 260,
              border: filter === 'unconfigured' ? "2px solid #000" : "1px solid #e5e7eb",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 18,
                marginBottom: 8,
              }}
            >
              กิจกรรมที่ยังไม่ได้ตั้งค่า ({pendingActivities.filter(a => a.points === 0).length})
            </div>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>
              กิจกรรมที่ต้องตั้งค่าคะแนน
            </div>
            <div style={{ maxHeight: 80, overflowY: "auto" }}>
              {pendingActivities.filter(a => a.points === 0).length === 0 ? (
                <div style={{ color: '#b0b0b0', fontSize: 15, textAlign: 'center' }}>ตั้งค่าครบทุกกิจกรรมแล้ว</div>
              ) : (
                pendingActivities.filter(a => a.points === 0).map((a) => (
                  <div key={a.id} style={{ color: '#222', fontSize: 15, marginBottom: 4 }}>
                    • {a.name}
                  </div>
                ))
              )}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              background: "#fff",
              borderRadius: 18,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              padding: 24,
              minWidth: 260,
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 18,
                marginBottom: 8,
              }}
            >
              คะแนนรวม
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#f59e42",
                marginBottom: 8,
              }}
            >
              {totalPoints.toLocaleString()}
            </div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              คะแนนสะสมทั้งหมดในระบบ
            </div>
          </div>
          {/* การ์ดจัดการของรางวัล */}
          <div
            style={{
              flex: 1,
              background: "#f9fafb",
              borderRadius: 18,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              padding: 24,
              minWidth: 260,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              border: "2px dashed #000",
            }}
            onClick={() => (window.location.href = "/admin/points/rewards")}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: "#000",
                marginBottom: 10,
              }}
            >
              จัดการของรางวัล
            </div>
            <div
              style={{
                fontSize: 14,
                color: "#6b7280",
                marginBottom: 12,
              }}
            >
              เพิ่ม/แก้ไข/ลบรางวัล
            </div>
            <HiOutlineGift style={{ fontSize: 32, color: "#000" }} />
          </div>
        </div>
        {/* Section: ตั้งค่าคะแนนกิจกรรม */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            padding: 24,
            marginBottom: 32,
            marginTop: 24,
            border: "1px solid #e5e7eb"
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: 18,
              marginBottom: 18,
            }}
          >
            ตั้งค่าคะแนนกิจกรรม
          </div>
          {pendingActivities.length > 0 && (
            <div
              style={{
                marginBottom: 18,
                color: "#f43f5e",
                fontWeight: 500,
              }}
            >
              มีกิจกรรมใหม่ {pendingActivities.length} รายการที่ยังไม่ได้ตั้งค่าคะแนน กรุณาตั้งค่าก่อนใช้งาน
            </div>
          )}
          {filteredActivities.length === 0 ? (
            <div style={{ background: '#fafbfc', borderRadius: 18, border: '1px solid #eee', minHeight: 180, padding: 32, marginBottom: 24 }}>
              <div style={{ textAlign: 'center', color: '#b0b0b0', fontSize: 20, padding: 60, background: 'transparent', borderRadius: 18, minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 32, marginBottom: 12 }}><FaDropbox /></span>
                <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 6 }}>ยังไม่มีกิจกรรมในขณะนี้</div>
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f3f4f6', zIndex: 1 }}>
                  <tr style={{ background: "#f3f4f6" }}>
                    <th
                      style={{
                        padding: "10px 8px",
                        fontWeight: 500,
                        fontSize: 14,
                        color: "#374151",
                        textAlign: "left",
                        width: 250,
                      }}
                    >
                      กิจกรรม
                    </th>
                    <th
                      style={{
                        padding: "10px 8px",
                        fontWeight: 500,
                        fontSize: 14,
                        color: "#374151",
                        textAlign: "left",
                        width: 120,
                      }}
                    >
                      ประเภท
                    </th>
                    <th
                      style={{
                        padding: "10px 8px",
                        fontWeight: 500,
                        fontSize: 14,
                        color: "#374151",
                        textAlign: "left",
                        width: 100,
                      }}
                    >
                      วันที่สิ้นสุดกิจกรรม
                    </th>
                    <th
                      style={{
                        padding: "10px 8px",
                        fontWeight: 500,
                        fontSize: 14,
                        color: "#374151",
                        textAlign: "left",
                        width: 80,
                      }}
                    >
                      ผู้เข้าร่วม
                    </th>
                    <th
                      style={{
                        padding: "10px 8px",
                        fontWeight: 500,
                        fontSize: 14,
                        color: "#374151",
                        textAlign: "left",
                        width: 10,
                      }}
                    >
                      คะแนน
                    </th>
                    <th
                      style={{
                        padding: "10px 8px",
                        fontWeight: 500,
                        fontSize: 14,
                        color: "#374151",
                        textAlign: "left",
                        width: 90,
                      }}
                    ></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.map((a) => (
                    <tr key={a.id} style={{ background: a.points === 0 ? "#fff7ed" : "#fff", borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "10px 8px", fontWeight: 500 }}>{a.name}</td>
                      <td style={{ padding: "10px 8px", width: 120 }}>
                        <span style={{
                          padding: "4px 12px",
                          background: "#ede9fe",
                          color: "#7c3aed",
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 500
                        }}>
                          {a.type}
                        </span>
                      </td>

                      <td style={{ padding: "10px 8px", width: 150, fontSize: 14 }}>
                        {a.stopDate ? new Date(a.stopDate).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : "-"}
                      </td>
                      <td style={{ padding: "10px 8px", width: 80, fontSize: 14, textAlign: "center" }}>
                        {a.participantCount || 0}
                      </td>
                      <td style={{ padding: "10px 8px", width: 250 }}>
                        {editId === a.id ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                              type="number"
                              value={editPoints}
                              min={0}
                              onChange={(e) => setEditPoints(e.target.value === "" ? "" : Number(e.target.value))}
                              style={{ width: 80, padding: 6, borderRadius: 6, border: "1px solid #ddd" }}
                            />
                            <button
                              onClick={() => handleSave(a.id)}
                              style={{ background: "#000", color: "white", border: "none", borderRadius: 6, padding: "6px 12px", fontWeight: 600, cursor: "pointer" }}
                            >
                              บันทึก
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              style={{ background: "#e5e7eb", color: "#374151", border: "none", borderRadius: 6, padding: "6px 12px", fontWeight: 600, cursor: "pointer" }}
                            >
                              ยกเลิก
                            </button>
                          </div>
                        ) : (
                          a.points
                        )}
                      </td>
                      <td style={{ padding: "10px 8px", width: 150 }}>
                        {editId !== a.id && (
                          (() => {
                            // ถ้ายังไม่ได้ตั้งค่าคะแนน ให้แสดงปุ่มตั้งค่าเสมอ
                            if (a.points === 0) {
                              return (
                                <button
                                  onClick={() => handleEdit(a.id, a.points)}
                                  style={{ background: "#000", color: "white", border: "none", borderRadius: 6, padding: "6px 16px", fontWeight: 600, cursor: "pointer" }}
                                >
                                  ตั้งค่า
                                </button>
                              );
                            }

                            // Check if activity has ended
                            const now = new Date();
                            const endDate = a.stopDate ? new Date(a.stopDate) : null;
                            const hasEnded = endDate && now > endDate;

                            if (hasEnded) {
                              // กิจกรรมจบแล้ว - แสดงปุ่มยืนยันสีเขียว
                              const isDistributed = a.pointsDistributed || false;

                              // ถ้ายังไม่แจกคะแนน และยังไม่มีผลการประกาศ
                              if (!isDistributed && !a.hasResults) {
                                return (
                                  <button
                                    className="cursor-not-allowed opacity-60"
                                    disabled
                                    style={{
                                      background: "#000", // Amber/Gold color for waiting
                                      color: "white",
                                      border: "none",
                                      borderRadius: 6,
                                      padding: "6px 12px",
                                      fontWeight: 600,
                                      cursor: "not-allowed"
                                    }}
                                  >
                                    รอผลการประกาศ
                                  </button>
                                );
                              }

                              return (
                                <button
                                  onClick={() => handleConfirmDistribution(a.id)}
                                  disabled={isDistributed}
                                  style={{
                                    background: isDistributed ? "#9ca3af" : "#16a34a",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 6,
                                    padding: "6px 12px",
                                    fontWeight: 600,
                                    cursor: isDistributed ? "not-allowed" : "pointer",
                                    opacity: isDistributed ? 0.6 : 1
                                  }}
                                >
                                  {isDistributed ? "แจกคะแนนแล้ว" : "ยืนยันแจกคะแนน"}
                                </button>
                              );
                            } else {
                              // กิจกรรมยังไม่จบ - แสดงปุ่มแก้ไข
                              return (
                                <button
                                  onClick={() => handleEdit(a.id, a.points)}
                                  style={{ background: "#000", color: "white", border: "none", borderRadius: 6, padding: "6px 16px", fontWeight: 600, cursor: "pointer" }}
                                >
                                  แก้ไข
                                </button>
                              );
                            }
                          })()
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}