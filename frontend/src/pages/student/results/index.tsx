import { useState, useEffect } from 'react';
import { Search, Calendar, Users, Trophy, AlertTriangle } from 'lucide-react';
import { GetAllPosts } from '@/services/postServices';
import { useAuth } from '@/context/AuthContext';
import { checkPointsDistributed } from '@/services/pointsService';
import { getImageUrl } from '@/utils/imageUtils';
import { BsHourglassSplit } from 'react-icons/bs';
import { FaMedal } from 'react-icons/fa6';
import { HiUserGroup } from 'react-icons/hi2';
import type { Activity } from '@/interfaces/result';
// Helper function ที่จัดการ base64 image data ก่อนเรียก getImageUrl
const getActivityImageUrl = (picture: string | undefined | null): string => {
  if (!picture) return '';
  // ตรวจสอบว่าเป็น base64 data หรือไม่ (JPEG เริ่มด้วย /9j/, PNG เริ่มด้วย iVBOR, GIF เริ่มด้วย R0lGO)
  if (picture.startsWith('/9j/') || picture.startsWith('9j/')) {
    return `data:image/jpeg;base64,${picture}`;
  }
  if (picture.startsWith('iVBOR')) {
    return `data:image/png;base64,${picture}`;
  }
  if (picture.startsWith('R0lGO')) {
    return `data:image/gif;base64,${picture}`;
  }
  // ถ้าเป็น data URL อยู่แล้ว ให้ใช้เลย
  if (picture.startsWith('data:')) {
    return picture;
  }
  // ถ้าไม่ใช่ base64 ให้ใช้ getImageUrl ปกติ
  return getImageUrl(picture);
};
export default function StudentResultsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // Get current logged-in user
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<{ teamName: string; members: string[]; memberIds: number[]; prize: string } | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Helper function to get category info
  const getCategoryInfo = (category: string) => {
    return {
      label: category || 'ทั่วไป',
      icon: '', // No icon for student view
      color: 'bg-purple-100 text-purple-700'
    };
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' });
  };

  // Fetch activities from backend
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Current user:', user);
        const res = await GetAllPosts();
        if (res?.status === 200 && res.data?.data) {
          const posts = res.data.data;
          console.log('All posts:', posts);

          // Transform posts to activities and filter only announced ones
          const transformedActivities: Activity[] = posts
            .filter((post: any) => {
              // Only show activities with results
              const hasResults = post.registrations?.some((reg: any) => reg.results && reg.results.length > 0);

              // Check if current user is registered for this activity (either as individual or team member)
              let isUserRegistered = false;
              if (user?.id && post.registrations && Array.isArray(post.registrations)) {
                isUserRegistered = post.registrations.some((reg: any) => {
                  // Check if users array exists and is an array
                  if (reg.users && Array.isArray(reg.users)) {
                    // Check if user ID matches any user in the registration
                    const found = reg.users.some((u: any) => {
                      // Try both u.id and u.ID (case sensitivity)
                      return u.id === user.id || u.ID === user.id;
                    });

                    if (found) {
                      console.log(`✓ User ${user.id} found in activity "${post.title || post.Title}"`);
                    }
                    return found;
                  }
                  return false;
                });
              }

              const shouldShow = hasResults && isUserRegistered;
              if (!shouldShow && post.registrations?.length > 0) {
                console.log(`✗ Activity "${post.title || post.Title}" filtered out - hasResults: ${hasResults}, isUserRegistered: ${isUserRegistered}`);
              }

              return shouldShow;
            })
            .map((post: any) => {
              // Extract winners from results
              const winners: { rank: number; name: string; prize: string; isTeam: boolean; members?: string[]; memberIds?: number[] }[] = [];

              if (post.registrations) {
                post.registrations.forEach((reg: any) => {
                  if (reg.results && reg.results.length > 0) {
                    // เอาเฉพาะ result ล่าสุด (กรณีมีการแก้ไข)
                    const latestResult = reg.results.reduce((latest: any, current: any) => {
                      const latestDate = new Date(latest.CreatedAt || latest.created_at || latest.UpdatedAt || latest.updated_at || 0);
                      const currentDate = new Date(current.CreatedAt || current.created_at || current.UpdatedAt || current.updated_at || 0);
                      return currentDate > latestDate ? current : latest;
                    });

                    // ใช้เฉพาะ latestResult
                    const result = latestResult;

                    // Determine winner name (team or individual)
                    let winnerName = '';
                    let isTeam = false;
                    let members: string[] = [];
                    let memberIds: number[] = [];

                    if (reg.users && reg.users.length > 1) {
                      // Team - show team name
                      winnerName = `${reg.team_name || 'ทีม'} (${reg.users.length} คน)`;
                      isTeam = true;
                      members = reg.users.map((u: any) => `${u.first_name} ${u.last_name}`);
                      memberIds = reg.users.map((u: any) => u.id || u.ID);
                    } else if (reg.users && reg.users.length === 1) {
                      // Individual - show person name
                      const user = reg.users[0];
                      winnerName = `${user.first_name} ${user.last_name}`;
                      isTeam = false;
                    } else {
                      winnerName = 'ไม่ระบุชื่อ';
                      isTeam = false;
                    }

                    // Get award name and rank
                    const awardNameMap: { [key: number]: string } = {
                      1: 'ชนะเลิศ',
                      2: 'รองชนะเลิศอันดับ 1',
                      3: 'รองชนะเลิศอันดับ 2',
                      4: 'ชมเชย',
                      5: 'อื่นๆ'
                    };
                    const awardName = result.award?.award_name || awardNameMap[result.award_id] || 'รางวัล';
                    const rank = result.award_id || winners.length + 1;

                    winners.push({
                      rank: rank,
                      name: winnerName,
                      prize: awardName,
                      isTeam: isTeam,
                      members: isTeam ? members : undefined,
                      memberIds: isTeam ? memberIds : undefined
                    });
                  }
                });
              }

              // Count total participants (users) from all registrations
              const totalParticipants = post.registrations?.reduce((sum: number, reg: any) => {
                return sum + (reg.users?.length || 0);
              }, 0) || 0;

              return {
                id: post.ID,
                title: post.title || post.Title,
                description: post.detail || post.Detail,
                participants: totalParticipants,
                endDate: formatDate(post.stop_date || post.StopDate),
                category: (post.type || post.Type || 'ทั่วไป').toLowerCase(),
                hasWinners: winners.length > 0,
                winners: winners, // Show all winners
                points: post.post_point || 0, // คะแนนกิจกรรม
                pointsDistributed: false, // Will be updated below
                picture: (() => {
                  const pic = post.picture || post.Picture || '';
                  console.log(`Activity "${post.title}":`, {
                    picture: post.picture ? `${post.picture.substring(0, 50)}...` : null,
                    Picture: post.Picture ? `${post.Picture.substring(0, 50)}...` : null,
                    used: pic ? `${pic.substring(0, 50)}...` : 'empty'
                  });
                  return pic;
                })() // รูปภาพกิจกรรม
              };
            });

          console.log(`✓ Found ${transformedActivities.length} activities for user ${user?.id}`);
          setActivities(transformedActivities);

          // Fetch distribution status for each activity
          const activitiesWithStatus = await Promise.all(
            transformedActivities.map(async (activity) => {
              try {
                const response = await checkPointsDistributed(activity.id);
                return {
                  ...activity,
                  pointsDistributed: response?.distributed || false
                };
              } catch (error) {
                console.error(`Error checking distribution for activity ${activity.id}:`, error);
                return activity;
              }
            })
          );


          // Filter out activities that haven't distributed points yet (Draft status)
          const visibleActivities = activitiesWithStatus.filter(a => a.pointsDistributed);

          setActivities(visibleActivities);
        } else {
          setActivities([]);
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('ไม่สามารถโหลดข้อมูลกิจกรรมได้');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user?.id]); // Re-fetch when user changes

  // Filter activities
  const filteredActivities = activities.filter(a => {
    const categoryOk = categoryFilter === 'all' ? true : a.category === categoryFilter;
    const searchOk = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryOk && searchOk;
  });



  return (
    <div style={{ minHeight: '100vh', background: '#fff', padding: '40px 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Search and Filter Bar */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#bbb', width: 20, height: 20 }} />
                <input
                  type="text"
                  placeholder="ค้นหากิจกรรม..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: 8, border: '1px solid #ddd', fontSize: 16 }}
                />
              </div>
            </div>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ padding: '8px 18px', border: '1px solid #ddd', borderRadius: 8, fontSize: 15 }}>
              <option value="all">ทุกประเภท</option>
              {Array.from(new Set(activities.map(a => a.category))).sort().map(category => {
                const categoryInfo = getCategoryInfo(category);
                return (
                  <option key={category} value={category}>
                    {categoryInfo.icon} {categoryInfo.label}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <BsHourglassSplit style={{ fontSize: 48 }} />
              </div>
              <div style={{ fontSize: 18, color: '#666' }}>กำลังโหลดข้อมูล...</div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 12, padding: 24, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <AlertTriangle style={{ width: 48, height: 48, color: '#b91c1c' }} />
            </div>
            <div style={{ fontSize: 18, color: '#b91c1c', fontWeight: 600 }}>{error}</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredActivities.length === 0 && (
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 60, textAlign: 'center', minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy style={{ width: 40, height: 40, color: '#9ca3af' }} />
              </div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#222', marginBottom: 8 }}>
              ยังไม่มีการประกาศรางวัล
            </div>
            <div style={{ fontSize: 16, color: '#888' }}>
              ขณะนี้ยังไม่มีกิจกรรมที่ประกาศผลรางวัล
            </div>
          </div>
        )}

        {/* Activities Grid */}
        {!loading && !error && filteredActivities.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {filteredActivities.map((activity) => {
              const categoryInfo = getCategoryInfo(activity.category);
              return (
                <div key={activity.id} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', transition: 'box-shadow 0.2s', overflow: 'hidden' }}>
                  {/* Activity Image */}
                  {activity.picture && (
                    <div style={{ width: '100%', height: 160, overflow: 'hidden' }}>
                      <img
                        src={getActivityImageUrl(activity.picture)}
                        alt={activity.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  {/* Card Header */}
                  <div style={{ padding: 20, borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <h3 style={{ fontWeight: 600, color: '#222', fontSize: 18, flex: 1 }}>{activity.title}</h3>
                    </div>
                    <p style={{ fontSize: 15, color: '#888', marginBottom: 12 }}>{activity.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ padding: '4px 14px', fontSize: 13, fontWeight: 500, borderRadius: 999, background: '#ede9fe', color: '#7c3aed' }}>
                        {categoryInfo.icon} {categoryInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 15, marginBottom: 16, color: '#666' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Users style={{ width: 18, height: 18, color: '#888' }} />
                        <span>{activity.participants} คน</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Calendar style={{ width: 18, height: 18, color: '#888' }} />
                        <span>{activity.endDate}</span>
                      </div>
                    </div>

                    {/* Points Display */}
                    <div style={{ marginBottom: 16, background: '#fff', borderRadius: 10, padding: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                        <Trophy style={{ width: 16, height: 16, color: '#000' }} />
                        <span style={{ fontWeight: 500, color: '#000' }}>
                          คะแนนที่ได้รับ: {activity.points > 0 ? `${activity.points} คะแนน` : 'ยังไม่ได้กำหนด'}
                        </span>
                      </div>
                    </div>

                    {/* Winners Display - Hybrid */}
                    {activity.hasWinners && activity.winners && (
                      <div style={{ marginBottom: 16, background: '#f9fafb', borderRadius: 10, padding: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, color: '#555', marginBottom: 10 }}>
                          <Trophy style={{ width: 18, height: 18, color: '#555' }} />
                          <span>ผลการแข่งขัน</span>
                        </div>

                        {activity.winners.slice(0, 3).map((winner, idx) => {
                          const getMedalIcon = (prize: string, rank: number) => {
                            if (prize.includes('ชนะเลิศ') || rank === 1) {
                              return <FaMedal color="#fbbf24" size={18} />;
                            }
                            if (prize.includes('รองชนะเลิศอันดับ 1') || prize.includes('รอง1') || rank === 2) {
                              return <FaMedal color="#9ca3af" size={18} />;
                            }
                            if (prize.includes('รองชนะเลิศอันดับ 2') || prize.includes('รอง2') || rank === 3) {
                              return <FaMedal color="#cd7f32" size={18} />;
                            }
                            return <FaMedal color="#6b7280" size={18} />;
                          };

                          return (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                fontSize: 14,
                                padding: '6px 0',
                                borderBottom: idx < Math.min(activity.winners?.length || 0, 3) - 1 ? '1px solid #e5e7eb' : 'none',
                                cursor: winner.isTeam ? 'pointer' : 'default'
                              }}
                              onClick={() => {
                                if (winner.isTeam && winner.members && winner.memberIds) {
                                  setSelectedTeam({
                                    teamName: winner.name,
                                    members: winner.members,
                                    memberIds: winner.memberIds,
                                    prize: winner.prize
                                  });
                                  setShowTeamModal(true);
                                }
                              }}
                            >
                              <span>{getMedalIcon(winner.prize, winner.rank)}</span>
                              <div style={{ flex: 1 }}>
                                <span style={{ fontWeight: 600, color: '#222' }}>{winner.name}</span>
                                {winner.isTeam && <HiUserGroup style={{ display: 'inline', marginLeft: 4, fontSize: 14, color: '#000' }} />}
                              </div>
                              <span style={{ color: '#666', fontSize: 13 }}>{winner.prize}</span>
                            </div>
                          );
                        })}

                        {/* View All Button - show if more than 3 winners */}
                        {activity.winners.length > 3 && (
                          <button
                            onClick={() => {
                              setSelectedActivity(activity);
                              setShowResultsModal(true);
                            }}
                            style={{
                              width: '100%',
                              marginTop: 12,
                              padding: '10px',
                              background: '#fff',
                              color: '#000',
                              borderRadius: 8,
                              border: '1px solid #000',
                              cursor: 'pointer',
                              fontSize: 14,
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#000';
                              e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#fff';
                              e.currentTarget.style.color = '#000';
                            }}
                          >
                            ดูทั้งหมด ({activity.winners.length} รางวัล)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Team Members Modal */}
        {showTeamModal && selectedTeam && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              padding: '20px'
            }}
            onClick={() => setShowTeamModal(false)}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 18,
                boxShadow: '0 4px 24px #0002',
                maxWidth: 600,
                width: '100%',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ padding: 24, borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: '#222', marginBottom: 4 }}>
                      {selectedTeam.teamName}
                    </h2>
                    <p style={{ color: '#888', fontSize: 15 }}>{selectedTeam.prize}</p>
                  </div>
                  <button
                    onClick={() => setShowTeamModal(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 28,
                      color: '#888',
                      cursor: 'pointer',
                      padding: '0 8px',
                      lineHeight: 1
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div style={{ padding: 24 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#555', marginBottom: 16 }}>
                  สมาชิกทีม ({selectedTeam.members.length} คน)
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                  {selectedTeam.members.map((member, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#f9fafb',
                        borderRadius: 12,
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 16
                      }}>
                        {member.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#222', fontSize: 16 }}>
                          {member}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Modal - Dark Theme */}
        {showResultsModal && selectedActivity && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              padding: '20px'
            }}
            onClick={() => setShowResultsModal(false)}
          >
            <div
              style={{
                background: '#1f2937',
                borderRadius: 16,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                maxWidth: 700,
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Banner Image */}
              <div style={{ position: 'relative' }}>
                {selectedActivity.picture ? (
                  <img
                    src={getActivityImageUrl(selectedActivity.picture)}
                    alt={selectedActivity.title}
                    style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: '16px 16px 0 0' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: 120,
                    background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                    borderRadius: '16px 16px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Trophy style={{ width: 48, height: 48, color: '#9ca3af' }} />
                  </div>
                )}
                <button
                  onClick={() => setShowResultsModal(false)}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    fontSize: 20,
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Content Area - White Background */}
              <div style={{ background: '#fff', borderRadius: '0 0 16px 16px' }}>
                {/* Title & Date */}
                <div style={{ padding: '24px 24px 16px' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 8 }}>
                    {selectedActivity.title}
                  </h2>
                  <div style={{ color: '#6b7280', fontSize: 14 }}>
                    {selectedActivity.endDate}
                  </div>
                </div>

                {/* Category Tags */}
                <div style={{ padding: '0 24px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '6px 14px',
                    background: '#f3f4f6',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#374151'
                  }}>
                    {getCategoryInfo(selectedActivity.category).label}
                  </span>
                  <span style={{
                    padding: '6px 14px',
                    background: '#f3f4f6',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#374151'
                  }}>
                    {selectedActivity.participants} ผู้เข้าร่วม
                  </span>
                </div>

                {/* Results Table Header */}
                <div style={{ padding: '16px 24px', fontWeight: 700, fontSize: 16, color: '#111' }}>
                  ผลการแข่งขัน
                </div>

                {/* Winners Table */}
                <div style={{ padding: '0 24px' }}>
                  {/* Table Header */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr 140px',
                    padding: '12px 16px',
                    background: '#f9fafb',
                    borderRadius: '8px 8px 0 0',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    <div>อันดับ</div>
                    <div>ผู้เข้าแข่งขัน</div>
                    <div>รางวัล</div>
                  </div>

                  {/* Table Rows */}
                  {selectedActivity.winners?.map((winner, idx) => {
                    const getMedalInfo = (prize: string, rank: number) => {
                      if (prize.includes('ชนะเลิศ') || rank === 1) {
                        return { icon: <FaMedal color="#fbbf24" size={20} />, text: 'ชนะเลิศ', color: '#ca8a04' };
                      }
                      if (prize.includes('รองชนะเลิศอันดับ 1') || prize.includes('รอง1') || rank === 2) {
                        return { icon: <FaMedal color="#9ca3af" size={20} />, text: 'รองอันดับ 1', color: '#6b7280' };
                      }
                      if (prize.includes('รองชนะเลิศอันดับ 2') || prize.includes('รอง2') || rank === 3) {
                        return { icon: <FaMedal color="#cd7f32" size={20} />, text: 'รองอันดับ 2', color: '#b45309' };
                      }
                      return { icon: <FaMedal color="#6b7280" size={20} />, text: `อันดับ ${rank}`, color: '#16a34a' };
                    };
                    const medal = getMedalInfo(winner.prize, winner.rank);

                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '100px 1fr 140px',
                          padding: '14px 16px',
                          borderBottom: idx < (selectedActivity.winners?.length || 0) - 1 ? '1px solid #e5e7eb' : 'none',
                          cursor: winner.isTeam ? 'pointer' : 'default',
                          transition: 'background 0.2s'
                        }}
                        onClick={() => {
                          if (winner.isTeam && winner.members && winner.memberIds) {
                            setSelectedTeam({
                              teamName: winner.name,
                              members: winner.members,
                              memberIds: winner.memberIds,
                              prize: winner.prize
                            });
                            setShowTeamModal(true);
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (winner.isTeam) e.currentTarget.style.background = '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{medal.icon}</span>
                          <span style={{ fontWeight: 500, color: medal.color }}>{medal.text}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 500, color: '#111' }}>{winner.name}</span>
                          {winner.isTeam && (
                            <HiUserGroup style={{ fontSize: 14, color: '#000' }} />
                          )}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: 14 }}>
                          {winner.prize}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Placement Section */}
                <div style={{
                  margin: '24px',
                  padding: '16px 20px',
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontWeight: 500, color: '#374151' }}>สถานะการแจกคะแนน:</span>
                  <span style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: selectedActivity.pointsDistributed ? '#16a34a' : '#f59e0b'
                  }}>
                    {selectedActivity.pointsDistributed ? '✓ แจกคะแนนแล้ว' : <BsHourglassSplit /> + 'รอการแจกคะแนน'}
                  </span>
                </div>

                {/* Points Footer */}
                <div style={{
                  background: '#374151',
                  padding: '20px 24px',
                  borderRadius: '0 0 16px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <span style={{
                    background: '#3b82f6',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 16
                  }}>
                    {selectedActivity.points > 0 ? `${selectedActivity.points} คะแนน` : 'ไม่มีคะแนน'}
                  </span>
                  <span style={{ color: '#d1d5db', fontSize: 15 }}>
                    คะแนนที่ได้รับจากกิจกรรมนี้
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}