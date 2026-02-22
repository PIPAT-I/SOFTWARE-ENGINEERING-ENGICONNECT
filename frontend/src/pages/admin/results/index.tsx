import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Search, Eye, Edit, Award, Clock, CheckCircle, AlertCircle, Calendar, Users, Trophy, AlertTriangle } from 'lucide-react';
import { createResult, updateResult, deleteResult } from '@/services/resultsService';
import { GetAllPosts } from '@/services/postServices';
import { GetRegistrationsByPostId } from '@/services/registrationService';
import { checkPointsDistributed, distributePoints } from '@/services/pointsService';
import { getImageUrl } from '@/utils/imageUtils';
import { BsHourglassSplit } from 'react-icons/bs';
import { Check } from 'lucide-react';
import { FaMedal } from 'react-icons/fa6';
import type { Activity, User, SelectedReward } from '@/interfaces/result';

// Helper function ที่จัดการ base64 image data ก่อนเรียก getImageUrl
const getActivityImageUrl = (picture: string | undefined | null): string => {
  if (!picture) return '';
  // ตรวจสอบว่าเป็น base64 data หรือไม่
  // JPEG เริ่มด้วย /9j/, PNG เริ่มด้วย iVBOR, GIF เริ่มด้วย R0lGO, WebP เริ่มด้วย UklGR
  if (picture.startsWith('/9j/') || picture.startsWith('9j/')) {
    return `data:image/jpeg;base64,${picture}`;
  }
  if (picture.startsWith('iVBOR')) {
    return `data:image/png;base64,${picture}`;
  }
  if (picture.startsWith('R0lGO')) {
    return `data:image/gif;base64,${picture}`;
  }
  if (picture.startsWith('UklGR')) {
    return `data:image/webp;base64,${picture}`;
  }
  // ถ้าเป็น data URL อยู่แล้ว ให้ใช้เลย
  if (picture.startsWith('data:')) {
    return picture;
  }
  // ถ้าไม่ใช่ base64 ให้ใช้ getImageUrl ปกติ
  return getImageUrl(picture);
};



