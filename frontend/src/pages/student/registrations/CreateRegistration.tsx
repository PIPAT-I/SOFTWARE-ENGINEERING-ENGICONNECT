import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, CheckCircle2, Users, Plus, Trash2, Loader2, Info, AlertCircle} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { 
  CreateRegistration, 
  UpdateRegistration, 
  UpdateRegistrationStatus,
  getUserByStudentId, 
  GetRegistrationsByPostId 
} from "@/services/registrationService";
import { GetPostById } from "@/services/postServices";
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

interface PostInfo {
  id: string;
  title: string;
  detail: string;
  picture: string;
  emoji: string;
  date: string;
  location: string;
  gradient: string;
  type?: string;
  organizer?: string;
  startDate?: string;
  stopDate?: string;
}

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  phone: string;
  isLoading?: boolean;
}

export default function PostRegistration() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [post, setPost] = useState<PostInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [existingRegistration, setExistingRegistration] = useState<any>(null);
  const [canRegister, setCanRegister] = useState(true);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', firstName: '', lastName: '', studentId: '', phone: '', isLoading: false }
  ]);


  const [formData, setFormData] = useState({
    teamName: '',
    note: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
  
    const firstMember = teamMembers[0];
    if (firstMember && user) {
      const userStudentId = user.sut_id;
      
      if (!firstMember.studentId.trim()) {
        newErrors['member-0-studentid'] = 'กรุณากรอกรหัสนักศึกษา';
      } else if (userStudentId && firstMember.studentId !== userStudentId) {
        newErrors['member-0-studentid'] = `สมาชิกคนที่ 1 ต้องเป็นผู้ใช้งานระบบเท่านั้น (${userStudentId})`;
      }
    }
  
    const usedStudentIds = new Set<string>();
  
    teamMembers.forEach((member, index) => {
      if (!member.studentId.trim()) {
        newErrors[`member-${index}-studentid`] = 'กรุณากรอกรหัสนักศึกษา';
      } 
      else if (usedStudentIds.has(member.studentId)) {
        newErrors[`member-${index}-studentid`] = `รหัสนักศึกษา ${member.studentId} ซ้ำกัน`;
      } 
      else {
        usedStudentIds.add(member.studentId);
      }
      if (!member.firstName.trim()) {
        newErrors[`member-${index}-firstname`] = 'กรุณากรอกชื่อ';
      } 
      if (!member.lastName.trim()) {
        newErrors[`member-${index}-lastname`] = 'กรุณากรอกนามสกุล';
      } 
      if (!member.phone.trim()) {
        newErrors[`member-${index}-phone`] = 'กรุณากรอกเบอร์โทรศัพท์';
      }
    });
  
    setErrors(newErrors);
  
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return false;
    }
  
    return true;
  };

  const fetchUserByStudentId = async (memberId: string, studentId: string) => {
    if (!studentId || studentId.length < 8) {
        return;
    }

    setTeamMembers(prev => prev.map(m => 
        m.id === memberId ? { ...m, isLoading: true } : m
    ));

    try {
        console.log("Fetching user:", studentId);
        const response = await getUserByStudentId(studentId);
        
        console.log("Response:", response);
        console.log("Data:", response?.data);

        if (response?.data) {
            const userData = response?.data?.data;

            if (!userData) {
            toast.warning(`ไม่พบข้อมูลนักศึกษารหัส ${studentId}`);
            setTeamMembers(prev => prev.map(m => 
                m.id === memberId ? { ...m, isLoading: false } : m
            ));
            return;
            }

            const firstName =
            userData.first_name ??
            userData.FirstName ??
            userData.firstname ??
            userData.firstName ??
            "";

            const lastName =
            userData.last_name ??
            userData.LastName ??
            userData.lastname ??
            userData.lastName ??
            "";

            const phone =
            userData.phone ??
            userData.Phone ??
            userData.phone_number ??
            "";

            setTeamMembers(prev =>
            prev.map(m =>
                m.id === memberId
                ? {
                    ...m,
                    firstName,
                    lastName,
                    phone,
                    isLoading: false,
                    }
                : m
            )
            );

            
        } else {
            setTeamMembers(prev => prev.map(m => 
                m.id === memberId ? { ...m, isLoading: false } : m
            ));
            toast.warning(`ไม่พบข้อมูลนักศึกษารหัส ${studentId}`);
        }
    } catch (error: any) {
        console.error("Error:", error);
        setTeamMembers(prev => prev.map(m => 
            m.id === memberId ? { ...m, isLoading: false } : m
        ));
        toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
    }
};

  const checkExistingRegistration = async () => {
    if (!id || !user?.id) {
      setCheckingRegistration(false);
      return;
    }
  
    try {
      setCheckingRegistration(true);
      const response = await GetRegistrationsByPostId(Number(id));
  
      if (response?.status === 200) {
        const registrations = Array.isArray(response.data) 
          ? response.data 
          : response.data?.data ?? [];
  
        const userRegistration = registrations.find((reg: any) => {
          const users = reg.users ?? reg.Users ?? [];
          return users.some((u: any) => {
            const userId = u.ID ?? u.id ?? u.user_id;
            return Number(userId) === Number(user.id);
          });
        });
  
        if (userRegistration) {
          const status = (userRegistration.status ?? userRegistration.Status ?? 'pending').toLowerCase();
          
          setExistingRegistration(userRegistration);
  
          if (status === 'pending' || status === 'approved') {
            setShowForm(false);
            setCanRegister(false);
            setIsUpdating(false);
          } else if (status === 'rejected') {
            setShowForm(true);
            setCanRegister(true);
            setIsUpdating(true);

            setFormData({
              teamName: userRegistration.team_name ?? userRegistration.TeamName ?? '',
              note: userRegistration.description ?? userRegistration.Description ?? '',
            });

            const existingUsers = userRegistration.users ?? userRegistration.Users ?? [];
  
            if (existingUsers.length > 0) {
              const members: TeamMember[] = existingUsers.map((u: any, index: number) => ({
                id: String(index + 1),
                firstName: u.FirstName ?? u.first_name ?? '',
                lastName: u.LastName ?? u.last_name ?? '',
                studentId: u.sut_id ?? u.SutID ?? '',
                phone: u.Phone ?? u.phone ?? '',
                isLoading: false
              }));
          
              setTeamMembers(members);
            }
          }
        } else {
          setShowForm(true);
          setCanRegister(true);
          setIsUpdating(false);
        }
      }
    } catch (error) {
      console.error("Error checking registration:", error);
    } finally {
      setCheckingRegistration(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!id) {
        setError("ไม่พบ ID กิจกรรม");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await GetPostById(id);

        if (res?.status === 401) {
          setError("กรุณา Login ใหม่");
          return;
        }

        if (res?.status !== 200) {
          throw new Error(res?.data?.error || "ไม่สามารถดึงข้อมูลกิจกรรมได้");
        }

        const data = res.data?.data ?? res.data;

        console.log(" Post Data:", data);

        const dateRange = `${formatDate(data.start_date)}${data.stop_date ? ` - ${formatDate(data.stop_date)}` : ""}`;

        let pictureUrl = "";
        if (data.picture) {
          if (data.picture.startsWith("data:")) {
            pictureUrl = data.picture;
          } else if (data.picture.startsWith("http")) {
            pictureUrl = data.picture;
          } else {
            pictureUrl = `data:image/jpeg;base64,${data.picture}`;
          }
        }

        const locationData = data.Location || data.location;
        const locationText = locationData
          ? locationData.building || locationData.name || "ไม่ระบุสถานที่"
          : "ไม่ระบุสถานที่";

        setPost({
          id: String(data.ID),
          title: data.title || "ไม่ระบุชื่อกิจกรรม",
          detail: data.detail || "",
          picture: pictureUrl,
          emoji: (data.type),
          date: dateRange,
          location: locationText,
          gradient: (data.type),
          type: data.type,
          organizer: data.organizer,
          startDate: data.start_date,
          stopDate: data.stop_date,
        });

        await checkExistingRegistration();

        console.log("Post set successfully");
      } catch (err: any) {
        console.error("Error:", err);
        setError(err?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [id, user?.id]);

  const addTeamMember = () => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      studentId: '',
      phone: '',
      isLoading: false
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  const removeTeamMember = (memberId: string) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter(member => member.id !== memberId));
    }
  };

  const updateTeamMember = (memberId: string, field: keyof TeamMember, value: string) => {
    setTeamMembers(teamMembers.map(member =>
      member.id === memberId ? { ...member, [field]: value } : member
    ));
  };

  const handleStudentIdChange = (memberId: string, value: string) => {
    updateTeamMember(memberId, 'studentId', value);
    if (value.length === 8) {
      fetchUserByStudentId(memberId, value);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
  
    if (!canRegister) {
      toast.error("คุณได้ลงทะเบียนกิจกรรมนี้แล้ว");
      return;
    }
  
    const firstMember = teamMembers[0];
    const userStudentId = user?.sut_id;
    
    if (firstMember && userStudentId && firstMember.studentId !== userStudentId) {
      toast.error(`สมาชิกคนที่ 1 ต้องเป็นผู้ใช้งานระบบเท่านั้น (${userStudentId})`);
      setErrors({
        'member-0-studentid': `รหัสนักศึกษาดังกล่าวไม่ใช้ผู้ใช้งานระบบ`
      });
      return;
    }
  
    if (!validateForm()) return;
  
    if (formData.teamName.trim() === '') {
      toast.error("กรุณากรอกชื่อทีม");
      return;
    }
  
    const teamName = formData.teamName.trim();
    const postIdNum = Number(id);
  
    setIsLoading(true);
    try {
      const userIds: number[] = [];
      const failedMembers: string[] = [];
  
      console.log("🔍 Processing members:", teamMembers.length);
      console.log("📋 Team members:", teamMembers.map(m => ({
        id: m.id,
        studentId: m.studentId,
        firstName: m.firstName,
        lastName: m.lastName
      })));
  
      for (const member of teamMembers) {
        try {
          console.log(`🔎 Fetching user: ${member.studentId}`);
          const userResponse = await getUserByStudentId(member.studentId);
          const userData = userResponse?.data?.data;
          
          console.log(`📦 Response for ${member.studentId}:`, userData);
          
          if (userData?.ID) {
            userIds.push(Number(userData.ID));
            console.log(` Added user ID: ${userData.ID}`);
          } else {
            failedMembers.push(member.studentId);
            console.log(`Failed to get user ID for: ${member.studentId}`);
          }
        } catch (error) {
          console.error(`Error fetching user ${member.studentId}:`, error);
          failedMembers.push(member.studentId);
        }
      }
  
      console.log("Final userIds:", userIds);
      console.log("Total userIds:", userIds.length);
      console.log("Failed members:", failedMembers);
  
      if (failedMembers.length > 0) {
        toast.error(`ไม่พบข้อมูลนักศึกษา: ${failedMembers.join(", ")}`);
        setIsLoading(false);
        return;
      }
  
      if (userIds.length === 0) {
        toast.error("ไม่พบข้อมูลสมาชิกในระบบ");
        setIsLoading(false);
        return;
      }
  
      if (isUpdating && existingRegistration) {
        const registrationId = existingRegistration.ID ?? existingRegistration.id;
        
        const updatePayload = {
          team_name: teamName,
          description: formData.note?.trim() || "-",
        };
  
        console.log("Updating registration:", registrationId, updatePayload);
  
        const res = await UpdateRegistration(registrationId, updatePayload);
  
        if (res?.status === 200 || res?.status === 201) {
          const statusRes = await UpdateRegistrationStatus(registrationId, { 
            status: "pending" 
          });
  
          if (statusRes?.status === 200 || statusRes?.status === 201) {
            setShowSuccessDialog(true);
            toast.success("ส่งการลงทะเบียนใหม่สำเร็จ");
            setTimeout(() => navigate(`/student/registrations/MyRegistrationsPage`), 1500);
            return;
          } else {
            toast.error("อัปเดตข้อมูลสำเร็จ แต่ไม่สามารถเปลี่ยนสถานะได้");
            setIsLoading(false);
            return;
          }
        }
  
        const errorMessage = res?.data?.error || 
                           res?.data?.message || 
                           `อัปเดตไม่สำเร็จ (${res?.status})`;
        
        console.error("Update failed:", res);
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }
  
      const payload = {
        team_name: teamName,
        description: formData.note?.trim() || "-",
        post_id: postIdNum,
        user_ids: userIds,
        status: "pending",
        registration_date: new Date().toISOString(),
      };
  
      console.log("Creating registration with payload:", payload);
      console.log("Total members to register:", userIds.length);
  
      const res = await CreateRegistration(payload);
  
      if (res?.status === 200 || res?.status === 201) {
        setShowSuccessDialog(true);
        toast.success("ลงทะเบียนสำเร็จ");
        setTimeout(() => navigate(`/student/registrations/MyRegistrationsPage`), 1500);
        return;
      }
  
      const errorMessage = res?.data?.error || 
                         res?.data?.message || 
                         `ลงทะเบียนไม่สำเร็จ (${res?.status})`;
      
      console.error("Registration failed:", res);
      toast.error(errorMessage);
      
    } catch (err: any) {
      console.error("Registration error:", err);
      toast.error(err?.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && teamMembers.length > 0) {
      const userStudentId = user.sut_id ;
      
      if (userStudentId && teamMembers[0].studentId === '') {
        handleStudentIdChange(teamMembers[0].id, userStudentId);
      }
    }
  }, [user, post]);

  const renderRegistrationAlert = () => {
    if (!existingRegistration) return null;

    const status = (existingRegistration.status ?? existingRegistration.Status ?? 'pending').toLowerCase();
    const teamName = existingRegistration.team_name ?? existingRegistration.TeamName ?? 'ทีมของคุณ';
    const rejectionReason = existingRegistration.rejection_reason ?? existingRegistration.RejectionReason ?? '';

    if (status === 'pending') {
      return (
        <Card className="mb-6 border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-yellow-100 p-2">
                <AlertCircle className="size-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">คุณได้ลงทะเบียนกิจกรรมนี้แล้ว</h3>
                <div className="space-y-1">
                  <p className="text-sm text-gray-700"><span className="font-medium">ทีม:</span> {teamName}</p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">สถานะ:</span> 
                    <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">
                      รอดำเนินการ
                    </span>
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-3">กรุณารอการอนุมัติจากผู้จัดกิจกรรม</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (status === 'approved') {
      return (
        <Card className="mb-6 border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle2 className="size-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">คุณได้รับการอนุมัติแล้ว</h3>
                <div className="space-y-1">
                  <p className="text-sm text-gray-700"><span className="font-medium">ทีม:</span> {teamName}</p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">สถานะ:</span> 
                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                      อนุมัติแล้ว
                    </span>
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-3">การลงทะเบียนของคุณได้รับการอนุมัติเรียบร้อยแล้ว</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (status === 'rejected') {
      return (
        <Card className="mb-6 border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <AlertCircle className="size-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">การลงทะเบียนครั้งก่อนไม่ได้รับการอนุมัติ</h3>
                <div className="space-y-1">
                  <p className="text-sm text-gray-700"><span className="font-medium">ทีม:</span> {teamName}</p>
                  {rejectionReason && (
                    <p className="text-sm text-gray-700"><span className="font-medium">เหตุผล:</span> {rejectionReason}</p>
                  )}
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">สถานะ:</span> 
                    <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">
                      ไม่ผ่านการอนุมัติ
                    </span>
                  </p>
                </div>
                <p className="text-sm text-green-700 font-medium mt-3">คุณสามารถแก้ไขและส่งใหม่ได้</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  if (loading || checkingRegistration) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">กำลังโหลดข้อมูล...</p>
          <p className="text-xs text-slate-400 mt-2">Post ID: {id || 'ไม่พบ'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-red-200">
            <div className="text-red-500 text-5xl mb-4"></div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">เกิดข้อผิดพลาด</h2>
            <p className="text-slate-600 mb-2">{error}</p>
            <p className="text-xs text-slate-400 mb-6">URL: {location.pathname}</p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => navigate('/student/events')}
                variant="outline"
              >
                <ArrowLeft className="mr-2 size-4" />
                กลับหน้ากิจกรรม
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="default"
              >
                ลองใหม่อีกครั้ง
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">ไม่พบข้อมูลกิจกรรม</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/student/events`)}
              >
                <ArrowLeft className="size-5" />
              </Button>
              <h1 className="text-xl font-bold">
                {isUpdating ? "แก้ไขและส่งใหม่" : "ลงทะเบียนเข้าร่วมกิจกรรม"}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Post Info Banner */}
        <Card className="mb-6 overflow-hidden">
          {post.picture ? (
            <div className="relative h-64 overflow-hidden">
              <img
                src={post.picture}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-5xl"></div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{post.title}</h2>
                    <p className="text-white/90">{post.date} | {post.location}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={cn(
              'relative h-48 bg-gradient-to-br',
              post.gradient,
              'flex items-center justify-center'
            )}>
              <div className="flex items-center gap-4 px-6">
                <div className="text-6xl">{post.emoji}</div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold mb-1">{post.title}</h2>
                  <p className="text-white/90">{post.date} | {post.location}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* แสดง Alert ถ้ามีการลงทะเบียนอยู่แล้ว */}
        {renderRegistrationAlert()}

        {/*  แสดงฟอร์มลงทะเบียนเฉพาะเมื่อ showForm เป็น true (rejected หรือยังไม่เคยลงทะเบียน) */}
        {showForm ? (
          <form noValidate onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>แบบฟอร์มลงทะเบียน</CardTitle>
                <CardDescription>
                  {post.organizer && `ระดับ: ${post.organizer}`}
                  {post.type && ` | ประเภท: ${post.type}`}
                  {isUpdating && <span className="text-orange-600"> | กำลังแก้ไข</span>}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Team Name */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Users className="size-5 text-indigo-600" />
                    ข้อมูลทีม
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="team-name">ชื่อทีม *</Label>
                    <Input
                      id="team-name"
                      placeholder="ใส่ชื่อทีม (ถ้าสมัครเป็นทีม)"
                      value={formData.teamName}
                      onChange={(e) => updateFormData('teamName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="note">รายละเอียดเพิ่มเติม (Optional)</Label>
                    <Input
                      id="note"
                      placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                      value={formData.note}
                      onChange={(e) => updateFormData('note', e.target.value)}
                    />
                  </div>
                </div>

                {/* Team Members Section */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <User className="size-5 text-indigo-600" />
                      รายชื่อสมาชิก
                    </h3>
                    <span className="text-sm text-slate-600">
                      {teamMembers.length} คน
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {teamMembers.map((member, index) => (
                      <Card key={member.id} className="relative bg-slate-50 border-2 border-slate-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-slate-700">
                              สมาชิก {index + 1} {index === 0 && <span className="text-indigo-600">(ผู้ลงทะเบียน)</span>}
                            </span>
                            {teamMembers.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => removeTeamMember(member.id)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs text-slate-600">
                                รหัสนักศึกษา {index === 0 && <span className="text-slate-400">(Optional)</span>}
                              </Label>
                              <div className="relative">
                                <Input
                                  placeholder="B6614690"
                                  value={member.studentId}
                                  onChange={(e) => handleStudentIdChange(member.id, e.target.value)}
                                  className="text-sm mt-1"
                                  maxLength={8}
                                />
                                {member.isLoading && (
                                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-indigo-600" />
                                )}
                              </div>
                              {errors[`member-${index}-studentid`] && (
                                <p className="text-xs text-red-500 mt-1">
                                  {errors[`member-${index}-studentid`]}
                                </p>
                              )}
                              {index === 0 ? (
                                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                  <Info className="size-3" />
                                  เฉพาะเจ้าของบัญชีที่ใช้งานระบบ
                                </p>
                              ) : (
                                <p className="text-xs text-slate-500 mt-1">
                                  💡 กรอกรหัสนักศึกษาครบ 8 หลักเพื่อดึงข้อมูลอัตโนมัติ
                                </p>
                              )}
                            </div>

                            <div>
                              <Label className="text-xs text-slate-600">ชื่อ - นามสกุล *</Label>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                <div>
                                  <Input
                                    placeholder="ชื่อจริง"
                                    value={member.firstName}
                                    onChange={(e) => updateTeamMember(member.id, 'firstName', e.target.value)}
                                    className="text-sm"
                                    disabled={member.isLoading}
                                  />
                                  {errors[`member-${index}-firstname`] && (
                                    <p className="text-xs text-red-500 mt-1">
                                      {errors[`member-${index}-firstname`]}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <Input
                                    placeholder="นามสกุล"
                                    value={member.lastName}
                                    onChange={(e) => updateTeamMember(member.id, 'lastName', e.target.value)}
                                    className="text-sm"
                                    disabled={member.isLoading}
                                  />
                                  {errors[`member-${index}-lastname`] && (
                                    <p className="text-xs text-red-500 mt-1">
                                      {errors[`member-${index}-lastname`]}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs text-slate-600">เบอร์โทรศัพท์ *</Label>
                              <Input
                                type="tel"
                                placeholder="0XX-XXX-XXXX"
                                value={member.phone}
                                onChange={(e) => updateTeamMember(member.id, 'phone', e.target.value)}
                                className="text-sm mt-1"
                                disabled={member.isLoading}
                              />
                              {errors[`member-${index}-phone`] && (
                                <p className="text-xs text-red-500 mt-1">
                                  {errors[`member-${index}-phone`]}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Add Member Card */}
                    <Card
                      className="relative bg-slate-50 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer group"
                      onClick={addTeamMember}
                    >
                      <CardContent className="p-4 h-full flex items-center justify-center min-h-[200px]">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-slate-200 group-hover:bg-indigo-100 flex items-center justify-center mx-auto mb-3 transition-colors">
                            <Plus className="size-8 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <p className="text-sm font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">
                            เพิ่มสมาชิก
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/student/events`)}
                    disabled={isLoading}
                  >
                    ยกเลิก
                  </Button>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 min-w-[150px]"
                    size="lg"
                  >
                    {isLoading ? (
                      'กำลังบันทึก...'
                    ) : isUpdating ? (
                      <>
                        <CheckCircle2 className="mr-2 size-5" />
                        ส่งใหม่
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 size-5" />
                        ยืนยันการลงทะเบียน
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        ) : (

          <div className="flex justify-end gap-3 pt-6">
          </div>
        )}
      </main>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="size-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center">
              {isUpdating ? "ส่งการลงทะเบียนใหม่สำเร็จ!" : "ลงทะเบียนสำเร็จ!"}
            </DialogTitle>
            <DialogDescription className="text-center">
              <p className="mb-2">
                ข้อมูลการลงทะเบียนของคุณถูกส่งเรียบร้อยแล้ว
              </p>
              <p className="text-sm text-slate-600">
                กรุณารอการอนุมัติจากผู้จัดกิจกรรม
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}