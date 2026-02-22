import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  BarChart3,
  Edit,
  ExternalLink,
  Code2,
  Heart,
  Wrench,
  FileText,
  FolderOpen,
  Award,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  ChevronLeft,
} from "lucide-react";
import { getMyProfile, getUserProfile } from "../../../services/profileService";
import type { User, CertificateDTO } from "../../../interfaces/user";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { getImageUrl } from "@/utils/imageUtils";

const SOCIAL_ICON_MAP: Record<
  string,
  { icon: React.ElementType; hoverColor: string }
> = {
  GitHub: {
    icon: Github,
    hoverColor: "hover:bg-gray-800 hover:border-gray-800",
  },
  LinkedIn: {
    icon: Linkedin,
    hoverColor: "hover:bg-[#0077B5] hover:border-[#0077B5]",
  },
  Twitter: {
    icon: Twitter,
    hoverColor: "hover:bg-[#1DA1F2] hover:border-[#1DA1F2]",
  },
  Instagram: {
    icon: Instagram,
    hoverColor: "hover:bg-[#E4405F] hover:border-[#E4405F]",
  },
  Facebook: {
    icon: Facebook,
    hoverColor: "hover:bg-[#1877F2] hover:border-[#1877F2]",
  },
};
export default function StudentProfileSkillPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);
  const isOwnProfile = !userId || userId === user?.sut_id;

  const fetchProfile = async () => {
    try {
      setLoading(true);

      let res;
      if (isOwnProfile || !userId) {
        res = await getMyProfile();
      } else {
        res = await getUserProfile(userId);
      }

      if (res && res.data) {
        setUserData(res.data);
      } else {
        console.error("Invalid Response:", res);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOwnProfile && user) {
      setUserData(user);
      setLoading(false);
    } else {
      fetchProfile();
    }
  }, [userId, user, isOwnProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!loading && !userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 bg-red-50 rounded-full">
          <FileText className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800">
          ไม่พบข้อมูลโปรไฟล์
        </h3>
        <p className="text-slate-500">
          ผู้ใช้นี้อาจไม่มีอยู่ในระบบ หรือคุณไม่มีสิทธิ์เข้าถึง
        </p>
        <Button onClick={() => navigate(-1)} variant="outline">
          ย้อนกลับ
        </Button>
      </div>
    );
  }

  const portfolios = userData?.portfolios || [];
  const certificates = userData?.certificates || [];
  const skills = userData?.skills || [];
  const interests = userData?.interests || [];
  const tools = userData?.tools || [];

  return (
    <div className="min-h-full bg-white text-slate-900">
      <div className="max-w-8xl mx-auto px-10 py-10">

        <Card className="bg-white border-slate-200 mb-6 shadow-sm hover:shadow-lg transition-all duration-300 relative">

          {!isOwnProfile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 w-9 h-9 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}

          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar section */}
              <div className="flex flex-col items-center group">
                <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-slate-900 ring-offset-4 ring-offset-white transition-all duration-300 group-hover:ring-black group-hover:ring-offset-blue-100 group-hover:scale-105">
                  <img
                    src={getImageUrl(userData?.avatar_url)}
                    alt="Profile"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <p className="mt-4 text-slate-500 text-sm font-mono">
                  @{userData?.sut_id}
                </p>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {userData?.first_name} {userData?.last_name}
                  </h1>
                  <p className="text-slate-600 flex items-center justify-center md:justify-start gap-2">
                    <Mail className="w-4 h-4" />
                    {userData?.email}
                  </p>
                </div>

                {userData?.socials && userData.socials.length > 0 && (
                  <div className="flex gap-3 justify-center md:justify-start mb-6">
                    {userData.socials.map((social, index) => {
                      const socialConfig = SOCIAL_ICON_MAP[social.platform];
                      if (!socialConfig) return null;
                      const IconComponent = socialConfig.icon;
                      return (
                        <a
                          key={index}
                          href={social.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-10 h-10 rounded-full border-2 border-primary bg-primary flex items-center justify-center text-white transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 hover:-translate-y-1 ${socialConfig.hoverColor}`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </a>
                      );
                    })}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-100 hover:bg-black hover:border-black hover:scale-[1.02] transition-all duration-200 cursor-default group">
                    <GraduationCap className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                    <span className="text-sm text-gray-700 group-hover:text-white transition-colors">
                      {userData?.faculty?.name || "ไม่ระบุคณะ"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-100 hover:bg-black hover:border-black hover:scale-[1.02] transition-all duration-200 cursor-default group">
                    <BookOpen className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                    <span className="text-sm text-gray-700 group-hover:text-white transition-colors">
                      {userData?.major?.name || "ไม่ระบุสาขา"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-100 hover:bg-black hover:border-black hover:scale-[1.02] transition-all duration-200 cursor-default group">
                    <Phone className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                    <span className="text-sm text-gray-700 group-hover:text-white transition-colors">
                      {userData?.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-100 hover:bg-black hover:border-black hover:scale-[1.02] transition-all duration-200 cursor-default group">
                    <BarChart3 className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                    <span className="text-sm text-gray-700 group-hover:text-white transition-colors">
                      ชั้นปีที่ {userData?.year}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-6">
            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-lg hover:border-gray-400 transition-all duration-300 group">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Code2 className="w-5 h-5 text-gray-700 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
                  ทักษะ (Skills)
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[120px]">
                <div className="flex flex-wrap gap-2">
                  {skills.length === 0 ? (
                    <p className="text-slate-500 text-sm">ยังไม่มีทักษะ</p>
                  ) : (
                    skills.map((skill: string, idx: number) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-black text-white border-black hover:bg-gray-800 hover:scale-110 border cursor-pointer transition-all duration-200 hover:shadow-md px-3 py-1.5 text-sm"
                      >
                        {skill}
                      </Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-lg hover:border-gray-400 transition-all duration-300 group">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Heart className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-all duration-300" />
                  สิ่งที่สนใจ
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[120px]">
                <div className="flex flex-wrap gap-2">
                  {interests.length === 0 ? (
                    <p className="text-slate-500 text-sm">ยังไม่มีความสนใจ</p>
                  ) : (
                    interests.map((interest: string, idx: number) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-black text-white border-black hover:bg-gray-800 hover:scale-110 border cursor-pointer transition-all duration-200 hover:shadow-md px-3 py-1.5 text-sm"
                      >
                        {interest}
                      </Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-lg hover:border-gray-400 transition-all duration-300 group">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Wrench className="w-5 h-5 text-gray-700 group-hover:scale-110 group-hover:rotate-45 transition-transform duration-300" />
                  เครื่องมือ
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[120px]">
                <div className="flex flex-wrap gap-2">
                  {tools.length === 0 ? (
                    <p className="text-slate-500 text-sm">ยังไม่มีเครื่องมือ</p>
                  ) : (
                    tools.map((tool: string, idx: number) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-black text-white border-black hover:bg-gray-800 hover:scale-110 border cursor-pointer transition-all duration-200 hover:shadow-md px-3 py-1.5 text-sm"
                      >
                        {tool}
                      </Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <FileText className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-all duration-300" />
                    เกี่ยวกับฉัน
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute -top-2 -left-2 text-6xl text-gray-200 font-serif select-none">"</div>
                  <div className="absolute -bottom-4 -right-2 text-6xl text-gray-200 font-serif select-none rotate-180">"</div>

                  <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                    {userData?.bio ? (
                      <p className="text-slate-700 leading-relaxed text-base italic">
                        {userData.bio}
                      </p>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                          <FileText className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-slate-400 text-sm">ยังไม่ได้เขียนข้อมูลเกี่ยวกับตัวเอง</p>
                        {isOwnProfile && (
                          <p className="text-gray-500 text-xs mt-1">คลิกแก้ไขโปรไฟล์เพื่อเพิ่มข้อมูล</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <FolderOpen className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-all duration-300" />
                    Portfolio
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      isOwnProfile
                        ? navigate("/student/portfolio")
                        : navigate(
                          `/student/profile-skill/${userData?.sut_id}/portfolio`
                        )
                    }
                    className="flex items-center gap-2 hover:bg-gray-100 hover:border-gray-400 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">ดูทั้งหมด</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {portfolios.length === 0 ? (
                  <p className="text-slate-500 text-sm">ยังไม่มีผลงานในคลัง</p>
                ) : (
                  <div className="relative">
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 scroll-smooth">
                      {portfolios.slice(0, 10).map((portfolio) => {
                        const imageUrl = portfolio.file_urls
                          ? portfolio.file_urls.startsWith("data:") ||
                            portfolio.file_urls.startsWith("http")
                            ? portfolio.file_urls
                            : `data:image/png;base64,${portfolio.file_urls}`
                          : null;

                        return (
                          <div
                            key={portfolio.ID}
                            onClick={() =>
                              navigate(`/student/portfolio/${portfolio.ID}`)
                            }
                            className="flex-shrink-0 w-64 bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-gray-400 hover:scale-[1.02] transition-all duration-300 group/card"
                          >
                            <div className="h-32 bg-slate-100 overflow-hidden relative">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={portfolio.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <FolderOpen className="w-10 h-10" />
                                </div>
                              )}
                            </div>

                            <div className="p-3">
                              <h4 className="font-semibold text-slate-800 mb-1 line-clamp-1 group-hover/card:text-gray-900 transition-colors text-sm">
                                {portfolio.title || "ไม่มีชื่อ"}
                              </h4>
                              <p className="text-slate-500 text-xs line-clamp-2">
                                {portfolio.description || "ไม่มีคำอธิบาย"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Award className="w-5 h-5 text-gray-700 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
                    Certificates
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/student/certificates")}
                    className="flex items-center gap-2 hover:bg-gray-100 hover:border-gray-400 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">ดูทั้งหมด</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {certificates.length === 0 ? (
                  <p className="text-slate-500 text-sm">ยังไม่มีใบรับรอง</p>
                ) : (
                  <div className="relative">
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 scroll-smooth">
                      {certificates.slice(0, 10).map((cert: CertificateDTO) => {
                        const imageUrl = cert.activity_picture
                          ? cert.activity_picture.startsWith("data:") ||
                            cert.activity_picture.startsWith("http")
                            ? cert.activity_picture
                            : `data:image/png;base64,${cert.activity_picture}`
                          : null;

                        return (
                          <div
                            key={cert.id}
                            onClick={() => navigate("/student/certificates")}
                            className="flex-shrink-0 w-64 bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-gray-400 hover:scale-[1.02] transition-all duration-300 group/card"
                          >
                            <div className="h-32 bg-slate-100 overflow-hidden relative">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={cert.activity_title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <Award className="w-10 h-10" />
                                </div>
                              )}
                            </div>

                            <div className="p-3">
                              <h4 className="font-semibold text-slate-800 mb-1 line-clamp-1 group-hover/card:text-gray-900 transition-colors text-sm">
                                {cert.activity_title || "ไม่มีชื่อ"}
                              </h4>
                              <p className="text-slate-500 text-xs line-clamp-1">
                                {cert.organizer || "ไม่ระบุผู้จัด"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {isOwnProfile && (
          <div className="fixed bottom-8 right-8 z-50 group">
            <div className="absolute inset-0" />
            <Button
              onClick={() => navigate("/student/profile-skill/edit")}
              className="relative flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl bg-primary text-white"
              size="lg"
            >
              <Edit className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              แก้ไขโปรไฟล์
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