function useAnnounceModal() {
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [rewardData, setRewardData] = useState({
    rank1: { name: '', prize: '' },
    rank2: { name: '', prize: '' },
    rank3: { name: '', prize: '' }
  });
  const [rewardList] = useState([
    { label: 'รางวัลชนะเลิศ', value: 'ชนะเลิศ' },
    { label: 'รองชนะเลิศอันดับ 1', value: 'รอง1' },
    { label: 'รองชนะเลิศอันดับ 2', value: 'รอง2' },
    { label: 'ชมเชย', value: 'ชมเชย' },
    { label: 'อื่นๆ', value: 'custom' }
  ]);
  const [selectedRewards, setSelectedRewards] = useState<SelectedReward[]>([
    { type: 'ชนะเลิศ', userId: '', prize: '' }
  ]);
  const [users, setUsers] = useState<User[]>([]);
  const [showEditReasonDialog, setShowEditReasonDialog] = useState(false);
  const [editReason, setEditReason] = useState('');

  // ดึง user ที่เข้าร่วมกิจกรรมจาก backend
  const fetchUsers = async (activityId: number) => {
    try {
      const res = await GetRegistrationsByPostId(activityId);
      if (res?.status === 200 && res.data?.data) {
        const registrations = res.data.data;
        // แปลง registrations เป็น users/teams list
        const usersList: User[] = [];
        registrations.forEach((reg: any) => {
          if (reg.users && Array.isArray(reg.users)) {
            // ถ้ามีมากกว่า 1 คน = ทีม ให้แสดงชื่อทีม
            if (reg.users.length > 1) {
              // ใช้ registration ID เป็น unique identifier
              usersList.push({
                id: reg.ID,
                name: `${reg.team_name || 'ทีม'} (${reg.users.length} คน)`
              });
            } else if (reg.users.length === 1) {
              // ถ้ามี 1 คน = เดี่ยว ให้แสดงชื่อบุคคล
              const user = reg.users[0];
              usersList.push({
                id: reg.ID,
                name: `${user.first_name} ${user.last_name}`
              });
            }
          }
        });
        setUsers(usersList);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const openModal = (activity: Activity, existingWinners?: any[]) => {
    setSelectedActivity(activity);
    setShowAnnounceModal(true);
    fetchUsers(activity.id);

    if (existingWinners && existingWinners.length > 0) {
      // Map existing winners to selectedRewards
      const mappedRewards = existingWinners.map(w => {
        let type = 'custom';
        // ใช้ awardName (ชื่อรางวัล) จาก backend ซึ่งมาจาก result.award?.award_name
        const awardName = w.awardName || '';
        if (awardName === 'ชนะเลิศ') type = 'ชนะเลิศ';
        else if (awardName === 'รองชนะเลิศอันดับ 1') type = 'รอง1';
        else if (awardName === 'รองชนะเลิศอันดับ 2') type = 'รอง2';
        else if (awardName === 'ชมเชย') type = 'ชมเชย';

        return {
          type: type,
          userId: w.registrationId ? w.registrationId.toString() : '',
          prize: w.prize || '', // รายละเอียดรางวัล (detail จาก backend)
          customName: type === 'custom' ? awardName : undefined // ชื่อรางวัลที่กำหนดเอง
        };
      });
      setSelectedRewards(mappedRewards);
    } else {
      setRewardData({
        rank1: { name: '', prize: '' },
        rank2: { name: '', prize: '' },
        rank3: { name: '', prize: '' }
      });
      setSelectedRewards([{ type: 'ชนะเลิศ', userId: '', prize: '' }]);
    }
  };
  const closeModal = () => {
    setShowAnnounceModal(false);
    setSelectedActivity(null);
  };
  return {
    showAnnounceModal,
    setShowAnnounceModal,
    selectedActivity,
    rewardData,
    setRewardData,
    openModal,
    closeModal,
    rewardList,
    selectedRewards,
    setSelectedRewards,
    users,
    showEditReasonDialog,
    setShowEditReasonDialog,
    editReason,
    setEditReason
  };
}

export default function AdminResultsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'announced' | 'overdue'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    showAnnounceModal,
    selectedActivity,
    openModal,
    closeModal,
    rewardList,
    selectedRewards,
    setSelectedRewards,
    users,
    showEditReasonDialog,
    setShowEditReasonDialog,
    editReason,
    setEditReason
  } = useAnnounceModal();

  // State for expanded winners
  const [expandedWinners, setExpandedWinners] = useState<{ [key: number]: boolean }>({});

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' });
  };

  const determineStatus = (post: any): string => {
    const now = new Date();
    const endDate = new Date(post.stop_date || post.StopDate);

    // Check if has results
    const hasResults = post.registrations?.some((reg: any) => reg.results && reg.results.length > 0);

    if (hasResults) {
      return 'announced';
    } else if (endDate < now) {
      // กิจกรรมสิ้นสุดแล้ว แต่ยังไม่มีการเพิ่มผลประกาศ
      return 'overdue';
    } else {
      // กิจกรรมกำลังดำเนินการอยู่ (ยังไม่จบ) - ไม่แสดงในรายการ
      return 'ongoing';
    }
  };

  // Fetch activities from backend
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await GetAllPosts();
        if (res?.status === 200 && res.data?.data) {
          const posts = res.data.data;

          // Transform posts to activities
          const transformedActivities: Activity[] = posts.map((post: any) => {
            // Count total participants (users) from all registrations
            const totalParticipants = post.registrations?.reduce((sum: number, reg: any) => {
              return sum + (reg.users?.length || 0);
            }, 0) || 0;

            // Extract winners from results
            const winners: { rank: number; name: string; prize: string; awardName?: string; isTeam: boolean; members?: string[]; awardId?: number; registrationId?: number }[] = [];
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

                  if (reg.users && reg.users.length > 1) {
                    // Team - show team name
                    winnerName = `${reg.team_name || 'ทีม'} (${reg.users.length} คน)`;
                    isTeam = true;
                    members = reg.users.map((u: any) => `${u.first_name} ${u.last_name}`);
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
                  // Map award_id to award names
                  const awardNameMap: { [key: number]: string } = {
                    1: 'ชนะเลิศ',
                    2: 'รองชนะเลิศอันดับ 1',
                    3: 'รองชนะเลิศอันดับ 2',
                    4: 'ชมเชย',
                    5: 'อื่นๆ'
                  };
                  const awardName = result.award?.award_name || awardNameMap[result.award_id] || 'รางวัล';
                  // Use award_id as rank (1=ชนะเลิศ, 2=รอง1, 3=รอง2, etc.)
                  const rank = result.award_id || winners.length + 1;

                  winners.push({
                    rank: rank,
                    name: winnerName,
                    prize: result.detail || awardName,
                    awardName: awardName,
                    isTeam: isTeam,
                    members: isTeam ? members : undefined,
                    awardId: result.ID,
                    registrationId: reg.ID
                  });
                }
              });
            }

            return {
              id: post.ID,
              title: post.title || post.Title,
              description: post.detail || post.Detail,
              participants: totalParticipants,
              status: determineStatus(post),
              endDate: formatDate(post.stop_date || post.StopDate),
              category: (post.type || post.Type || 'innovation').toLowerCase(),
              hasWinners: winners.length > 0,
              winners: winners,
              points: post.post_point || 0, // คะแนนกิจกรรม
              pointsDistributed: false, // Will be updated below
              picture: (() => {
                const pic = post.picture || post.Picture || '';
                console.log(`[Admin] Activity "${post.title}":`, {
                  picture: post.picture ? `${post.picture.substring(0, 50)}...` : null,
                  Picture: post.Picture ? `${post.Picture.substring(0, 50)}...` : null,
                  used: pic ? `${pic.substring(0, 50)}...` : 'empty'
                });
                return pic;
              })() // รูปภาพกิจกรรม
            };
          });

          setActivities(transformedActivities);

          // Fetch distribution status for each activity
          const activitiesWithStatus = await Promise.all(
            transformedActivities.map(async (activity) => {
              try {
                const response = await checkPointsDistributed(activity.id);
                const distributed = response?.distributed || false;

                // Update status: If has winners but not distributed, it should be 'pending' (Wait for Approval)
                // This ensures consistency with badges and filters
                let status = activity.status;
                if (activity.hasWinners && !distributed) {
                  status = 'pending';
                }

                return {
                  ...activity,
                  pointsDistributed: distributed,
                  status: status
                };
              } catch (error) {
                console.error(`Error checking distribution for activity ${activity.id}:`, error);
                return activity;
              }
            })
          );

          setActivities(activitiesWithStatus);
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
  }, []);

  // Calculate stats from activities
  const stats = [
    {
      icon: <Calendar className="w-6 h-6" />,
      label: 'กิจกรรมทั้งหมด',
      value: activities.length.toString(),
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: 'รออนุมัติ',
      value: activities.filter(a => a.status === 'pending').length.toString(),
      color: 'bg-orange-500',
      bgLight: 'bg-orange-50'
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      label: 'ยังไม่ประกาศ',
      value: activities.filter(a => a.status === 'overdue').length.toString(),
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50'
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      label: 'ประกาศแล้ว',
      value: activities.filter(a => a.status === 'announced').length.toString(),
      color: 'bg-green-500',
      bgLight: 'bg-green-50'
    }
  ];

  // เรียงกิจกรรม: pending ก่อนเสมอ
  const sortedActivities = [...activities].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return 0;
  });

  // filter ตาม status และ category
  const filteredActivities = sortedActivities.filter(a => {
    const statusOk = statusFilter === 'all' ? true : a.status === statusFilter;
    const categoryOk = categoryFilter === 'all' ? true : a.category === categoryFilter;
    return statusOk && categoryOk;
  });

  const getCategoryInfo = (category: string) => {
    return {
      label: category || 'ทั่วไป',
      color: 'bg-purple-100 text-purple-700'
    };
  };

  const handleAnnounceClick = (activity: Activity) => {
    openModal(activity);
  };

  const handleEditActivityClick = (activity: Activity) => {
    openModal(activity, activity.winners);
  };

  const handleAnnounce = async () => {
    if (selectedActivity) {
      // ถ้าเป็นการแก้ไข (มี winners อยู่แล้ว) ให้แสดง dialog ขอเหตุผล
      if (selectedActivity.hasWinners && selectedActivity.winners && selectedActivity.winners.length > 0) {
        setShowEditReasonDialog(true);
        return;
      }

      // ถ้าเป็นการสร้างใหม่ ให้ดำเนินการตามปกติ
      await performAnnounce();
    }
  };

  const performAnnounce = async () => {
    if (selectedActivity) {
      // ตรวจสอบว่าตั้งค่าคะแนนแล้วหรือยัง
      if (selectedActivity.points === 0) {
        toast.warning('กรุณาตั้งค่าคะแนนกิจกรรมก่อนประกาศรางวัล ไปที่เมนู "คะแนนสะสม" เพื่อกำหนดคะแนนให้กิจกรรมนี้');
        return;
      }

      // ตรวจสอบว่ากรอกข้อมูลครบถ้วน
      const hasEmptyFields = selectedRewards.some(r => !r.userId || !r.type);
      if (hasEmptyFields) {
        toast.warning('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }

      // แมปชื่อรางวัลเป็น ID
      const awardMapping: { [key: string]: number } = {
        'ชนะเลิศ': 1,
        'รอง1': 2,
        'รอง2': 3,
        'ชมเชย': 4
      };

      try {
        // ถ้าเป็นการแก้ไข (มี winners อยู่แล้ว) ให้ใช้ CRUD แบบ granular
        if (selectedActivity.winners && selectedActivity.winners.length > 0) {
          // สร้าง Map ของ existing results โดยใช้ registrationId เป็น key
          // กรองเฉพาะ winners ที่มี awardId (result ID) และ registrationId
          const existingResultsMap = new Map(
            selectedActivity.winners
              .filter(w => w.awardId !== undefined && w.registrationId !== undefined)
              .map(w => [w.registrationId!, w])
          );

          // สร้าง Map ของ new rewards โดยใช้ userId (registrationId) เป็น key
          const newRewardsMap = new Map(
            selectedRewards.map(r => [parseInt(r.userId), r])
          );

          // Operations to perform
          const toCreate: typeof selectedRewards = [];
          const toUpdate: Array<{ resultId: number; payload: any }> = [];
          const toDelete: number[] = [];

          // หา results ที่ต้อง UPDATE หรือ CREATE
          for (const reward of selectedRewards) {
            const registrationId = parseInt(reward.userId);
            const existingWinner = existingResultsMap.get(registrationId);

            const payload = {
              award_id: reward.type === 'custom' ? 0 : (awardMapping[reward.type] || 1),
              registration_id: registrationId,
              award_name: reward.type === 'custom' ? (reward.customName || '') : undefined,
              detail: reward.prize || '',
              edit_reason: editReason || undefined
            };

            if (existingWinner) {
              // Winner นี้มีอยู่แล้ว ให้ UPDATE
              toUpdate.push({
                resultId: existingWinner.awardId!,
                payload
              });
            } else {
              // Winner ใหม่ ให้ CREATE
              toCreate.push(reward);
            }
          }

          // หา results ที่ต้อง DELETE (มีใน existing แต่ไม่มีใน new)
          for (const [registrationId, winner] of existingResultsMap.entries()) {
            if (!newRewardsMap.has(registrationId)) {
              toDelete.push(winner.awardId!);
            }
          }

          // Execute CRUD operations
          const operations: Promise<any>[] = [];

          // CREATE operations
          for (const reward of toCreate) {
            const payload = {
              award_id: reward.type === 'custom' ? 0 : (awardMapping[reward.type] || 1),
              registration_id: parseInt(reward.userId),
              award_name: reward.type === 'custom' ? (reward.customName || '') : undefined,
              detail: reward.prize || ''
            };
            operations.push(createResult(payload));
          }

          // UPDATE operations
          for (const { resultId, payload } of toUpdate) {
            operations.push(updateResult(resultId, payload));
          }

          // DELETE operations
          for (const resultId of toDelete) {
            operations.push(deleteResult(resultId));
          }

          // Execute all operations in parallel
          await Promise.all(operations);
        } else {
          // การสร้างครั้งแรก ใช้ CREATE ทั้งหมด
          const payloads = selectedRewards.map(r => ({
            award_id: r.type === 'custom' ? 0 : (awardMapping[r.type] || 1),
            registration_id: parseInt(r.userId) || 0,
            award_name: r.type === 'custom' ? (r.customName || '') : undefined,
            detail: r.prize || ''
          }));

          await Promise.all(payloads.map(p => createResult(p)));
        }

        toast.success('บันทึกสำเร็จ!');

        // Refresh ข้อมูลกิจกรรมเพื่อแสดงสถานะใหม่
        const res = await GetAllPosts();
        if (res?.status === 200 && res.data?.data) {
          const posts = res.data.data;
          const transformedActivities: Activity[] = posts.map((post: any) => {
            const totalParticipants = post.registrations?.reduce((sum: number, reg: any) => {
              return sum + (reg.users?.length || 0);
            }, 0) || 0;

            // Extract winners from results
            const winners: { rank: number; name: string; prize: string; awardName?: string; isTeam: boolean; members?: string[]; awardId?: number; registrationId?: number }[] = [];
            if (post.registrations) {
              post.registrations.forEach((reg: any) => {
                if (reg.results && reg.results.length > 0) {
                  const latestResult = reg.results.reduce((latest: any, current: any) => {
                    const latestDate = new Date(latest.CreatedAt || latest.created_at || latest.UpdatedAt || latest.updated_at || 0);
                    const currentDate = new Date(current.CreatedAt || current.created_at || current.UpdatedAt || current.updated_at || 0);
                    return currentDate > latestDate ? current : latest;
                  });

                  const result = latestResult;
                  let winnerName = '';
                  let isTeam = false;
                  let members: string[] = [];

                  if (reg.users && reg.users.length > 1) {
                    winnerName = `${reg.team_name || 'ทีม'} (${reg.users.length} คน)`;
                    isTeam = true;
                    members = reg.users.map((u: any) => `${u.first_name} ${u.last_name}`);
                  } else if (reg.users && reg.users.length === 1) {
                    const user = reg.users[0];
                    winnerName = `${user.first_name} ${user.last_name}`;
                    isTeam = false;
                  } else {
                    winnerName = 'ไม่ระบุชื่อ';
                    isTeam = false;
                  }

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
                    prize: result.detail || awardName,
                    awardName: awardName,
                    isTeam: isTeam,
                    members: isTeam ? members : undefined,
                    awardId: result.ID,
                    registrationId: reg.ID
                  });
                }
              });
            }

            return {
              id: post.ID,
              title: post.title || post.Title,
              description: post.detail || post.Detail,
              participants: totalParticipants,
              status: determineStatus(post),
              endDate: formatDate(post.stop_date || post.StopDate),
              category: (post.type || post.Type || 'innovation').toLowerCase(),
              hasWinners: winners.length > 0,
              winners: winners,
              points: post.post_point || 0,
              pointsDistributed: false,
              picture: post.picture || post.Picture || ''
            };
          });

          // Fetch distribution status for each activity
          const activitiesWithStatus = await Promise.all(
            transformedActivities.map(async (activity) => {
              try {
                const response = await checkPointsDistributed(activity.id);
                const distributed = response?.distributed || false;

                // Update status: If has winners but not distributed, it should be 'pending' (Wait for Approval)
                let status = activity.status;
                if (activity.hasWinners && !distributed) {
                  status = 'pending';
                }

                return {
                  ...activity,
                  pointsDistributed: distributed,
                  status: status
                };
              } catch (error) {
                console.error(`Error checking distribution for activity ${activity.id}:`, error);
                return activity;
              }
            })
          );

          setActivities(activitiesWithStatus);
        }

        closeModal();
      } catch (err) {
        console.error('Error announcing results:', err);
        toast.error('เกิดข้อผิดพลาดในการบันทึกผล');
      }
    }
  };

  const handleConfirmAnnouncement = async (activity: Activity) => {
    if (!activity.hasWinners) return;
    if (activity.pointsDistributed) {
      toast.info('กิจกรรมนี้ได้ทำการแจกคะแนนไปแล้ว');
      return;
    }

    try {
      await distributePoints(activity.id);
      toast.success('แจกคะแนนรางวัลสำเร็จ!');

      // Update local state
      setActivities(prev => prev.map(a => {
        if (a.id === activity.id) {
          return { ...a, pointsDistributed: true, status: 'announced' };
        }
        return a;
      }));
    } catch (err) {
      console.error('Error distributing points:', err);
      toast.error('เกิดข้อผิดพลาดในการแจกคะแนน');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', padding: '40px 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
          {stats.map((stat, index) => (
            <div key={index} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 24, transition: 'box-shadow 0.2s', cursor: 'pointer', border: '1px solid #d1d5db' }}
              onClick={() => {
                if (index === 0) setStatusFilter('all');
                else if (index === 1) setStatusFilter('pending');
                else if (index === 2) setStatusFilter('overdue');
                else if (index === 3) setStatusFilter('announced');
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#888', fontSize: 15, marginBottom: 8 }}>{stat.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#222' }}>{stat.value}</div>
                </div>
                <div style={{ background: '#000', color: '#fff', padding: 12, borderRadius: 12 }}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

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
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} style={{ padding: '8px 18px', border: '1px solid #ddd', borderRadius: 8, fontSize: 15 }}>
              <option value="all">ทุกสถานะ</option>
              <option value="pending">รออนุมัติ</option>
              <option value="announced">ประกาศแล้ว</option>
              <option value="overdue">ยังไม่ประกาศ</option>
            </select>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ padding: '8px 18px', border: '1px solid #ddd', borderRadius: 8, fontSize: 15 }}>
              <option value="all">ทุกประเภท</option>
              {/* แสดงประเภทจากข้อมูลจริง */}
              {Array.from(new Set(activities.map(a => a.category))).sort().map(category => {
                const categoryInfo = getCategoryInfo(category);
                return (
                  <option key={category} value={category}>
                    {categoryInfo.label}
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
              <div style={{ fontSize: 48, marginBottom: 16, display: 'flex', justifyContent: 'center' }}><BsHourglassSplit /></div>
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

        {/* Activities Grid */}
        {!loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {filteredActivities
              .filter(a => a.title.includes(searchTerm) || a.description.includes(searchTerm))
              .map((activity) => {
                const categoryInfo = getCategoryInfo(activity.category);
                return (
                  <div key={activity.id} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', transition: 'box-shadow 0.2s', overflow: 'hidden', border: '1px solid #d1d5db' }}>
                    {/* Activity Image */}
                    {activity.picture && (
                      <div style={{ width: '100%', height: 200, overflow: 'hidden', background: '#f3f4f6' }}>
                        <img
                          src={getActivityImageUrl(activity.picture)}
                          alt={activity.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                          {categoryInfo.label}
                        </span>
                        {/* Status badge inline style */}
                        {activity.status === 'overdue' && (
                          <span style={{ padding: '4px 14px', fontSize: 13, fontWeight: 500, borderRadius: 999, background: '#f3e8ff', color: '#7c3aed' }}>ยังไม่ประกาศ</span>
                        )}
                        {activity.status === 'pending' && (
                          <span style={{ padding: '4px 14px', fontSize: 13, fontWeight: 500, borderRadius: 999, background: '#ffedd5', color: '#c2410c' }}>รออนุมัติ</span>
                        )}
                        {activity.status === 'announced' && (
                          <span style={{ padding: '4px 14px', fontSize: 13, fontWeight: 500, borderRadius: 999, background: '#d1fae5', color: '#047857' }}>ประกาศแล้ว</span>
                        )}
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

                      {/* Winners Display (if announced) - Show only when expanded */}
                      {activity.hasWinners && activity.winners && expandedWinners[activity.id] && (
                        <div style={{ marginBottom: 16, background: '#f9fafb', borderRadius: 10, padding: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, color: '#555', marginBottom: 8 }}>
                            <Trophy style={{ width: 18, height: 18, color: '#fbbf24' }} />
                            <span>ผู้ชนะ</span>
                          </div>
                          {activity.winners.map((winner, idx) => {
                            // Get medal icon based on award name or rank
                            const getMedalIcon = (prize: string, rank: number) => {
                              if (prize.includes('ชนะเลิศ') || rank === 1) {
                                return <FaMedal color="#fbbf24" size={20} />;
                              }
                              if (prize.includes('รองชนะเลิศอันดับ 1') || prize.includes('รอง1') || rank === 2) {
                                return <FaMedal color="#9ca3af" size={20} />;
                              }
                              if (prize.includes('รองชนะเลิศอันดับ 2') || prize.includes('รอง2') || rank === 3) {
                                return <FaMedal color="#cd7f32" size={20} />;
                              }
                              return <FaMedal color="#6b7280" size={20} />;
                            };

                            return (
                              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, marginBottom: 8, paddingBottom: 8, borderBottom: idx < (activity.winners?.length ?? 0) - 1 ? '1px solid #e5e7eb' : 'none' }}>
                                <span style={{ fontWeight: 600 }}>
                                  {getMedalIcon(winner.prize, winner.rank)}
                                </span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600, color: '#222' }}>{winner.name}</div>
                                  <div style={{ fontSize: 13, color: '#000', fontWeight: 600, marginBottom: 2 }}>{winner.awardName}</div>
                                  {winner.prize !== winner.awardName && (
                                    <div style={{ color: '#666', marginBottom: 4, fontSize: 13 }}>{winner.prize}</div>
                                  )}
                                  {/* Show team members if it's a team */}
                                  {winner.isTeam && winner.members && winner.members.length > 0 && (
                                    <div style={{ marginTop: 6, paddingLeft: 12, borderLeft: '2px solid #e5e7eb' }}>
                                      <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>สมาชิกทีม:</div>
                                      {winner.members.map((member, mIdx) => (
                                        <div key={mIdx} style={{ fontSize: 13, color: '#666', marginBottom: 2 }}>
                                          • {member}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: 10 }}>
                        {activity.status === 'overdue' ? (
                          <>
                            <button
                              onClick={() => handleAnnounceClick(activity)}
                              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', fontSize: 15, color: '#fff', background: '#000', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                            >
                              <Award style={{ width: 18, height: 18 }} />
                              ประกาศรางวัล
                            </button>
                            <button style={{ padding: '10px 18px', fontSize: 15, color: '#444', background: '#f3f4f6', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer' }}>
                              <Eye style={{ width: 18, height: 18 }} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                const newExpanded = { ...expandedWinners };
                                newExpanded[activity.id] = !newExpanded[activity.id];
                                setExpandedWinners(newExpanded);
                              }}
                              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', fontSize: 15, color: '#444', background: '#f3f4f6', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer' }}
                            >
                              <Eye style={{ width: 18, height: 18 }} />
                              {expandedWinners[activity.id] ? 'ซ่อน' : 'ดู'}
                            </button>

                            {/* Confirm (Distribute) Button - Show only if not distributed yet */}
                            {!activity.pointsDistributed && (
                              <button
                                onClick={() => handleConfirmAnnouncement(activity)}
                                title="ยืนยันการประกาศและแจกคะแนน"
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', fontSize: 15, color: '#fff', background: '#000', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                              >
                                <Check style={{ width: 18, height: 18 }} />
                                ยืนยัน
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (!activity.pointsDistributed) {
                                  handleEditActivityClick(activity);
                                }
                              }}
                              disabled={activity.pointsDistributed}
                              title={activity.pointsDistributed ? 'ไม่สามารถแก้ไขได้ เนื่องจากแจกคะแนนแล้ว' : 'แก้ไขผลการประกาศ'}
                              style={{
                                width: 42,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '10px 0',
                                fontSize: 15,
                                color: activity.pointsDistributed ? '#9ca3af' : '#fff',
                                background: activity.pointsDistributed ? '#f3f4f6' : '#000',
                                border: 'none',
                                borderRadius: 8,
                                fontWeight: 600,
                                cursor: activity.pointsDistributed ? 'not-allowed' : 'pointer',
                                opacity: activity.pointsDistributed ? 0.6 : 1
                              }}
                            >
                              <Edit style={{ width: 18, height: 18 }} />
                            </button>

                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Announce Winners Modal */}
        {showAnnounceModal && selectedActivity && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #0002', maxWidth: 700, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
              {/* Modal Header */}
              <div style={{ padding: 32, borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#222' }}>
                  {selectedActivity.hasWinners ? 'แก้ไขผลการประกาศ' : 'ประกาศรางวัล'}
                </h2>
                <p style={{ color: '#888', marginTop: 6 }}>{selectedActivity.title}</p>
              </div>

              {/* Modal Content */}
              <div style={{ padding: 32 }}>
                {/* Activity Info */}
                <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <Calendar style={{ width: 20, height: 20, color: '#000' }} />
                    <span style={{ fontSize: 15, color: '#222' }}>สิ้นสุด: {selectedActivity.endDate}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <Users style={{ width: 20, height: 20, color: '#000' }} />
                    <span style={{ fontSize: 15, color: '#222' }}>ผู้เข้าร่วม: {selectedActivity.participants} คน</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Trophy style={{ width: 20, height: 20, color: '#000' }} />
                    <span style={{ fontSize: 15, color: '#222' }}>
                      คะแนน: {selectedActivity.points > 0 ? `${selectedActivity.points} คะแนน` : 'ยังไม่ได้ตั้งค่า'}
                    </span>
                    {selectedActivity.points === 0 && (
                      <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AlertTriangle style={{ width: 14, height: 14 }} />
                        กรุณาตั้งค่าคะแนนก่อน
                      </span>
                    )}
                  </div>
                </div>
                {/* เลือกประเภทและผู้รับรางวัล */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 10 }}>กำหนดรางวัล</div>
                  {selectedRewards.map((reward, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                      <select value={reward.type} onChange={e => {
                        const newRewards = [...selectedRewards];
                        newRewards[idx].type = e.target.value;
                        if (e.target.value === 'custom') newRewards[idx].customName = '';
                        setSelectedRewards(newRewards);
                      }} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15 }}>
                        {rewardList.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                      {reward.type === 'custom' && (
                        <input value={reward.customName || ''} onChange={e => {
                          const newRewards = [...selectedRewards];
                          newRewards[idx].customName = e.target.value;
                          setSelectedRewards(newRewards);
                        }} placeholder="ชื่อรางวัลเอง" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15 }} />
                      )}
                      <select value={reward.userId} onChange={e => {
                        const newRewards = [...selectedRewards];
                        newRewards[idx].userId = e.target.value;
                        setSelectedRewards(newRewards);
                      }} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15, minWidth: 120 }}>
                        <option value="">เลือกผู้รับ</option>
                        {users
                          .filter(u => {
                            // Filter out users who are already selected in other rewards
                            const isAlreadySelected = selectedRewards.some((r, rIdx) =>
                              rIdx !== idx && r.userId === u.id.toString()
                            );
                            return !isAlreadySelected;
                          })
                          .map(u => <option key={u.id} value={u.id}>{u.name}</option>)
                        }
                      </select>
                      <input value={reward.prize} onChange={e => {
                        const newRewards = [...selectedRewards];
                        newRewards[idx].prize = e.target.value;
                        setSelectedRewards(newRewards);
                      }} placeholder="รายละเอียดรางวัล" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15 }} />
                      {selectedRewards.length > 1 && (
                        <button onClick={() => setSelectedRewards(selectedRewards.filter((_, i) => i !== idx))} style={{ color: '#b91c1c', background: 'none', border: 'none', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}>×</button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setSelectedRewards([...selectedRewards, { type: '', userId: '', prize: '' }])} style={{ marginTop: 6, color: '#000', background: 'none', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>+ เพิ่มรางวัล</button>
                </div>
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button
                    onClick={closeModal}
                    style={{ flex: 1, padding: '12px 0', color: '#444', background: '#f3f4f6', border: 'none', borderRadius: 8, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleAnnounce}
                    style={{ flex: 1, padding: '12px 0', background: '#000', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <Award style={{ width: 20, height: 20 }} />
                    {selectedActivity.hasWinners ? 'บันทึกผลการแก้ไข' : 'บันทึกผล'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Reason Dialog */}
        {showEditReasonDialog && selectedActivity && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
            <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #0002', maxWidth: 500, width: '100%', padding: 32 }}>
              {/* Dialog Header */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#222', marginBottom: 8 }}>ยืนยันการแก้ไขผลประกาศ</h3>
                <p style={{ color: '#666', fontSize: 15 }}>กรุณาระบุเหตุผลในการแก้ไขผลประกาศรางวัล</p>
              </div>

              {/* Reason Input */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 15, marginBottom: 8, color: '#222' }}>
                  เหตุผลในการแก้ไข <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="เช่น แก้ไขข้อมูลผู้ชนะที่ผิดพลาด, เปลี่ยนแปลงรางวัลตามการพิจารณาใหม่..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 8,
                    border: '1px solid #ddd',
                    fontSize: 15,
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => {
                    setShowEditReasonDialog(false);
                    setEditReason('');
                  }}
                  style={{ flex: 1, padding: '12px 0', color: '#444', background: '#f3f4f6', border: 'none', borderRadius: 8, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={async () => {
                    if (!editReason.trim()) {
                      toast.warning('กรุณาระบุเหตุผลในการแก้ไข');
                      return;
                    }
                    setShowEditReasonDialog(false);
                    await performAnnounce();
                    setEditReason('');
                  }}
                  style={{ flex: 1, padding: '12px 0', background: '#000', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                >
                  ยืนยันการแก้ไข
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}