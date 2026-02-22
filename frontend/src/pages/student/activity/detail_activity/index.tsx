import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar,
  MapPin, 
  Users, 
  Building2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { GetPostById } from '@/services/postServices';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [post, setPost] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>('');

  const formatDate = (date?: string) => {
    if (!date) return 'ไม่ระบุวันที่';
    const d = new Date(date);
    return d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTypeBadge = (type?: string) => {
    const config: Record<string, { label: string; color: string }> = {
      volunteer: { label: 'กิจกรรมจิตอาสา', color: 'bg-green-500 text-white' },
      academic: { label: 'กิจกรรมวิชาการ', color: 'bg-blue-500 text-white' },
      sport: { label: 'กิจกรรมกีฬา', color: 'bg-orange-500 text-white' }
    };
    
    const { label, color } = config[type || ''] || { 
      label: 'กิจกรรม', 
      color: 'bg-slate-500 text-white' 
    };
    
    return (
      <Badge className={`${color} px-4 py-1.5 text-sm font-semibold rounded-full`}>
        {label}
      </Badge>
    );
  };

  React.useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
  
      try {
        setLoading(true);
        setError('');
        
        const response = await GetPostById(id);
        
        console.log('Full Response:', response);
        
        if (response.status === 200) {
          let postData;
          
          if (response.data?.data) {
            postData = response.data.data;
          } else {
            postData = response.data;
          }
          
          console.log('Post Data:', postData);
          console.log('Location Data:', postData?.location || postData?.Location);
          console.log('User Data:', postData?.user || postData?.User);
          setPost(postData);
        } else {
          setError('ไม่สามารถโหลดข้อมูลได้');
        }
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message || 'เกิดข้อผิดพลาด');
      } finally {
        setLoading(false);
      }
    };
  
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-300 border-t-slate-900 mb-4 mx-auto"></div>
          <p className="text-slate-600 font-semibold">กำลังโหลด...</p>
        </div>
      </div> 
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Button onClick={() => navigate(-1)} variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2" /> กลับ
          </Button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-700 font-bold text-xl mb-2">ไม่พบข้อมูลกิจกรรม</p>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const location = post.Location || post.location;
  const user = post.User || post.user;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-20 shadow-sm">
        <div className="w-full px-6 sm:px-12 lg:px-16">
          <div className="flex items-center justify-between h-20 py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-slate-100 rounded-xl"
              >
                <ArrowLeft className="size-5" />
              </Button>
              <div className="h-8 w-px bg-slate-200" />
              <h1 className="text-xl font-bold">รายละเอียดกิจกรรม</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Poster */}
        <Card className="mb-6 overflow-hidden shadow-lg">
          <CardContent className="p-0">
            {post.picture ? (
              <img 
                src={
                  post.picture.startsWith('data:')
                    ? post.picture
                    : `data:image/jpeg;base64,${post.picture}`
                }
                alt={post.title} 
                className="w-full h-auto object-contain max-h-[600px] bg-slate-100"
              />
            ) : (
              <div className="w-full h-96 min-h-screen bg-white from-slate-200 to-slate-300 flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <Users className="size-24 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">ไม่มีรูปภาพ</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ชื่อกิจกรรม */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            {post.title}
          </h2>
          <div className="flex flex-wrap gap-2">
            {getTypeBadge(post.type)}
            {post.organizer && (
              <Badge className="bg-indigo-500 text-white px-4 py-1.5 text-sm font-semibold rounded-full">
                {post.organizer}
              </Badge>
            )}
          </div>
        </div>

        {/* ข้อมูลพื้นฐาน */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">ข้อมูลกิจกรรม</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* วันที่จัดกิจกรรม - รองรับทั้ง start_date และ start */}
            <div className="flex items-start gap-3">
              <Calendar className="size-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-slate-600 mb-1">วันที่จัดกิจกรรม</p>
                <p className="font-semibold text-slate-900">
                  {formatDate(post.start_date || post.start)} - {formatDate(post.stop_date || post.stop)}
                </p>
              </div>
            </div>

            <Separator />

            {/* สถานที่ */}
            {location && (
              <div className="flex items-start gap-3">
                <Building2 className="size-5 text-red-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-slate-600 mb-1">สถานที่จัดกิจกรรม</p>
                  <p className="font-semibold text-slate-900 text-lg">
                    {location.building || 'ไม่ระบุอาคาร'}
                  </p>
                  {location.detail && (
                    <p className="text-sm text-slate-600 mt-1">{location.detail}</p>
                  )}
                </div>
              </div>
            )}

            {/* แสดงข้อมูลแผนที่ (ถ้ามี) */}
            {location && (location.latitude || location.picture) && (
              <>
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <MapPin className="size-5 text-green-600" />
                    <span>ข้อมูลสถานที่</span>
                  </div>

                  {/* พิกัด */}
                  {location.latitude && location.longitude && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="size-4 text-red-500" />
                      <span>
                        พิกัด: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </span>
                      <a
                        href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        เปิดใน Google Maps
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  )}

                  {/* รูปสถานที่ */}
                  {location.picture && (
                    <div className="mt-3">
                      <p className="text-sm text-slate-600 mb-2">รูปภาพสถานที่</p>
                      <img
                        src={
                          location.picture.startsWith('http')
                            ? location.picture
                            : `https://tse2.mm.bing.net/th?id=${location.picture}`
                        }
                        alt="สถานที่จัดกิจกรรม"
                        className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-slate-200 shadow-sm"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* รายละเอียดเพิ่มเติม */}
        <div className="grid grid-cols-1 gap-6">
          {/* รายละเอียดกิจกรรม */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>รายละเอียดกิจกรรม</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 whitespace-pre-wrap">
                {post.detail || 'ไม่มีรายละเอียด'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ช่องทางติดต่อ - รองรับทั้ง User และ user */}
        {user && (
          <Card className="mt-6 shadow-lg">
            <CardHeader>
              <CardTitle>ผู้สร้างโพสต์</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.first_name && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-20">ชื่อ:</span>
                  <span className="font-medium">
                    {user.first_name} {user.last_name}
                  </span>
                </div>
              )}
              {user.email && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-20">Email:</span>
                  <a
                    href={`mailto:${user.email}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {user.email}
                  </a>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-20">Phone:</span>
                  <a
                    href={`tel:${user.phone}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {user.phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}